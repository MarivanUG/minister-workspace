import React from 'react';
import SharedListManager from '../components/SharedListManager';
import { PenTool, Calendar, Trash2 } from 'lucide-react';

const MySermons = ({ records, collectionName }) => {
    const fields = [
        { name: 'title', label: 'Sermon Title', type: 'text', placeholder: 'e.g. The Power of Grace', required: true, fullWidth: true },
        { name: 'date', label: 'Date Preached', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: true },
        { name: 'scripture', label: 'Main Scripture', type: 'text', placeholder: 'e.g. Ephesians 2:8-9', required: true },
        { name: 'topic', label: 'Topic / Theme', type: 'text', placeholder: 'e.g. Grace, Salvation', required: true, fullWidth: true },
        { name: 'notes', label: 'Sermon Notes', type: 'textarea', placeholder: 'Outline, key points, or full manuscript...', required: true, fullWidth: true },
        { name: 'mediaLink', label: 'Audio/Video Link', type: 'url', placeholder: 'https://youtube.com/... (optional)', fullWidth: true },
    ];

    const renderRecord = (record, onDelete) => (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <h4 className="text-xl font-extrabold text-indigo-900">{record.title}</h4>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">{record.topic}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {record.date}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{record.scripture}</span>
                </div>
                {record.notes && (
                    <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed font-medium whitespace-pre-wrap">{record.notes}</p>
                )}
                {record.mediaLink && (
                    <a href={record.mediaLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                        View Media Recording &rarr;
                    </a>
                )}
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-end">
                <button
                    onClick={onDelete}
                    className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100 delay-75 opacity-0 group-hover:opacity-100"
                    title="Delete Sermon"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <SharedListManager
            title="My Sermons"
            icon={PenTool}
            records={records}
            collectionName={collectionName}
            fields={fields}
            listRenderer={renderRecord}
        />
    );
};

export default MySermons;
