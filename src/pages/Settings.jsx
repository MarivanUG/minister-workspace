import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, User, ShieldAlert, Check } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Settings = () => {
    const [config, setConfig] = useState({ username: '', password: '', geminiApiKey: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRef = doc(db, 'config', 'minister_admin');
                const snap = await getDoc(configRef);
                if (snap.exists()) {
                    setConfig(snap.data());
                }
            } catch (error) {
                console.error("Error fetching admin config:", error);
                setMessage({ text: 'Error loading settings. Check Firestore rules.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const configRef = doc(db, 'config', 'minister_admin');
            await setDoc(configRef, config, { merge: true });
            setMessage({ text: 'Settings saved successfully! Next login will require updated credentials.', type: 'success' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-100 text-gray-700 rounded-2xl shadow-inner">
                    <SettingsIcon size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Manage credentials and API keys</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
                <ShieldAlert className="absolute -top-10 -right-10 text-gray-50 w-64 h-64 -rotate-12 pointer-events-none" />

                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm z-10 relative
                        ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}
                    `}>
                        {message.type === 'success' ? <Check size={20} className="text-emerald-500" /> : <ShieldAlert size={20} className="text-rose-500" />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-5 relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Admin Credentials</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Admin Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                required
                                value={config.username || ''}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-gray-800"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Admin Password</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="password"
                                required
                                value={config.password || ''}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-gray-800"
                            />
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                <div className="space-y-5 relative z-10 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Integrations</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Gemini API Key</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="geminiApiKey"
                                value={config.geminiApiKey || ''}
                                onChange={handleChange}
                                placeholder="AIzaSy..."
                                className="w-full pl-4 pr-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-semibold text-gray-800"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1 font-medium">This key powers the AI Assistant and document summarizer tools.</p>
                    </div>
                </div>

                <div className="pt-6 relative z-10 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-75 flex gap-2 items-center"
                    >
                        {saving ? 'Saving Changes...' : <><Save size={18} /> Save Settings</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
