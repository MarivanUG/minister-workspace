import React from 'react';
import { NavLink } from 'react-router-dom';
import { PenTool, BookOpen, Headphones, ShieldAlert, Sparkles, Activity } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, colorClass, highlight, link }) => (
    <NavLink
        to={link}
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 rotate-12 opacity-10 rounded-3xl ${highlight}`}></div>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">{title}</p>
                <h3 className="text-4xl font-black text-gray-900 mt-2">{count}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="mt-6 flex items-center text-sm font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
            Manage Records &rarr;
        </div>
    </NavLink>
);

const Dashboard = ({ sermons, studies, externalSermons }) => {

    // Get recent activity (last 5 items across all categories)
    const allActivity = [
        ...sermons.map(s => ({ ...s, type: 'My Sermon', icon: PenTool, color: 'text-indigo-600', bg: 'bg-indigo-50' })),
        ...studies.map(s => ({ ...s, type: 'Bible Study', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' })),
        ...externalSermons.map(s => ({ ...s, type: 'External Sermon', icon: Headphones, color: 'text-teal-600', bg: 'bg-teal-50' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        Welcome Back <Sparkles size={24} className="text-amber-400 fill-amber-300" />
                    </h1>
                    <p className="text-gray-500 font-semibold tracking-wide mt-1">Here is a summary of your spiritual resources.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="My Sermons"
                    count={sermons.length}
                    icon={PenTool}
                    colorClass="bg-indigo-50 text-indigo-600"
                    highlight="bg-indigo-500"
                    link="/sermons"
                />
                <StatCard
                    title="Bible Studies"
                    count={studies.length}
                    icon={BookOpen}
                    colorClass="bg-amber-50 text-amber-600"
                    highlight="bg-amber-500"
                    link="/bible-study"
                />
                <StatCard
                    title="Other Preachers"
                    count={externalSermons.length}
                    icon={Headphones}
                    colorClass="bg-teal-50 text-teal-600"
                    highlight="bg-teal-500"
                    link="/external-sermons"
                />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <ShieldAlert className="absolute -bottom-10 -right-10 text-gray-50 w-64 h-64 -rotate-12 pointer-events-none" />
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                    <Activity size={24} className="text-indigo-500" /> Recent Activity
                </h3>

                {allActivity.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-2xl relative z-10 border border-gray-100 border-dashed">
                        <p className="text-gray-500 font-medium tracking-wide">No recent activity detected.</p>
                        <p className="text-sm text-gray-400 mt-1">Start adding sermons or study notes from the sidebar.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative z-10">
                        {allActivity.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.title || item.topic}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${item.bg} ${item.color}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 capitalize">{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
