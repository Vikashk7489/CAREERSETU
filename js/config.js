// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "careersetu-xxxx.firebaseapp.com",
    databaseURL: "https://careersetu-xxxx.firebaseio.com",
    projectId: "careersetu-xxxx",
    storageBucket: "careersetu-xxxx.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// OpenCode AI Configuration
const openCodeAIConfig = {
    apiKey: "YOUR_OPENCODE_AI_API_KEY",
    apiUrl: "https://api.opencode.ai/v1"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    window.storage = firebase.storage();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// API Helper Functions
window.API = {
    // Get all posts
    getPosts: async function(category = null) {
        try {
            const ref = category ? window.database.ref('posts').orderByChild('category').equalTo(category) : window.database.ref('posts');
            const snapshot = await ref.once('value');
            const posts = [];
            snapshot.forEach(child => {
                posts.push({
                    id: child.key,
                    ...child.val()
                });
            });
            return posts.reverse();
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    },

    // Get single post
    getPost: async function(id) {
        try {
            const snapshot = await window.database.ref(`posts/${id}`).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    },

    // Get categories
    getCategories: async function() {
        try {
            const snapshot = await window.database.ref('categories').once('value');
            const categories = [];
            snapshot.forEach(child => {
                categories.push({
                    id: child.key,
                    ...child.val()
                });
            });
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // Get trending posts
    getTrendingPosts: async function(limit = 5) {
        try {
            const posts = await this.getPosts();
            return posts.filter(p => p.featured).slice(0, limit);
        } catch (error) {
            console.error('Error fetching trending posts:', error);
            return [];
        }
    },

    // Generate article using OpenCode AI
    generateArticle: async function(title, sourceUrl) {
        try {
            const response = await fetch(`${openCodeAIConfig.apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openCodeAIConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    source: sourceUrl,
                    model: 'gpt-4'
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating article:', error);
            return null;
        }
    },

    // Save post to Firebase
    savePost: async function(post) {
        try {
            const postRef = window.database.ref('posts').push();
            await postRef.set({
                ...post,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return postRef.key;
        } catch (error) {
            console.error('Error saving post:', error);
            return null;
        }
    },

    // Update post
    updatePost: async function(id, post) {
        try {
            await window.database.ref(`posts/${id}`).update({
                ...post,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error updating post:', error);
            return false;
        }
    },

    // Delete post
    deletePost: async function(id) {
        try {
            await window.database.ref(`posts/${id}`).remove();
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    },

    // Upload file to Firebase Storage
    uploadFile: async function(file, path) {
        try {
            const storageRef = window.storage.ref(path);
            const snapshot = await storageRef.put(file);
            const downloadUrl = await snapshot.ref.getDownloadURL();
            return downloadUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    },

    // Get analytics data
    getAnalytics: async function() {
        try {
            const snapshot = await window.database.ref('analytics').once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return {};
        }
    },

    // Update analytics
    updateAnalytics: async function(data) {
        try {
            await window.database.ref('analytics').update(data);
            return true;
        } catch (error) {
            console.error('Error updating analytics:', error);
            return false;
        }
    }
};

console.log('Config loaded successfully');
