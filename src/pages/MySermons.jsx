import React from 'react';
import SharedListManager from '../components/SharedListManager';
import { PenTool, Calendar, Trash2, Download, Archive, ArchiveRestore } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

const MySermons = ({ records, collectionName }) => {
    const fields = [
        { name: 'title', label: 'Sermon Title', type: 'text', placeholder: 'e.g. The Grace of Giving', required: true, fullWidth: true, aiPrompt: 'Give me a catchy, engaging 5-7 word title for a sermon about: {topic} using scripture {scripture}' },
        { name: 'date', label: 'Date Preached', type: 'date', defaultValue: new Date().toISOString().split('T')[0], required: true },
        { name: 'scripture', label: 'Main Scripture', type: 'text', placeholder: 'e.g. 2 Corinthians 8:1-9', required: true },
        { name: 'topic', label: 'Core Topic / Theme', type: 'text', placeholder: 'e.g. Generosity, Grace', required: true, fullWidth: true },
        { name: 'notes', label: 'Sermon Notes / Manuscript', type: 'richtext', placeholder: 'Write your full sermon here...', required: true, fullWidth: true, aiPrompt: 'Act as a seasoned Christian minister. Give me a detailed 3-point sermon outline on the topic of "{topic}" based on scripture "{scripture}". Include an intro, 3 points with practical application, and a conclusion.' },
        { name: 'mediaLink', label: 'Audio / Video Link', type: 'text', placeholder: 'Optional link to recording', fullWidth: true },
    ];

    const handleDownloadDOCX = (record) => {
        const loadingToastId = toast.loading('Generating Word Document...');
        try {
            const htmlString = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>${record.title}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; font-size: 14pt; }
                        h1 { color: #333333; font-size: 24pt; }
                        p { line-height: 1.5; }
                    </style>
                </head>
                <body>
                    <h1>${record.title}</h1>
                    <p><strong>Topic:</strong> ${record.topic}</p>
                    <p><strong>Date:</strong> ${record.date}</p>
                    <p><strong>Scripture:</strong> ${record.scripture}</p>
                    <hr/>
                    ${record.notes || ''}
                </body>
                </html>
            `;
            const blob = new Blob(['\ufeff', htmlString], {
                type: 'application/msword'
            });
            saveAs(blob, `${record.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`);
            toast.success('Downloaded successfully!', { id: loadingToastId });
        } catch (error) {
            console.error("DOCX Generation Error:", error);
            toast.error('Error downloading document.', { id: loadingToastId });
        }
    };

    const renderRecord = (record, onDelete, onArchive) => (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <h4 className="text-xl font-extrabold text-indigo-900">{record.title}</h4>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">{record.topic}</span>
                    {record.isArchived && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-extrabold rounded-md flex items-center gap-1"><Archive size={10} /> Archived</span>}
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> {record.date}</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{record.scripture}</span>
                </div>
                {record.notes && (
                    <div className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed font-medium prose prose-sm prose-indigo max-w-none richtext-content" dangerouslySetInnerHTML={{ __html: record.notes }}></div>
                )}
                {record.mediaLink && (
                    <a href={record.mediaLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                        View Media Recording &rarr;
                    </a>
                )}
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2">
                <button
                    onClick={() => handleDownloadDOCX(record)}
                    className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100 delay-75 opacity-0 group-hover:opacity-100"
                    title="Download as Word Document (DOCX)"
                >
                    <Download size={18} />
                </button>
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
