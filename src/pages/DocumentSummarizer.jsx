import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Wand2, RefreshCw, Key, ArrowRight, UploadCloud, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DocumentSummarizer = () => {
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const fetchKey = async () => {
            try {
                const configRef = doc(db, 'config', 'minister_admin');
                const snap = await getDoc(configRef);
                if (snap.exists() && snap.data().geminiApiKey) {
                    setApiKey(snap.data().geminiApiKey);
                }
            } catch (error) {
                console.error("Error fetching AI key:", error);
            }
        };
        fetchKey();
    }, []);

    const handleSummarize = async () => {
        if (!inputText.trim() && !selectedFile) return;
        if (!apiKey) {
            alert("Please configure your Gemini API Key in Settings first.");
            return;
        }

        setLoading(true);
        setSummary('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const promptText = `You are a theologian and minister's assistant. Please read the provided document/text and provide a comprehensive but concise summary. Include: 1) The main thesis/argument, 2) 3-5 key bullet points, 3) A brief paragraph on how a minister might apply this in a sermon or teaching.\n\nText to summarize:\n${inputText}`;

            let parts = [promptText];

            if (selectedFile) {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });

                parts = [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: selectedFile.type || "application/pdf"
                        }
                    },
                    promptText
                ];
            }

            const result = await model.generateContent(parts);
            setSummary(result.response.text());
        } catch (error) {
            console.error("Summarization Error:", error);
            setSummary("Error generating summary: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <header className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-inner">
                    <FileText size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Document Summarizer</h1>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Paste long articles or chapters to extract key insights</p>
                </div>
            </header>

            {!apiKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3 text-amber-800 text-sm font-bold">
                    <Key size={18} className="text-amber-500" />
                    You haven't configured your Gemini API Key yet. Please do so in Settings.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                    <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                        <span>Source Text or PDF</span>
                        <span className="text-xs text-gray-400 font-semibold">{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                        {selectedFile ? (
                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl my-auto">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-emerald-500" size={24} />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                                        <p className="text-xs font-semibold text-emerald-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedFile(null)} className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative h-full">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Paste your long theological article, book chapter, or commentary here..."
                                    className="w-full h-80 resize-none outline-none font-medium text-gray-800 placeholder:text-gray-300"
                                />
                                <div className="absolute bottom-2 right-2 flex gap-2">
                                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-200 shadow-sm rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition active:scale-95">
                                        <UploadCloud size={16} /> Upload PDF
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setSelectedFile(e.target.files[0]);
                                                    if (inputText === '') setInputText('Please summarize this document.');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={handleSummarize}
                            disabled={loading || (!inputText.trim() && !selectedFile) || !apiKey}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            {loading ? 'Analyzing Document...' : 'Summarize Document'}
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div className="bg-[#f0fdf4] rounded-3xl border border-emerald-100 shadow-sm flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-300"></div>
                    <div className="bg-emerald-50/50 px-5 py-4 border-b border-emerald-100 font-bold text-emerald-900 flex items-center gap-2 ml-2">
                        <Sparkles size={16} className="text-emerald-600" /> AI Insights & Takeaways
                    </div>
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[32rem] ml-2">
                        {!summary && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-700/50 space-y-3">
                                <ArrowRight size={48} className="animate-pulse" />
                                <p className="font-semibold text-center mt-2 max-w-xs">Paste text on the left and click summarize to see the magic happen.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                                </div>
                                <p className="text-emerald-800 font-bold animate-pulse">Reading and distilling insights...</p>
                            </div>
                        )}
                        {summary && !loading && (
                            <div className="prose prose-emerald prose-sm sm:prose-base prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed text-gray-800">
                                {/* Since we aren't using a full markdown renderer here, we do a basic split mapping */}
                                {summary.split('\n').map((line, i) => {
                                    if (line.startsWith('##')) return <h3 key={i} className="text-emerald-900 mt-6 mb-2">{line.replace(/#/g, '').trim()}</h3>;
                                    if (line.startsWith('#')) return <h2 key={i} className="text-emerald-900 text-xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h2>;
                                    if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-2">{line.replace(/\*/g, '').trim()}</li>;
                                    if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2">{line.replace(/-/g, '').trim()}</li>;
                                    if (line.trim() === '') return <br key={i} />;
                                    return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DocumentSummarizer;
