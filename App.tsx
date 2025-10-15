import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ArticleList } from './components/ArticleList';
import { TopicGraph } from './components/TopicGraph';
import { fetchNews, rankAndAnalyze, generateImage } from './services/geminiService';
import type { Article, GraphData, Feedback, Page, Language, Comment, User } from './types';
import { Trie } from './utils/Trie';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { Header } from './components/Header';
import { AboutPage } from './components/AboutPage';
import { ProfilePage } from './components/ProfilePage';
import { translations } from './utils/translations';

const App: React.FC = () => {
  // Page state
  const [topic, setTopic] = useState<string>('Artificial Intelligence Breakthroughs');
  const [articles, setArticles] = useState<Article[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  // User & App state
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [articlesRead, setArticlesRead] = useState<number>(0);
  const [articleFeedback, setArticleFeedback] = useState<Record<string, Feedback>>({});
  
  const keywordTrie = useMemo(() => new Trie(), []);
  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    // Load all user data from localStorage on initial load
    const storedFeedback = localStorage.getItem('articleFeedback');
    if (storedFeedback) setArticleFeedback(JSON.parse(storedFeedback));

    const storedLang = localStorage.getItem('language');
    if (storedLang) setLanguage(storedLang as Language);
    
    const storedComments = localStorage.getItem('comments');
    if (storedComments) setComments(JSON.parse(storedComments));

    // Check for active session
    const sessionUserEmail = sessionStorage.getItem('currentUserEmail');
    if (sessionUserEmail) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const userData = users[sessionUserEmail];
      if (userData) {
        setCurrentUser({ name: userData.name, email: sessionUserEmail });
      }
    }

    // Gamification logic
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    const streak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);
    const readCount = parseInt(localStorage.getItem('articlesRead') || '0', 10);

    if (lastVisit === today) {
      setDailyStreak(streak);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastVisit === yesterday.toDateString()) {
        const newStreak = streak + 1;
        setDailyStreak(newStreak);
        localStorage.setItem('dailyStreak', newStreak.toString());
      } else {
        setDailyStreak(1);
        localStorage.setItem('dailyStreak', '1');
      }
      localStorage.setItem('lastVisit', today);
    }
    setArticlesRead(readCount);
  }, []);
  
  const handleSearch = useCallback(async (newTopic: string) => {
    if (!newTopic || isLoading) return;
    setIsLoading(true);
    setError(null);
    setArticles([]);
    setGraphData({ nodes: [], links: [] });
    setActiveArticleId(null);
    keywordTrie.clear();

    try {
      const rawArticles = await fetchNews(newTopic);
      if (rawArticles.length === 0) throw new Error("No articles found for this topic.");
      const processedData = await rankAndAnalyze(newTopic, rawArticles);
      
      const sortedArticles = [...processedData.articles].sort((a, b) => b.relevanceScore - a.relevanceScore);
      setArticles(sortedArticles);
      setGraphData(processedData.graphData);

      processedData.keywords.forEach(keyword => keywordTrie.insert(keyword));

      // Asynchronously generate and update images for each article
      sortedArticles.forEach(async (article) => {
        try {
            const imageUrl = await generateImage(article.title);
            if (imageUrl) {
                setArticles(prevArticles => 
                    prevArticles.map(prevArticle => 
                        prevArticle.id === article.id 
                            ? { ...prevArticle, imageUrl } 
                            : prevArticle
                    )
                );
            }
        } catch (imgError) {
            console.error(`Failed to generate image for article: "${article.title}"`, imgError);
        }
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, keywordTrie]);
  
  useEffect(() => {
    handleSearch(topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArticleSelect = (articleId: string) => {
    setActiveArticleId(prevId => {
      const newId = prevId === articleId ? null : articleId;
      if (newId !== null) {
        const readArticles = JSON.parse(localStorage.getItem('readArticleIds') || '[]');
        if (!readArticles.includes(articleId)) {
            const newCount = articlesRead + 1;
            setArticlesRead(newCount);
            localStorage.setItem('articlesRead', newCount.toString());
            readArticles.push(articleId);
            localStorage.setItem('readArticleIds', JSON.stringify(readArticles));
        }
      }
      return newId;
    });
  };
  
  const handleFeedback = (articleId: string, feedback: 'up' | 'down') => {
    setArticleFeedback(prevFeedback => {
      const newFeedbackState = { ...prevFeedback };
      newFeedbackState[articleId] = prevFeedback[articleId] === feedback ? null : feedback;
      localStorage.setItem('articleFeedback', JSON.stringify(newFeedbackState));
      return newFeedbackState;
    });
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleAddComment = (articleId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
    };
    setComments(prev => {
      const articleComments = prev[articleId] ? [...prev[articleId], newComment] : [newComment];
      const newComments = { ...prev, [articleId]: articleComments };
      localStorage.setItem('comments', JSON.stringify(newComments));
      return newComments;
    });
  };

  const handleLogin = (email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[email] && users[email].password === pass) {
        setCurrentUser({ name: users[email].name, email });
        sessionStorage.setItem('currentUserEmail', email);
        resolve();
      } else {
        reject(new Error(t.invalidCredentials));
      }
    });
  };

  const handleSignUp = (name: string, email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[email]) {
        return reject(new Error(t.userExists));
      }
      users[email] = { name, password: pass };
      localStorage.setItem('users', JSON.stringify(users));
      handleLogin(email, pass).then(resolve).catch(reject);
    });
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUserEmail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage t={t} />;
      case 'profile':
        return <ProfilePage t={t} currentUser={currentUser} onLogin={handleLogin} onSignUp={handleSignUp} onLogout={handleLogout} />;
      case 'home':
      default:
        return (
          <main className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
            <aside className="md:col-span-3">
              <Sidebar
                onSearch={handleSearch}
                initialTopic={topic}
                keywordTrie={keywordTrie}
                dailyStreak={dailyStreak}
                articlesRead={articlesRead}
                isLoading={isLoading}
                t={t}
              />
            </aside>
            <section className="md:col-span-5">
              {isLoading && !articles.length ? (
                <div className="flex flex-col items-center justify-center h-full bg-secondary rounded-lg p-8">
                  <LoadingSpinner />
                  <p className="mt-4 text-lg text-text-secondary animate-pulse">{t.fetchingNews}</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full bg-red-900/50 border border-red-500 rounded-lg p-4">
                  <p className="text-center text-red-200">{error}</p>
                </div>
              ) : (
                <ArticleList 
                  articles={articles} 
                  onArticleSelect={handleArticleSelect}
                  activeArticleId={activeArticleId}
                  articleFeedback={articleFeedback}
                  onFeedback={handleFeedback}
                  comments={comments}
                  onAddComment={handleAddComment}
                  currentUser={currentUser}
                  t={t}
                />
              )}
            </section>
            <section className="md:col-span-4 h-[60vh] md:h-auto">
              <TopicGraph 
                data={graphData} 
                key={JSON.stringify(graphData)}
                isLoading={isLoading && articles.length > 0} 
                t={t}
              />
            </section>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary font-sans">
      <Header
        t={t}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        language={language}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
      />
      {renderPage()}
    </div>
  );
};

export default App;