import React, { useState } from 'react';
import type { Article, Feedback, Comment, Translations, User } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { ShareIcon } from './icons/ShareIcon';

interface ArticleCardProps {
  article: Article;
  rank: number;
  onSelect: (id: string) => void;
  isActive: boolean;
  feedback: Feedback;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
  comments: Comment[];
  onAddComment: (id: string, text: string) => void;
  currentUser: User | null;
  t: Translations;
}

const getScoreColor = (score: number) => {
    if (score > 85) return 'bg-green-500';
    if (score > 65) return 'bg-yellow-500';
    return 'bg-orange-500';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, rank, onSelect, isActive, feedback, onFeedback, comments, onAddComment, currentUser, t }) => {
  const scoreColor = getScoreColor(article.relevanceScore);
  const [commentText, setCommentText] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.summary,
      url: article.url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(article.url).then(() => {
        setCopyStatus(t.copied);
        setTimeout(() => setCopyStatus(''), 2000);
      });
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(article.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div
      className={`bg-accent p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ${isActive ? 'border-highlight' : 'border-transparent'}`}
    >
        <div className="flex justify-between items-start cursor-pointer" onClick={() => onSelect(article.id)}>
            <div className="flex-1 pr-4">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="flex-shrink-0 bg-secondary text-highlight font-bold rounded-full h-8 w-8 flex items-center justify-center text-sm">{rank}</span>
                    <h3 className="text-md font-semibold text-text-primary">{article.title}</h3>
                </div>
                <div className="flex items-center text-xs text-text-secondary space-x-4 ml-11">
                    <span>{article.source}</span>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className={`text-xs font-bold text-primary px-2 py-1 rounded-full ${scoreColor}`}>
                    {article.relevanceScore}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
            </div>
        </div>

      {isActive && (
        <div className="mt-4 pl-11 animate-fade-in space-y-4">
          <div className="w-full overflow-hidden rounded-lg shadow-inner">
            {article.imageUrl ? (
                <img src={article.imageUrl} alt={`AI generated image for ${article.title}`} className="w-full h-auto object-cover" />
            ) : (
                <div className="w-full aspect-video bg-secondary animate-pulse-fast rounded-lg flex items-center justify-center">
                    <p className="text-text-secondary text-sm">Generating image...</p>
                </div>
            )}
          </div>
          <p className="text-sm text-text-secondary">{article.summary}</p>
          <div className="flex justify-between items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-highlight hover:text-teal-300 transition-colors"
            >
              {t.readFullArticle} <ExternalLinkIcon className="w-4 h-4 ml-1" />
            </a>
            <div className="flex items-center space-x-2">
                <div className="relative">
                  <button 
                      onClick={handleShare}
                      aria-label="Share article"
                      className="p-1 rounded-full hover:bg-secondary transition-colors text-text-secondary"
                  >
                      <ShareIcon className="w-5 h-5" />
                  </button>
                  {copyStatus && <span className="absolute -top-7 right-0 text-xs bg-highlight text-primary px-2 py-1 rounded">{copyStatus}</span>}
                </div>
                <button 
                    onClick={() => onFeedback(article.id, 'up')}
                    aria-label="Like article"
                    className={`p-1 rounded-full hover:bg-secondary transition-colors ${feedback === 'up' ? 'text-green-400' : 'text-text-secondary'}`}
                >
                    <ThumbsUpIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onFeedback(article.id, 'down')}
                    aria-label="Dislike article"
                    className={`p-1 rounded-full hover:bg-secondary transition-colors ${feedback === 'down' ? 'text-red-400' : 'text-text-secondary'}`}
                >
                    <ThumbsDownIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
          <div className="border-t border-secondary pt-4">
            <h4 className="font-semibold text-text-primary mb-2">{t.comments}</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {comments.length > 0 ? comments.map(comment => (
                <div key={comment.id} className="text-sm bg-secondary p-2 rounded-lg">
                  <p className="font-bold text-highlight">{comment.author}</p>
                  <p className="text-text-secondary">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(comment.timestamp).toLocaleString()}</p>
                </div>
              )) : <p className="text-xs text-text-secondary">No comments yet.</p>}
            </div>
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="mt-3 flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t.addComment}
                  className="flex-grow bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-highlight"
                />
                <button type="submit" className="bg-highlight text-primary font-bold py-1 px-3 rounded-md text-sm hover:bg-teal-300 transition-colors">Post</button>
              </form>
            ) : (
              <p className="text-xs text-amber-400 mt-3">{t.loginToComment}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};