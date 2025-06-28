import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl shadow-lg mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Inncircles</h1>
          <p className="text-purple-100 text-sm sm:text-base">Intern Portal</p>
        </div>

        {/* Login form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-100 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <LogIn size={18} />
                  <span>Sign In</span>
                </div>
              )}
            </button>
          </form>

          {/* Demo credentials */}

        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-purple-100 text-xs sm:text-sm">
            © 2025 Inncircles. Empowering the next generation of innovators.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
