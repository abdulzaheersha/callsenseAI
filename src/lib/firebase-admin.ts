import admin from 'firebase-admin';

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    try {
        await admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch(e) {
        console.log(e);
    }
}