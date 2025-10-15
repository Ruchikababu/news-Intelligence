import React, { useState, useCallback } from 'react';
import type { Trie } from '../utils/Trie';
import { SearchIcon } from './icons/SearchIcon';
import { FlameIcon } from './icons/FlameIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import type { Translations } from '../types';

interface SidebarProps {
  onSearch: (topic: string) => void;
  initialTopic: string;
  keywordTrie: Trie;
  dailyStreak: number;
  articlesRead: number;
  isLoading: boolean;
  t: Translations;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSearch, initialTopic, keywordTrie, dailyStreak, articlesRead, isLoading, t }) => {
  const [inputValue, setInputValue] = useState(initialTopic);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      const foundSuggestions = keywordTrie.findSuggestions(value);
      setSuggestions(foundSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setSuggestions([]);
  };

  const getReaderRank = useCallback(() => {
    if (articlesRead > 50) return { title: t.topReader, color: 'text-yellow-400' };
    if (articlesRead > 25) return { title: t.newsHound, color: 'text-green-400' };
    if (articlesRead > 10) return { title: t.informedCitizen, color: 'text-blue-400' };
    if (articlesRead > 0) return { title: t.gettingStarted, color: 'text-text-secondary' };
    return { title: t.weakWarrior, color: 'text-red-400' };
  }, [articlesRead, t]);

  const rank = getReaderRank();

  return (
    <div className="bg-secondary p-4 rounded-lg shadow-lg space-y-6 h-full">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="topic-search" className="block text-sm font-medium text-text-secondary mb-1">
          {t.searchTopic}
        </label>
        <div className="relative">
          <input
            id="topic-search"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="e.g., Global Economy"
            className="w-full bg-accent border border-gray-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-highlight"
            autoComplete="off"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-accent border border-gray-600 rounded-md mt-1 max-h-60 overflow-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="px-4 py-2 hover:bg-highlight/50 cursor-pointer"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
        <button type="submit" className="w-full mt-2 bg-highlight text-primary font-bold py-2 px-4 rounded-md hover:bg-teal-300 transition-colors duration-200 disabled:bg-gray-500" disabled={isLoading}>
          {isLoading ? t.searching : t.search}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-accent pb-2">{t.yourStats}</h3>
        <div className="flex items-center justify-between bg-accent p-3 rounded-md">
          <div className="flex items-center space-x-3">
            <FlameIcon className="h-6 w-6 text-orange-400" />
            <span className="font-medium">{t.dailyStreak}</span>
          </div>
          <span className="text-2xl font-bold text-orange-400">{dailyStreak}</span>
        </div>
        <div className="flex items-center justify-between bg-accent p-3 rounded-md">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className={`h-6 w-6 ${rank.color}`} />
            <span className="font-medium">{t.readerRank}</span>
          </div>
          <span className={`text-lg font-bold ${rank.color}`}>{rank.title}</span>
        </div>
      </div>
    </div>
  );
};
