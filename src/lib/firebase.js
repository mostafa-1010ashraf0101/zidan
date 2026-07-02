import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// الإعدادات الحقيقية لبراند ZIDAN
const firebaseConfig = {
  apiKey: "AIzaSyBi4JpMVHuvflISB8DVOiMayUwPTtNTSww",
  authDomain: "zidan-brand.firebaseapp.com",
  projectId: "zidan-brand",
  storageBucket: "zidan-brand.firebasestorage.app",
  messagingSenderId: "891724181605",
  appId: "1:891724181605:web:b7b03751addf4f0e63568c",
  measurementId: "G-12Q91PCSGH"
};

// منع تهيئة التطبيق أكثر من مرة أثناء الـ Hot Reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };