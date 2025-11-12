import React, { useState, useEffect, useMemo } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  setLogLevel,
} from 'firebase/firestore';

// --- Global Firebase & App Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCOggkRb4hF3gUT3Gf6aJXes3zm6_Yspzg",
  authDomain: "dieter-512e1.firebaseapp.com",
  projectId: "dieter-512e1",
  storageBucket: "dieter-512e1.firebasestorage.app",
  messagingSenderId: "494620949863",
  appId: "1:494620949863:web:70d3aca17dc51708c583c2"
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'dieter-app';
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined'
    ? __initial_auth_token
    : null;

// --- Firebase Initialization ---
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setLogLevel('debug');
} catch (e) {
  console.error('Firebase initialization error:', e);
}

// --- Recommended Daily Allowances (RDAs) ---
const RDA = {
  calories: 2000,
  protein: 50, // grams
  fat: 78, // grams
  carbohydrates: 275, // grams
};

// --- Helper Components (Dark Mode) ---

/**
 * A simple loading spinner component.
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
  </div>
);

/**
 * A modal component for displaying errors or messages.
 */
const Modal = ({ title, message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300">
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-gray-700">
      <h3 className="text-lg font-medium leading-6 text-white">{title}</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-400">{message}</p>
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

/**
 * Component for uploading an image.
 */
const ImageUploader = ({ onImageUpload, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">
        Add Food Item
      </h2>
      <label
        htmlFor="file-upload"
        className={`flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          dragOver ? 'border-blue-500 bg-gray-700' : 'hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-400">
            <span className="relative font-medium text-blue-400 hover:text-blue-300">
              Upload a photo
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </label>
      {isLoading && (
        <div className="mt-4">
          <LoadingSpinner />
          <p className="text-center text-sm text-gray-400 mt-2">
            Analyzing your food...
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Displays the daily nutritional summary and RDA percentages.
 */
const DailySummary = ({ totals }) => {
  const summaryItems = [
    {
      name: 'Calories',
      value: totals.calories,
      rda: RDA.calories,
      unit: 'kcal',
    },
    {
      name: 'Protein',
      value: totals.protein,
      rda: RDA.protein,
      unit: 'g',
    },
    { name: 'Fat', value: totals.fat, rda: RDA.fat, unit: 'g' },
    {
      name: 'Carbs',
      value: totals.carbohydrates,
      rda: RDA.carbohydrates,
      unit: 'g',
    },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">
        Today's Summary
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryItems.map((item) => {
          const percentage = item.rda > 0 ? (item.value / item.rda) * 100 : 0;
          const barWidth = Math.min(percentage, 100);

          return (
            <div key={item.name} className="text-center">
              <div className="relative h-24 w-24 mx-auto">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-700"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                  />
                  <path
                    className="text-blue-500"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                    strokeDasharray={`${barWidth}, 100`}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white">
                  {Math.round(percentage)}%
                </div>
              </div>
              <p className="font-semibold text-gray-300 mt-2">{item.name}</p>
              <p className="text-sm text-gray-400">
                {item.value.toFixed(0)} / {item.rda} {item.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Displays the list of food items eaten today.
 */
const FoodList = ({ foodEntries }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
    <h2 className="text-xl font-semibold text-white mb-4">Today's Log</h2>
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {foodEntries.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          No food logged for today.
        </p>
      ) : (
        foodEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
          >
            <div>
              <p className="font-semibold text-white">{entry.foodName}</p>
              <p className="text-sm text-gray-400">
                {entry.calories ? entry.calories.toFixed(0) : 0} kcal &bull;{' '}
                {entry.nutrients?.protein ? entry.nutrients.protein.toFixed(0) : 0}g P &bull;{' '}
                {entry.nutrients?.fat ? entry.nutrients.fat.toFixed(0) : 0}g F &bull;{' '}
                {entry.nutrients?.carbohydrates ? entry.nutrients.carbohydrates.toFixed(0) : 0}g C
              </p>
            </div>
            {entry.timestamp && (
              <span className="text-sm text-gray-500">
                {entry.timestamp.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);


// --- REMOVED: Recommendation Component ---


/**
 * Main App Component
 */
export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState(null);

  // --- REMOVED: Recommendation State and Refs ---

  // --- 1. Authentication Effect ---
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth is not initialized.');
      setError('Firebase failed to initialize. Please check console.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (authError) {
          console.error('Error signing in:', authError);
          setError(`Failed to authenticate: ${authError.message}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Firestore Data-Fetching Effect ---
  useEffect(() => {
    if (!isAuthReady || !userId || !db) {
      return;
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);
    const entriesCollection = collection(
      db,
      `artifacts/${appId}/users/${userId}/foodEntries`
    );
    const q = query(
      entriesCollection,
      where('timestamp', '>=', startOfTodayTimestamp)
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const entries = [];
        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() });
        });
        entries.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.toDate() - a.timestamp.toDate();
          }
          return 0;
        });
        setFoodEntries(entries);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    );
    return () => unsubscribe();
  }, [isAuthReady, userId]);

  // --- 3. Compute Daily Totals ---
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
    };
    foodEntries.forEach((entry) => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.nutrients?.protein || 0;
      totals.fat += entry.nutrients?.fat || 0;
      totals.carbohydrates += entry.nutrients?.carbohydrates || 0;
    });
    return totals;
  }, [foodEntries]);

  // --- Helper: Convert file to base64 ---
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve(reader.result.split(',')[1]); 
      reader.onerror = (error) => reject(error);
    });
  };

  // --- 4. Gemini API Call: Image Analysis ---
  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsLoadingImage(true);
    setError(null);
    try {
      const base64ImageData = await fileToBase64(file);
      const response = await fetch('https://schoolstuff-lj67.onrender.com/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ImageData,
          mimeType: file.type,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Backend error: ${errData.error || response.statusText}`);
      }
      const foodData = await response.json();
      if (db && userId) {
        const entriesCollection = collection(
          db,
          `artifacts/${appId}/users/${userId}/foodEntries`
        );
        await addDoc(entriesCollection, {
          ...foodData,
          timestamp: Timestamp.now(), 
        });
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(`Error analyzing image: ${err.message}`);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // --- REMOVED: handleGetRecommendation function ---
  
  // --- REMOVED: Automatic Recommendation Effect ---


  // --- Render App ---
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner />
        <p className="ml-2 text-gray-400">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 font-inter text-gray-200">
      {error && (
        <Modal
          title="An Error Occurred"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <main className="max-w-2xl mx-auto space-y-6">
        <header className="text-center py-4">
          <h1 className="text-4xl font-bold text-white">
            Dieter
          </h1>
        </header>

        {/* 1. Add Food Item */}
        <ImageUploader
          onImageUpload={handleImageUpload}
          isLoading={isLoadingImage}
        />

        {/* 2. Today's Summary */}
        <DailySummary totals={dailyTotals} />
        
        {/* 3. Today's Log */}
        <FoodList foodEntries={foodEntries} />

        {/* --- REMOVED: Recommendation Component --- */}
      </main>
    </div>
  );
}