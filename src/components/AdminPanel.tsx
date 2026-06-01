import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { db, auth } from '../firebase';
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
  Eye
} from 'lucide-react';

const provider = new GoogleAuthProvider();

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Login State
  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('email');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'jobs',
    content: '',
    isNew: true,
    isHot: false,
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Simple admin check based on email from request
        if (u.email === 'kumarprince80970@gmail.com') {
          setIsAdmin(true);
        } else {
          // You could also check against an 'admins' collection here
          setIsAdmin(true); 
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleGoogleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setLoginError(err.message);
      console.error("Google login failed:", err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginError(null);
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    } catch (err: any) {
      setLoginError("Invalid email or password. Please try again.");
      console.error("Email login failed:", err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      views: editingPost ? editingPost.views : 0,
      updatedAt: serverTimestamp(),
      authorId: user?.uid
    };

    try {
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), payload);
      } else {
        await addDoc(collection(db, 'posts'), { ...payload, date: new Date().toISOString() });
      }
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
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
      isNew: true,
      isHot: false,
      tags: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const startEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      category: post.category,
      content: post.content,
      isNew: post.isNew || false,
      isHot: post.isHot || false,
      tags: post.tags ? post.tags.join(', ') : '',
      date: post.date ? post.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsAdding(true);
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-border-color/30">
          <div className="bg-red-primary p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <p className="text-white/70 text-sm mt-1">Authorized access only</p>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button 
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'email' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-primary' : 'text-text-secondary hover:text-[var(--text-primary)]'}`}
              >
                ID/Password
              </button>
              <button 
                onClick={() => setLoginMethod('google')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${loginMethod === 'google' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-primary' : 'text-text-secondary hover:text-[var(--text-primary)]'}`}
              >
                Google Login
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-primary text-red-primary text-xs font-bold animate-in fade-in">
                {loginError}
              </div>
            )}

            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 transition-all font-medium"
                    placeholder="admin@careersetu.com"
                    value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary flex items-center gap-1.5">
                    <KeyIcon size={12} /> Password
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
                  className="w-full bg-red-primary text-white py-3 rounded-lg font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest mt-2"
                >
                  Login to Dashboard
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full bg-white dark:bg-gray-800 border border-border-color py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-[var(--text-primary)]"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Sign in with Google
                </button>
              </div>
            )}

            {user && !isAdmin && (
              <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-orange-600 dark:text-orange-400 text-xs font-bold">Access Denied: Not an Admin</p>
                <button onClick={handleLogout} className="text-xs text-blue-link hover:underline mt-2">Sign out and try another account</button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border-color text-center">
              <button 
                onClick={onBack}
                className="text-xs font-bold text-text-secondary hover:text-red-primary flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft size={14} /> Back to Public Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-border-color/30">
        <div className="flex items-center gap-4">
          <div className="bg-red-primary p-3 rounded-xl shadow-lg shadow-red-primary/20">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Admin Dashboard</h2>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-widest opacity-60">CareerSetu Control Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2 text-right">
            <span className="text-xs font-bold truncate max-w-[150px]">{user.email}</span>
            <span className="text-[10px] text-green-500 font-bold uppercase">System Admin</span>
          </div>
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-red-primary text-white h-10 px-6 rounded-lg text-xs font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-red-primary/20 transition-all active:scale-95"
          >
            <Plus size={18} /> New Post
          </button>
          <button 
            onClick={handleLogout} 
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-red-primary transition-all active:scale-95 border border-border-color/50"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {isAdding ? (
          <div className="bg-white dark:bg-gray-900 border border-border-color rounded-2xl p-8 shadow-2xl animate-in slide-in-from-top-6 duration-500">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-color/50">
              <div className="flex items-center gap-3">
                <FilePlus className="text-red-primary" />
                <h3 className="text-xl font-bold">{editingPost ? 'Edit Article' : 'Create New Article'}</h3>
              </div>
              <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Post Title *</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SSC GD Constable Recruitment 2025"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Category *</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(categoryMap).map(([key, val]) => (
                      <option key={key} value={key}>{val.label} ({val.hindi})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Tags</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-red-primary/20 font-medium"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="comma separated tags"
                  />
                </div>
                <div className="flex items-center gap-8 py-2 md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isNew}
                      onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-5 h-5 rounded accent-red-primary"
                    />
                    <span className="text-sm font-bold text-text-secondary group-hover:text-[var(--text-primary)] transition-colors">Show NEW Badge</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isHot}
                      onChange={e => setFormData({ ...formData, isHot: e.target.checked })}
                      className="w-5 h-5 rounded accent-orange-500"
                    />
                    <span className="text-sm font-bold text-text-secondary group-hover:text-[var(--text-primary)] transition-colors">Show HOT Badge</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Article HTML/Text Content *</label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-border-color focus-within:ring-2 ring-red-primary/20">
                  <textarea 
                    required
                    rows={15}
                    className="w-full bg-transparent p-6 text-sm outline-none font-mono resize-y"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter detailed article content here..."
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-border-color/50">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-8 py-3 rounded-xl text-sm font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-mono"
                >
                  DISCARD
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 rounded-xl bg-red-primary text-white text-sm font-bold shadow-xl shadow-red-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <Save size={18} /> {editingPost ? 'Update Entry' : 'Publish Entry'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-border-color rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-b border-border-color flex justify-between items-center">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className={`text-red-primary ${loading ? 'animate-spin' : ''}`} />
                <h3 className="text-base font-bold uppercase tracking-widest text-text-secondary">Published Content ({posts.length})</h3>
              </div>
              <div className="text-[10px] font-bold opacity-40 uppercase">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
            
            <div className="divide-y divide-border-color">
              {posts.length === 0 && !loading ? (
                <div className="p-20 text-center text-sm text-text-secondary opacity-50">
                  No content found. Start by clicking "New Post" above.
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="p-6 md:px-8 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[11px] font-extrabold uppercase bg-red-primary/10 text-red-primary px-3 py-1 rounded-full border border-red-primary/20">
                          {categoryMap[post.category as keyof typeof categoryMap]?.label}
                        </span>
                        <div className="flex gap-2">
                          {post.isNew && <span className="w-2 h-2 rounded-full bg-red-primary animate-pulse" title="New Badge On"></span>}
                          {post.isHot && <span className="w-2 h-2 rounded-full bg-orange-500" title="Hot Badge On"></span>}
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary opacity-60">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-base font-bold truncate group-hover:text-red-primary transition-colors">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-text-secondary font-bold flex items-center gap-1 opacity-70">
                          <Eye size={12} /> {post.views?.toLocaleString() || 0} VIEWS
                        </span>
                        <span className="text-[10px] text-text-secondary font-bold opacity-70 uppercase">
                          DB ID: <span className="font-mono text-[9px]">{post.id.slice(0, 8)}...</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button 
                        onClick={() => startEdit(post)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-link hover:bg-blue-link hover:text-white transition-all shadow-sm"
                        title="Edit Article"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-primary hover:bg-red-primary hover:text-white transition-all shadow-sm"
                        title="Delete Article"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-20">
        <button 
          onClick={onBack}
          className="px-8 py-3 rounded-xl border border-border-color text-sm font-bold text-text-secondary hover:text-red-primary hover:border-red-primary transition-all"
        >
          Return to Portal Home
        </button>
      </div>
    </div>
  );
}
