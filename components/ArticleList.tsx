import React from 'react';
import type { Article, Feedback, Comment, Translations, User } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  onArticleSelect: (articleId: string) => void;
  activeArticleId: string | null;
  articleFeedback: Record<string, Feedback>;
  onFeedback: (articleId: string, feedback: 'up' | 'down') => void;
  comments: Record<string, Comment[]>;
  onAddComment: (articleId: string, text: string) => void;
  currentUser: User | null;
  t: Translations;
}

export const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  onArticleSelect, 
  activeArticleId, 
  articleFeedback, 
  onFeedback,
  comments,
  onAddComment,
  currentUser,
  t
}) => {
  if (articles.length === 0) {
    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
            <p className="text-text-secondary">{t.noArticles}</p>
        </div>
    );
  }

  return (
    <div className="bg-secondary p-4 rounded-lg shadow-lg h-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-highlight border-b border-accent pb-2">{t.rankedArticles}</h2>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            rank={index + 1} 
            onSelect={onArticleSelect}
            isActive={article.id === activeArticleId}
            feedback={articleFeedback[article.id] || null}
            onFeedback={onFeedback}
            comments={comments[article.id] || []}
            onAddComment={onAddComment}
            currentUser={currentUser}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};