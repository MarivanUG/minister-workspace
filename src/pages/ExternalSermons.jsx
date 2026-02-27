import React from 'react';
import SharedListManager from '../components/SharedListManager';
import { Headphones, Calendar, Trash2, User } from 'lucide-react';

const ExternalSermons = ({ records, collectionName }) => {
    const fields = [
        { name: 'title', label: 'Message Title', type: 'text', placeholder: 'e.g. Leading with Love', required: true, fullWidth: true },
        { name: 'preacher', label: 'Preacher / Speaker', type: 'text', placeholder: 'e.g. Bishop T.D. Jakes', required: true },
        { name: 'date', label: 'Date Listened', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: true },
        { name: 'scripture', label: 'Core Scripture', type: 'text', placeholder: 'e.g. 1 Corinthians 13' },
        { name: 'takeaways', label: 'Key Takeaways', type: 'textarea', placeholder: 'What did you learn? Notes and quotes...', required: true, fullWidth: true },
        { name: 'sourceLink', label: 'Source Link', type: 'url', placeholder: 'https://... (optional)', fullWidth: true },
    ];

    const renderRecord = (record, onDelete) => (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h4 className="text-xl font-extrabold text-teal-900">{record.title}</h4>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-sm font-bold rounded-full w-fit">
                        <User size={14} /> {record.preacher}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {record.date}</span>
                    {record.scripture && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{record.scripture}</span>}
                </div>
                {record.takeaways && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Takeaways</p>
                        <p className="text-gray-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">{record.takeaways}</p>
                    </div>
                )}
                {record.sourceLink && (
                    <a href={record.sourceLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm font-bold text-teal-600 hover:text-teal-800 hover:underline">
                        Listen to Original Message &rarr;
                    </a>
                )}
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-end">
                <button
                    onClick={onDelete}
                    className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100 delay-75 opacity-0 group-hover:opacity-100"
                    title="Delete Record"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <SharedListManager
            title="Other Preachers"
            icon={Headphones}
            records={records}
            collectionName={collectionName}
            fields={fields}
            listRenderer={renderRecord}
        />
    );
};

export default ExternalSermons;
