// DOM Ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App loaded');
    
    // Load homepage sections
    loadBreakingNews();
    loadLatestJobs();
    loadResults();
    loadTrendingPosts();
    loadCategories();
    setupSearch();
    setupMobileMenu();
});

// Load Breaking News
async function loadBreakingNews() {
    try {
        const posts = await API.getPosts('breaking-news');
        const news = posts.slice(0, 1);
        
        if (news.length > 0) {
            const ticker = document.getElementById('breakingNewsTicker');
            ticker.innerHTML = `<strong>${news[0].title}</strong> - ${news[0].excerpt || ''}`;
        }
    } catch (error) {
        console.error('Error loading breaking news:', error);
    }
}

// Load Latest Jobs
async function loadLatestJobs() {
    try {
        const container = document.getElementById('latestJobsContainer');
        const posts = await API.getPosts('jobs');
        const jobs = posts.slice(0, 6);
        
        if (jobs.length === 0) {
            container.innerHTML = '<div class="col-12 alert alert-info">No jobs available at the moment</div>';
            return;
        }
        
        let html = '';
        jobs.forEach(job => {
            html += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${job.title}</h5>
                            <p class="card-text text-muted small">${job.excerpt || ''}</p>
                            <div class="mb-3">
                                <span class="badge bg-danger">${job.category || 'Job'}</span>
                                <span class="badge bg-secondary">${job.vacancies || 'TBD'} Posts</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">${new Date(job.createdAt).toLocaleDateString()}</small>
                                <a href="article.html?id=${job.id}" class="btn btn-sm btn-danger">Read More</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('latestJobsContainer').innerHTML = '<div class="col-12 alert alert-danger">Error loading jobs</div>';
    }
}

// Load Results
async function loadResults() {
    try {
        const container = document.getElementById('resultsContainer');
        const posts = await API.getPosts('results');
        const results = posts.slice(0, 6);
        
        if (results.length === 0) {
            container.innerHTML = '<div class="col-12 alert alert-info">No results available at the moment</div>';
            return;
        }
        
        let html = '';
        results.forEach(result => {
            html += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${result.title}</h5>
                            <p class="card-text text-muted small">${result.excerpt || ''}</p>
                            <div class="mb-3">
                                <span class="badge bg-danger">Result</span>
                                <span class="badge bg-secondary">Check Now</span>
                            </div>
                            <a href="article.html?id=${result.id}" class="btn btn-sm btn-danger w-100">View Result</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Load Trending Posts
async function loadTrendingPosts() {
    try {
        const container = document.getElementById('trendingPostsContainer');
        const posts = await API.getTrendingPosts(10);
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="alert alert-info">No trending posts at the moment</p>';
            return;
        }
        
        let html = '';
        posts.forEach(post => {
            html += `
                <div class="mb-3">
                    <div class="job-card">
                        <h5>${post.title}</h5>
                        <p class="text-muted small mb-2">${post.excerpt || ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-danger">${post.category}</span>
                            <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
                        </div>
                        <a href="article.html?id=${post.id}" class="btn btn-sm btn-danger mt-2">Read More</a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading trending posts:', error);
    }
}

// Load Categories
async function loadCategories() {
    try {
        const container = document.getElementById('categoriesContainer');
        const categories = await API.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = '<p class="list-group-item">No categories available</p>';
            return;
        }
        
        let html = '';
        categories.forEach(cat => {
            html += `
                <a href="pages/latest-jobs.html?category=${cat.id}" class="list-group-item list-group-item-action">
                    ${cat.name} <span class="badge bg-danger float-end">${cat.count || 0}</span>
                </a>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

// Setup Mobile Menu
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            navbarCollapse.classList.toggle('show');
        });
    }
}

// Utility: Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility: Truncate Text
function truncateText(text, length = 100) {
    if (text.length > length) {
        return text.substring(0, length) + '...';
    }
    return text;
}

console.log('App.js loaded successfully');
