import React from 'react';

const Login = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo Area */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-teal-500 mb-2">Dieter</h1>
          <p className="text-gray-400">나만의 똑똑한 식단 관리</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">이메일</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">비밀번호</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              onClick={onLogin}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-4"
            >
              로그인
            </button>
          </div>
          
          <p className="text-center mt-6 text-sm text-gray-400">
            계정이 없으신가요? <a href="#" className="text-teal-500 font-bold">회원가입</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;