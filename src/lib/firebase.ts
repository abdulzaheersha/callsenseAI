import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-5914560500-7c943",
  "appId": "1:374205285734:web:3a439b5f9c73538763f4a7",
  "apiKey": "AIzaSyB1PTQslFQIfvR-n0SHEfREalWlRxTHdlM",
  "authDomain": "studio-5914560500-7c943.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "374205285734"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

export { app, auth };
