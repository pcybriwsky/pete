const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3008;

// Spotify configuration
const spotifyApi = new SpotifyWebApi({
  clientId: 'eaaa05c8731f45949942df38bb26e623',
  clientSecret: '6282661653ca4461b38886dc444d8602',
  redirectUri: 'http://127.0.0.1:3008/callback'
});

// Scopes needed for playlist modification
const scopes = [
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private'
];

app.get('/', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.send(`
    <h1>Spotify Authentication</h1>
    <p>Click the link below to authorize the app to modify your playlists:</p>
    <a href="${authorizeURL}" style="background: #1DB954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Authorize Spotify App
    </a>
  `);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('No authorization code received');
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    console.log('✅ Authentication successful!');
    console.log('Access Token:', data.body.access_token);
    console.log('Refresh Token:', data.body.refresh_token);
    console.log('Expires In:', data.body.expires_in);
    
    res.send(`
      <h1>✅ Authentication Successful!</h1>
      <p>Your refresh token has been obtained. Check the console for the token.</p>
      <p><strong>Refresh Token:</strong> ${data.body.refresh_token}</p>
      <p>Copy this token and update the playlist-sync-script.js file.</p>
    `);
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`🔗 Authentication server running at http://127.0.0.1:${port}`);
  console.log('📱 Open this URL in your browser to authenticate:');
  console.log(`   http://127.0.0.1:${port}`);
}); 