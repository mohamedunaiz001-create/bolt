import React, { useState, useEffect, useRef } from "react";
import {
  Newspaper,
  Calendar,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Zap,
  BookOpen,
  CheckCircle2,
  Layers,
  HelpCircle,
  TrendingUp,
  Rss,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NewsArticle } from "../types";

interface NewsViewProps {
  articles: NewsArticle[];
  onUpdateArticles?: (newArticles: NewsArticle[]) => void;
  onStartTodayMCQs: () => void;
  onAskBoltArticle: (article: NewsArticle) => void;
}

interface SavedFeed {
  id: string;
  name: string;
  source: "The Hindu" | "PIB" | "The Indian Express" | "Government Sources" | "Editorials";
  url: string;
  category: string;
  lastSynced?: string;
  articleCount?: number;
}

const DEFAULT_PRESET_FEEDS: SavedFeed[] = [
  {
    id: "preset-hindu-ed",
    name: "The Hindu - Editorials & Op-Ed",
    source: "The Hindu",
    url: "https://www.thehindu.com/opinion/editorial/feeder/default.rss",
    category: "Editorials",
  },
  {
    id: "preset-et",
    name: "Economic Times - Economy & Policy",
    source: "Government Sources",
    url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms",
    category: "Economy & Governance",
  },
  {
    id: "preset-livemint",
    name: "Livemint - Politics & Governance",
    source: "Government Sources",
    url: "https://www.livemint.com/rss/politics",
    category: "Polity & Governance",
  },
  {
    id: "preset-pib",
    name: "PIB - Official Press Releases",
    source: "PIB",
    url: "https://pib.gov.in/press-releases",
    category: "Government Sources",
  },
  {
    id: "preset-ie-exp",
    name: "The Indian Express - Explained",
    source: "The Indian Express",
    url: "https://indianexpress.com/section/explained/feed/",
    category: "In-depth Analysis",
  },
];

