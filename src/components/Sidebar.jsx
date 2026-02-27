import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, BookOpen, Headphones, Book, Sparkles, FileText, Pickaxe, Settings as SettingsIcon, LogOut } from 'lucide-react';

const Sidebar = ({ onLogout }) => {

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Sermon Wizard', icon: Pickaxe, path: '/wizard' },
        { name: 'My Sermons', icon: PenTool, path: '/sermons' },
        { name: 'Bible Study', icon: BookOpen, path: '/bible-study' },
        { name: 'Other Preachers', icon: Headphones, path: '/external-sermons' },
        { name: 'Bible Library', icon: Book, path: '/bible-library' },
        { name: 'AI Assistant', icon: Sparkles, path: '/ai-assistant' },
        { name: 'Document Summarizer', icon: FileText, path: '/summarizer' },
        { name: 'Settings', icon: SettingsIcon, path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-indigo-50 flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <BookOpen size={24} />
                </div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Minister<span className="text-indigo-600">Space</span></h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items - center gap - 3 px - 4 py - 3 rounded - xl font - bold transition - all ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                } `
                            }
                        >
                            <Icon size={20} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-50">
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
