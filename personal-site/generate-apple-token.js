const { SignJWT, importPKCS8 } = require('jose');

// Your Apple Developer credentials
const TEAM_ID = 'HY8S2WXJ2X'; // Your Team ID
const KEY_ID = 'J7M4MP5TY9'; // Your Key ID
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg7MjDrHmdC+sF36Xt
xCVMOrtcXfi1otb19qxfnpmv3ySgCgYIKoZIzj0DAQehRANCAASvpBXVcFp0H4h
cBKsPK1hLUekfN9V9JC0KZQJ3Ka+DJ2V6J+shsBy0DwEElPkOdqvLS46t5TK+v8
NKWLl3xh8n
-----END PRIVATE KEY-----`;

async function generateToken() {
  try {
    // Import the private key
    const privateKey = await importPKCS8(PRIVATE_KEY, 'ES256');
    
    // Create the JWT
    const jwt = await new SignJWT({
      // No payload needed for Apple Music tokens
    })
      .setProtectedHeader({ 
        alg: 'ES256', 
        kid: KEY_ID 
      })
      .setIssuedAt()
      .setIssuer(TEAM_ID)
      .setExpirationTime('6m') // 6 months
      .sign(privateKey);
    
    console.log('🎵 Apple Developer Token Generated Successfully!');
    console.log('📋 Copy this token to your SongSwapPage.js:');
    console.log('='.repeat(60));
    console.log(jwt);
    console.log('='.repeat(60));
    console.log('\n⚠️  Important Notes:');
    console.log('- This token expires in 6 months');
    console.log('- Keep your private key secure');
    console.log('- Regenerate this token before it expires');
    
    return jwt;
    
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.log('\n🔧 Make sure you have:');
    console.log('1. Installed jose: npm install jose');
    console.log('2. Your Team ID and Key ID are correct');
  }
}

// Run the token generation
generateToken(); 