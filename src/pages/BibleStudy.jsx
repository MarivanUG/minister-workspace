import React from 'react';
import SharedListManager from '../components/SharedListManager';
import { BookOpen, Calendar, Trash2, Library, Archive, ArchiveRestore } from 'lucide-react';

const BibleStudy = ({ records, collectionName }) => {
    const fields = [
        { name: 'topic', label: 'Study Topic / Book', type: 'text', placeholder: 'e.g. Book of Romans or Grace', required: true, fullWidth: true },
        { name: 'date', label: 'Study Date', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: true },
        { name: 'scriptures', label: 'Reference Scriptures', type: 'text', placeholder: 'e.g. Romans 8:1-4' },
        { name: 'insights', label: 'Insights & Revelation', type: 'richtext', placeholder: 'What the Holy Spirit revealed...', required: true, fullWidth: true, aiPrompt: 'Based on the scripture "{scriptures}" and the topic "{topic}", provide a theological breakdown of the text, historical context, and 2 deep spiritual insights a minister could use for teaching.' },
    ];

    const BibleStudyRecord = ({ record, onDelete, onArchive }) => {
        const [isExpanded, setIsExpanded] = React.useState(false);

        return (
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-2">
                        <h4 className="text-xl font-extrabold text-amber-900">{record.topic}</h4>
                        {record.isArchived && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-extrabold rounded-md flex items-center gap-1 ml-2"><Archive size={10} /> Archived</span>}
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
                        <div>
                            <div className={`mt-3 text-gray-800 text-sm leading-relaxed p-4 bg-[#fffdf0] border border-amber-100 rounded-xl relative overflow-hidden ${isExpanded ? '' : 'max-h-32 line-clamp-4'}`}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                <div className="font-medium prose prose-sm prose-amber max-w-none richtext-content" dangerouslySetInnerHTML={{ __html: record.insights }}></div>
                                {!isExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#fffdf0] to-transparent"></div>
                                )}
                            </div>
                            <button onClick={() => setIsExpanded(!isExpanded)} className="text-amber-700 font-bold text-xs mt-2 hover:text-amber-900 transition-colors uppercase tracking-wider bg-amber-100/50 px-3 py-1.5 rounded-lg active:scale-95">
                                {isExpanded ? 'Show Less' : 'Read Full Insight'}
                            </button>
                        </div>
                    )}
                </div>
                <div className="shrink-0 flex items-center justify-end gap-2 pt-1">
                    <button
                        onClick={onArchive}
                        className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 delay-75 opacity-0 group-hover:opacity-100"
                        title={record.isArchived ? "Restore to Active" : "Move to Archive"}
                    >
                        {record.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                    </button>
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
    };

    const listRenderer = (record, onDelete, onArchive) => (
        <BibleStudyRecord record={record} onDelete={onDelete} onArchive={onArchive} />
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
