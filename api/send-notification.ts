import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin once
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM Token is required' });
    }

    const payload = {
      notification: {
        title: title || 'Ludo Star',
        body: body || 'You have a new notification!',
      },
      data: data || {},
    };

    const response = await getMessaging().send({
      token: token,
      ...payload
    });

    return res.status(200).json({ success: true, response });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: error.message });
  }
}
