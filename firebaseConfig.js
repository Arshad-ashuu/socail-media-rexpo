import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // to check platform web/device
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration


// Initialize Firebase App only if not already initialized id initilized then get the instence of that
const firebaseConfig = {
  apiKey: "AIzaSyCH6Kx3speUvl8vvWJlIBXu9DwDurDcBnM",
  authDomain: "explore-b1a73.firebaseapp.com",
  projectId: "explore-b1a73",
  storageBucket: "explore-b1a73.appspot.com",
  messagingSenderId: "64533833522",
  appId: "1:64533833522:web:620097364c3e9d639d192b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); 

// Initialize Auth with AsyncStorage persistence for native platforms
export const auth = Platform.OS === "web"
  ? getAuth(app) // For web, use getAuth
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export const db = getFirestore(app);    


