import React from 'react';
import type { Page, Language, Translations, User } from '../types';

interface HeaderProps {
    t: Translations;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ t, currentPage, onNavigate, language, onLanguageChange, currentUser }) => {
    const navItems: { page: Page, label: keyof Translations }[] = [
        { page: 'home', label: 'home' },
        { page: 'about', label: 'about' },
        { page: 'profile', label: 'profile' },
    ];

    return (
        <header className="bg-secondary shadow-md p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-highlight">{t.title}</h1>
            <div className="flex items-center space-x-6">
                <nav className="flex items-center space-x-4">
                    {navItems.map(item => (
                        <button
                            key={item.page}
                            onClick={() => onNavigate(item.page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === item.page
                                    ? 'bg-highlight text-primary'
                                    : 'text-text-secondary hover:bg-accent hover:text-text-primary'
                            }`}
                        >
                            {t[item.label]}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center space-x-4">
                    {currentUser && <span className="text-text-secondary text-sm hidden md:block">{t.welcome}, {currentUser.name}</span>}
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value as Language)}
                        className="bg-accent border border-gray-600 rounded-md py-1 px-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-highlight"
                    >
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                        <option value="ml">മലയാളം</option>
                    </select>
                </div>
            </div>
        </header>
    );
};