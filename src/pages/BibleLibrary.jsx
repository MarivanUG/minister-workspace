import React, { useState } from 'react';
import { Book, Search, Library, Bookmark, RefreshCw } from 'lucide-react';

const BibleLibrary = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [translation, setTranslation] = useState('web');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=${translation}`);
            if (!res.ok) {
                throw new Error('Reference not found. Try "John 3:16" or "Romans 8"');
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <header className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shadow-inner">
                    <Library size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bible Library</h1>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Quick Scripture lookup & research</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative z-10">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. John 3:16-17, Romans 8"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-semibold text-gray-800 text-lg shadow-inner"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    </div>
                    <select
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                        className="px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-600 outline-none hidden sm:block shadow-inner cursor-pointer"
                    >
                        <option value="web">WEB (World English)</option>
                        <option value="kjv">KJV (King James)</option>
                        <option value="bbe">BBE (Basic English)</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-75 flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Search'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-100 flex items-center gap-3">
                        <Bookmark className="text-rose-400" size={20} />
                        {error}
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-[#fffdf0] rounded-3xl p-8 lg:p-12 border border-amber-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-200"></div>
                    <h2 className="text-3xl font-black text-amber-900 mb-2">{result.reference}</h2>
                    <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-8">{result.translation_name}</p>

                    <div className="space-y-4 text-justify">
                        {result.verses.map((verse) => (
                            <p key={verse.verse} className="text-lg md:text-xl text-gray-800 leading-loose font-medium">
                                <sup className="text-xs font-bold text-amber-500 mr-1">{verse.verse}</sup>
                                {verse.text.trim()}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Suggestions */}
            {!result && !loading && !error && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 opacity-60">
                    {['Genesis 1', 'Psalm 23', 'John 14', 'Romans 8'].map(ref => (
                        <button
                            key={ref}
                            onClick={() => { setQuery(ref); setTranslation('web'); setTimeout(() => document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 10); }}
                            className="p-4 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-bold transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <Book size={16} /> {ref}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BibleLibrary;
