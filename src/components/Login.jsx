import React, { useState } from 'react';
import { BookOpen, Key, LogIn, ShieldAlert } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulated network delay
        setTimeout(() => {
            const success = onLogin(username, password);
            if (!success) {
                setError('Invalid credentials. Remember default is admin/admin123');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-indigo-50/50 flex flex-col justify-center items-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mb-4 transform rotate-3">
                        <BookOpen size={32} className="text-indigo-600 -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Minister Workspace</h1>
                    <p className="text-indigo-600/80 font-medium mt-2 text-sm tracking-wide uppercase">Manage your calling with excellence</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8">
                    {/* Security Notice */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50 mb-6 flex gap-3 text-amber-800 text-sm items-start">
                        <ShieldAlert className="shrink-0 mt-0.5 text-amber-500" size={18} />
                        <p>Authorized personnel only. Default login is <strong>admin</strong> and <strong>admin123</strong>.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition font-medium text-gray-800"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition font-medium text-gray-800"
                                    required
                                />
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="animate-in fade-in zoom-in duration-200 text-rose-600 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 ${loading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Sign In securely
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 text-gray-500 text-xs font-medium">
                    &copy; {new Date().getFullYear()} Minister Workspace. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
