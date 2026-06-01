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
  Lock
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
import { db } from './firebase';

type Page = 'home' | 'jobs' | 'results' | 'admitcard' | 'answerkey' | 'syllabus' | 'notifications' | 'contact' | 'bookmarks' | 'about' | 'privacy' | 'terms' | 'disclaimer' | 'detail' | 'admin';

const ScriptAdBanner = ({ type }: { type?: 'mobile' | 'desktop' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('iframe')) {
      const conf = document.createElement('script');
      conf.innerHTML = `
        atOptions = {
          'key' : 'af3a0f42870899e50e6b0b00bd20358f',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      const script = document.createElement('script');
      script.src = 'https://www.highperformanceformat.com/af3a0f42870899e50e6b0b00bd20358f/invoke.js';
      
      containerRef.current.appendChild(conf);
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`flex justify-center my-4 overflow-hidden bg-gray-50/50 dark:bg-gray-800/10 rounded border border-dashed border-border-color/20 ${type === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'}`} 
      style={{ minHeight: '60px' }}
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
  }, []);

  // Fetch posts from Firestore
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as unknown as JobItem));
      
      // If Firestore is empty, we can show hardcoded data or handle it
      if (data.length > 0) {
        setLivePosts(data);
      } else {
        // Fallback to initial data if needed, but in production we want Firestore
        setLivePosts(allData);
      }
      setPostsLoading(false);
    }, (err) => {
      console.error("Firestore Subscribe Error:", err);
      setLivePosts(allData); // Fallback
      setPostsLoading(false);
    });
    return () => unsub();
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

    // Increment Firestore views if it's a string id (Firestore post)
    if (typeof id === 'string') {
      try {
        await updateDoc(doc(db, 'posts', id), {
          views: increment(1)
        });
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
              <div className="mb-6 bg-transparent text-center">
                <ScriptAdBanner />
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
                    {idx % 2 === 1 && (
                      <div className="my-2 border border-border-color/10 rounded overflow-hidden">
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
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-dark-gray text-white pt-10 pb-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-6">
            {['f', '𝕏', '📷', '▶', '✈'].map((icon, idx) => (
              <button key={idx} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-primary transition-colors">
                {icon}
              </button>
            ))}
          </div>
          
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] mb-6 font-medium opacity-80">
              <button onClick={() => navigateTo('home')} className="hover:opacity-100">Home</button>
              <button onClick={() => navigateTo('contact')} className="hover:opacity-100">Contact Us</button>
              <button onClick={() => navigateTo('about')} className="hover:opacity-100">About Us</button>
              <button onClick={() => navigateTo('privacy')} className="hover:opacity-100">Privacy Policy</button>
              <button onClick={() => navigateTo('terms')} className="hover:opacity-100">Terms & Conditions</button>
              <button onClick={() => navigateTo('disclaimer')} className="hover:opacity-100">Disclaimer</button>
            </div>

          <div className="pt-6 border-t border-white/10 text-[10px] opacity-60">
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
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-red-primary text-white shadow-xl flex items-center justify-center hover:-translate-y-1 transition-all z-50"
        >
          <ChevronUp size={24} />
        </button>
      )}

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
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-red-primary transition-colors">
        <ArrowLeft size={14} /> वापस जाएं (BACK)
      </button>

      <article className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-md p-5 md:p-8">
        <div className="mb-6">
          <span className="inline-block bg-red-primary text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase mb-3 ring-2 ring-red-primary/10">
            {cat.hindi}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
            {item.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[11px] text-text-secondary border-b border-border-color pb-4">
             <span className="flex items-center gap-1">📅 {new Date(item.date).toLocaleDateString()}</span>
             <span className="flex items-center gap-1">📂 {cat.label}</span>
             <span className="flex items-center gap-1">👁️ {item.views.toLocaleString()} Views</span>
             {item.isNew && <span className="text-red-primary font-bold">🆕 NEW</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => shareWhatsApp(item.title)} className="bg-[#25D366] text-white px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 hover:brightness-95 transition-all">
            <Share2 size={14} /> WhatsApp
          </button>
          <button onClick={() => shareTelegram(item.title)} className="bg-[#0088CC] text-white px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 hover:brightness-95 transition-all">
            <Share2 size={14} /> Telegram
          </button>
          <button onClick={copyLink} className="bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)] px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
            <Copy size={14} /> Copy Link
          </button>
          <button onClick={() => window.print()} className="bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)] px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
            <Printer size={14} /> Print
          </button>
          <button 
            onClick={() => toggleBookmark(item.id)}
            className={`${isBookmarked ? 'bg-red-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-[var(--text-primary)]'} px-4 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all`}
          >
            <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} /> {isBookmarked ? 'सेव्ड (SAVED)' : 'बुकमार्क'}
          </button>
        </div>

        {/* Ad Slot (Article Top) */}
        <div className="mb-8 bg-transparent text-center">
          <ScriptAdBanner />
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-5868574385517005"
               data-ad-slot="6696255538"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          {item.content ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
               {item.content}
            </div>
          ) : (
            <>
              {/* Overview Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 border-l-4 border-red-primary pl-3">
                  🏢 भर्ती/रिजल्ट का संक्षिप्त विवरण (Brief Overview)
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  <strong>CareerSetu</strong> की ओर से सभी उम्मीदवारों को सूचित किया जाता है कि <strong>{item.title}</strong> की घोषणा कर दी गई है। यह उन सभी विद्यार्थियों के लिए एक शानदार अवसर है जो सरकारी नौकरी या बेहतर करियर की तलाश में हैं। इस आर्टिकल में हमने पात्रता (Eligibility), आयु सीमा (Age Limit), और आवेदन प्रक्रिया की पूरी जानकारी दी है।
                </p>
              </div>

              {/* Mid Article Ad */}
              <div className="my-6">
                <ScriptAdBanner type="mobile" />
              </div>

              {/* Recruitment Table */}
              <div className="overflow-x-auto shadow-sm rounded-lg border border-border-color">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-red-800 text-white">
                    <tr>
                      <th colSpan={2} className="p-3 text-center font-bold text-base uppercase tracking-wider">CareerSetu.com - Important Information</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color bg-white dark:bg-gray-900">
                    <tr>
                      <td className="p-3 font-bold bg-gray-50 dark:bg-gray-800 w-1/3">संगठन का नाम (Organization)</td>
                      <td className="p-3">{item.title.split(' ')[0]} Board / Organization</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50 dark:bg-gray-800">पोस्ट का नाम (Post Name)</td>
                      <td className="p-3">{item.title.split(' - ')[0]}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50 dark:bg-gray-800">कैटेगरी (Category)</td>
                      <td className="p-3 font-bold text-red-primary uppercase">{cat.hindi} ({cat.label})</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50 dark:bg-gray-800">अपडेट की तिथि</td>
                      <td className="p-3 font-medium">{new Date(item.date).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mid Article Ad 2 */}
              <div className="my-6">
                <ins className="adsbygoogle"
                     style={{ display: 'block', textAlign: 'center' }}
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-5868574385517005"
                     data-ad-slot="6696255538"></ins>
              </div>

              {/* Two Column Section for Dates and Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border border-border-color rounded-lg overflow-hidden shrink-0">
                    <h4 className="bg-dark-blue text-white p-2.5 text-center font-bold text-xs uppercase">📅 महत्वपूर्ण तिथियां (Dates)</h4>
                    <ul className="p-3 space-y-2 text-[13px] bg-white dark:bg-gray-900">
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1"><span>आवेदन शुरू (Start Date):</span> <span className="font-bold">{new Date(item.date).toLocaleDateString()}</span></li>
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1"><span>अंतिम तिथि (Last Date):</span> <span className="font-bold">Next Month</span></li>
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1 text-red-primary"><span>परीक्षा तिथि (Exam Date):</span> <span className="font-bold">Notified Soon</span></li>
                       <li className="flex justify-between"><span>एडमिट कार्ड (Admit Card):</span> <span className="font-bold">7 Days Before</span></li>
                    </ul>
                 </div>
                 <div className="border border-border-color rounded-lg overflow-hidden shrink-0">
                    <h4 className="bg-dark-blue text-white p-2.5 text-center font-bold text-xs uppercase">💰 आवेदन शुल्क (Application Fee)</h4>
                    <ul className="p-3 space-y-2 text-[13px] bg-white dark:bg-gray-900">
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1"><span>General / OBC / EWS:</span> <span className="font-bold">₹100 - ₹500</span></li>
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1"><span>SC / ST / PH:</span> <span className="font-bold">₹0/- (Exempted)</span></li>
                       <li className="flex justify-between border-b border-dashed border-border-color pb-1"><span>महिला (All Category):</span> <span className="font-bold">₹0 - 100/-</span></li>
                       <li className="flex justify-between text-blue-link"><span>भुगतान प्रकार:</span> <span className="font-bold italic">Online Payment</span></li>
                    </ul>
                 </div>
              </div>

              {/* Age Limit and Qualifications */}
              <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-xl border border-border-color">
                <h4 className="font-bold text-base mb-4 text-dark-blue dark:text-white flex items-center gap-2">
                   ⚖️ आयु सीमा और योग्यता (Age & Education)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div className="space-y-2">
                      <p className="font-bold text-red-primary">आयु सीमा (Age Limit):</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>न्यूनतम आयु (Minimum Age): 18 वर्ष</li>
                        <li>अधिकतम आयु (Maximum Age): 25-45 वर्ष</li>
                        <li>आयु में छूट नियमानुसार दी जाएगी।</li>
                      </ul>
                   </div>
                   <div className="space-y-2">
                      <p className="font-bold text-blue-link">शैक्षिक योग्यता (Qualifications):</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>न्यूनतम 10वीं/12वीं पास (किसी भी बोर्ड से)।</li>
                        <li>ग्रेजुएशन या डिप्लोमा (संबंधित विषय में)।</li>
                        <li>अधिक जानकारी के लिए नोटिफिकेशन डाउनलोड करें।</li>
                      </ul>
                   </div>
                </div>
              </div>

              <div className="my-6">
                <ScriptAdBanner />
              </div>

              {/* Application Guide */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 border-l-4 border-red-primary pl-3">
                  📝 ऑनलाइन आवेदन कैसे करें? (Step-by-Step Guide)
                </h3>
                <div className="text-sm space-y-3 bg-white dark:bg-gray-900 border border-border-color p-4 rounded-lg">
                  <p>उम्मीदवार आवेदन करने के लिए इन आसान चरणों का पालन कर सकते हैं:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>सबसे पहले आधिकारिक वेबसाइट (Direct Link Below) पर जाएं।</li>
                    <li>वेबसाइट के 'Apply Online' या 'Registration' टैब पर क्लिक करें।</li>
                    <li>सभी आवश्यक व्यक्तिगत विवरण (नाम, पता, शैक्षिक योग्यता) भरें।</li>
                    <li>अपनी रंगीन फोटो और हस्ताक्षर (Signature) अपलोड करें।</li>
                    <li>आवश्यकतानुसार आवेदन शुल्क का भुगतान ऑनलाइन क्रेडिट/डेबिट कार्ड या नेट बैंकिंग से करें।</li>
                    <li>फॉर्म को अंतिम रूप से सबमिट करने से पहले दोबारा चेक (Preview) कर लें।</li>
                    <li>सबमिट करने के बाद, भविष्य के लिए फॉर्म का प्रिंट आउट या PDF ज़रूर सेव करें।</li>
                  </ol>
                </div>
              </div>

              {/* Important Links Table */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 border-l-4 border-green-600 pl-3">
                  🔗 महत्वपूर्ण डायरेक्ट लिंक्स (Important Links)
                </h3>
                <div className="overflow-x-auto shadow-md rounded-lg">
                   <table className="w-full border-collapse text-sm">
                      <tbody className="bg-white dark:bg-gray-900">
                         <tr className="border-b border-border-color">
                            <td className="p-4 font-bold w-1/2">Apply Online (ऑनलाइन आवेदन)</td>
                            <td className="p-4"><a href="#" className="text-blue-link font-bold hover:underline">Click Here (जल्द सक्रिय)</a></td>
                         </tr>
                         <tr className="border-b border-border-color">
                            <td className="p-4 font-bold">Download Full Notification</td>
                            <td className="p-4"><a href="#" className="text-red-primary font-bold hover:underline">Download PDF</a></td>
                         </tr>
                         <tr className="border-b border-border-color">
                            <td className="p-4 font-bold">Download Syllabus (Sarkari Exam)</td>
                            <td className="p-4"><a href="#" className="text-blue-link font-bold hover:underline">Direct Link</a></td>
                         </tr>
                         <tr className="border-b border-border-color">
                            <td className="p-4 font-bold">Official Website</td>
                            <td className="p-4"><a href="#" className="text-gray-600 font-medium hover:underline">Click Here ↗</a></td>
                         </tr>
                         <tr>
                            <td className="p-4 font-bold">Join Telegram / WhatsApp</td>
                            <td className="p-4"><a href="https://t.me/CareerSetu76" className="text-green-600 font-bold hover:underline">Join For Updates</a></td>
                         </tr>
                      </tbody>
                   </table>
                </div>
              </div>
            </>
          )}
          
          <div className="bg-ticker-bg/50 p-4 rounded-lg border border-red-primary/10">
             <h4 className="font-bold text-red-primary text-sm mb-2 flex items-center gap-2">
               ⚠️ महत्वपूर्ण निर्देश:
             </h4>
             <p className="text-[12px] italic leading-relaxed text-text-secondary">
               हमेशा आधिकारिक नोटिफिकेशन ध्यानपूर्वक पढ़ें। CareerSetu केवल सूचनात्मक उद्देश्य के लिए है। किसी भी त्रुटि के लिए हम ज़िम्मेदार नहीं हैं।
             </p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border-color">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <ChevronRight className="text-red-primary" size={16} /> संबंधित पोस्ट (Related Posts)
            </h3>
            <div className="space-y-2">
              {related.map((r: any) => (
                <button 
                  key={r.id} 
                  onClick={() => onNavigateDetail(r.id)}
                  className="w-full text-left py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded flex justify-between items-center group"
                >
                  <span className="text-[13px] text-blue-link group-hover:text-red-primary font-medium line-clamp-1">{r.title}</span>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap ml-4">{new Date(r.date).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
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
