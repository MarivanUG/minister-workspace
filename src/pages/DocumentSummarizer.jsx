import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Wand2, RefreshCw, Key, ArrowRight, UploadCloud, X, Download, FileAudio } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

const DocumentSummarizer = () => {
    const [inputText, setInputText] = useState('');
    const [files, setFiles] = useState([]);
    const [summary, setSummary] = useState('');
    const [sermon, setSermon] = useState('');
    const [loading, setLoading] = useState(false);
    const [sermonLoading, setSermonLoading] = useState(false);
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const generateDocx = async (text, filename) => {
        const lines = text.split('\n');
        const children = [];

        // Basic Markdown to Docx parser
        let inList = false;

        for (let line of lines) {
            if (!line.trim()) {
                children.push(new Paragraph({ text: "" }));
                continue;
            }

            let plainText = line.replace(/\*\*/g, '').trim();

            if (line.startsWith('### ')) {
                children.push(new Paragraph({ text: plainText.replace('### ', ''), heading: HeadingLevel.HEADING_3 }));
            } else if (line.startsWith('## ')) {
                children.push(new Paragraph({ text: plainText.replace('## ', ''), heading: HeadingLevel.HEADING_2 }));
            } else if (line.startsWith('# ')) {
                children.push(new Paragraph({ text: plainText.replace('# ', ''), heading: HeadingLevel.HEADING_1 }));
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                children.push(new Paragraph({ text: plainText.replace(/^[-*]\s/, ''), bullet: { level: 0 } }));
            } else {
                children.push(new Paragraph({ children: [new TextRun(plainText)] }));
            }
        }

        const doc = new Document({
            sections: [{ children }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, filename || "Ministry_Document.docx");
    };

    const handleSummarize = async () => {
        if (!inputText.trim() && files.length === 0) return;
        if (!apiKey) {
            toast.error("Please configure your Gemini API Key in Settings first.");
            return;
        }

        setLoading(true);
        setSummary('');
        setSermon('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const isSingle = (inputText.trim() ? 1 : 0) + files.length === 1;

            const singlePrompt = `You are an expert summarizer of Christian teachings. I will provide you with document containing a teaching. Your task is to create a well-structured summary that is:
Clear and concise: capture the main theme and supporting summaries cointained therein.
Complete: include every example and Scripture reference exactly as they appear in the text. Do not omit any.
Organized:Start with the central theme of the teaching.
Present the supporting points in the order they appear.
For each point, list the examples and connect the Scripture references that support it.
The final summary should flow logically, read naturally, and preserve the teaching's integrity.`;

            const multiPrompt = `You are an expert summarizer of Christian teachings. I will provide you with several documents containing a teaching. Your task is to create a well-structured summary that is:
Clear and concise: capture the main theme and supporting summaries cointained therein.
Complete: include every example and Scripture reference exactly as they appear in the text. Do not omit any.
Organized:Start with the central theme of the teaching.
Present the supporting points in the order they appear.
For each point, list the examples and connect the Scripture references that support it.
The final summary should flow logically, read naturally, and preserve the teaching's integrity. Because it's a long message, share the final output in different reasonal parts you deem fit to bring it out in clear understandable segments. share final outputs in docx well formatted documents.`;

            const promptText = (isSingle ? singlePrompt : multiPrompt) + `\n\nText to summarize:\n${inputText}`;

            let parts = [{ text: promptText }];

            // Add all files
            for (let file of files) {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type || "application/pdf"
                    }
                });
            }

            const result = await model.generateContent(parts);
            const responseText = result.response.text();
            setSummary(responseText);

            // Generate Word doc automatically if it was multi-doc, OR based on user's request.
            // The prompt says "share final outputs in docx" which implies downloading it.
            generateDocx(responseText, "Teaching_Summary.docx");

        } catch (error) {
            console.error("Summarization Error:", error);
            setSummary("Error generating summary: " + error.message);
            toast.error("Error generating summary.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSermon = async () => {
        if (!summary || !apiKey) return;
        setSermonLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const promptText = `Act as a senior minister. Based on the following extensive teaching summary, prepare a suggested sermon outline that I can preach to my congregation. Make sure the sermon has a clear central theme, an introduction, 3 actionable main points supported by the scriptures in the summary, and a strong conclusion.\n\nSummary:\n${summary}`;
            const result = await model.generateContent(promptText);
            setSermon(result.response.text());
            toast.success("Sermon drafted successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Error generating sermon.");
        } finally {
            setSermonLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-inner">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Document Summarizer</h1>
                        <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Distill long teachings & generate sermons</p>
                    </div>
                </div>
            </header>

            {!apiKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3 text-amber-800 text-sm font-bold">
                    <Key size={18} className="text-amber-500" />
                    You haven't configured your Gemini API Key yet. Please do so in Settings.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Inputs Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                    <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                        <span>Source Material</span>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white px-3 py-1.5 border border-gray-200 shadow-sm rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition active:scale-95">
                                <UploadCloud size={14} /> Add PDF
                                <input
                                    type="file"
                                    accept="application/pdf, text/plain"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col overflow-y-auto">

                        {files.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="text-emerald-500 shrink-0" size={18} />
                                            <p className="text-sm font-bold text-emerald-900 truncate max-w-[200px]">{file.name}</p>
                                        </div>
                                        <div className="flex flex-row items-center gap-3 shrink-0">
                                            <span className="text-xs font-semibold text-emerald-600 hidden sm:block">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <button onClick={() => removeFile(idx)} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 p-1 rounded-md transition">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative h-64 sm:h-80 shrink-0">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Also optionally paste your raw text, transcript, or commentary here..."
                                className="w-full h-full resize-none outline-none font-medium text-gray-800 placeholder:text-gray-300 bg-gray-50 border border-gray-100 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                            />
                        </div>

                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <button
                            onClick={handleSummarize}
                            disabled={loading || (!inputText.trim() && files.length === 0) || !apiKey}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            {loading ? 'Analyzing Content...' : 'Summarize Document & Export .DOCX'}
                        </button>
                    </div>
                </div>

                {/* Outputs Area */}
                <div className="bg-[#f0fdf4] rounded-3xl border border-emerald-100 shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-300"></div>
                    <div className="bg-emerald-50/50 px-5 py-4 border-b border-emerald-100 font-bold text-emerald-900 flex items-center justify-between ml-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-emerald-600" /> AI Output
                        </div>
                        {summary && (
                            <button
                                onClick={() => generateDocx(sermon || summary, "Minister_Document.docx")}
                                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                            >
                                <Download size={12} /> Download .DOCX
                            </button>
                        )}
                    </div>
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[40rem] ml-2">
                        {!summary && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-700/50 space-y-3">
                                <ArrowRight size={48} className="animate-pulse" />
                                <p className="font-semibold text-center mt-2 max-w-xs">Upload documents or paste text to see the magic happen.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                                </div>
                                <p className="text-emerald-800 font-bold animate-pulse">Distilling deep insights from source material...</p>
                            </div>
                        )}
                        {summary && !loading && !sermon && (
                            <div className="space-y-6">
                                <div className="prose prose-emerald prose-sm sm:prose-base prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed text-gray-800">
                                    {summary.split('\n').map((line, i) => {
                                        if (line.startsWith('###')) return <h3 key={i} className="text-emerald-900 mt-6 mb-2">{line.replace(/#/g, '').trim()}</h3>;
                                        if (line.startsWith('##')) return <h2 key={i} className="text-emerald-900 text-xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h2>;
                                        if (line.startsWith('#')) return <h1 key={i} className="text-emerald-900 text-2xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h1>;
                                        if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-2">{line.replace(/\*/g, '').trim()}</li>;
                                        if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2">{line.replace(/-/g, '').trim()}</li>;
                                        if (line.trim() === '') return <br key={i} />;
                                        return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
                                    })}
                                </div>
                                <div className="pt-6 border-t border-emerald-100 flex justify-end">
                                    <button
                                        onClick={handleGenerateSermon}
                                        disabled={sermonLoading}
                                        className="py-3 px-6 bg-emerald-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {sermonLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        {sermonLoading ? 'Drafting Sermon...' : 'Prepare Suggested Sermon'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {sermon && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-bold mb-4">
                                    <Sparkles size={16} /> Suggested Sermon Outline Generated
                                </div>
                                <div className="prose prose-indigo prose-sm sm:prose-base prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed text-gray-800">
                                    {sermon.split('\n').map((line, i) => {
                                        if (line.startsWith('###')) return <h3 key={i} className="text-indigo-900 mt-6 mb-2">{line.replace(/#/g, '').trim()}</h3>;
                                        if (line.startsWith('##')) return <h2 key={i} className="text-indigo-900 text-xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h2>;
                                        if (line.startsWith('#')) return <h1 key={i} className="text-indigo-900 text-2xl mt-6 mb-2">{line.replace(/#/g, '').trim()}</h1>;
                                        if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-2">{line.replace(/\*/g, '').trim()}</li>;
                                        if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2">{line.replace(/-/g, '').trim()}</li>;
                                        if (line.trim() === '') return <br key={i} />;
                                        return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentSummarizer;
