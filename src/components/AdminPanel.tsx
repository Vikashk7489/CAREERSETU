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
  Trash,
  CheckCircle2,
  AlertCircle,
  Wand2,
  List,
  Target,
  Megaphone,
  Activity,
  History,
  Lock as LockIcon,
  HardDrive
} from 'lucide-react';

async function callAI(prompt: string, systemPrompt: string) {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemPrompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  } catch (err) {
    console.error('AI Call Failed:', err);
    throw err;
  }
}

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

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
            { id: 'newsletter', icon: <Mail size={18} />, label: '📰 Newsletter' },
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
                { label: 'Ad Revenue', value: '$1,245.80', icon: <Megaphone />, color: 'bg-indigo-500' },
                { label: 'Today Traffic', value: '4,102', icon: <Activity />, color: 'bg-green-500' },
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

        {(activeTab === 'ai' || activeTab === 'categories' || activeTab === 'seo' || activeTab === 'ads' || activeTab === 'settings') && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Module: AI Center */}
              {activeTab === 'ai' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-primary"><Wand2 size={18} /> AI Article Studio</h3>
                            {aiLoading ? (
                               <span className="text-[10px] font-black text-red-primary animate-pulse tracking-widest">AI PROCESSING...</span>
                            ) : (
                               <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                            )}
                         </div>
                         <div className="space-y-4">
                            <textarea 
                              value={aiPrompt}
                              onChange={e => setAiPrompt(e.target.value)}
                              placeholder="Describe the article you want to generate (e.g. 'SSC CGL 2025 Tier-I Result expected date and official link info')"
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl p-4 text-sm font-medium h-32 outline-none focus:ring-2 ring-red-primary/20"
                            ></textarea>
                            
                            {aiResult && (
                              <div className="p-6 bg-red-primary/5 border border-red-primary/20 rounded-xl relative group">
                                 <h4 className="text-[9px] font-black uppercase text-red-primary mb-2">AI Generation Result</h4>
                                 <div className="text-sm font-medium whitespace-pre-wrap max-h-60 overflow-y-auto pr-4">{aiResult}</div>
                                 <button 
                                   onClick={() => { setFormData({...formData, longArticle: aiResult}); setIsAdding(true); setActiveTab('posts'); }}
                                   className="absolute top-4 right-4 bg-red-primary text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                   title="Use in Post"
                                 >
                                    <FilePlus size={16} />
                                 </button>
                              </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { id: 'article', label: 'Auto Article', icon: '📝', prompt: 'Write a detailed sarkari exam article about: ' },
                                  { id: 'rewrite', label: 'Rewrite AI', icon: '✍️', prompt: 'Rewrite this professionally for a job portal: ' },
                                  { id: 'seo', label: 'SEO tags', icon: '🏷️', prompt: 'Generate SEO keywords comma separated for: ' },
                                  { id: 'faq', label: 'FAQ Gen', icon: '❓', prompt: 'Generate 5 FAQs with answers for: ' }
                                ].map(tool => (
                                  <button 
                                    key={tool.id} 
                                    onClick={async () => {
                                      if (!aiPrompt) return alert('Enter description first');
                                      setAiLoading(true);
                                      try {
                                        const res = await callAI(tool.prompt + aiPrompt, 'You are an expert content writer for CareerSetu, a leading Indian job portal. Write in professional English.');
                                        setAiResult(res);
                                      } finally {
                                        setAiLoading(false);
                                      }
                                    }}
                                    disabled={aiLoading}
                                    className="bg-white dark:bg-gray-900 border border-border-color p-3 rounded-xl text-center hover:border-red-primary hover:bg-red-primary/5 transition-all group disabled:opacity-50"
                                  >
                                     <div className="text-xl mb-1">{tool.icon}</div>
                                     <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary group-hover:text-red-primary">{tool.label}</div>
                                  </button>
                                ))}
                            </div>
                            <button 
                              onClick={async () => {
                                if (!aiPrompt) return alert('Enter description first');
                                setAiLoading(true);
                                try {
                                  const res = await callAI('Write a full comprehensive job portal article including all sections for: ' + aiPrompt, 'You are a professional SEO content creator for CareerSetu.');
                                  setAiResult(res);
                                } finally {
                                  setAiLoading(false);
                                }
                              }}
                              disabled={aiLoading}
                              className="w-full bg-red-primary text-white py-4 rounded-xl font-black uppercase tracking-[3px] shadow-lg shadow-red-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                               <Sparkles size={20} /> {aiLoading ? 'AI is Writing...' : 'Generate with OpenCode AI'}
                            </button>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Cpu size={18} className="text-blue-600" /> AI SEO & Metadata</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border-color">
                               <p className="text-[9px] font-black uppercase text-text-secondary opacity-50 mb-2">Meta Description Gen</p>
                               <div className="flex gap-2">
                                  <input type="text" placeholder="Post Title" className="flex-1 bg-white dark:bg-gray-900 border border-border-color rounded-lg px-3 py-1.5 text-[10px] font-bold" />
                                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase">Generate</button>
                               </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border-color">
                               <p className="text-[9px] font-black uppercase text-text-secondary opacity-50 mb-2">Keyword Extractor</p>
                               <div className="flex gap-2">
                                  <input type="text" placeholder="Paste Content Snippet" className="flex-1 bg-white dark:bg-gray-900 border border-border-color rounded-lg px-3 py-1.5 text-[10px] font-bold" />
                                  <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase">Extract</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-900/40">
                         <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={16} className="text-red-primary" /> AI Usage Stats</h4>
                         <div className="space-y-4">
                            <div>
                               <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                  <span>Tokens Used</span>
                                  <span>4,500 / 50,000</span>
                               </div>
                               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-primary w-[9%]"></div>
                               </div>
                            </div>
                            <div>
                               <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                  <span>Articles Gen</span>
                                  <span>12 / 100</span>
                               </div>
                               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 w-[12%]"></div>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-border-color p-6 rounded-2xl shadow-sm">
                         <h4 className="text-xs font-black uppercase tracking-widest mb-4">AI History</h4>
                         <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-border-color">
                                 <div className="w-8 h-8 rounded-lg bg-red-primary/10 text-red-primary flex items-center justify-center font-bold text-xs">AI</div>
                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold truncate">Article: SSC CHSL 2025...</p>
                                    <p className="text-[8px] text-text-secondary">2 hours ago</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Module: Categories */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm h-fit">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><List size={18} className="text-red-primary" /> Add New Category</h3>
                      <form className="space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Category Name</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-2.5 text-sm font-bold" placeholder="e.g. UPSC" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Hindi Name</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-2.5 text-sm font-bold" placeholder="e.g. संघ लोक सेवा आयोग" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">SEO Slug</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-2.5 text-sm font-bold" placeholder="upsc-jobs" />
                         </div>
                         <button className="w-full bg-red-primary text-white py-3 rounded-xl font-black uppercase tracking-widest mt-2 shadow-lg shadow-red-primary/20">Create Category</button>
                      </form>
                   </div>
                   <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-border-color rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-8 py-5 border-b border-border-color bg-gray-50 dark:bg-gray-800/20">
                         <h3 className="text-[10px] font-black uppercase tracking-[3px]">Active Categories</h3>
                      </div>
                      <div className="divide-y divide-border-color">
                         {Object.entries(categoryMap).map(([key, val]) => (
                           <div key={key} className="p-4 px-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-red-primary uppercase shadow-sm">{key.slice(0, 2)}</div>
                                 <div>
                                    <h4 className="text-sm font-black">{val.label}</h4>
                                    <p className="text-[10px] font-bold text-text-secondary opacity-60 uppercase">{val.hindi}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-blue-link bg-blue-50 px-3 py-1 rounded-full">{posts.filter(p => p.category === key).length} Posts</span>
                                 <button className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center hover:bg-red-primary hover:text-white transition-all"><Edit2 size={14}/></button>
                                 <button className="w-8 h-8 rounded-lg border border-border-color flex items-center justify-center hover:bg-red-primary hover:text-white transition-all"><Trash2 size={14}/></button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* Module: Newsletter */}
              {activeTab === 'newsletter' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm h-fit">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Mail size={18} className="text-red-primary" /> Create Campaign</h3>
                      <form className="space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Subject Line</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-2.5 text-sm font-bold" placeholder="Latest Jobs Update" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Email Template</label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-2.5 text-sm font-bold">
                               <option>Modern Newsletter</option>
                               <option>Breaking News Alert</option>
                               <option>Weekly Digest</option>
                            </select>
                         </div>
                         <button type="button" className="w-full bg-red-primary text-white py-3 rounded-xl font-black uppercase tracking-widest mt-2 shadow-lg shadow-red-primary/20">Send to 1,245 Subscribers</button>
                      </form>
                   </div>
                   <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-gray-900 border border-border-color rounded-2xl shadow-sm overflow-hidden">
                         <div className="px-8 py-5 border-b border-border-color bg-gray-50 dark:bg-gray-800/20">
                            <h3 className="text-[10px] font-black uppercase tracking-[3px]">Subscriber List</h3>
                         </div>
                         <div className="max-h-[400px] overflow-y-auto divide-y divide-border-color">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="p-4 px-8 flex justify-between items-center hover:bg-gray-50">
                                 <div>
                                    <p className="text-sm font-bold">user{i}@example.com</p>
                                    <p className="text-[9px] text-text-secondary uppercase">Subscribed on: 12 Jan 2025</p>
                                 </div>
                                 <span className="text-[9px] font-black text-green-600 bg-green-500/10 px-3 py-1 rounded-full">ACTIVE</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Module: SEO */}
              {activeTab === 'seo' && (
                <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-green-600 font-black"><Target size={18} /> Search Engine Optimization</h3>
                     <button className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20">Update SEO Global</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Website Title (Home)</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm font-bold" defaultValue="CareerSetu - Sarkari Result, Latest Jobs, Admit Card" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-text-secondary">Meta Description</label>
                            <textarea rows={4} className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm font-medium" defaultValue="Find latest government jobs, results, answer keys and admit cards on CareerSetu. The most trusted portal for sarkari naukri updates in Hindi & English."></textarea>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-border-color">
                            <h4 className="text-[10px] font-black uppercase mb-4 tracking-widest">Sitemap & Discovery</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color">
                                  <div className="text-[10px] font-bold uppercase tracking-widest">Generate sitemap.xml</div>
                                  <button className="bg-red-primary text-white px-3 py-1 rounded-md text-[9px] font-black uppercase">Run Now</button>
                               </div>
                               <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-border-color">
                                  <div className="text-[10px] font-bold uppercase tracking-widest">Ping Google Indexer</div>
                                  <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-[9px] font-black uppercase">Execute</button>
                               </div>
                            </div>
                         </div>
                         <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200">
                            <h4 className="text-[10px] font-bold text-green-700 uppercase mb-2 tracking-widest">SEO Health Score</h4>
                            <div className="text-3xl font-black text-green-700">94/100</div>
                            <p className="text-[9px] font-bold text-green-600 uppercase mt-1">Excellent: Optimization optimal</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Module: Ads */}
              {activeTab === 'ads' && (
                <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                   <div className="flex justify-between items-center mb-8">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-indigo-600"><Megaphone size={18} /> Ad Central</h3>
                     <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">Apply Ad Layout</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-border-color">
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="text-[10px] font-black uppercase tracking-widest">AdSense Approval</h4>
                               <span className="text-[9px] font-bold text-green-500">ACTIVE</span>
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-text-secondary">Publisher ID (ca-pub)</label>
                               <input type="text" className="w-full bg-white dark:bg-gray-900 border border-border-color rounded-lg px-4 py-2 text-sm font-mono" defaultValue="ca-pub-1234567890123456" />
                            </div>
                         </div>
                         <div className="p-6 border border-border-color rounded-2xl space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Ad Placement Toggles</h4>
                            {[
                               { label: 'Header Sticky Ads', active: true },
                               { label: 'Inside Article Ads', active: true },
                               { label: 'Sidebar Floating Ads', active: false },
                               { label: 'Footer Announcement', active: true }
                            ].map(ad => (
                               <div key={ad.label} className="flex justify-between items-center py-2 border-b border-border-color last:border-0">
                                  <span className="text-xs font-bold">{ad.label}</span>
                                  <div className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors ${ad.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                     <div className={`w-4 h-4 rounded-full bg-white transition-all ${ad.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl shadow-indigo-900/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Megaphone size={120} /></div>
                            <p className="text-[10px] font-black uppercase tracking-[4px] mb-2 opacity-60">Estimated Revenue</p>
                            <h3 className="text-4xl font-black mb-4">$1,245.80</h3>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
                               <Activity size={14} className="text-green-400" /> +12.5% this week
                            </div>
                         </div>
                         <div className="bg-white dark:bg-gray-900 border border-border-color p-6 rounded-2xl shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest mb-4">Ad History & Clicks</h4>
                            <div className="h-40 flex items-end gap-1">
                               {[20, 50, 30, 80, 40, 60, 90, 70, 40, 60, 50, 80].map((h, i) => (
                                 <div key={i} className="flex-1 bg-indigo-100 dark:bg-indigo-900/20 rounded-t-sm relative group">
                                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm" style={{ height: h + '%' }}></div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Module: Settings */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2"><Settings size={18} className="text-red-primary" /> General Configuration</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-text-secondary">Organization Name</label>
                               <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm font-bold" defaultValue="CareerSetu India" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-text-secondary">Public Contact Email</label>
                               <input type="email" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm font-bold" defaultValue="career@careersetu.com" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                               <label className="text-[10px] font-black uppercase text-text-secondary">Footer Copyright Text</label>
                               <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm font-bold" defaultValue="© 2025 CareerSetu. All Rights Reserved. | सरकारी नौकरी, रिजल्ट और एडमिट कार्ड" />
                            </div>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl shadow-sm">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-red-primary font-black"><LockIcon size={18} /> Security & System</h3>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border-color">
                               <div>
                                  <p className="text-xs font-black uppercase tracking-widest">Maintenance Mode</p>
                                  <p className="text-[10px] text-text-secondary pt-1 font-medium">Temporarily disable public access to the portal</p>
                               </div>
                               <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative p-1 cursor-pointer">
                                  <div className="w-4 h-4 rounded-full bg-white"></div>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button className="bg-gray-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><History size={16} /> Activity Logs</button>
                               <button className="bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Database size={16} /> Database Backup</button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-red-primary/5 border border-red-primary/20 p-8 rounded-2xl text-center">
                         <div className="w-16 h-16 bg-red-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-primary">
                            <Shield size={32} />
                         </div>
                         <h4 className="text-xs font-black uppercase mb-2 tracking-widest">Super Admin Credentials</h4>
                         <p className="text-[10px] text-text-secondary leading-relaxed mb-6 font-medium">To update your master password, please use the system reset protocol or contact dev support.</p>
                         <button className="w-full bg-red-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-primary/20">Change Password</button>
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-border-color p-8 rounded-2xl">
                         <h4 className="text-xs font-black uppercase mb-4 tracking-widest">System Info</h4>
                         <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold border-b border-border-color pb-2">
                               <span className="text-text-secondary uppercase">Framework</span>
                               <span>React 19 + Vite</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold border-b border-border-color pb-2">
                               <span className="text-text-secondary uppercase">Version</span>
                               <span>v2.8.4-PRO</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold border-b border-border-color pb-2">
                               <span className="text-text-secondary uppercase">Server Node</span>
                               <span>AS-SOUTH-1</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        )}
      </main>
    </div>
  );
}
