// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFNmIw9VUy2MYaidt2GY7DD3_Suv7TQTo",
  authDomain: "hiring-guru.firebaseapp.com",
  projectId: "hiring-guru",
  storageBucket: "hiring-guru.firebasestorage.app",
  messagingSenderId: "842977968726",
  appId: "1:842977968726:web:3513e98ec001d1aaeeb1f7",
  measurementId: "G-Y0NQB4K87X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);