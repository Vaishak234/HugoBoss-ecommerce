import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyASOlXDXb0g4qYgLhQdJcL4JdPtVgWK3eU",
  authDomain: "hugoboss-ecommerce.firebaseapp.com",
  projectId: "hugoboss-ecommerce",
  storageBucket: "hugoboss-ecommerce.appspot.com",
  messagingSenderId: "854483694",
  appId: "1:854483694:web:e152f34c1ffe75db5909ff",
  measurementId: "G-WD4TXYYHRC"
};



const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);