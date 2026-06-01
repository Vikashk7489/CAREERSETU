import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import { JobItem, categoryMap } from '../data';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Lock, 
  LogOut, 
  ArrowLeft,
  LayoutDashboard,
  FilePlus,
  RefreshCw,
  Mail,
  Key as KeyIcon,
  Eye,
  Sparkles,
  Search,
  BarChart4,
  Cpu,
  Globe,
  Bell,
  Settings,
  Users,
  Database,
  Shield,
  Smartphone,
  Trash
} from 'lucide-react';

// Hardcoded Admin Credentials
const ADMIN_ID = 'kumarprince80970@gmail.com';
const ADMIN_PASS = 'admin@careersetu';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('cs_admin_session') === 'active');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'categories' | 'seo' | 'ai' | 'ads' | 'settings'>('dashboard');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'jobs',
    content: '',
    shortDescription: '',
    importantDates: [] as { label: string, value: string }[],
    applicationFee: [] as { label: string, value: string }[],
    vacancyDetails: [] as { category: string, posts: string }[],
    totalPosts: '',
    importantLinks: [] as { label: string, url: string }[],
    faq: [] as { question: string, answer: string }[],
    longArticle: '',
    imageUrl: '',
    isNew: true,
    isHot: false,
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Supabase Fetch Error:", error);
      } else if (data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();

    const channel = supabase
      .channel('admin-posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email === ADMIN_ID && loginData.password === ADMIN_PASS) {
      setIsLoggedIn(true);
      localStorage.setItem('cs_admin_session', 'active');
      setLoginError(null);
    } else {
      setLoginError("Invalid Admin ID or Password. Only authorized access permitted.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cs_admin_session');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      views: editingPost ? editingPost.views : 0,
      updated_at: new Date().toISOString(),
      date: formData.date
    };

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([payload]);
        if (error) throw error;
      }
      resetForm();
      setActiveTab('posts');
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setIsAdding(false);
    setFormData({
      title: '',
      category: 'jobs',
      content: '',
      shortDescription: '',
      importantDates: [],
      applicationFee: [],
      vacancyDetails: [],
      totalPosts: '',
      longArticle: '',
      imageUrl: '',
      importantLinks: [],
      faq: [],
      isNew: true,
      isHot: false,
      tags: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const startEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      category: post.category || 'jobs',
      content: post.content || '',
      shortDescription: post.shortDescription || '',
      importantDates: Array.isArray(post.importantDates) ? post.importantDates : [],
      applicationFee: Array.isArray(post.applicationFee) ? post.applicationFee : [],
      vacancyDetails: Array.isArray(post.vacancyDetails) ? post.vacancyDetails : [],
      totalPosts: post.totalPosts || '',
      longArticle: post.longArticle || '',
      imageUrl: post.imageUrl || '',
      importantLinks: Array.isArray(post.importantLinks) ? post.importantLinks : [],
      faq: Array.isArray(post.faq) ? post.faq : [],
      isNew: post.isNew ?? true,
      isHot: post.isHot ?? false,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      date: post.date ? post.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsAdding(true);
    setActiveTab('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats for Dashboard
  const stats = useMemo(() => {
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const categoryCounts = posts.reduce((acc: any, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalPosts: posts.length,
      totalViews,
      topPost: [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0],
      categories: Object.keys(categoryCounts).length
    };
  }, [posts]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-border-color/30">
          <div className="bg-red-primary p-8 text-white text-center relaltive overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={100} /></div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md relative z-10 border border-white/30">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter relative z-10">CareerSetu Admin</h2>
            <p className="text-white/70 text-[10px] mt-1 font-bold uppercase tracking-widest relative z-10">Private Super Admin Console</p>
          </div>

          <div className="p-8">
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-primary text-red-primary text-xs font-bold animate-in shake duration-300">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-text-secondary flex items-center gap-1.5 tracking-widest">
                  <Mail size={12} /> Admin Identity
                </label>
                <input 
                  required
                  type="email"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 transition-all font-medium"
                  placeholder="Master ID"
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-text-secondary flex items-center gap-1.5 tracking-widest">
                  <KeyIcon size={12} /> Master Password
                </label>
                <input 
                  required
                  type="password"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 transition-all font-medium"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-red-primary text-white py-4 rounded-lg font-black text-sm shadow-xl shadow-red-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[4px] mt-2"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border-color text-center">
              <button 
                onClick={onBack}
                className="text-[10px] font-black text-text-secondary hover:text-red-primary flex items-center justify-center gap-1.5 mx-auto transition-colors uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                <ArrowLeft size={14} /> Exit to Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row pb-10 md:pb-0">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-primary rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter">CS PANEL</h1>
            <p className="text-[9px] font-bold text-red-primary uppercase tracking-[2px]">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: '📊 Dashboard' },
            { id: 'posts', icon: <FilePlus size={18} />, label: '📝 Posts' },
            { id: 'categories', icon: <Plus size={18} />, label: '🏷 Categories' },
            { id: 'ai', icon: <Cpu size={18} />, label: '🤖 AI Center' },
            { id: 'ads', icon: <Globe size={18} />, label: '📢 Ad Manager' },
            { id: 'seo', icon: <Search size={18} />, label: '🔍 SEO Manager' },
            { id: 'settings', icon: <Settings size={18} />, label: '⚙ Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsAdding(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === item.id && !isAdding ? 'bg-red-primary text-white shadow-lg shadow-red-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          
          <div className="pt-6 pb-2">
             <p className="px-4 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Post Actions</p>
             <button 
                onClick={() => { setActiveTab('posts'); setIsAdding(true); setEditingPost(null); resetForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${isAdding ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Plus size={18} /> Add New Post
             </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-primary/20 hover:text-red-primary py-3 rounded-lg text-[11px] font-black transition-all border border-white/10 uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
             </h2>
             <p className="text-xs text-text-secondary font-medium uppercase tracking-widest opacity-60">Manage your portal operations</p>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="bg-white dark:bg-gray-900 border border-border-color py-2 px-4 rounded-full flex items-center gap-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-text-secondary uppercase">Live Database</span>
             </div>
             <button onClick={onBack} title="View Site" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-border-color flex items-center justify-center hover:bg-gray-100 transition-all shadow-sm">
                <Globe size={18} className="text-blue-link" />
             </button>
           </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Posts', value: stats.totalPosts, icon: <FilePlus />, color: 'bg-blue-500' },
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <Eye />, color: 'bg-purple-500' },
                { label: 'Categories', value: stats.categories, icon: <LayoutDashboard />, color: 'bg-orange-500' },
                { label: 'Cloud Status', value: 'ONLINE', icon: <Database />, color: 'bg-green-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-border-color p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform ${stat.color} text-white rounded-bl-3xl`}>{stat.icon}</div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-[2px] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analytics Component (Placeholder) */}
              <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm h-80 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><BarChart4 size={18} className="text-red-primary" /> Traffic Overview</h3>
                   <select className="bg-gray-50 border border-border-color text-[10px] font-bold px-2 py-1 rounded">
                     <option>Last 7 Days</option>
                     <option>Last 30 Days</option>
                   </select>
                </div>
                <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
                   {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                     <div key={i} className="flex-1 bg-red-primary/10 rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-red-primary rounded-t-lg transition-all duration-1000" style={{ height: h + '%' }}></div>
                        <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-1 rounded font-bold">{h*25}</div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-bold text-text-secondary opacity-50 px-2 uppercase tracking-tighter">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Top Post Summary */}
              <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm h-80 flex flex-col">
                 <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles size={18} className="text-orange-500" /> Trending Now</h3>
                 {stats.topPost ? (
                   <div className="space-y-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border-color">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Most Viewed Post</p>
                        <h4 className="text-sm font-bold line-clamp-2">{stats.topPost.title}</h4>
                        <div className="flex justify-between items-center mt-3">
                           <span className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{stats.topPost.views.toLocaleString()} <span className="text-[10px] font-medium text-text-secondary">VIEWS</span></span>
                           <button onClick={() => startEdit(stats.topPost)} className="text-[10px] font-black text-blue-link hover:underline uppercase">Edit Post</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                           <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Social Shares</p>
                           <p className="text-xs font-bold">1,245 Shares</p>
                         </div>
                         <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                           <p className="text-[8px] font-black text-green-600 uppercase mb-1">Avg. Read Time</p>
                           <p className="text-xs font-bold">4.5 Minutes</p>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex-1 flex items-center justify-center text-xs text-text-secondary opacity-60">No data available yet</div>
                 )}
              </div>
            </div>

            {/* Feature Modules Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-red-primary font-black uppercase text-xs tracking-widest"><Cpu size={20} /> AI Center</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">Auto-generate articles, descriptions and SEO keywords using OpenCode AI.</p>
                  <button className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-primary hover:text-white transition-all">Launch AI</button>
               </div>
               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-green-600 font-black uppercase text-xs tracking-widest"><Globe size={20} /> SEO Manager</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">Manage sitemaps, robots.txt and meta tags for better search ranking.</p>
                  <button className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">Configure SEO</button>
               </div>
               <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-border-color shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-blue-600 font-black uppercase text-xs tracking-widest"><Smartphone size={20} /> App Manager</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">Send push notifications and manage mobile app synchronization.</p>
                  <button className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Open Console</button>
               </div>
            </div>
          </div>
        )}

        {isAdding && activeTab === 'posts' && (
          <div className="bg-white dark:bg-gray-900 border border-border-color rounded-2xl p-8 shadow-2xl animate-in slide-in-from-top-6 duration-500 max-w-5xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-color/50">
              <div className="flex items-center gap-3">
                <FilePlus className="text-red-primary" />
                <h3 className="text-xl font-black uppercase tracking-tight">{editingPost ? 'Edit Article' : 'Create New Article'}</h3>
              </div>
              <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Post Title *</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SSC GD Constable Recruitment 2025"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Featured Image URL</label>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, imageUrl: `https://images.unsplash.com/photo-1541339907198-e08759df9a13?auto=format&fit=crop&q=80&w=1000`})}
                      className="text-[10px] flex items-center gap-1 text-red-primary font-bold hover:underline"
                    >
                      <Sparkles size={12} /> Suggest AI Image
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo... or use /images/post1.jpg"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Short Description (English Intro)</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief intro in English for SEO..."
                  />
                </div>

                {/* Article Section */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Detailed Long Article (Full Depth)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const template = `## ${formData.title}\n\nThe ${formData.title} marks a significant opportunity for job seekers in the year 2025-26. This recruitment drive aims to appoint dedicated professionals who meet the stringent yet fair eligibility criteria set by the board.\n\n### Detailed Breakdown & Selection Process\nThe selection involves multiple phases including a written examination, followed by standard verification and skill tests. Thousands of candidates prepare for this exam every single year, making it one of the most competitive fields in the government sector.\n\n### Career Growth and Benefits\nWorking under this department offers not just a stable career but extensive benefits including healthcare, retirement plans, and standard governmental increments. Candidates are advised to prepare systematically, focusing on the current exam pattern as provided in the official notification...`;
                        setFormData({...formData, longArticle: template});
                      }}
                      className="text-[10px] flex items-center gap-1 text-red-primary font-bold hover:underline"
                    >
                      <Sparkles size={12} /> Generate Long Article Draft
                    </button>
                  </div>
                  <textarea 
                    rows={12}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium whitespace-pre-wrap"
                    value={formData.longArticle}
                    onChange={e => setFormData({ ...formData, longArticle: e.target.value })}
                    placeholder="Write a long detailed article in English with all details..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Category *</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-bold appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(categoryMap).map(([key, val]) => (
                      <option key={key} value={key}>{val.label} ({val.hindi})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Tags (Keywords)</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="ssc, jobs, sarkari result, upsc"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-8 border-t border-border-color/50">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-10 py-3 rounded-xl text-[11px] font-black bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-mono uppercase tracking-widest"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="px-12 py-3 rounded-xl bg-red-primary text-white text-[11px] font-black shadow-xl shadow-red-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all uppercase tracking-[2px]"
                >
                  <Save size={18} /> {editingPost ? 'Update & Live' : 'Publish to Portal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'posts' && !isAdding && (
          <div className="bg-white dark:bg-gray-900 border border-border-color rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-500">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-b border-border-color flex justify-between items-center">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className={`text-red-primary ${loading ? 'animate-spin' : ''}`} />
                <h3 className="text-xs font-black uppercase tracking-[3px] text-text-secondary">Content Management ({posts.length})</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-40" size={14} />
                    <input type="text" placeholder="Search entries..." className="bg-white dark:bg-gray-900 border border-border-color rounded-full pl-9 pr-4 py-1.5 text-[10px] font-bold outline-none focus:ring-2 ring-red-primary/20 w-60" />
                 </div>
                 <button onClick={() => setIsAdding(true)} className="bg-red-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-primary/10">Add Post</button>
              </div>
            </div>
            
            <div className="divide-y divide-border-color">
              {posts.length === 0 && !loading ? (
                <div className="p-20 text-center">
                   <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40"><FilePlus size={32} /></div>
                   <p className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-50">No published content yet</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="p-6 md:px-8 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase bg-red-primary/10 text-red-primary px-3 py-1 rounded-md border border-red-primary/20">
                          {categoryMap[post.category as keyof typeof categoryMap]?.label}
                        </span>
                        <div className="flex gap-2">
                          {post.isNew && <span className="w-1.5 h-1.5 rounded-full bg-red-primary animate-pulse"></span>}
                          {post.isHot && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary opacity-30 select-none">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-black truncate group-hover:text-red-primary transition-colors pr-10">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[9px] text-text-secondary font-black flex items-center gap-1 opacity-70 uppercase tracking-tighter">
                          <Eye size={12} className="text-red-primary" /> {post.views?.toLocaleString() || 0} Total Traffic
                        </span>
                        <span className="text-[9px] text-text-secondary font-black opacity-30 uppercase tracking-widest hidden sm:block">
                          Object Hash: <span className="font-mono">{post.id.slice(0, 8)}...</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button 
                        onClick={() => startEdit(post)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-link hover:bg-blue-link hover:text-white transition-all shadow-sm"
                        title="Edit Article"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-primary hover:bg-red-primary hover:text-white transition-all shadow-sm"
                        title="Delete Article"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-t border-border-color text-center">
               <p className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-[4px]">End of content library</p>
            </div>
          </div>
        )}

        {(activeTab === 'ai' || activeTab === 'seo' || activeTab === 'ads' || activeTab === 'settings') && (
          <div className="bg-white dark:bg-gray-900 border border-border-color p-20 rounded-2xl shadow-xl animate-in zoom-in-95 duration-500 text-center">
             <div className="w-24 h-24 bg-red-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-red-primary border border-red-primary/10">
                <Settings size={48} className="animate-spin-slow" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">{activeTab.toUpperCase()} Module</h3>
             <p className="text-sm text-text-secondary max-w-sm mx-auto mb-8 font-medium">This module is currently being provisioned in the backend. Full integration with the AI engine and SEO trackers will be available in the next system update.</p>
             <button onClick={() => setActiveTab('dashboard')} className="bg-red-primary text-white px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-primary/20 hover:brightness-110 active:scale-95 transition-all">Return to Core Dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}
