// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC35B7WLS2-Y8O6guqkNYE54QURlwSWpBE",
    authDomain: "residental-system.firebaseapp.com",
    projectId: "residental-system",
    storageBucket: "residental-system.firebasestorage.app",
    messagingSenderId: "1065961808011",
    appId: "1:1065961808011:web:a6af0e4b654cc7f9fe348e",
    measurementId: "G-H6WKNC1W17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);