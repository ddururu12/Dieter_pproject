import React, { useState } from 'react';

// 공통 네비게이션 헤더 (각 뷰에서 currentView만 변경하여 사용)
const NavHeader = ({ currentView, onNavigate }) => (
    <header className="bg-white px-4 py-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-teal-500">Dieter</h1>
             <nav>
                {['dashboard', 'log', 'recommendation', 'mypage'].map((view) => (
                    <button 
                        key={view}
                        onClick={() => onNavigate(view)} 
                        className={`mx-2 text-lg pb-1 transition-colors ${
                            currentView === view
                                ? 'font-bold text-teal-500 border-b-2 border-teal-500'
                                : 'font-medium text-gray-500 hover:text-teal-500'
                        }`}
                    >
                        {view === 'dashboard' ? '홈' : view === 'log' ? '기록' : view === 'recommendation' ? '메뉴 추천' : '마이페이지'}
                    </button>
                ))}
            </nav>
        </div>
    </header>
);

const MyPage = ({ userProfile, onUpdateProfile, onNavigate }) => {
  const [height, setHeight] = useState(userProfile.height || '');
  const [weight, setWeight] = useState(userProfile.weight || '');
  const [email, setEmail] = useState(userProfile.email || 'test@dieter.com');
  const [newPassword, setNewPassword] = useState('');
  
  const handleSaveStats = () => {
    onUpdateProfile({ ...userProfile, height, weight });
    alert('신체 정보가 저장되었습니다.');
  };

  const handleSaveAccount = () => {
    alert('계정 정보가 업데이트 되었습니다.');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavHeader currentView="mypage" onNavigate={onNavigate} />

      <main className="p-4 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">마이페이지</h2>

        {/* 1. 내 신체 정보 섹션 */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">내 신체 정보</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">키 (cm)</label>
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} 
                           className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">몸무게 (kg)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                           className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500" />
                </div>
                <button 
                  onClick={handleSaveStats}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-4"
                >
                  저장하기
                </button>
            </div>
        </section>

        {/* 2. 계정 설정 섹션 (이메일 및 비밀번호 변경) */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">계정 설정</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">아이디 변경 (이메일)</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                           className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">새 비밀번호</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                           className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500"
                           placeholder="변경할 비밀번호 입력" />
                </div>
                <button 
                  onClick={handleSaveAccount}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-4"
                >
                  계정 정보 수정
                </button>
            </div>
        </section>
      </main>
    </div>
  );
};

export default MyPage;