export const NewsView: React.FC<NewsViewProps> = ({
  articles,
  onUpdateArticles,
  onStartTodayMCQs,
  onAskBoltArticle,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(articles[0] || null);

  // Scroll Progress Tracking
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // RSS Feed URL Input & Management State
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState<boolean>(false);
  const [feedUrlInput, setFeedUrlInput] = useState<string>("");
  const [feedSourceInput, setFeedSourceInput] = useState<SavedFeed["source"]>("The Hindu");
  const [isFetchingFeed, setIsFetchingFeed] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [feedNotification, setFeedNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Saved Feeds
  const [savedFeeds, setSavedFeeds] = useState<SavedFeed[]>(() => {
    try {
      const stored = localStorage.getItem("bolt_rss_feeds");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_PRESET_FEEDS;
  });

  const saveFeedsList = (feeds: SavedFeed[]) => {
    setSavedFeeds(feeds);
    try {
      localStorage.setItem("bolt_rss_feeds", JSON.stringify(feeds));
    } catch (e) {}
  };

  // Sync active article if articles prop changes
  useEffect(() => {
    if (!activeArticle && articles.length > 0) {
      setActiveArticle(articles[0]);
    }
  }, [articles]);

  // Handle adding and fetching a new RSS/Atom feed URL
  const handleAddAndFetchFeed = async (urlToFetch?: string, explicitSource?: SavedFeed["source"]) => {
    const targetUrl = (urlToFetch || feedUrlInput).trim();
    if (!targetUrl) {
      setFeedNotification({ type: "error", message: "Please enter a valid RSS or Atom feed URL." });
      return;
    }

    const targetSource = explicitSource || feedSourceInput;
    setIsFetchingFeed(true);
    setFeedNotification(null);

    try {
      const response = await fetch("/api/news/fetch-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl: targetUrl,
          sourceName: targetSource,
        }),
      });

      const data = await response.json();

      if (data.success && data.articles && data.articles.length > 0) {
        // Merge with existing articles, avoiding duplicates
        const existingHeadlines = new Set(articles.map((a) => a.headline.toLowerCase().trim()));
        const newArticlesToAdd: NewsArticle[] = [];

        for (const art of data.articles) {
          if (!existingHeadlines.has(art.headline.toLowerCase().trim())) {
            newArticlesToAdd.push(art);
          }
        }

        const merged = [...newArticlesToAdd, ...articles];
        if (onUpdateArticles) {
          onUpdateArticles(merged);
        }
        if (newArticlesToAdd.length > 0) {
          setActiveArticle(newArticlesToAdd[0]);
        }

        // Add to saved feeds if not already there
        const alreadySaved = savedFeeds.some((f) => f.url.toLowerCase() === targetUrl.toLowerCase());
        if (!alreadySaved) {
          const newFeed: SavedFeed = {
            id: "feed-" + Date.now(),
            name: data.feedTitle || `${targetSource} Feed`,
            source: data.sourceDetected || targetSource,
            url: targetUrl,
            category: targetSource,
            lastSynced: "Just now",
            articleCount: data.articles.length,
          };
          saveFeedsList([...savedFeeds, newFeed]);
        }

        setFeedNotification({
          type: "success",
          message: `Successfully parsed ${data.articles.length} real-time articles from ${data.sourceDetected || targetSource} with UPSC syllabus tags!`,
        });
        setFeedUrlInput("");
      } else {
        setFeedNotification({
          type: "error",
          message: data.error || "Could not parse articles from this feed URL. Ensure it is a valid XML/RSS feed.",
        });
      }
    } catch (err: any) {
      console.error("RSS fetch error:", err);
      setFeedNotification({
        type: "error",
        message: err?.message || "Failed to connect to backend feed parser.",
      });
    } finally {
      setIsFetchingFeed(false);
    }
  };

  // Sync All Configured Feeds in Batch
  const handleSyncAllFeeds = async () => {
    setIsSyncingAll(true);
    setFeedNotification(null);

    try {
      const response = await fetch("/api/news/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeds: savedFeeds.map((f) => ({ url: f.url, sourceName: f.source })),
        }),
      });

      const data = await response.json();

      if (data.success && data.articles) {
        const existingHeadlines = new Set(articles.map((a) => a.headline.toLowerCase().trim()));
        const fresh: NewsArticle[] = [];

        for (const art of data.articles) {
          if (!existingHeadlines.has(art.headline.toLowerCase().trim())) {
            fresh.push(art);
          }
        }

        const merged = [...fresh, ...articles];
        if (onUpdateArticles) {
          onUpdateArticles(merged);
        }
        if (fresh.length > 0) {
          setActiveArticle(fresh[0]);
        }

        setFeedNotification({
          type: "success",
          message: `All sources synchronized! Added ${fresh.length} fresh articles across The Hindu, PIB, and The Indian Express.`,
        });
      }
    } catch (err: any) {
      setFeedNotification({
        type: "error",
        message: "Failed to batch synchronize feeds.",
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleRemoveSavedFeed = (id: string) => {
    const filtered = savedFeeds.filter((f) => f.id !== id);
    saveFeedsList(filtered);
  };

  const sources = ["All", "The Hindu", "PIB", "The Indian Express", "Government Sources", "Editorials"];

  const filteredArticles = articles.filter((a) => {
    if (selectedSource === "All") return true;
    return a.source === selectedSource;
  });

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12 relative">
      {/* Subtle Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900/60 backdrop-blur-sm pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Banner with Reading Progress & RSS Feed Manager Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111723] rounded-2xl border border-[#1e293b] p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Today, Sep 16, 2026</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live RSS Feeds Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit'] mt-1">
            UPSC Current Affairs & Daily Editorial Analysis
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Curated daily from The Hindu, Indian Express & PIB with syllabus tagging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* RSS Feed Management Button */}
          <button
            onClick={() => setIsFeedManagerOpen((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
              isFeedManagerOpen
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                : "bg-[#162033] hover:bg-[#1f2d48] text-slate-200 border-slate-700"
            }`}
          >
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            <span>Custom RSS Feeds</span>
            {isFeedManagerOpen ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </button>

          {/* Sync All Button */}
          <button
            onClick={handleSyncAllFeeds}
            disabled={isSyncingAll}
            className="px-3.5 py-2 rounded-xl bg-[#162033] hover:bg-[#1f2d48] text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Fetch latest updates from all configured feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          {/* Compilations PDF */}
          <button
            onClick={() => alert("Monthly UPSC Current Affairs Compilations PDF downloaded.")}
            className="px-3.5 py-2 rounded-xl bg-[#162033] hover:bg-[#1f2d48] text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>CA Magazines</span>
          </button>
        </div>
      </div>

      {/* RSS / ATOM FEED MANAGER PANEL (Expandable) */}
      {isFeedManagerOpen && (
        <div className="bg-[#111723] rounded-2xl border border-blue-500/30 p-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Rss className="w-4 h-4 text-amber-400" />
                <span>RSS & Atom Feed Ingestion</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add real-time feeds for The Hindu, PIB, or The Indian Express. Our backend extracts headlines, generates UPSC GS tags, and prepares Mains questions.
              </p>
            </div>
            <span className="text-[11px] text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {savedFeeds.length} Active Feeds Configured
            </span>
          </div>

          {/* URL Input Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Source Publisher
                </label>
                <select
                  value={feedSourceInput}
                  onChange={(e) => setFeedSourceInput(e.target.value as any)}
                  className="w-full bg-[#162033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="The Hindu">The Hindu</option>
                  <option value="PIB">Press Information Bureau (PIB)</option>
                  <option value="The Indian Express">The Indian Express</option>
                  <option value="Government Sources">Government Sources</option>
                  <option value="Editorials">Editorials</option>
                </select>
              </div>

              <div className="sm:col-span-7">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  RSS or Atom Feed URL
                </label>
                <input
                  type="url"
                  placeholder="e.g., https://www.thehindu.com/opinion/editorial/feeder/default.rss"
                  value={feedUrlInput}
                  onChange={(e) => setFeedUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddAndFetchFeed();
                  }}
                  className="w-full bg-[#162033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={() => handleAddAndFetchFeed()}
                  disabled={isFetchingFeed || !feedUrlInput.trim()}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-600/20"
                >
                  {isFetchingFeed ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isFetchingFeed ? "Fetching..." : "Fetch Feed"}</span>
                </button>
              </div>
            </div>

            {/* Quick-Add Preset Feed Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">1-Click Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("The Hindu");
                  setFeedUrlInput("https://www.thehindu.com/opinion/editorial/feeder/default.rss");
                  handleAddAndFetchFeed("https://www.thehindu.com/opinion/editorial/feeder/default.rss", "The Hindu");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-blue-300 border border-blue-500/30 transition-colors flex items-center space-x-1"
              >
                <span>The Hindu (Editorial)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("The Hindu");
                  setFeedUrlInput("https://www.thehindu.com/news/national/feeder/default.rss");
                  handleAddAndFetchFeed("https://www.thehindu.com/news/national/feeder/default.rss", "The Hindu");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-blue-300 border border-blue-500/30 transition-colors flex items-center space-x-1"
              >
                <span>The Hindu (National)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("Government Sources");
                  setFeedUrlInput("https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms");
                  handleAddAndFetchFeed("https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", "Government Sources");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-amber-300 border border-amber-500/30 transition-colors flex items-center space-x-1"
              >
                <span>Economic Times (Economy)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("Government Sources");
                  setFeedUrlInput("https://www.livemint.com/rss/politics");
                  handleAddAndFetchFeed("https://www.livemint.com/rss/politics", "Government Sources");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-purple-300 border border-purple-500/30 transition-colors flex items-center space-x-1"
              >
                <span>Livemint (Polity)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("PIB");
                  setFeedUrlInput("https://pib.gov.in/press-releases");
                  handleAddAndFetchFeed("https://pib.gov.in/press-releases", "PIB");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-amber-300 border border-amber-500/30 transition-colors flex items-center space-x-1"
              >
                <span>PIB Press Releases</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("The Indian Express");
                  setFeedUrlInput("https://indianexpress.com/section/explained/feed/");
                  handleAddAndFetchFeed("https://indianexpress.com/section/explained/feed/", "The Indian Express");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-emerald-300 border border-emerald-500/30 transition-colors flex items-center space-x-1"
              >
                <span>Indian Express (Explained)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedSourceInput("The Indian Express");
                  setFeedUrlInput("https://indianexpress.com/section/opinion/editorials/feed/");
                  handleAddAndFetchFeed("https://indianexpress.com/section/opinion/editorials/feed/", "The Indian Express");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#182338] hover:bg-[#202f4a] text-emerald-300 border border-emerald-500/30 transition-colors flex items-center space-x-1"
              >
                <span>Indian Express (Editorials)</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast */}
          {feedNotification && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                feedNotification.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : feedNotification.type === "error"
                  ? "bg-red-950/40 border-red-500/40 text-red-300"
                  : "bg-blue-950/40 border-blue-500/40 text-blue-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedNotification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span>{feedNotification.message}</span>
              </div>
              <button
                onClick={() => setFeedNotification(null)}
                className="text-slate-400 hover:text-white text-[11px] ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Feeds List */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Configured Real-Time Feed Sources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {savedFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="p-2.5 rounded-xl bg-[#162033] border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <p className="text-xs font-bold text-white truncate">{feed.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{feed.url}</p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddAndFetchFeed(feed.url, feed.source)}
                      disabled={isFetchingFeed}
                      title="Sync this feed"
                      className="p-1 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedFeed(feed.id)}
                      title="Remove feed"
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today's MCQs Banner (Matching Screenshot 6 Banner) */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/70 via-purple-950/50 to-[#121b2d] border border-red-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
            Daily Knowledge Test
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
            Today's MCQs
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            <span className="text-slate-400">1603 practiced</span> • 15 questions based on today's newspaper editorials.
          </p>
        </div>

        <button
          onClick={onStartTodayMCQs}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
        >
          <span>Practice Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Source Filter Tabs & Feed Scroll Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-[#111723] p-1.5 rounded-xl border border-[#1e293b] text-xs font-semibold overflow-x-auto">
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedSource === src
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Scroll Progress Metric Badge */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 self-end sm:self-auto">
          <span>Feed scrolled:</span>
          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/80">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-300">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Layout: Articles List (Left) + Detail View (Right, Matching Screenshot 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Articles Feed */}
        <div className="lg:col-span-5 space-y-3.5">
          {filteredArticles.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111723] border border-[#1e293b] text-center space-y-3">
              <Newspaper className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="font-bold text-white text-sm">No articles found for "{selectedSource}"</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click "Custom RSS Feeds" at the top to add a live feed URL for {selectedSource}.
              </p>
              <button
                onClick={() => setIsFeedManagerOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Add RSS Feed
              </button>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isSelected = activeArticle?.id === article.id;

              return (
                <div
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#162033] border-blue-500/60 ring-1 ring-blue-500/40 shadow-md shadow-blue-500/10"
                      : "bg-[#111723] border-[#1e293b] hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-blue-400">{article.source}</span>
                    <span className="text-[11px]">{article.date}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2">
                    {article.headline}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                    {article.gsTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#1f2c42] text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.prelimsTag && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        Prelims Fact
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Full Article View (Matching Screenshot 5) */}
        {activeArticle && (
          <div className="lg:col-span-7 bg-[#111723] rounded-2xl border border-[#1e293b] p-5 sm:p-7 space-y-6 shadow-md">
            {/* Header & Meta */}
            <div className="space-y-3 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-bold">{activeArticle.source}</span>
                  {activeArticle.page && (
                    <span className="text-slate-400">• {activeArticle.page}</span>
                  )}
                  <span className="text-slate-400">• {activeArticle.date}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAskBoltArticle(activeArticle)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>Ask Bolt</span>
                  </button>
                  <button
                    onClick={() => alert("Article bookmarked to your revision folder.")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeArticle.headline}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                {activeArticle.gsTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
                {activeArticle.prelimsTag && (
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Prelims Ready
                  </span>
                )}
              </div>
            </div>

            {/* Key Highlights (Matching Screenshot 5) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Key Highlights
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                {activeArticle.keyHighlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Infographic Card (Matching Screenshot 5 Box) */}
            {activeArticle.infographic && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#0e141f] border border-blue-900/40 space-y-4 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      UPSC Infographic
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {activeArticle.infographic.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Effective: {activeArticle.infographic.effectiveDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeArticle.infographic.cards.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-lg bg-[#162033] border border-slate-800 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200">{card.title}</span>
                        {card.value && (
                          <span className="text-xs font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                            {card.value}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{card.subtitle}</p>
                    </div>
                  ))}
                </div>

                {activeArticle.infographic.themes && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Themes:</span>
                    {activeArticle.infographic.themes.map((th, thIdx) => (
                      <span key={thIdx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {th}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Insights & Key Concepts */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Detailed Insights
              </h3>
              {activeArticle.detailedInsights.map((insight, idx) => (
                <p key={idx}>{insight}</p>
              ))}
            </div>

            {/* UPSC Relevance Card (Matching Screenshot 5) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#121b2d] to-[#0e141f] border border-blue-900/40 space-y-2.5 text-xs">
              <h4 className="font-bold text-white flex items-center space-x-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>UPSC Examination Relevance</span>
              </h4>

              <div className="space-y-1.5 text-slate-300">
                <p>
                  <strong className="text-slate-200">Prelims Pointer:</strong>{" "}
                  {activeArticle.upscRelevance.prelimsFact}
                </p>
                <p>
                  <strong className="text-slate-200">Mains Dimension:</strong>{" "}
                  {activeArticle.upscRelevance.mainsRelevance}
                </p>
                <div className="p-2.5 rounded-lg bg-[#162033] border border-slate-800 text-blue-200">
                  <strong className="text-blue-400 block mb-1">Expected Mains Question:</strong>
                  "{activeArticle.upscRelevance.possibleMainsQuestion}"
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={onStartTodayMCQs}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>Practice MCQs on this Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onAskBoltArticle(activeArticle)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Deep Dive with Bolt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
