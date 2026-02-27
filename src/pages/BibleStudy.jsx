import React from 'react';
import SharedListManager from '../components/SharedListManager';
import { BookOpen, Calendar, Trash2, Library } from 'lucide-react';

const BibleStudy = ({ records, collectionName }) => {
    const fields = [
        { name: 'topic', label: 'Study Topic / Book', type: 'text', placeholder: 'e.g. Book of Romans or Grace', required: true, fullWidth: true },
        { name: 'date', label: 'Study Date', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: true },
        { name: 'scriptures', label: 'Reference Scriptures', type: 'text', placeholder: 'e.g. Romans 8:1-4' },
        { name: 'insights', label: 'Insights & Revelation', type: 'richtext', placeholder: 'What the Holy Spirit revealed...', required: true, fullWidth: true, aiPrompt: 'Based on the scripture "{scriptures}" and the topic "{topic}", provide a theological breakdown of the text, historical context, and 2 deep spiritual insights a minister could use for teaching.' },
    ];

    const renderRecord = (record, onDelete) => (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <h4 className="text-xl font-extrabold text-amber-900">{record.topic}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {record.date}</span>
                    {record.scriptures && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                            <Library size={12} /> {record.scriptures}
                        </span>
                    )}
                </div>
                {record.insights && (
                    <div className="mt-3 text-gray-800 text-sm leading-relaxed p-4 bg-[#fffdf0] border border-amber-100 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                        <div className="font-medium prose prose-sm prose-amber max-w-none richtext-content" dangerouslySetInnerHTML={{ __html: record.insights }}></div>
                    </div>
                )}
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-end">
                <button
                    onClick={onDelete}
                    className="p-2.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100 delay-75 opacity-0 group-hover:opacity-100"
                    title="Delete Study Note"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <SharedListManager
            title="Bible Study Notes"
            icon={BookOpen}
            records={records}
            collectionName={collectionName}
            fields={fields}
            listRenderer={renderRecord}
        />
    );
};

export default BibleStudy;
