import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Save, FileText, Pickaxe, Key } from 'lucide-react';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SermonPrepWizard = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');

    // Draft State
    const [topic, setTopic] = useState('');
    const [scripture, setScripture] = useState('');
    const [titles, setTitles] = useState([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [outline, setOutline] = useState('');

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

    const generateTitles = async () => {
        if (!topic || !scripture || !apiKey) return;
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Act as an expert theologian and speaker. Give me exactly 3 engaging, profound, and distinct sermon titles for a message about "${topic}" based on "${scripture}". Format the response as a simple numbered list, just the titles. Example:\n1. Title One\n2. Title Two\n3. Title Three`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Parse numbered list
            const parsedTitles = text.split('\n')
                .filter(line => line.trim().match(/^\d+\./))
                .map(line => line.replace(/^\d+\.\s*/, '').replace(/\*/g, '').trim())
                .slice(0, 3);

            setTitles(parsedTitles.length === 3 ? parsedTitles : [text.slice(0, 50), text.slice(50, 100), text.slice(100, 150)]);
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Error generating titles.");
        } finally {
            setLoading(false);
        }
    };

    const generateOutline = async () => {
        if (!selectedTitle) return;
        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Act as a senior pastor mentoring a younger minister. Write a comprehensive, 3-point sermon manuscript/outline. 
Title: "${selectedTitle}"
Topic: "${topic}"
Scripture: "${scripture}"

Format it beautifully using Markdown with:
- An engaging Introduction (with a 'hook')
- 3 clear main points (with practical application for each)
- A compelling Conclusion and call to action.`;

            const result = await model.generateContent(prompt);
            setOutline(result.response.text());
            setStep(3);
        } catch (error) {
            console.error(error);
            alert("Error generating outline.");
        } finally {
            setLoading(false);
        }
    };

    const saveToSermons = async () => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'sermons'), {
                title: selectedTitle,
                topic,
                scripture,
                notes: outline,
                date: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp()
            });
            setStep(4);
        } catch (error) {
            console.error(error);
            alert("Error saving sermon.");
        } finally {
            setLoading(false);
        }
    };

    const resetWizard = () => {
        setTopic('');
        setScripture('');
        setTitles([]);
        setSelectedTitle('');
        setOutline('');
        setStep(1);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
            <header className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 text-pink-700 rounded-2xl shadow-inner">
                    <Pickaxe size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sermon Prep Wizard</h1>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Co-author your next message with AI</p>
                </div>
            </header>

            {!apiKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3 text-amber-800 text-sm font-bold">
                    <Key size={18} className="text-amber-500" />
                    You haven't configured your Gemini API Key yet. Please do so in Settings.
                </div>
            )}

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-pink-500 rounded-full z-0 transition-all duration-500`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-300 ${step >= s ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${step >= s ? 'bg-pink-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                            {s === 4 ? <CheckCircle2 size={20} /> : s}
                        </div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider absolute -bottom-6 w-32 text-center -ml-16 left-1/2">
                            {s === 1 ? 'Topic' : s === 2 ? 'Title' : s === 3 ? 'Review' : 'Saved'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 min-h-[400px] mt-12 relative overflow-hidden">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6 max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900">What is God placing on your heart?</h2>
                            <p className="text-gray-500 mt-2 font-medium">Give me the seed, and we'll grow it together.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Core Topic or Theme</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Overcoming Fear, The Grace of God"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-semibold text-gray-800 text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Anchor Scripture</label>
                                <input
                                    type="text"
                                    value={scripture}
                                    onChange={(e) => setScripture(e.target.value)}
                                    placeholder="e.g. 2 Timothy 1:7, Ephesians 2:8"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-semibold text-gray-800 text-lg"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={generateTitles}
                                disabled={!topic || !scripture || loading || !apiKey}
                                className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                {loading ? <Sparkles size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                                {loading ? 'Brainstorming...' : 'Generate Titles'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Select a Sermon Title</h2>
                            <p className="text-gray-500 mt-2 font-medium">Choose from 3 AI-generated options for your message on <strong>{topic}</strong>.</p>
                        </div>

                        <div className="space-y-3">
                            {titles.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedTitle(t)}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group ${selectedTitle === t ? 'border-pink-500 bg-pink-50/50 scale-[1.02] shadow-md shadow-pink-100' : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${selectedTitle === t ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-pink-100 group-hover:text-pink-600'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className={`text-lg font-bold ${selectedTitle === t ? 'text-pink-900' : 'text-gray-700'}`}>{t}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="pt-8 flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-bold flex gap-2 items-center transition-colors">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={generateOutline}
                                disabled={!selectedTitle || loading}
                                className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-md shadow-pink-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Sparkles size={20} className="animate-spin" /> : <FileText size={20} />}
                                {loading ? 'Drafting Outline...' : 'Generate Outline'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6 h-full flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{selectedTitle}</h2>
                                <p className="text-gray-500 mt-1 font-semibold">{scripture} &mdash; {topic}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[400px]">
                            <textarea
                                value={outline}
                                onChange={(e) => setOutline(e.target.value)}
                                className="w-full h-full min-h-[400px] p-6 bg-amber-50/30 border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 resize-y text-gray-800 font-medium leading-relaxed"
                            />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 ml-1">You can freely edit this draft before saving.</p>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-bold flex gap-2 items-center transition-colors">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={saveToSermons}
                                disabled={loading}
                                className="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Sparkles size={20} className="animate-spin" /> : <Save size={20} />}
                                {loading ? 'Saving to Database...' : 'Save to My Sermons'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in zoom-in-95 duration-500 h-[400px] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">Sermon Saved!</h2>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                            "{selectedTitle}" has been safely stored in your database. You can view, edit, or delete it anytime from the <strong>My Sermons</strong> module.
                        </p>
                        <button
                            onClick={resetWizard}
                            className="px-8 py-4 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl font-bold transition-all active:scale-95"
                        >
                            Start Another Message
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SermonPrepWizard;
