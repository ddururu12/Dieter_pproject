import React, { useState, useEffect, useMemo } from 'react';
import Login from './Login';
import MyPage from './MyPage';

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
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

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

// --- Constants ---
const RDA = {
  calories: 2000,
  protein: 75,
  fat: 33,
  carbohydrates: 225,
};

// --- UI Components ---

// [수정됨] 메인 대시보드 (상단 텍스트 네비게이션 추가)
const MainDashboard = ({ dailyTotals, foodEntries, onUploadClick, isLoading, onNavigate }) => {
  const percentage = Math.min((dailyTotals.calories / RDA.calories) * 100, 100);
  const circleRadius = 55;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24">
      {/* Header Area */}
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        {/* [추가됨] 상단 텍스트 네비게이션 바 */}
        <div className="flex px-6 pt-4 gap-6 border-b border-gray-100">
            <button 
                onClick={() => onNavigate('dashboard')}
                className="pb-2 text-lg font-bold text-gray-900 border-b-2 border-black"
            >
                홈
            </button>
            <button 
                onClick={() => onNavigate('mypage')}
                className="pb-2 text-lg font-medium text-gray-400 hover:text-gray-900 transition-colors"
            >
                마이페이지
            </button>
        </div>

        {/* 기존 Header 내용 (날짜 등) */}
        <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">오늘의 기록</h2>
            <div className="flex gap-4 text-sm font-medium text-gray-400">
                <span>단식</span>
                <span className="relative">통계<span className="absolute -top-1 -right-2 w-2 h-2 bg-orange-500 rounded-full"></span></span>
            </div>
            </div>
            
            <div className="flex justify-center items-center gap-4 text-lg font-bold">
                <span className="text-gray-300">11.28</span>
                <span className="text-black bg-black text-white px-3 py-1 rounded-full text-sm">11.29 오늘</span>
                <span className="text-gray-300">11.30</span>
            </div>
        </div>
      </header>

      <main className="px-4 space-y-4 mt-4">
        {/* Main Summary Card */}
        <div className="bg-[#66cdaa] p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full pointer-events-none"></div>

            <div className="flex flex-col items-center justify-center py-4 relative">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r={circleRadius} stroke="rgba(255,255,255,0.3)" strokeWidth="12" fill="none" />
                        <circle cx="96" cy="96" r={circleRadius} stroke="#fff" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{dailyTotals.calories.toFixed(0)}</span>
                        <span className="text-sm font-medium opacity-80">kcal 먹었어요</span>
                    </div>
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2 text-right">
                    <div className="text-sm"><span className="opacity-70">탄수</span> <span className="font-bold text-xl">30%</span></div>
                    <div className="text-sm"><span className="opacity-70">단백</span> <span className="font-bold text-xl text-yellow-200">38%</span></div>
                    <div className="text-sm"><span className="opacity-70">지방</span> <span className="font-bold text-xl">31%</span></div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                    <div className="flex justify-between text-xs mb-1 opacity-90"><span>순탄수</span></div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden"><div style={{width: '30%'}} className="h-full bg-white rounded-full"></div></div>
                    <div className="text-center mt-1 text-xs font-medium">{dailyTotals.carbohydrates.toFixed(0)} / {RDA.carbohydrates}g</div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1 opacity-90"><span>단백질</span></div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden"><div style={{width: '60%'}} className="h-full bg-yellow-300 rounded-full"></div></div>
                    <div className="text-center mt-1 text-xs font-medium text-yellow-200">{dailyTotals.protein.toFixed(0)} / {RDA.protein}g</div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1 opacity-90"><span>지방</span></div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden"><div style={{width: '40%'}} className="h-full bg-white rounded-full"></div></div>
                    <div className="text-center mt-1 text-xs font-medium">{dailyTotals.fat.toFixed(0)} / {RDA.fat}g</div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-center">
                 <div><p className="text-xs opacity-70">내 목표</p><p className="font-bold text-lg">{RDA.calories}</p></div>
                 <div><p className="text-xs opacity-70">섭취량</p><p className="font-bold text-lg">{dailyTotals.calories.toFixed(0)}</p></div>
                 <div><p className="text-xs opacity-70">더 먹을 수 있어요</p><p className="font-bold text-lg text-yellow-300">{(RDA.calories - dailyTotals.calories).toFixed(0)}</p></div>
            </div>
        </div>

        {/* Image Upload / Food Log Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">오늘의 식사</h3>
                <label className="cursor-pointer bg-teal-50 px-4 py-2 rounded-full text-teal-600 text-sm font-bold hover:bg-teal-100 transition-colors flex items-center gap-2">
                   <span>+ 추가하기</span>
                   <input type="file" className="hidden" accept="image/*" onChange={onUploadClick} />
                </label>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-gray-400 animate-pulse">AI가 식사를 분석하고 있어요... 🍎</div>
            ) : (
                <div className="space-y-3">
                    {foodEntries.length === 0 ? (
                         <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">아직 기록된 식사가 없어요.</div>
                    ) : (
                        foodEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xl">🍽️</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{entry.foodName}</p>
                                        <p className="text-xs text-gray-500">{entry.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-800">{entry.calories?.toFixed(0)} kcal</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center text-xs font-medium text-gray-400 z-50">
          <div className="flex flex-col items-center gap-1 text-black cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-6 h-6 bg-black rounded-full mb-1"></div><span>기록</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-gray-800">
              <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div><span>AI코치</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-gray-800">
              <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div><span>배틀</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-gray-800">
              <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div><span>커뮤니티</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-gray-800 cursor-pointer" onClick={() => onNavigate('mypage')}>
              <div className="w-6 h-6 bg-gray-200 rounded-full mb-1"></div><span>마이룸</span>
          </div>
      </nav>
    </div>
  );
};

// --- Helper ---
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Main App Component
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'mypage'
  
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [foodEntries, setFoodEntries] = useState([]);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // 사용자 프로필 상태
  const [userProfile, setUserProfile] = useState({
    name: '김식단',
    email: 'test@dieter.com',
    height: 175,
    weight: 70
  });
  
  // --- Authentication ---
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        setIsLoggedIn(true);
      } else {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!userId || !db) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);
    const entriesCollection = collection(db, `artifacts/${appId}/users/${userId}/foodEntries`);
    const q = query(entriesCollection, where('timestamp', '>=', startOfTodayTimestamp));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries = [];
      querySnapshot.forEach((doc) => entries.push({ id: doc.id, ...doc.data() }));
      entries.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
      setFoodEntries(entries);
    });
    return () => unsubscribe();
  }, [userId]);

  // --- Totals ---
  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
    foodEntries.forEach((entry) => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.nutrients?.protein || 0;
      totals.fat += entry.nutrients?.fat || 0;
      totals.carbohydrates += entry.nutrients?.carbohydrates || 0;
    });
    return totals;
  }, [foodEntries]);

  // --- Handlers ---
  const handleLogin = async () => {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        setIsLoggedIn(true);
    } catch (e) {
        console.error(e);
        alert("로그인 에러 (콘솔 확인)");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setIsLoadingImage(true);
    try {
      const base64ImageData = await fileToBase64(file);
      const response = await fetch('https://schoolstuff-lj67.onrender.com/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64ImageData, mimeType: file.type }),
      });
      
      if (!response.ok) throw new Error('Backend Error');
      const foodData = await response.json();
      
      if (db && userId) {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/foodEntries`), {
          ...foodData,
          timestamp: Timestamp.now(),
        });
      }
    } catch (err) {
      console.error(err);
      alert("이미지 분석 실패");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleUpdateProfile = (newProfile) => {
    setUserProfile(newProfile);
  };

  // --- Render ---
  if (!isAuthReady) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <MainDashboard 
          dailyTotals={dailyTotals} 
          foodEntries={foodEntries} 
          onUploadClick={handleImageUpload}
          isLoading={isLoadingImage}
          onNavigate={setCurrentView}
        />
      )}
      {currentView === 'mypage' && (
        <MyPage 
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </>
  );
}