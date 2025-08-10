import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, functions, httpsCallable, db, collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp, doc, getDoc, setDoc, signInAnonymously } from '../firebase.init';
import { runTransaction } from 'firebase/firestore';
import SongSwapSketch from './Components/SongSwap/SongSwapSketch';
import './SongSwapPage.css';
import BangersOnlyBank from '../Assets/Images/BangersOnlyBank.png';

// Spotify API configuration
let selectedSpotifyID = "26c47d5dba534624b1f3e93f5a7a3bd7";
let selectedSpotifySecret = "5f6cde63b377471c9ebbd44cf23afc21";
const current_URL = window.location.href;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const code = urlParams.get('code');
const isLocal = current_URL.includes("localhost");



const SongSwapPage = () => {
  const [user, loading] = useAuthState(auth);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [topSongs, setTopSongs] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [selectedReceive, setSelectedReceive] = useState(null);
  const [songs, setSongs] = useState(null);
  const [recommendationNote, setRecommendationNote] = useState('');
  const [depositCount, setDepositCount] = useState(0);
  
  // Debug: Log when songs state changes
  useEffect(() => {
    console.log('Songs state changed:', songs);
  }, [songs]);
  
  const [error, setError] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [codeUsed, setCodeUsed] = useState(false);

  // Fetch deposit count on component mount
  useEffect(() => {
    const fetchDepositCount = async () => {
      try {
        const songsQuery = query(collection(db, 'songs'));
        const querySnapshot = await getDocs(songsQuery);
        setDepositCount(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching deposit count:', error);
      }
    };
    
    fetchDepositCount();
  }, []);



    // Simple recommendation option for users without Spotify
  const handleRecommendation = async () => {
    console.log('🎵 Starting recommendation flow...');
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Create a mock user for recommendations
      const mockUser = {
        display_name: 'Guest User',
        id: 'guest_' + Date.now(),
        images: []
      };
      setSpotifyUser(mockUser);
      
      // Generate some curated recommendations
      const recommendations = [
        {
          title: "Bohemian Rhapsody",
          artist: "Queen",
          album: "A Night at the Opera",
          genre: "Rock",
          uri: "spotify:track:recommendation_1",
          image: null,
          allGenres: ["Rock", "Progressive Rock"],
          rank: 1,
          source: 'recommendation'
        },
        {
          title: "Hotel California",
          artist: "Eagles",
          album: "Hotel California",
          genre: "Rock",
          uri: "spotify:track:recommendation_2",
          image: null,
          allGenres: ["Rock", "Soft Rock"],
          rank: 2,
          source: 'recommendation'
        },
        {
          title: "Imagine",
          artist: "John Lennon",
          album: "Imagine",
          genre: "Pop",
          uri: "spotify:track:recommendation_3",
          image: null,
          allGenres: ["Pop", "Soft Rock"],
          rank: 3,
          source: 'recommendation'
        },
        {
          title: "What's Going On",
          artist: "Marvin Gaye",
          album: "What's Going On",
          genre: "R&B",
          uri: "spotify:track:recommendation_4",
          image: null,
          allGenres: ["R&B", "Soul"],
          rank: 4,
          source: 'recommendation'
        }
      ];
      
      console.log('🎉 Recommendations generated:', recommendations);
      setTopSongs(recommendations);
      
    } catch (error) {
      console.error('❌ Recommendation error:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Immediate recommendation + print withdrawal slip
  const handleImmediateRecommendationPrint = async () => {
    console.log('🧾 Immediate recommendation + print...');
    try {
      setIsProcessing(true);
      setError(null);

      // Prefer genres from selected deposit if available
      const seed = selectedDeposit?.allGenres || [];
      const receivedSong = await getWeightedRandomSong(seed, true);

      // Update UI preview
      setSongs((prev) => ({
        deposited: prev?.deposited || selectedDeposit || null,
        received: receivedSong
      }));

      // Queue withdrawal print
      const cleanReceivedSong = {
        title: receivedSong.title,
        artist: receivedSong.artist,
        album: receivedSong.album,
        genre: receivedSong.genre,
        allGenres: receivedSong.allGenres || [],
        popularity: receivedSong.popularity,
        duration: receivedSong.duration,
        releaseDate: receivedSong.releaseDate,
        uri: receivedSong.uri,
        image: receivedSong.image,
        submittedByName: receivedSong.submittedByName || 'Unknown User',
        submittedById: receivedSong.submittedById || null,
        recommendation: receivedSong.recommendation || '',
        depositNumber: receivedSong.depositNumber || null
      };
      const printWithdrawalFn = httpsCallable(functions, 'printWithdrawal');
      await printWithdrawalFn({ receivedSong: cleanReceivedSong });
      console.log('✅ Withdrawal print queued');
    } catch (error) {
      console.error('❌ Immediate recommendation print error:', error);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };



  const fetchSpotifyAuth = async () => {
    if (!code) return;

    // Wait for API keys to load
    while (selectedSpotifyID == null || selectedSpotifySecret == null) {
      await new Promise(r => setTimeout(r, 100));
    }

    const redirectUri = isLocal 
      ? "http://localhost:3000/gallery/song-swap"
      : "https://repete.art/gallery/song-swap";

    console.log('Exchanging code for token with redirect URI:', redirectUri);

    const response = await fetch(
      `https://accounts.spotify.com/api/token?client_id=${selectedSpotifyID}&client_secret=${selectedSpotifySecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "accept": "application/json"
        }
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Spotify token exchange failed:', data);
      if (data.error === 'invalid_grant') {
        throw new Error('Authorization code expired or already used. Please try logging in again.');
      } else if (data.error === 'invalid_client') {
        throw new Error('Invalid client configuration. Please check your Spotify app settings.');
      } else {
        throw new Error(data.error_description || `Spotify error: ${data.error}`);
      }
    }

    if (data.error) {
      throw new Error(data.error_description || 'Authentication failed');
    }

    console.log('Successfully exchanged code for token');

    // Get user profile and top song directly with the access token
    const getUserData = await fetch(`https://api.spotify.com/v1/me`, {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + data.access_token
      }
    });

    if (getUserData.status !== 200) {
      throw new Error('Failed to get user data');
    }

    const userData = await getUserData.json();
    setSpotifyUser(userData);

    // Pull top 1 track and enrich with artist genres
    const top1Response = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=1`,
      {
        method: "GET",
        headers: { 'Authorization': 'Bearer ' + data.access_token }
      }
    );

    const top1Data = await top1Response.json();
    console.log('Top 1 track response:', top1Data);

    if (top1Data.items && top1Data.items.length > 0) {
      const track = top1Data.items[0];
      const artistId = track.artists?.[0]?.id;

      let artistGenres = [];
      if (artistId) {
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          { method: 'GET', headers: { 'Authorization': 'Bearer ' + data.access_token } }
        );
        const artistData = await artistResponse.json();
        artistGenres = artistData.genres || [];
      }

      const topSong = {
        title: track.name,
        artist: track.artists?.[0]?.name || 'Unknown',
        uri: track.uri,
        image: track.album?.images?.[0]?.url || null,
        album: track.album?.name || 'Unknown',
        genre: artistGenres?.[0] || 'Unknown',
        allGenres: artistGenres,
        popularity: track.popularity,
        duration: track.duration_ms,
        releaseDate: track.album?.release_date || null,
        rank: 1,
        source: 'spotify'
      };

      // Auto-select deposit with the top 1 choice
      setSelectedDeposit(topSong);
      setTopSongs([topSong]);
    }
  };





  useEffect(() => {
    const initializeAuth = async () => {
      if (auth.currentUser == null) {
        await signInAnonymously(auth);
      }
    };

    const handleSpotifyCallback = async () => {
      if (code && !isProcessing && !codeUsed) {
        setIsProcessing(true);
        setCodeUsed(true); // Mark code as used immediately
        try {
          await fetchSpotifyAuth();
          // Clear the code from URL to prevent reuse
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Spotify auth error:', error);
          setError('Authentication failed. Please try again.');
          // Clear the code from URL on error too
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    initializeAuth();
    handleSpotifyCallback();
  }, [code, isProcessing, codeUsed]);

  const getMockTopSong = () => {
    const mockSongs = [
      { 
        title: "Motion Sickness", 
        artist: "Phoebe Bridgers", 
        uri: "spotify:track:mock1", 
        image: null, 
        album: "Stranger in the Alps",
        genre: "indie folk",
        allGenres: ["indie folk", "alternative", "singer-songwriter"],
        popularity: 85,
        duration: 234000,
        releaseDate: "2017-09-22"
      },
      { 
        title: "Bohemian Rhapsody", 
        artist: "Queen", 
        uri: "spotify:track:mock2", 
        image: null, 
        album: "A Night at the Opera",
        genre: "rock",
        allGenres: ["rock", "progressive rock", "classic rock"],
        popularity: 95,
        duration: 354000,
        releaseDate: "1975-11-21"
      },
      { 
        title: "Blinding Lights", 
        artist: "The Weeknd", 
        uri: "spotify:track:mock3", 
        image: null, 
        album: "After Hours",
        genre: "pop",
        allGenres: ["pop", "r&b", "synthwave"],
        popularity: 90,
        duration: 200000,
        releaseDate: "2020-03-20"
      },
      { 
        title: "Shape of You", 
        artist: "Ed Sheeran", 
        uri: "spotify:track:mock4", 
        image: null, 
        album: "÷ (Divide)",
        genre: "pop",
        allGenres: ["pop", "folk pop", "acoustic"],
        popularity: 88,
        duration: 233000,
        releaseDate: "2017-01-06"
      },
      { 
        title: "Uptown Funk", 
        artist: "Mark Ronson ft. Bruno Mars", 
        uri: "spotify:track:mock5", 
        image: null, 
        album: "Uptown Special",
        genre: "funk",
        allGenres: ["funk", "pop", "disco"],
        popularity: 92,
        duration: 270000,
        releaseDate: "2014-11-10"
      },
      { 
        title: "Bad Guy", 
        artist: "Billie Eilish", 
        uri: "spotify:track:mock6", 
        image: null, 
        album: "When We All Fall Asleep, Where Do We Go?",
        genre: "pop",
        allGenres: ["pop", "alternative", "electropop"],
        popularity: 87,
        duration: 194000,
        releaseDate: "2019-03-29"
      },
      { 
        title: "Old Town Road", 
        artist: "Lil Nas X", 
        uri: "spotify:track:mock7", 
        image: null, 
        album: "7",
        genre: "country rap",
        allGenres: ["country rap", "hip hop", "country"],
        popularity: 89,
        duration: 157000,
        releaseDate: "2019-04-05"
      }
    ];
    return mockSongs[Math.floor(Math.random() * mockSongs.length)];
  };

  // Atomically increments and returns the next deposit number
  const getNextDepositNumber = async () => {
    const counterRef = doc(db, 'counters', 'deposits');
    const next = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      const current = snap.exists() ? (snap.data().current || 0) : 0;
      const updated = current + 1;
      tx.set(counterRef, { current: updated }, { merge: true });
      return updated;
    });
    return next;
  };

  const handleSpotifyLogin = () => {
    const scopes = "user-top-read%20user-read-recently-played";
    const redirectUri = isLocal 
      ? "http://localhost:3000/gallery/song-swap"
      : "https://repete.art/gallery/song-swap";
    
    window.location.replace(
      `https://accounts.spotify.com/authorize?client_id=${selectedSpotifyID}&scope=${scopes}&response_type=code&redirect_uri=${redirectUri}`
    );
  };

  const handlePrint = () => {
    // Get the canvas element from the p5.js sketch
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Convert canvas to image data
      const imageData = canvas.toDataURL('image/png');
      
      // Send to print server
      printDirectly(imageData);
    }
  };

  const printDirectly = async (imageData) => {
    try {
      // Use environment variable for print server URL
      const printServerUrl = process.env.REACT_APP_PRINT_SERVER_URL || 'http://localhost:3001';
      
      const response = await fetch(`${printServerUrl}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageData,
          printerName: process.env.REACT_APP_PRINTER_NAME || 'HP_Envy_6555e',
          paperSize: 'business_card',
          copies: 1
        })
      });
      
      if (response.ok) {
        console.log('Print job sent successfully!');
        // Show success message to user
        alert('🎵 Card printed successfully!');
      } else {
        console.error('Print failed:', response.statusText);
        alert('❌ Print failed. Please try again.');
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('❌ Print error. Please check printer connection.');
    }
  };

  const handleNewSwap = async () => {
    if (spotifyUser) {
      // For new swaps, we'd need to re-authenticate with Spotify
      // For now, just clear the current songs
      setSongs(null);
    } else {
      setSongs(null);
    }
  };

  const handleRetryAuth = () => {
    setCodeUsed(false);
    setError(null);
    setSpotifyUser(null);
    setTopSongs(null);
    setSelectedDeposit(null);
    setSelectedReceive(null);
    setSongs(null);
  };

  const handleSelectDeposit = (song) => {
    setSelectedDeposit(song);
  };

  const handleSelectReceive = (song) => {
    setSelectedReceive(song);
  };

  const handleCreateSwap = async () => {
    if (selectedDeposit && spotifyUser) {
      try {
        // Save the deposited song to Firebase
        const songData = {
          title: selectedDeposit.title,
          artist: selectedDeposit.artist,
          album: selectedDeposit.album,
          genre: selectedDeposit.genre,
          allGenres: selectedDeposit.allGenres || [],
          popularity: selectedDeposit.popularity,
          duration: selectedDeposit.duration,
          releaseDate: selectedDeposit.releaseDate,
          uri: selectedDeposit.uri,
          image: selectedDeposit.image,
          spotifyUsername: spotifyUser?.display_name || 'Guest User',
          submittedByName: spotifyUser?.display_name || 'Guest User',
          submittedById: spotifyUser?.id || null,
          recommendation: recommendationNote || '',
          withdrawals: 0,
          timestamp: serverTimestamp()
        };

        console.log('Saving song to Firebase:', songData);
        
        // Add to songs collection
        const docRef = await addDoc(collection(db, 'songs'), songData);
        console.log('Song saved with ID:', docRef.id);

        // Compute deposit number as total songs in collection after save
        const countSnap = await getDocs(collection(db, 'songs'));
        const depositNumber = countSnap.size;
        await updateDoc(docRef, { depositNumber });

        // Get a recommendation preferring matching genres
        const receivedSong = await getWeightedRandomSong(selectedDeposit.allGenres || [], true);
        
        console.log('Creating swap with:', {
          deposited: selectedDeposit,
          received: receivedSong
        });
        
        setSongs({
          deposited: {
            ...selectedDeposit,
            submittedByName: spotifyUser?.display_name || 'Guest User',
            submittedById: spotifyUser?.id || null,
            recommendation: recommendationNote || '',
            depositNumber
          },
          received: receivedSong
        });

        // Call Firebase Function to trigger print
        const printSongSwap = httpsCallable(functions, 'printSongSwap');
        
        // Clean the song data to ensure it's serializable
        const cleanDepositedSong = {
          title: selectedDeposit.title,
          artist: selectedDeposit.artist,
          album: selectedDeposit.album,
          genre: selectedDeposit.genre,
          allGenres: selectedDeposit.allGenres || [],
          popularity: selectedDeposit.popularity,
          duration: selectedDeposit.duration,
          releaseDate: selectedDeposit.releaseDate,
          uri: selectedDeposit.uri,
          image: selectedDeposit.image,
          submittedByName: spotifyUser?.display_name || 'Guest User',
          submittedById: spotifyUser?.id || null,
          recommendation: recommendationNote || '',
          depositNumber
        };
        
        const cleanReceivedSong = {
          title: receivedSong.title,
          artist: receivedSong.artist,
          album: receivedSong.album,
          genre: receivedSong.genre,
          allGenres: receivedSong.allGenres || [],
          popularity: receivedSong.popularity,
          duration: receivedSong.duration,
          releaseDate: receivedSong.releaseDate,
          uri: receivedSong.uri,
          image: receivedSong.image,
          submittedByName: receivedSong.submittedByName || 'Unknown User',
          submittedById: receivedSong.submittedById || null,
          recommendation: receivedSong.recommendation || '',
          depositNumber: receivedSong.depositNumber || null
        };
        
        const functionData = {
          depositedSong: cleanDepositedSong,
          receivedSong: cleanReceivedSong
        };
        
        console.log('Calling Firebase Function with data:', functionData);
        console.log('Function data JSON:', JSON.stringify(functionData, null, 2));
        
        const result = await printSongSwap(functionData);
        console.log('Firebase Function result:', result);

        // Show success message
        setSongs({
          deposited: {
            ...selectedDeposit,
            submittedByName: spotifyUser?.display_name || 'Guest User',
            submittedById: spotifyUser?.id || null,
            recommendation: recommendationNote || '',
            depositNumber
          },
          received: receivedSong,
          status: 'thank-you'
        });
        
        // Update deposit count
        setDepositCount(prev => prev + 1);
        
      } catch (error) {
        console.error('Error creating swap:', error);
        alert('❌ Error creating swap. Please try again.');
      }
    }
  };

  // Function to get weighted random song from Firebase, preferring genre overlap
  const getWeightedRandomSong = async (seedGenres = [], excludeRecentDeposit = true) => {
    try {
      const songsQuery = query(collection(db, 'songs'));
      const querySnapshot = await getDocs(songsQuery);
      
      if (querySnapshot.empty) {
        console.log('No songs in database, using mock song');
        return getMockTopSong();
      }
      
      const songs = [];
      querySnapshot.forEach((docSnap) => {
        songs.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Find the highest deposit number to exclude the most recent
      const maxDepositNumber = Math.max(...songs.map(s => s.depositNumber || 0));
      
      // Filter out the most recent deposit if requested
      let filteredSongs = songs;
      if (excludeRecentDeposit && maxDepositNumber > 0) {
        filteredSongs = songs.filter(s => (s.depositNumber || 0) < maxDepositNumber);
        console.log(`Excluding most recent deposit (#${maxDepositNumber}), ${filteredSongs.length} songs remaining`);
      }
      
      // If no songs left after filtering, use all songs
      if (filteredSongs.length === 0) {
        console.log('No songs available after filtering, using all songs');
        filteredSongs = songs;
      }

      const lower = (arr = []) => arr.map(g => String(g).toLowerCase());
      const seed = lower(seedGenres);
      const overlap = (a, b) => a.some(g => b.includes(g));

      const genreCandidates = seed.length
        ? filteredSongs.filter(s => overlap(seed, lower(s.allGenres || [])))
        : filteredSongs;

      const pool = genreCandidates.length ? genreCandidates : filteredSongs;

      const weightedPool = pool.map(song => ({
        ...song,
        weight: 1 / (((song.withdrawals) || 0) + 1)
      }));

      const totalWeight = weightedPool.reduce((sum, s) => sum + s.weight, 0);
      let r = Math.random() * totalWeight;

      let chosen = weightedPool[0];
      for (const s of weightedPool) {
        r -= s.weight;
        if (r <= 0) { chosen = s; break; }
      }

      await updateDoc(doc(db, 'songs', chosen.id), {
        withdrawals: ((chosen.withdrawals) || 0) + 1
      });

      return {
        title: chosen.title,
        artist: chosen.artist,
        album: chosen.album,
        genre: chosen.genre,
        allGenres: chosen.allGenres || [],
        popularity: chosen.popularity,
        duration: chosen.duration,
        releaseDate: chosen.releaseDate,
        uri: chosen.uri,
        image: chosen.image,
        submittedByName: chosen.submittedByName || chosen.spotifyUsername || 'Unknown User',
        submittedById: chosen.submittedById || null,
        recommendation: chosen.recommendation || '',
        depositNumber: chosen.depositNumber || null,
        withdrawals: ((chosen.withdrawals) || 0) + 1
      };
      
    } catch (error) {
      console.error('Error getting weighted random song:', error);
      // Fallback to mock song
      return getMockTopSong();
    }
  };

  if (printMode) {
    return (
      <div className="print-container">
        <SongSwapSketch songs={songs} />
      </div>
    );
  }

  return (
    <div className="song-swap-page">
      <div className="song-swap-container">
        <header className="song-swap-header">
          <div className="logo-container">
            <img src={BangersOnlyBank} alt="Bangers Only Bank" />
          </div>
          
          <div className="deposit-counter">
            <span className="counter-label">Bangers Deposited</span>
            <span className="counter-number">{depositCount.toString().padStart(3, '0')}</span>
          </div>
        </header>

        {!spotifyUser ? (
          <div className="auth-section">
            <div className="auth-buttons">
              <button 
                className="auth-button spotify"
                onClick={handleSpotifyLogin}
                disabled={isProcessing}
              >
                <span className="auth-icon">🎵</span>
                Connect with Spotify
              </button>
              <button 
                className="auth-button recommendation"
                onClick={handleImmediateRecommendationPrint}
                disabled={isProcessing}
              >
                <span className="auth-icon">💡</span>
                Get a Recommendation
              </button>
            </div>
            <p className="auth-note">
              Connect with Spotify to use your top songs, or get a curated recommendation
            </p>
            
            {isProcessing && (
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="user-section">
            {songs ? (
              <div className="songs-section">
                {songs.status === 'thank-you' ? (
                  <div className="thank-you-message">
                    <h2>Thank you</h2>
                    <button className="get-recommendation-button" onClick={handleImmediateRecommendationPrint}>
                      Get Recommendation
                    </button>
                  </div>
                ) : null}
              </div>
            ) : topSongs ? (
              <div className="song-selection-section">
                <div className="user-info">
                  <p>Hello, {spotifyUser?.display_name || 'Music Lover'}!</p>
                  <p>Thanks for banking with us</p>
                </div>
                
                <h2>Your All‑Time #1 — Ready to Deposit</h2>
              
                <div className="song-grid">
                  {topSongs.map((song, index) => (
                    <div key={index} className="song-card">
                      <div className="song-rank">#{song.rank}</div>
                      {song.image && (
                        <img src={song.image} alt={song.title} className="song-image" />
                      )}
                      <h3>{song.title}</h3>
                      <p className="song-artist">{song.artist}</p>
                      <p className="song-album">{song.album}</p>
                      <p className="song-genre">{song.genre}</p>
                    </div>
                  ))}
                </div>
                <div className="recommendation-note" style={{ marginTop: 12 }}>
                  <label htmlFor="rec-note"><strong>Why this song?</strong></label>
                  <textarea
                    id="rec-note"
                    value={recommendationNote}
                    onChange={(e) => setRecommendationNote(e.target.value)}
                    placeholder="Write a short note about why you deposited this song..."
                    rows={3}
                    style={{ width: '100%', marginTop: 6 }}
                  />
                </div>
                
                {selectedDeposit && (
                  <div className="swap-actions">
                    <button className="create-swap-button" onClick={handleCreateSwap}>
                      Deposit Song
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ready-section">
                <p>Ready to swap songs!</p>
                <button className="swap-button" onClick={handleNewSwap}>
                  🎵 Start Song Swap
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={handleRetryAuth}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongSwapPage; 