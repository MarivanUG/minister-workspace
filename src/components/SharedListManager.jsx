import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Calendar, FileText, LayoutList, Sparkles, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SharedListManager = ({
    title,
    icon: Icon,
    records,
    collectionName,
    fields,
    listRenderer
}) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(
        fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || '' }), {})
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI State
    const [apiKey, setApiKey] = useState('');
    const [aiLoadingField, setAiLoadingField] = useState(null);

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

    const handleAISuggest = async (fieldName, promptTemplate) => {
        if (!apiKey) {
            toast.error("Please configure your Gemini API Key in Settings first.");
            return;
        }

        setAiLoadingField(fieldName);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Replaces template variables like {topic} or {scriptures} with current form data
            let prompt = promptTemplate;
            Object.keys(formData).forEach(key => {
                prompt = prompt.replace(`{${key}}`, formData[key] || "something");
            });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            setFormData(prev => ({ ...prev, [fieldName]: responseText }));
            toast.success("AI suggestion generated!");
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast.error("Failed to generate suggestion.");
        } finally {
            setAiLoadingField(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, collectionName), {
                ...formData,
                createdAt: serverTimestamp()
            });
            setShowForm(false);
            setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || '' }), {}));
            toast.success("Record saved successfully!");
        } catch (error) {
            console.error("Error adding document:", error);
            toast.error("Failed to save record.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record forever?")) {
            await deleteDoc(doc(db, collectionName, id));
        }
    };

    // Prepare inputs
    const InputFields = fields.map(field => {
        const isAILoading = aiLoadingField === field.name;

        const renderAIAssistant = () => {
            if (!field.aiPrompt) return null;
            return (
                <button
                    type="button"
                    onClick={() => handleAISuggest(field.name, field.aiPrompt)}
                    disabled={isAILoading}
                    className="absolute top-0 right-1 flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                >
                    {isAILoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isAILoading ? 'Generating...' : 'Ask AI'}
                </button>
            );
        };

        if (field.type === 'textarea') {
            return (
                <div key={field.name} className={`space-y-1 relative ${field.fullWidth ? 'col-span-full' : ''}`}>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">{field.label}</label>
                    {renderAIAssistant()}
                    <textarea
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-gray-800 resize-none shadow-sm"
                        required={field.required}
                    />
                </div>
            )
        } else if (field.type === 'richtext') {
            return (
                <div key={field.name} className={`space-y-1 relative ${field.fullWidth ? 'col-span-full' : ''}`}>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">{field.label}</label>
                    {renderAIAssistant()}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                        <ReactQuill
                            theme="snow"
                            value={formData[field.name]}
                            onChange={(content) => setFormData(prev => ({ ...prev, [field.name]: content }))}
                            placeholder={field.placeholder}
                            className="h-64 sm:h-80"
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['link', 'clean']
                                ]
                            }}
                        />
                    </div>
                </div>
            );
        }
        return (
            <div key={field.name} className={`space-y-1 relative ${field.fullWidth ? 'col-span-full' : ''}`}>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">{field.label}</label>
                {renderAIAssistant()}
                <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-gray-800 shadow-sm"
                    required={field.required}
                />
            </div>
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-inner">
                        <Icon size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-sm font-semibold text-gray-500 tracking-wide mt-1">Manage and view your records</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>{showForm ? 'Cancel Entry' : 'New Record'}</span>
                </button>
            </header>

            {/* Hidden Form */}
            {showForm && (
                <div className="bg-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2"><FileText size={20} /> Create New {title}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {InputFields}
                        <div className="col-span-full pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md transition-all active:scale-95 ${isSubmitting ? 'opacity-75' : ''}`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                    <LayoutList size={18} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-700">All {title} ({records.length})</h3>
                </div>

                {records.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 text-gray-200" />
                        <p className="font-semibold text-lg">No records found.</p>
                        <p className="text-sm">Click "New Record" to add your first entry.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {records.map(record => (
                            <div key={record.id} className="p-6 hover:bg-indigo-50/30 transition-colors group">
                                {listRenderer(record, () => handleDelete(record.id))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedListManager;
