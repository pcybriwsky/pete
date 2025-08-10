const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, query, orderBy, limit, updateDoc, doc } = require('firebase/firestore');
const SpotifyWebApi = require('spotify-web-api-node');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDkadMxyW5CaCEcxnXGvsdVOuQCzsUdQ5k",
  authDomain: "song-swap-4ccc5.firebaseapp.com",
  projectId: "song-swap-4ccc5",
  storageBucket: "song-swap-4ccc5.firebasestorage.app",
  messagingSenderId: "235923715185",
  appId: "1:235923715185:web:043ce2a3378dceca7c97d0",
  measurementId: "G-SSBB857VVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Spotify configuration
const spotifyConfig = {
  clientId: 'eaaa05c8731f45949942df38bb26e623',
  clientSecret: '6282661653ca4461b38886dc444d8602',
  redirectUri: 'http://127.0.0.1:3008/callback'
};

// Playlist configuration
const PLAYLIST_ID = '3PcOGGOI7r84VuQb6bwMkX';

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi(spotifyConfig);

// Track processed songs to avoid duplicates
const processedSongs = new Set();

// Add your refresh token here after running the auth script
const REFRESH_TOKEN = 'AQC-g8NeXVvLF7GM8ofKRwmmPNWN2wSAu_GocPDWAGtplfn0LizPrpTIs6Oz534YN5qOLZhXdnyoMqRxXhDp1nlhliUMz5DtchZyVvtaXYrYKH9dsX2k_E0sKwlbafkDwz4';

// Get access token using refresh token
async function getSpotifyAccessToken() {
  try {
    if (!REFRESH_TOKEN || REFRESH_TOKEN === 'YOUR_REFRESH_TOKEN_HERE') {
      throw new Error('Please set your refresh token in the script first');
    }

    spotifyApi.setRefreshToken(REFRESH_TOKEN);
    const data = await spotifyApi.refreshAccessToken();
    
    if (data.body.access_token) {
      spotifyApi.setAccessToken(data.body.access_token);
      console.log('✅ Spotify access token refreshed');
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

// Process a new song deposit
async function processSongDeposit(song) {
  try {
    console.log('🔄 Processing new song deposit:', song.title);
    
    const trackId = extractTrackId(song.uri);
    const success = await addTrackToPlaylist(trackId, song);
    
    if (success) {
      console.log('✅ Song deposit processed successfully');
    }
    
  } catch (error) {
    console.error('❌ Error processing song deposit:', error);
  }
}

// Main function to monitor songs collection
async function startPlaylistSync() {
  console.log('🎵 Starting Playlist Sync Monitor...');
  console.log('📡 Listening for new songs in Firebase...');
  console.log(`🎼 Target playlist: ${PLAYLIST_ID}`);
  
  // Get initial access token
  await getSpotifyAccessToken();
  
  // Set up token refresh (every 50 minutes)
  setInterval(async () => {
    try {
      await getSpotifyAccessToken();
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
    }
  }, 50 * 60 * 1000);
  
  // Monitor songs collection
  const songsRef = collection(db, 'songs');
  const q = query(songsRef, orderBy('timestamp', 'desc'), limit(100));
  
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const song = change.doc.data();
        const songId = change.doc.id;
        
        // Avoid processing the same song multiple times
        if (!processedSongs.has(songId)) {
          processedSongs.add(songId);
          
          console.log('🎵 New song deposit detected:', song.title);
          
          // Process the song deposit
          await processSongDeposit(song);
          
          // Mark as synced to playlist
          await updateDoc(doc(db, 'songs', songId), {
            playlistSynced: true,
            syncedAt: new Date()
          });
        }
      }
    });
  }, (error) => {
    console.error('Firebase listener error:', error);
  });
  
  console.log('✅ Playlist sync monitor is running. Press Ctrl+C to stop.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down playlist sync monitor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down playlist sync monitor...');
  process.exit(0);
});

// Start the monitor
startPlaylistSync().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 