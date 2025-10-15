export type Feedback = 'up' | 'down' | null;

export type Page = 'home' | 'about' | 'profile';
export type Language = 'en' | 'ta' | 'ml';

export interface User {
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  relevanceScore: number;
  imageUrl?: string;
}

// Fix: Resolved "Cannot find namespace 'd3'" error by replacing `extends d3.SimulationNodeDatum`
// with the explicit properties that d3-force simulation adds to nodes.
export interface GraphNode {
  id: string;
  group: string;
  size?: number;
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// Fix: Resolved "Cannot find namespace 'd3'" error by removing `extends d3.SimulationLinkDatum<GraphNode>`
// and adding the optional `index` property directly.
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  label?: string;
  index?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Translations {
    title: string;
    searchTopic: string;
    search: string;
    searching: string;
    yourStats: string;
    dailyStreak: string;
    readerRank: string;
    rankedArticles: string;
    noArticles: string;
    topicGraph: string;
    graphPlaceholder: string;
    fetchingNews: string;
    readFullArticle: string;
    home: string;
    about: string;
    profile: string;
    welcome: string;
    aboutTitle: string;
    aboutText: string;
    profileTitle: string;
    profileText: string;
    yourName: string;
    saveName: string;
    nameSaved: string;
    comments: string;
    addComment: string;
    loginToComment: string;
    copied: string;
    weakWarrior: string;
    gettingStarted: string;
    informedCitizen: string;
    newsHound: string;
    topReader: string;
    // New auth keys
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    authPrompt: string;
    loginSuccess: string;
    signupSuccess: string;
    logoutSuccess: string;
    invalidCredentials: string;
    userExists: string;
    yourProfile: string;
    loggedInAs: string;
}