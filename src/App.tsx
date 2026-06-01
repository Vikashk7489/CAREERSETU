/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Trophy, 
  Ticket, 
  Key, 
  BookOpen, 
  Bell, 
  Home, 
  Phone, 
  Search, 
  Bookmark, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Share2, 
  Printer, 
  Copy, 
  ChevronRight, 
  ArrowLeft,
  ChevronUp,
  Eye,
  MessageCircle,
  Send,
  Lock,
  LayoutDashboard,
  Plus,
  PhoneCall
} from 'lucide-react';
import { allData, tickerItems, quickLinks, categoryMap, JobItem } from './data';

import AdminPanel from './components/AdminPanel.tsx';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { supabase } from './supabase';

type Page = 'home' | 'jobs' | 'results' | 'admitcard' | 'answerkey' | 'syllabus' | 'notifications' | 'contact' | 'bookmarks' | 'about' | 'privacy' | 'terms' | 'disclaimer' | 'detail' | 'admin';

const ScriptAdBanner = ({ type }: { type?: 'mobile' | 'desktop' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('iframe')) {
      const isMobile = window.innerWidth < 768;
      const key = isMobile ? 'af3a0f42870899e50e6b0b00bd20358f' : '9d198a72d47a984cde7ece74d4b49f0b';
      const format = isMobile ? 'iframe' : 'iframe';
      const height = isMobile ? 60 : 90;
      const width = isMobile ? 468 : 728;

      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : '${key}',
          'format' : '${format}',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      const script = document.createElement('script');
      script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      
      containerRef.current.appendChild(conf);
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`flex justify-center my-4 overflow-hidden bg-gray-50/50 dark:bg-gray-800/10 rounded border border-dashed border-border-color/20 ${type === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'}`} 
      style={{ minHeight: window.innerWidth < 768 ? '60px' : '90px' }}
    />
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentDetailId, setCurrentDetailId] = useState<number | string | null>(null);
  const [history, setHistory] = useState<Page[]>([]);
  const [livePosts, setLivePosts] = useState<JobItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    }

    let socialBar: HTMLScriptElement | null = null;
    let popunder: HTMLScriptElement | null = null;

    // Only run global ads IF NOT on admin page
    if (currentPage !== 'admin') {
      socialBar = document.createElement('script');
      socialBar.src = 'https://pl29606893.effectivecpmnetwork.com/a7/ae/7f/a7ae7f68b3162c91ce5838defee20d25.js';
      socialBar.async = true;
      document.body.appendChild(socialBar);

      popunder = document.createElement('script');
      popunder.src = 'https://pl29606927.effectivecpmnetwork.com/4b/c2/4a/4bc24a29b0aa581eb392fd042161cdad.js';
      popunder.async = true;
      document.body.appendChild(popunder);
    }

    return () => {
      if (socialBar && document.body.contains(socialBar)) {
        document.body.removeChild(socialBar);
      }
      if (popunder && document.body.contains(popunder)) {
        document.body.removeChild(popunder);
      }
    };
  }, [currentPage]);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Supabase Fetch Error:", error);
        setLivePosts(allData);
      } else if (data) {
        setLivePosts(data as unknown as JobItem[]);
      }
      setPostsLoading(false);
    };

    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Use livePosts instead of allData globally
  const currentAllData = useMemo(() => livePosts.length > 0 ? livePosts : allData, [livePosts]);
  const [bookmarks, setBookmarks] = useState<(number | string)[]>(() => {
    const saved = localStorage.getItem('cs_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('cs_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('cs_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cs_theme', theme);
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Navigation functions
  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setHistory((prev) => [...prev, currentPage]);
    }
    setCurrentPage(page);
    setCurrentDetailId(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDetail = async (id: number | string) => {
    setHistory((prev) => [...prev, currentPage]);
    setCurrentDetailId(id);
    setCurrentPage('detail');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Increment views in Supabase
    if (typeof id === 'string' || typeof id === 'number') {
      try {
        const { error } = await supabase.rpc('increment_views', { post_id: id });
        if (error) {
          // Fallback to simple update if RPC doesn't exist
          const { data: item } = await supabase.from('posts').select('views').eq('id', id).single();
          if (item) {
            await supabase.from('posts').update({ views: (item.views || 0) + 1 }).eq('id', id);
          }
        }
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((prevH) => prevH.slice(0, -1));
      setCurrentPage(prev);
      setCurrentDetailId(null);
    } else {
      navigateTo('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = (id: number | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        triggerToast('बुकमार्क हटाया गया');
        return prev.filter(b => b !== id);
      } else {
        triggerToast('बुकमार्क जोड़ा गया ✓');
        return [...prev, id];
      }
    });
  };

  const shareWhatsApp = (title: string) => {
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank');
  };

  const shareTelegram = (title: string) => {
    const url = window.location.href;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => triggerToast('लिंक कॉपी हो गया ✓'));
  };

  // Search Logic
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase();
    return currentAllData.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery, currentAllData]);

  useEffect(() => {
    // Initialize AdSense on route/page changes
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push failed - this is expected in development without a verified domain');
    }
  }, [currentPage, currentDetailId]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {currentPage === 'admin' ? (
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 min-h-screen">
          <AdminPanel onBack={() => navigateTo('home')} />
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-red-primary text-white py-3 px-4 sticky top-0 z-[1000] shadow-md w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button className="md:hidden p-1" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="text-center flex-1 md:text-left">
            <h1 className="text-xl md:text-2xl font-extrabold m-0 leading-tight tracking-tight">CareerSetu</h1>
            <p className="text-[9px] md:text-[10px] font-semibold opacity-90 tracking-wider">EDUCATIONAL JOB PORTAL 2025-26</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:opacity-80 transition-opacity" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-1.5 hover:opacity-80 transition-opacity" onClick={() => setIsSearchOpen(true)}>
              <Search size={20} />
            </button>
            <button className="p-1.5 hover:opacity-80 transition-opacity relative" onClick={() => navigateTo('bookmarks')}>
              <Bookmark size={20} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-dark-blue text-white overflow-x-auto whitespace-nowrap scrollbar-none sticky top-[52px] md:top-[60px] z-[999] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex">
          {[
            { id: 'home', icon: <Home size={14} />, label: 'Home' },
            { id: 'jobs', icon: <Briefcase size={14} />, label: 'Latest Jobs' },
            { id: 'results', icon: <Trophy size={14} />, label: 'Results' },
            { id: 'admitcard', icon: <Ticket size={14} />, label: 'Admit Card' },
            { id: 'answerkey', icon: <Key size={14} />, label: 'Answer Key' },
            { id: 'syllabus', icon: <BookOpen size={14} />, label: 'Syllabus' },
            { id: 'notifications', icon: <Bell size={14} />, label: 'Notifications' },
            { id: 'contact', icon: <Phone size={14} />, label: 'Contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as Page)}
              className={`py-3 px-4 text-[11px] md:text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-r border-white/10 last:border-none ${currentPage === item.id ? 'bg-red-primary/30' : 'hover:bg-red-primary/20'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Breaking News Ticker */}
      <div className="bg-ticker-bg border-b border-border-color h-8 overflow-hidden flex items-center relative">
        <div className="bg-red-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-10 animate-blink h-full flex items-center shrink-0">
          ⚡ BREAKING
        </div>
        <div className="flex-1 relative overflow-hidden h-full flex items-center">
          <div className="flex animate-ticker whitespace-nowrap">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span key={idx} className="text-xs text-[var(--text-primary)] px-8 font-medium hover:text-red-primary cursor-pointer transition-colors flex items-center">
                <span className="bg-red-primary text-white text-[8px] px-1 rounded mr-1.5 font-bold">NEW</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        
        <div className="content-area">
          {currentPage === 'home' && (
            <>
              {/* Hero Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                {[
                  { id: 'jobs', icon: <Briefcase />, label: 'Jobs', color: 'from-red-600 to-red-800' },
                  { id: 'admitcard', icon: <Ticket />, label: 'Admit Card', color: 'from-orange-500 to-orange-700' },
                  { id: 'answerkey', icon: <Key />, label: 'Ans Key', color: 'from-pink-500 to-pink-700' },
                  { id: 'results', icon: <Trophy />, label: 'Results', color: 'from-lime-600 to-lime-800' },
                  { id: 'syllabus', icon: <BookOpen />, label: 'Syllabus', color: 'from-blue-500 to-blue-700' },
                  { id: 'notifications', icon: <Bell />, label: 'Notif', color: 'from-red-900 to-red-950' },
                ].map(btn => (
                  <button 
                    key={btn.id}
                    onClick={() => navigateTo(btn.id as Page)}
                    className={`bg-gradient-to-br ${btn.color} text-white p-3 rounded-lg flex flex-col items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all hover:-translate-y-1`}
                  >
                    <span className="text-xl md:text-2xl">{btn.icon}</span>
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-tight">{btn.label}</span>
                  </button>
                ))}
              </div>

              {/* Join Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <a 
                  href="https://whatsapp.com/channel/0029Vb86tg3D38CMUPve8U0a" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white p-3 rounded-lg flex items-center justify-center gap-3 shadow-md hover:brightness-110 transition-all font-bold text-sm uppercase tracking-wider"
                >
                  <MessageCircle size={22} /> Join WhatsApp Channel
                </a>
                <a 
                  href="https://t.me/CareerSetu76" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#0088CC] text-white p-3 rounded-lg flex items-center justify-center gap-3 shadow-md hover:brightness-110 transition-all font-bold text-sm uppercase tracking-wider"
                >
                  <Send size={22} /> Join Telegram Group
                </a>
              </div>

              {/* Ad Slot (Home Top) */}
              <div className="mb-4 bg-transparent text-center space-y-2">
                <ScriptAdBanner />
                <div className="flex justify-center gap-2">
                   <ScriptAdBanner type="mobile" />
                   <ScriptAdBanner type="mobile" />
                </div>
                <ins className="adsbygoogle"
                     style={{ display: 'block' }}
                     data-ad-client="ca-pub-5868574385517005"
                     data-ad-slot="6696255538"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {(Object.keys(categoryMap) as Array<keyof typeof categoryMap>).map((catKey, idx) => (
                  <React.Fragment key={catKey}>
                    <SectionCard 
                      categoryKey={catKey}
                      allData={currentAllData}
                      onNavigateTo={() => navigateTo(catKey as Page)}
                      onDetailNavigate={navigateToDetail}
                      onToggleBookmark={toggleBookmark}
                      isBookmarked={bookmarks.includes.bind(bookmarks)}
                    />
                    {idx % 1 === 0 && (
                      <div className="my-2 border border-border-color/5 overflow-hidden">
                        <ScriptAdBanner />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}

          {currentPage === 'detail' && currentDetailId && (
            <ArticleDetail 
              id={currentDetailId} 
              allData={currentAllData}
              onBack={goBack}
              onNavigateDetail={navigateToDetail}
              toggleBookmark={toggleBookmark}
              isBookmarked={bookmarks.includes(currentDetailId)}
              shareWhatsApp={shareWhatsApp}
              shareTelegram={shareTelegram}
              copyLink={copyLink}
            />
          )}

          {(categoryMap[currentPage as keyof typeof categoryMap]) && (
            <CategoryPage 
              categoryKey={currentPage as keyof typeof categoryMap}
              allData={currentAllData}
              onNavigateDetail={navigateToDetail}
              onBack={() => navigateTo('home')}
              onToggleBookmark={toggleBookmark}
              isBookmarked={bookmarks.includes.bind(bookmarks)}
            />
          )}

          {currentPage === 'contact' && <ContactPage onBack={() => navigateTo('home')} />}
          {currentPage === 'bookmarks' && (
            <BookmarksPage 
              bookmarks={bookmarks}
              allData={currentAllData}
              onNavigateDetail={navigateToDetail}
              onBack={() => navigateTo('home')}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {currentPage === 'admin' && <AdminPanel onBack={() => navigateTo('home')} />}

          {['about','privacy','terms','disclaimer'].includes(currentPage) && (
             <InfoPage type={currentPage} onBack={() => navigateTo('home')} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Ad unit (Sidebar Top) */}
          <div className="bg-white dark:bg-gray-900 border border-border-color p-2 rounded-lg text-center">
            <ScriptAdBanner />
            <div className="flex justify-center gap-1 mt-1">
              <ScriptAdBanner type="mobile" />
              <ScriptAdBanner type="mobile" />
            </div>
          </div>

          {/* Sidebar Widget: Trending */}
          <SidebarWidget title="🔥 Trending / ट्रेंडिंग">
            <ul className="divide-y divide-border-color">
              {[...currentAllData].sort((a,b) => b.views - a.views).slice(0, 6).map(item => (
                <li key={item.id} className="py-2.5 flex justify-between items-start gap-2">
                  <button onClick={() => navigateToDetail(item.id)} className="text-blue-link hover:text-red-primary text-[11px] font-medium text-left line-clamp-2">
                    {item.title}
                  </button>
                  <span className="text-[9px] text-text-secondary flex items-center gap-1 shrink-0 mt-1">
                    <Eye size={10} /> {item.views > 1000 ? (item.views/1000).toFixed(1)+'K' : item.views}
                  </span>
                </li>
              ))}
            </ul>
          </SidebarWidget>

          {/* Sidebar Ad unit */}
          <div className="bg-transparent text-center">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-5868574385517005"
                 data-ad-slot="6696255538"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>

          <SidebarWidget title="📂 Categories / श्रेणियां">
            <ul className="divide-y divide-border-color">
              {(Object.keys(categoryMap) as Array<keyof typeof categoryMap>).map(key => (
                <li key={key} className="py-2.5 flex justify-between items-center">
                  <button onClick={() => navigateTo(key)} className="text-blue-link hover:text-red-primary text-[11px] font-medium">
                    {categoryMap[key].icon} {categoryMap[key].label}
                  </button>
                  <span className="bg-gray-200 dark:bg-gray-700 text-text-secondary text-[9px] px-2 py-0.5 rounded-full font-bold">
                    {currentAllData.filter(d => d.category === key).length}
                  </span>
                </li>
              ))}
            </ul>
          </SidebarWidget>

          <SidebarWidget title="🔗 Quick Links / त्वरित लिंक">
            <ul className="divide-y divide-border-color">
              {quickLinks.map((link, idx) => (
                <li key={idx} className="py-2.5">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-link hover:text-red-primary text-[11px] font-medium flex items-center justify-between">
                    {link.name} <ChevronRight size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </SidebarWidget>

          {/* Sticky Sidebar Ad unit */}
          <div className="sticky top-20 space-y-4">
             <div className="bg-white dark:bg-gray-900 border border-border-color p-2 rounded-lg text-center shadow-md">
               <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">Sponsored</p>
               <ScriptAdBanner />
             </div>
             <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg">
               <h4 className="text-xs font-bold uppercase mb-2">🚀 Free Job Alert</h4>
               <p className="text-[10px] opacity-90 leading-relaxed mb-3">Get Latest Jobs, Results & Admit Card updates instantly on your mobile.</p>
               <button onClick={() => window.open('https://t.me/CareerSetu76', '_blank')} className="w-full bg-white text-blue-600 py-2 rounded-lg text-[10px] font-black uppercase shadow-inner">Subscribe Telegram</button>
             </div>
             <div className="bg-white dark:bg-gray-900 border border-border-color p-2 rounded-lg text-center">
               <ScriptAdBanner />
             </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-dark-gray text-white pt-6 pb-4 mt-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-6">
            {['f', '𝕏', '📷', '▶', '✈'].map((icon, idx) => (
              <button key={idx} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-primary transition-colors">
                {icon}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] mb-4 font-medium opacity-80 uppercase tracking-tighter">
            <button onClick={() => navigateTo('home')} className="hover:opacity-100">Home</button>
            <button onClick={() => navigateTo('contact')} className="hover:opacity-100">Contact</button>
            <button onClick={() => navigateTo('about')} className="hover:opacity-100">About</button>
            <button onClick={() => navigateTo('privacy')} className="hover:opacity-100">Privacy</button>
            <button onClick={() => navigateTo('terms')} className="hover:opacity-100">Terms</button>
            <button onClick={() => navigateTo('disclaimer')} className="hover:opacity-100">Disclaimer</button>
          </div>

          <div 
            className="pt-6 border-t border-white/10 text-[10px] opacity-60 cursor-default select-none"
            onClick={(e) => {
              // Secret way to access admin: Click copyright 5 times
              const clicks = parseInt(e.currentTarget.getAttribute('data-clicks') || '0') + 1;
              e.currentTarget.setAttribute('data-clicks', clicks.toString());
              if (clicks >= 5) {
                navigateTo('admin');
                e.currentTarget.setAttribute('data-clicks', '0');
              }
            }}
          >
            © 2025 CareerSetu. All Rights Reserved. | सरकारी नौकरी, रिजल्ट और एडमिट कार्ड की जानकारी
          </div>
        </div>
      </footer>

      {/* Overlays & Modals */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-full w-[75%] max-w-sm bg-dark-blue flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-red-primary/10">
              <div>
                <h2 className="text-white text-lg font-bold">CareerSetu</h2>
                <p className="text-white/60 text-[10px]">EDUCATIONAL JOB PORTAL</p>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {[
                { id: 'home', icon: <Home size={18} />, label: 'Home' },
                { id: 'jobs', icon: <Briefcase size={18} />, label: 'Latest Jobs' },
                { id: 'results', icon: <Trophy size={18} />, label: 'Results' },
                { id: 'admitcard', icon: <Ticket size={18} />, label: 'Admit Card' },
                { id: 'answerkey', icon: <Key size={18} />, label: 'Answer Key' },
                { id: 'syllabus', icon: <BookOpen size={18} />, label: 'Syllabus' },
                { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
                { id: 'bookmarks', icon: <Bookmark size={18} />, label: 'Bookmarks' },
                { id: 'contact', icon: <Phone size={18} />, label: 'Contact Us' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as Page)}
                  className="w-full text-left p-4 text-white font-semibold flex items-center gap-3 hover:bg-red-primary/20 border-b border-white/5"
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex justify-center items-start pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-[var(--card-bg)] w-full max-w-xl rounded-lg overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border-color flex items-center gap-3">
              <Search className="text-text-secondary" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="नौकरी, रिजल्ट, एडमिट कार्ड खोजें..." 
                className="flex-1 bg-transparent border-none outline-none text-base text-[var(--text-primary)]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="text-text-secondary" onClick={() => setIsSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              {searchQuery.length < 2 ? (
                <div className="p-10 text-center text-text-secondary text-sm">
                  کم से कम 2 अक्षर टाइप करें...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-10 text-center text-text-secondary text-sm">
                  🔍 "{searchQuery}" के लिए कोई परिणाम नहीं मिला
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => navigateToDetail(item.id)}
                      className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <div className="text-blue-link font-medium text-sm line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-text-secondary mt-1">
                        {item.date} | {categoryMap[item.category].hindi}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {showScrollTop && (
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-red-primary text-white shadow-xl flex items-center justify-center hover:-translate-y-1 transition-all"
          >
            <ChevronUp size={24} />
          </button>
        )}
        <a 
          href="https://whatsapp.com/channel/0029Vb86tg3D38CMUPve8U0a" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Join WhatsApp"
        >
          <MessageCircle size={20} />
        </a>
        <a 
          href="https://t.me/CareerSetu76" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 bg-[#0088CC] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Join Telegram"
        >
          <Send size={20} />
        </a>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl z-[3000] animate-in slide-in-from-bottom-5 fade-in duration-300">
          {toast}
        </div>
      )}
        </>
      )}
    </div>
  );
}

// Helper Components
function SectionCard({ categoryKey, allData, onNavigateTo, onDetailNavigate, onToggleBookmark, isBookmarked }: any) {
  const cat = categoryMap[categoryKey as keyof typeof categoryMap];
  const items = allData.filter((d: any) => d.category === categoryKey).slice(0, 5);
  
  return (
    <div className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-sm">
      <div className={`bg-gradient-to-r ${cat.color} text-white px-4 py-2.5 flex justify-between items-center`}>
         <div className="flex items-center gap-2">
           <span className="text-lg">{cat.icon}</span>
           <span className="font-bold text-[12px] uppercase tracking-wider">{cat.label}</span>
         </div>
         <button onClick={onNavigateTo} className="text-[10px] font-bold uppercase opacity-90 hover:opacity-100 flex items-center gap-0.5">
           View All <ChevronRight size={12} />
         </button>
      </div>
      <div className="divide-y divide-border-color">
         {items.map(item => (
           <ItemRow 
            key={item.id} 
            item={item} 
            onClick={() => onDetailNavigate(item.id)} 
            onBookmark={(e) => onToggleBookmark(item.id, e)}
            bookmarked={isBookmarked(item.id)}
           />
         ))}
      </div>
    </div>
  );
}

function ItemRow({ item, onClick, onBookmark, bookmarked }: any) {
  return (
    <div 
      onClick={onClick}
      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-start gap-3 group transition-colors"
    >
      <div className="flex-1">
        <h4 className="text-blue-link font-medium text-[13px] group-hover:text-red-primary transition-colors leading-snug line-clamp-2">
          {item.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-text-secondary font-medium tracking-tight">{item.date}</span>
          <div className="flex gap-1">
            {item.isNew && <span className="bg-red-primary text-white text-[8px] px-1.5 py-0.5 rounded font-bold animate-blink">NEW</span>}
            {item.isHot && <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">HOT</span>}
          </div>
        </div>
      </div>
      <button 
        onClick={onBookmark}
        className={`shrink-0 transition-all ${bookmarked ? 'text-red-primary opacity-100' : 'text-text-secondary opacity-30 hover:opacity-100'}`}
      >
        <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

function SidebarWidget({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white px-4 py-2 font-bold text-[11px] uppercase tracking-wider">
        {title}
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

function ArticleDetail({ id, allData, onBack, onNavigateDetail, toggleBookmark, isBookmarked, shareWhatsApp, shareTelegram, copyLink }: any) {
  const item = allData.find((d: any) => d.id === id);
  if (!item) return <div>Post not found</div>;
  
  const cat = categoryMap[item.category as keyof typeof categoryMap];
  const related = allData.filter((d: any) => d.category === item.category && d.id !== id).slice(0, 5);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center bg-[var(--card-bg)] border border-border-color rounded-lg p-3 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-red-primary transition-colors">
          <ArrowLeft size={14} /> वापस जाएं (BACK)
        </button>
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary" title="Print Article">
              <Printer size={16} />
            </button>
            <button 
                onClick={() => toggleBookmark(item.id)}
                className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${isBookmarked ? 'text-red-primary' : 'text-text-secondary'}`}
                title="Save Article"
            >
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
        </div>
      </div>

      <article className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-md">
        {/* Sarkari Style Header Banner */}
        <div className="bg-gradient-to-r from-red-800 to-red-800 text-white p-4 text-center border-b-2 border-orange-500">
           <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight leading-tight mb-1">
             {item.title}
           </h1>
             <div className="flex justify-center flex-wrap gap-2 text-[9px] font-bold opacity-90">
               <span className="bg-yellow-400 text-red-900 px-2 py-0.5 rounded shadow-sm">Updated : {new Date(item.date).toLocaleDateString()}</span>
               <span className="bg-white/20 px-2 py-0.5 rounded uppercase">{cat.label}</span>
               <span className="bg-white/20 px-2 py-0.5 rounded uppercase">👁️ {item.views.toLocaleString()} Views</span>
               <button 
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({
                       title: item.title,
                       text: `Check out ${item.title} on CareerSetu`,
                       url: window.location.href,
                     }).catch(console.error);
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert('Link copied to clipboard!');
                   }
                 }}
                 className="bg-white/20 px-2 py-0.5 rounded uppercase flex items-center gap-1 hover:bg-white/30 transition-colors"
               >
                 <Share2 size={10} /> Share
               </button>
             </div>
        </div>

        <div className="p-4 md:p-6 space-y-8">
            {/* Join Buttons (Prominent) */}
            <div className="grid grid-cols-2 gap-3">
              <a href="https://whatsapp.com/channel/0029Vb86tg3D38CMUPve8U0a" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded font-bold text-xs shadow-sm hover:brightness-105 transition-all">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="https://t.me/CareerSetu76" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#0088CC] text-white py-2 rounded font-bold text-xs shadow-sm hover:brightness-105 transition-all">
                <Send size={16} /> Telegram
              </a>
            </div>

            {/* Featured Image */}
            {item.imageUrl && (
              <div className="rounded-xl overflow-hidden border-4 border-red-primary/10 shadow-lg">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-auto object-cover max-h-[400px]"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{item.title} Official Notification Graphic</p>
                </div>
              </div>
            )}

            {/* Ad Slot */}
            <div className="bg-transparent text-center space-y-2">
              <ScriptAdBanner />
              <div className="flex justify-center gap-2">
                <ScriptAdBanner type="mobile" />
                <ScriptAdBanner type="mobile" />
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
                {/* Short Description */}
                <div className="text-center rounded-lg border-2 border-dashed border-red-primary/30 p-4 bg-red-primary/5">
                   <p className="text-[13px] leading-relaxed font-medium text-[var(--text-primary)]">
                     {item.shortDescription || `Bihar Public Service Commission (BPSC) Has Released A Notification On Its Official Website For The ${item.title}. Interested Candidates Can Check The Complete Details For This Recruitment 2025 Given Below.`}
                   </p>
                </div>

                {/* Important Dates & Application Fee Table */}
                <div className="overflow-hidden border-2 border-red-primary rounded-lg">
                  <div className="bg-red-primary text-white text-center py-2 font-bold uppercase text-sm">
                    Important Dates & Application Fee
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-red-primary text-[var(--text-primary)]">
                    <div className="p-0">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-red-50 dark:bg-red-950/30 text-red-primary text-center font-bold">
                            <th className="py-2 px-4 border-b border-red-primary font-bold uppercase" colSpan={2}>Important Dates</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {(item.importantDates || [
                            { label: 'Online Apply Start', value: '07 May 2026' },
                            { label: 'Registration Last Date', value: '31 May 2026' },
                            { label: 'Fee Payment Last Date', value: '31 May 2026' },
                            { label: 'Exam Date', value: 'Update Soon' }
                          ]).map((row: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 px-4 font-bold border-r border-gray-200 dark:border-gray-800 w-1/2">{row.label}</td>
                              <td className="py-2 px-4 text-red-primary font-bold">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-red-50 dark:bg-red-950/30 text-red-primary text-center font-bold">
                            <th className="py-2 px-4 border-b border-red-primary font-bold uppercase" colSpan={2}>Application Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {(item.applicationFee || [
                            { label: 'Gen / OBC / EWS', value: '₹ 100/-' },
                            { label: 'SC / ST / PH', value: '₹ 100/-' },
                            { label: 'All Category Female', value: '₹ 100/-' },
                            { label: 'Payment Mode', value: 'Online Only' }
                          ]).map((row: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 px-4 font-bold border-r border-gray-200 dark:border-gray-800 w-1/2">{row.label}</td>
                              <td className="py-2 px-4 text-red-primary font-bold">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border-2 border-green-600 rounded-lg text-[var(--text-primary)]">
                  <div className="bg-green-600 text-white flex justify-between items-center px-4 py-2 font-bold uppercase text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span>Notification Age Limits</span>
                    </div>
                    <span className="bg-white text-green-700 px-2 py-0.5 rounded text-[11px]">Total Post</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] divide-y md:divide-y-0 md:divide-x divide-green-600">
                    <div className="p-4 text-[12px] space-y-2 bg-green-50/30 dark:bg-green-900/5">
                       <ul className="list-disc pl-5 font-bold space-y-2 text-green-800 dark:text-green-300">
                         <li>Minimum Age : 20-22 Years (Post Wise)</li>
                         <li>Maximum Age : 37 Years (UR Male)</li>
                         <li>Maximum Age : 40 Year (Female UR, BC/ EBC-Male & Female)</li>
                         <li>Maximum Age : 42 Year (SC/ ST-Male & Female)</li>
                         <li className="text-red-primary">Age Relaxation Extra as per Recruitment Rules.</li>
                       </ul>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900">
                       <div className="text-3xl font-black text-green-700 leading-none">{item.totalPosts || '1189'}</div>
                       <div className="text-[10px] font-bold uppercase opacity-60 mt-1">Vacancies</div>
                    </div>
                  </div>
                </div>

                {/* Vacancy Details Table */}
                <div className="overflow-hidden border-2 border-blue-900 rounded-lg text-[var(--text-primary)]">
                  <div className="bg-blue-900 text-white text-center py-2 font-bold uppercase text-sm">
                    CATEGORY WISE POST DETAILS
                  </div>
                  <table className="w-full text-[12px] text-center border-collapse">
                    <thead className="bg-blue-50 dark:bg-blue-950/30 text-blue-900 font-bold uppercase">
                      <tr>
                        <th className="py-2 border-b border-blue-900">Category Name</th>
                        <th className="py-2 border-b border-blue-900">No. Of Post</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-bold">
                       {(item.vacancyDetails || [
                         { category: 'General', posts: '513' },
                         { category: 'EWS', posts: '116' },
                         { category: 'BC', posts: '140' },
                         { category: 'SC', posts: '175' }
                       ]).map((row: any, i: number) => (
                         <tr key={i}>
                           <td className="py-2 border-r border-gray-200 dark:border-gray-800">{row.category}</td>
                           <td className="py-2">{row.posts}</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>

                {/* Main Content Area (Custom Text from Admin) */}
                {item.content && (
                  <div className="bg-gray-50 dark:bg-gray-800/20 p-6 rounded-lg border border-border-color/30 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--text-primary)]">
                    {item.content}
                  </div>
                )}

                {/* How to Fill Section */}
                <div className="overflow-hidden border-2 border-blue-900 rounded-lg text-[var(--text-primary)]">
                  <div className="bg-blue-900 text-white text-center py-2 font-bold uppercase text-sm">
                    How To Fill {item.title.split(' ')[0]} Online Form 2026
                  </div>
                  <div className="p-4 text-[12px] space-y-3 font-semibold leading-relaxed">
                    <p>• Candidates Who Wish To Apply For The <strong>{item.title.split(' ')[0]}</strong> Post Can Submit Their Application Online Before the deadline.</p>
                    <p>• Use The Click Here Link Provided Below Under Important Link Section To Apply Directly.</p>
                    <p>• Alternatively, Visit The <strong>Official Website</strong> To Complete The Application Process Online.</p>
                    <p>• Make Sure To Complete The Application Before The Deadline.</p>
                    <p className="text-red-primary font-bold">• Note – छात्रों से ये अनुरोध किया जाता है की वो अपना फॉर्म भरने से पहले Official Notification को ध्यान से जरूर पढ़े उसके बाद ही अपना फॉर्म भरे।</p>
                    <p>• Take A Print Out of Final Submitted Form.</p>
                  </div>
                </div>

                {/* Important Links Section */}
                <div className="overflow-hidden border-2 border-red-primary rounded-lg shadow-sm text-[var(--text-primary)]">
                  <div className="bg-red-primary text-white text-center py-2 font-bold uppercase text-sm">
                    SOME USEFUL IMPORTANT LINKS
                  </div>
                  <table className="w-full text-[13px] text-center border-collapse">
                    <tbody className="divide-y divide-red-primary font-extrabold uppercase">
                       {(item.importantLinks && item.importantLinks.length > 0 ? item.importantLinks : [
                         { label: 'Apply Online Link', url: '#' },
                         { label: 'Download Official Notification', url: '#' },
                         { label: 'Official Website', url: '#' }
                       ]).map((link: any, i: number) => (
                         <tr key={i} className="hover:bg-red-primary/5 transition-colors border-b border-red-primary/20">
                           <td className="py-2.5 px-4 text-left border-r border-red-primary w-1/2 bg-yellow-50 dark:bg-yellow-950/20 font-bold text-blue-900 dark:text-blue-300">{link.label}</td>
                           <td className="py-2.5 px-4 bg-white dark:bg-gray-900">
                             {link.url.includes(',') ? (
                               <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
                                 {link.url.split(',').map((u: string, idx: number) => (
                                   <React.Fragment key={idx}>
                                      <a href={u.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-400 hover:text-red-primary font-black">Link-{idx+1}</a>
                                      {idx < link.url.split(',').length - 1 && <span className="text-gray-400">|</span>}
                                   </React.Fragment>
                                 ))}
                               </div>
                             ) : (
                               <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-400 hover:text-red-primary font-black">Click Here</a>
                             )}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>

                {/* Ad Slot (Post Mid) */}
                <div className="bg-transparent text-center space-y-2">
                  <ScriptAdBanner />
                  <div className="flex justify-center gap-2">
                    <ScriptAdBanner type="mobile" />
                    <ScriptAdBanner type="mobile" />
                  </div>
                </div>

                {/* Detailed Long Article Section */}
                {item.longArticle && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-black text-red-primary border-b-2 border-red-primary pb-2 uppercase tracking-tight">Detailed Information & Guidelines</h2>
                    <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-border-color shadow-sm whitespace-pre-wrap text-[14px] leading-8 font-medium text-[var(--text-primary)] font-serif">
                      {item.longArticle}
                    </div>
                    
                    {/* Another Ad Slot within the content for space filling */}
                    <div className="my-6 border border-dashed border-gray-300 dark:border-gray-700 p-2 rounded">
                       <ScriptAdBanner />
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                <div className="space-y-4 text-[var(--text-primary)]">
                  <div className="bg-blue-900 text-white text-center py-2 rounded-t-lg font-bold uppercase text-sm">
                    Frequently Asked Questions (FAQ)
                  </div>
                  <div className="border-x border-b border-blue-900 rounded-b-lg divide-y divide-gray-200 dark:divide-gray-800">
                    {(item.faq || [
                      { question: 'What is the last date to apply?', answer: 'The last date is 31st May 2026.' },
                      { question: 'What is the required qualification?', answer: 'Check the education details in the notification above.' }
                    ]).map((faq: any, i: number) => (
                      <div key={i} className="p-4 space-y-2">
                        <p className="font-bold text-[13px] flex gap-2">
                          <span className="text-blue-link shrink-0">Question:</span> {faq.question}
                        </p>
                        <p className="font-medium text-[13px] flex gap-2 pl-4">
                          <span className="text-red-primary shrink-0">Answer:</span> {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            {/* Social Share Bottom */}
            <div className="pt-8 border-t border-border-color flex flex-wrap justify-center gap-4">
               <button onClick={copyLink} className="flex items-center gap-2 text-[11px] font-bold text-text-secondary hover:text-red-primary border border-border-color px-4 py-2 rounded-full transition-all">
                 <Copy size={14} /> Copy Post Link
               </button>
               <button onClick={() => shareWhatsApp(item.title)} className="flex items-center gap-2 text-[11px] font-bold text-[#25D366] border border-[#25D366]/30 px-4 py-2 rounded-full hover:bg-[#25D366]/5 transition-all">
                 <Share2 size={14} /> WhatsApp Share
               </button>
            </div>
        </div>
      </article>

      {/* Related Posts */}
      <div className="space-y-4 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            🔗 RELATED POSTS / संबंधित पोस्ट
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((post: any) => (
              <div 
                key={post.id} 
                onClick={() => onNavigateDetail(post.id)}
                className="bg-[var(--card-bg)] border border-border-color rounded-lg p-3 hover:shadow-md cursor-pointer transition-all flex items-start gap-3 group"
              >
                <div className="w-1.5 h-full bg-red-primary rounded-full shrink-0 group-hover:scale-y-125 transition-transform" />
                <div>
                  <h4 className="text-[12px] font-bold text-blue-link group-hover:text-red-primary line-clamp-2 leading-tight transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-[10px] text-text-secondary mt-1 font-medium">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}

function CategoryPage({ categoryKey, allData, onNavigateDetail, onBack, onToggleBookmark, isBookmarked }: any) {
  const cat = categoryMap[categoryKey];
  const items = allData.filter((d: any) => d.category === categoryKey);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`bg-gradient-to-r ${cat.color} text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
             {cat.icon} {cat.label} - <span className="opacity-90">{cat.hindi}</span>
          </h2>
          <p className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">Total Posts: {items.length} | Latest Updates 2025-26</p>
        </div>
        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-md">
        <div className="divide-y divide-border-color">
          {items.map(item => (
            <ItemRow 
              key={item.id} 
              item={item} 
              onClick={() => onNavigateDetail(item.id)}
              onBookmark={(e) => onToggleBookmark(item.id, e)}
              bookmarked={isBookmarked(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BookmarksPage({ bookmarks, allData, onNavigateDetail, onBack, onToggleBookmark }: any) {
  const items = allData.filter((d: any) => bookmarks.includes(d.id));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
            🔖 मेरे बुकमार्क्स (Saved Items)
          </h2>
          <p className="text-xs opacity-80 mt-1 uppercase tracking-widest font-semibold">Count: {items.length}</p>
        </div>
        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-xs font-bold transition-all">
          Back to Home
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-border-color rounded-lg py-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
            <Bookmark size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold">अभी कोई बुकमार्क नहीं है</h3>
            <p className="text-sm text-text-secondary">किसी भी पोस्ट पर 📌 क्लिक करके यहाँ सेव करें।</p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-md">
          <div className="divide-y divide-border-color">
            {items.map(item => (
              <ItemRow 
                key={item.id} 
                item={item} 
                onClick={() => onNavigateDetail(item.id)}
                onBookmark={(e) => onToggleBookmark(item.id, e)}
                bookmarked={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactPage({ onBack }: any) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
       <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
          📞 Contact Us - संपर्क करें
        </h2>
        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-xs font-bold transition-all">Back</button>
      </div>
      
      <div className="bg-[var(--card-bg)] border border-border-color rounded-lg p-6 md:p-8 shadow-md">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">हमसे संपर्क करें</h3>
            <p className="text-sm text-text-secondary">कोई सवाल या सुझाव है? नीचे फॉर्म भरें, हम जल्द ही जवाब देंगे।</p>
          </div>

          <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('संदेश भेजा गया!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">नाम (Name) *</label>
                <input required type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm focus:ring-2 ring-red-primary/20 outline-none transition-all" placeholder="अपना नाम दर्ज करें" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">ईमेल (Email) *</label>
                <input required type="email" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm focus:ring-2 ring-red-primary/20 outline-none transition-all" placeholder="ईमेल पता" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">विषय (Subject) *</label>
              <input required type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm focus:ring-2 ring-red-primary/20 outline-none transition-all" placeholder="किस विषय में संपर्क करना चाहते हैं?" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">संदेश (Message) *</label>
              <textarea required rows={5} className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm focus:ring-2 ring-red-primary/20 outline-none transition-all resize-none" placeholder="अपना संदेश यहाँ लिखें..."></textarea>
            </div>
            <button type="submit" className="bg-red-primary text-white font-bold py-3 px-8 rounded shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-widest">
              📨 संदेश भेजें (Send Message)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoPage({ type, onBack }: { type: string, onBack: () => void }) {
  const pages: any = {
    about: { 
      title: "About Us - हमारे बारे में", 
      icon: "ℹ️", 
      color: "from-blue-800 to-blue-600",
      body: (
        <div className="space-y-4">
          <p>CareerSetu भारत का एक प्रमुख शैक्षिक और करियर पोर्टल है जो सरकारी नौकरी, परीक्षा परिणाम, एडमिट कार्ड, आंसर की, सिलेबस और नोटिफिकेशन की जानकारी प्रदान करता है।</p>
          <p>हमारा लक्ष्य हर विद्यार्थी और जॉब सीकर को सही समय पर सही जानकारी देना है ताकि वे कोई भी अवसर न चूकें।</p>
          <h3 className="text-lg font-bold border-l-4 border-red-primary pl-3">हमारी विशेषताएं</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>ताज़ा सरकारी नौकरी अपडेट</li>
            <li>परीक्षा परिणाम जानकारी</li>
            <li>एडमिट कार्ड डाउनलोड लिंक</li>
            <li>आंसर की और सिलेबस</li>
            <li>नोटिफिकेशन अलर्ट</li>
          </ul>
        </div>
      )
    },
    privacy: { 
      title: "Privacy Policy - गोपनीयता नीति", 
      icon: "🔒", 
      color: "from-indigo-800 to-indigo-600",
      body: (
        <div className="space-y-4">
          <p>आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। CareerSetu आपकी व्यक्तिगत जानकारी को सुरक्षित रखता है।</p>
          <h3 className="text-lg font-bold border-l-4 border-red-primary pl-3">हम क्या जानकारी एकत्र करते हैं</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>ब्राउज़र कुकीज़</li>
            <li>पेज विज़िट डेटा</li>
            <li>न्यूज़लेटर सब्सक्रिप्शन ईमेल</li>
          </ul>
          <h3 className="text-lg font-bold border-l-4 border-red-primary pl-3">जानकारी का उपयोग</h3>
          <p>हम आपकी जानकारी का उपयोग केवल सेवा सुधार और अपडेट भेजने के लिए करते हैं।</p>
        </div>
      )
    },
    terms: { 
      title: "Terms & Conditions - नियम व शर्तें", 
      icon: "📋", 
      color: "from-slate-800 to-slate-600",
      body: (
        <div className="space-y-4">
          <p>CareerSetu का उपयोग करके आप हमारी नियम व शर्तों से सहमत होते हैं।</p>
          <h3 className="text-lg font-bold border-l-4 border-red-primary pl-3">उपयोग की शर्तें</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>सभी जानकारी केवल सूचनात्मक उद्देश्य के लिए है</li>
            <li>हम जानकारी की सटीकता की गारंटी नहीं देते</li>
            <li>कृपया आधिकारिक वेबसाइट से सत्यापित करें</li>
            <li>अनुचित उपयोग प्रतिबंधित है</li>
          </ul>
        </div>
      )
    },
    disclaimer: { 
      title: "Disclaimer - अस्वीकरण", 
      icon: "⚠️", 
      color: "from-amber-800 to-amber-600",
      body: (
        <div className="space-y-4">
          <p>CareerSetu किसी भी सरकारी संस्था की आधिकारिक वेबसाइट नहीं है।</p>
          <h3 className="text-lg font-bold border-l-4 border-red-primary pl-3">महत्वपूर्ण नोट</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>यह जानकारी केवल संदर्भ के लिए है</li>
            <li>सभी परीक्षा और भर्ती संबंधी जानकारी के लिए आधिकारिक वेबसाइट देखें</li>
            <li>हम किसी भी त्रुटि के लिए जिम्मेदार नहीं हैं</li>
          </ul>
        </div>
      )
    }
  };

  const pg = pages[type];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className={`bg-gradient-to-r ${pg.color} text-white p-6 rounded-lg shadow-md flex justify-between items-center`}>
        <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-3">
          {pg.icon} {pg.title}
        </h2>
        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-xs font-bold transition-all">Back</button>
      </div>
      <div className="bg-[var(--card-bg)] border border-border-color rounded-lg p-6 md:p-10 shadow-md">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {pg.body}
        </div>
      </div>
    </div>
  );
}
