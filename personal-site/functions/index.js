/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const SpotifyWebApi = require('spotify-web-api-node');

admin.initializeApp();

// Spotify configuration
const spotifyApi = new SpotifyWebApi({
  clientId: 'eaaa05c8731f45949942df38bb26e623',
  clientSecret: '6282661653ca4461b38886dc444d8602',
  redirectUri: 'http://127.0.0.1:3008/callback'
});

// Playlist configuration
const PLAYLIST_ID = '3PcOGGOI7r84VuQb6bwMkX';

// Add your refresh token here
const REFRESH_TOKEN = 'AQC-g8NeXVvLF7GM8ofKRwmmPNWN2wSAu_GocPDWAGtplfn0LizPrpTIs6Oz534YN5qOLZhXdnyoMqRxXhDp1nlhliUMz5DtchZyVvtaXYrYKH9dsX2k_E0sKwlbafkDwz4';

// Get Spotify access token using refresh token
async function getSpotifyAccessToken() {
  try {
    spotifyApi.setRefreshToken(REFRESH_TOKEN);
    const data = await spotifyApi.refreshAccessToken();
    
    if (data.body.access_token) {
      spotifyApi.setAccessToken(data.body.access_token);
      return data.body.access_token;
    } else {
      throw new Error('Failed to refresh access token');
    }
  } catch (error) {
    console.error('❌ Error refreshing Spotify access token:', error);
    throw error;
  }
}

// Extract Spotify track ID from URI
function extractTrackId(uri) {
  if (!uri) return null;
  
  if (uri.startsWith('spotify:track:')) {
    return uri.split(':')[2];
  }
  
  // Handle URLs
  const urlMatch = uri.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
}

// Add track to playlist
async function addTrackToPlaylist(trackId, songInfo) {
  try {
    if (!trackId) {
      console.log('⚠️ No valid track ID found for:', songInfo.title);
      return false;
    }

    console.log(`🎵 Adding "${songInfo.title}" by ${songInfo.artist} to playlist...`);
    
    const response = await spotifyApi.addTracksToPlaylist(PLAYLIST_ID, [`spotify:track:${trackId}`]);
    
    if (response.statusCode === 201) {
      console.log(`✅ Successfully added "${songInfo.title}" to playlist`);
      return true;
    } else {
      console.log(`❌ Failed to add track. Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    if (error.statusCode === 400 && error.body?.error?.message?.includes('already exists')) {
      console.log(`ℹ️ Track "${songInfo.title}" already in playlist`);
      return true; // Consider this a success
    }
    
    console.error(`❌ Error adding track "${songInfo.title}":`, error.message);
    return false;
  }
}

// Firebase Function: Triggered when a new song is added to the songs collection (1st gen)
exports.onSongAdded = functions.firestore
  .document('songs/{songId}')
  .onCreate(async (snap, context) => {
    try {
      const songData = snap.data();
      const songId = context.params.songId;
      
      console.log('🎵 New song deposit detected:', songData.title);
      
      // Skip if already synced
      if (songData.playlistSynced) {
        console.log('ℹ️ Song already synced to playlist, skipping');
        return;
      }
      
      // Get Spotify access token
      await getSpotifyAccessToken();
      
      // Extract track ID and add to playlist
      const trackId = extractTrackId(songData.uri);
      const success = await addTrackToPlaylist(trackId, songData);
      
      if (success) {
        // Mark as synced
        await admin.firestore().collection('songs').doc(songId).update({
          playlistSynced: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Song successfully synced to playlist');
      }
      
    } catch (error) {
      console.error('❌ Error processing song deposit:', error);
    }
  });

exports.printSongSwap = onCall(async (request) => {
  try {
    const { data } = request;
    
    console.log('=== FIREBASE FUNCTION DEBUG V2 ===');
    console.log('Raw data received:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data || {}));
    console.log('depositedSong exists:', !!data?.depositedSong);
    console.log('receivedSong exists:', !!data?.receivedSong);
    console.log('depositedSong type:', typeof data?.depositedSong);
    console.log('receivedSong type:', typeof data?.receivedSong);
    
    if (!data) {
      throw new Error('No data received');
    }
    
    if (!data.depositedSong || !data.receivedSong) {
      console.log('Missing song data - data.depositedSong:', data.depositedSong);
      console.log('Missing song data - data.receivedSong:', data.receivedSong);
      throw new Error('Missing song data');
    }
    
    // Extract only the song data we need
    const printJobData = {
      type: 'swap',
      depositedSong: data.depositedSong,
      receivedSong: data.receivedSong,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };
    
    console.log('Print job data to store:', JSON.stringify(printJobData, null, 2));

    // Store only the clean song data
    await admin.firestore().collection('printJobs').add(printJobData);
    
    console.log('Print job stored successfully');
    return { success: true, message: 'Print job queued' };
    
  } catch (error) {
    console.error('Print function error:', error);
    throw new Error(error.message || 'Failed to queue print job');
  }
});

// New: withdrawal-only print (recommendation slip)
exports.printWithdrawal = onCall(async (request) => {
  try {
    const { data } = request;
    if (!data || !data.receivedSong) {
      throw new Error('Missing receivedSong');
    }

    const printJobData = {
      type: 'withdrawal',
      receivedSong: data.receivedSong,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    console.log('Withdrawal print job to store:', JSON.stringify(printJobData, null, 2));
    await admin.firestore().collection('printJobs').add(printJobData);
    return { success: true, message: 'Withdrawal print job queued' };
  } catch (error) {
    console.error('printWithdrawal error:', error);
    throw new Error(error.message || 'Failed to queue withdrawal print job');
  }
});
