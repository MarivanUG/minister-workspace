import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, Info, Key, Check } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', text: 'Hello Pastor! I am your AI Ministry Assistant. You can ask me to help outline a sermon, explain cultural contexts of scriptures, or brainstorm sermon series ideas. How can I serve you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // API Key State
    const [apiKey, setApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [isSavingKey, setIsSavingKey] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load API Key from Firestore on mount
    useEffect(() => {
        const fetchKey = async () => {
            try {
                const configRef = doc(db, 'config', 'minister_admin');
                const snap = await getDoc(configRef);
                if (snap.exists() && snap.data().geminiApiKey) {
                    setApiKey(snap.data().geminiApiKey);
                    setIsKeySaved(true);
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };
        fetchKey();
    }, []);

    const handleSaveKey = async (e) => {
        e.preventDefault();
        if (!apiKey.trim()) return;

        setIsSavingKey(true);
        try {
            const configRef = doc(db, 'config', 'minister_admin');
            await setDoc(configRef, { geminiApiKey: apiKey.trim() }, { merge: true });
            setIsKeySaved(true);
        } catch (error) {
            console.error("Error saving key:", error);
            alert("Failed to save key. Make sure your Firestore rules are updated.");
        } finally {
            setIsSavingKey(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !isKeySaved) return;

        const userText = input.trim();
        const userMsg = { id: Date.now(), role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Format history for Gemini SDK
            // We skip the very first welcome message and map the rest
            const history = messages.slice(1).map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.text }],
            }));

            // Start chat session with system instruction proxy
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: "You are a helpful, wise AI Assistant for a Christian Minister. Keep your answers concise, practical, deeply empathetic, and scripturally grounded." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood! I am ready to serve the minister." }],
                    },
                    ...history
                ]
            });

            const result = await chat.sendMessage(userText);
            const responseText = result.response.text();

            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: responseText }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: `Error communicating with AI: ${error.message}. Please check if your API key is valid.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <header className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl shadow-inner">
                    <Sparkles size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Assistant</h1>
                    <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Brainstorm, research, and outline</p>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-t-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">

                {/* API Key Banner */}
                {!isKeySaved && (
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
                        <div className="flex items-center gap-3 text-amber-800 text-sm">
                            <Key size={20} className="text-amber-500 shrink-0" />
                            <div>
                                <p className="font-bold">Connect your Gemini API Key</p>
                                <p className="text-xs opacity-80 mt-0.5">Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio</a> to unlock AI chatting.</p>
                            </div>
                        </div>
                        <form onSubmit={handleSaveKey} className="flex w-full sm:w-auto gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste API Key here..."
                                className="w-full sm:w-64 px-4 py-2 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium text-gray-800"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSavingKey}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-75 flex gap-2 items-center"
                            >
                                {isSavingKey ? 'Saving...' : <><Check size={16} /> Save</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-3 rounded-2xl shrink-0 ${msg.role === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                {msg.role === 'ai' ? <Bot size={24} /> : <User size={24} />}
                            </div>
                            <div className={`max-w-[75%] rounded-3xl p-5 text-sm md:text-base leading-relaxed font-medium shadow-sm border whitespace-pre-wrap
                                ${msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none border-gray-800'
                                    : 'bg-white text-gray-800 rounded-tl-none border-gray-100'}`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl shrink-0 bg-purple-100 text-purple-600">
                                <Bot size={24} />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-none p-5 flex gap-2 w-24">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl relative z-10">
                    <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder={isKeySaved ? "Ask me to outline a sermon on Grace..." : "Please save your API key above first..."}
                            disabled={!isKeySaved}
                            className="w-full pl-6 pr-16 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-800 resize-none shadow-inner h-14 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading || !isKeySaved}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center cursor-pointer"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-center text-[10px] uppercase font-bold text-gray-400 mt-3 tracking-widest">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
