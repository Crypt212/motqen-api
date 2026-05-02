import admin from 'firebase-admin';
import { logger } from './winston.js';
import environment from '../configs/environment.js';

let firebaseReady = false;

const raw = environment.firebase.serviceAccount;

if (raw) {
  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseReady = true;
    logger.info('✅ Firebase Admin initialized');
  } catch (error) {
    logger.warn('⚠️ Firebase Admin initialization failed — push notifications disabled', error);
  }
} else {
  logger.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
}

export default admin;
export { firebaseReady };
