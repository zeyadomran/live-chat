import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
	apiKey: 'AIzaSyDXEtoARYkTgXSuicWa8WwvaLPrhSp8vFM',
	authDomain: 'emoji-chat-d6418.firebaseapp.com',
	projectId: 'emoji-chat-d6418',
	storageBucket: 'emoji-chat-d6418.appspot.com',
	messagingSenderId: '20987845314',
	appId: '1:20987845314:web:408e66e3426fc65d95b95b',
	measurementId: 'G-3KSJD5VZ2R',
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
