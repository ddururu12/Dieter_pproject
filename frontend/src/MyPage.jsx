import React, { useState } from 'react';

const MyPage = ({ userProfile, onUpdateProfile, onBack }) => {
  // 입력 상태 관리
  const [height, setHeight] = useState(userProfile.height || '');
  const [weight, setWeight] = useState(userProfile.weight || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveStats = () => {
    onUpdateProfile({ ...userProfile, height, weight });
    alert('신체 정보가 저장되었습니다.');
  };

  const handleSaveAccount = () => {
    // 실제 변경 로직은 Firebase 연동 필요
    alert('계정 정보가 업데이트 되었습니다. (실제 반영은 백엔드 연동 필요)');
    setPassword('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">마이페이지</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 1. Profile Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold">
            {userProfile.name ? userProfile.name[0] : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{userProfile.name || '사용자'}</h2>
            <p className="text-sm text-gray-400">{userProfile.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* 2. Body Stats Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">내 신체 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">키 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500"
                placeholder="170"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">몸무게 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500"
                placeholder="60"
              />
            </div>
            <button 
              onClick={handleSaveStats}
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg mt-2 hover:bg-teal-600 transition-colors"
            >
              저장하기
            </button>
          </div>
        </div>

        {/* 3. Account Settings Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">계정 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">아이디 변경 (이메일)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="border-t border-gray-100 my-4 pt-4">
                <label className="text-sm font-medium text-gray-600 block mb-1">새 비밀번호</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500 mb-2"
                    placeholder="변경할 비밀번호 입력"
                />
            </div>
            <button 
              onClick={handleSaveAccount}
              className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              계정 정보 수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;