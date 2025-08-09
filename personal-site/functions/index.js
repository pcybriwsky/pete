/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

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
