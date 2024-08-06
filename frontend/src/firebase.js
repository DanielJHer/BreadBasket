import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCBZTs4EMeT0JwO5NNqFkZjI2GW5O-lkMM',
  authDomain: 'breadbasket-b666b.firebaseapp.com',
  projectId: 'breadbasket-b666b',
  storageBucket: 'breadbasket-b666b.appspot.com',
  messagingSenderId: '765294789035',
  appId: '1:765294789035:web:b6f84686329e0111c752ee',
  measurementId: 'G-1GH75EPDJG',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
