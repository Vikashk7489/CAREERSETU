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
  User
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
  RefreshCw
} from 'lucide-react';

const provider = new GoogleAuthProvider();

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
          setIsAdmin(false);
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
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
        const logMsg = JSON.stringify({ action: 'UPDATE', path: `posts/${editingPost.id}` });
        console.log("Admin Action:", logMsg);
      } else {
        await addDoc(collection(db, 'posts'), { ...payload, date: new Date().toISOString() });
        console.log("Admin Action:", JSON.stringify({ action: 'CREATE', path: 'posts' }));
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
      console.log("Admin Action:", JSON.stringify({ action: 'DELETE', path: `posts/${id}` }));
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-16 h-16 bg-red-primary/10 rounded-full flex items-center justify-center text-red-primary">
          <Lock size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Admin Login Required</h2>
          <p className="text-sm text-text-secondary">Please sign in with your admin account to manage content.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="bg-white border border-gray-300 px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-3 shadow-sm hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-primary font-bold">Access Denied</p>
        <p className="text-sm text-text-secondary">Logged in as {user.email}. This account does not have admin privileges.</p>
        <button onClick={handleLogout} className="text-blue-link hover:underline text-sm font-bold flex items-center gap-1 mx-auto">
          <LogOut size={14} /> Logout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-dark-blue text-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-red-primary" />
          <h2 className="text-lg font-bold">CareerSetu Admin Panel</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded hidden md:inline">{user.email}</span>
          <button onClick={handleLogout} className="text-white hover:text-red-primary transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-red-primary text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:brightness-110"
        >
          <FilePlus size={16} /> Add New Post
        </button>
        <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Site
        </button>
      </div>

      {isAdding && (
        <div className="bg-[var(--card-bg)] border border-border-color rounded-lg p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">{editingPost ? 'Edit Post' : 'Add New Post'}</h3>
            <button onClick={resetForm} className="text-text-secondary hover:text-red-primary"><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase text-text-secondary">Title *</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-red-primary/20"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter full post title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-text-secondary">Category *</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-red-primary/20"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(categoryMap).map(([key, val]) => (
                    <option key={key} value={key}>{val.label} ({val.hindi})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-text-secondary">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-red-primary/20"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ssc, jobs, 2025"
                />
              </div>
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isNew}
                    onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 accent-red-primary"
                  />
                  <span className="text-xs font-bold text-text-secondary">Mark as NEW</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isHot}
                    onChange={e => setFormData({ ...formData, isHot: e.target.checked })}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-xs font-bold text-text-secondary">Mark as HOT</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-text-secondary">Article Content (Markdown/HTML Support) *</label>
              <textarea 
                required
                rows={12}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-border-color rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-red-primary/20 font-mono"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write full article here..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2 rounded text-xs font-bold bg-gray-200 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2 rounded bg-red-primary text-white text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Save size={16} /> {editingPost ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--card-bg)] border border-border-color rounded-lg overflow-hidden shadow-md">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-border-color flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          <span>All Posts ({posts.length})</span>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </div>
        <div className="divide-y divide-border-color">
          {posts.map(post => (
            <div key={post.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase bg-red-primary/10 text-red-primary px-2 py-0.5 rounded">
                    {categoryMap[post.category as keyof typeof categoryMap]?.label}
                  </span>
                  <span className="text-[10px] text-text-secondary">{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold truncate">{post.title}</h4>
                <div className="text-[10px] text-text-secondary flex gap-2 mt-1">
                   <span>👁️ {post.views} views</span>
                   {post.isNew && <span className="text-red-primary font-bold">New</span>}
                   {post.isHot && <span className="text-orange-500 font-bold">Hot</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => startEdit(post)}
                  className="p-2 text-blue-link hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-red-primary hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {loading && posts.length === 0 && <div className="p-10 text-center text-sm text-text-secondary animate-pulse">Loading posts...</div>}
          {!loading && posts.length === 0 && <div className="p-10 text-center text-sm text-text-secondary">No posts found. Start by adding one!</div>}
        </div>
      </div>
    </div>
  );
}
