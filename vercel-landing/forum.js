// Forum System
// Stores posts and replies in localStorage

class ForumSystem {
    constructor() {
        this.postsKey = 'fountain_forum_posts';
        this.repliesKey = 'fountain_forum_replies';
        this.currentCategory = 'all';
        this.currentPostId = null;
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
    }

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.loadPosts();
            });
        });

        // New post button
        document.getElementById('new-post-btn').addEventListener('click', () => {
            this.showNewPostModal();
        });

        // Modal close buttons
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideNewPostModal();
        });

        document.getElementById('close-detail-modal').addEventListener('click', () => {
            this.hidePostDetailModal();
        });

        document.getElementById('cancel-post').addEventListener('click', () => {
            this.hideNewPostModal();
        });

        // Close modal on background click
        document.getElementById('new-post-modal').addEventListener('click', (e) => {
            if (e.target.id === 'new-post-modal') {
                this.hideNewPostModal();
            }
        });

        document.getElementById('post-detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'post-detail-modal') {
                this.hidePostDetailModal();
            }
        });

        // New post form
        document.getElementById('new-post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPost();
        });
    }

    // Get all posts from storage
    getPosts() {
        const posts = localStorage.getItem(this.postsKey);
        return posts ? JSON.parse(posts) : [];
    }

    // Save posts to storage
    savePosts(posts) {
        localStorage.setItem(this.postsKey, JSON.stringify(posts));
    }

    // Get all replies from storage
    getReplies() {
        const replies = localStorage.getItem(this.repliesKey);
        return replies ? JSON.parse(replies) : [];
    }

    // Save replies to storage
    saveReplies(replies) {
        localStorage.setItem(this.repliesKey, JSON.stringify(replies));
    }

    // Get current user
    getCurrentUser() {
        if (typeof auth !== 'undefined') {
            return auth.getCurrentUser();
        }
        return null;
    }

    // Create a new post
    createPost() {
        const user = this.getCurrentUser();
        if (!user) {
            alert('You must be logged in to create a post');
            return;
        }

        const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value.trim();

        if (!title || !content) {
            alert('Please fill in all fields');
            return;
        }

        const posts = this.getPosts();
        const newPost = {
            id: Date.now().toString(),
            title: title,
            category: category,
            content: content,
            authorId: user.id,
            authorName: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        posts.unshift(newPost); // Add to beginning
        this.savePosts(posts);

        // Reset form
        document.getElementById('new-post-form').reset();
        this.hideNewPostModal();
        this.loadPosts();

        // Switch to the category of the new post
        this.currentCategory = category;
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
    }

    // Load and display posts
    loadPosts() {
        const posts = this.getPosts();
        const filteredPosts = this.currentCategory === 'all' 
            ? posts 
            : posts.filter(post => post.category === this.currentCategory);

        const container = document.getElementById('posts-container');
        const emptyState = document.getElementById('empty-state');

        if (filteredPosts.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'flex';
        emptyState.style.display = 'none';

        // Sort by date (newest first)
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = filteredPosts.map(post => this.renderPost(post)).join('');

        // Add click listeners to post cards
        container.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.post-card').classList.contains('post-card')) return;
                const postId = e.currentTarget.dataset.postId;
                this.showPostDetail(postId);
            });
        });
    }

    // Render a single post card
    renderPost(post) {
        const replies = this.getReplies();
        const replyCount = replies.filter(r => r.postId === post.id).length;
        const excerpt = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');
        const date = new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <span class="post-category">${this.getCategoryLabel(post.category)}</span>
                </div>
                <p class="post-excerpt">${this.escapeHtml(excerpt)}</p>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">${post.authorName.charAt(0).toUpperCase()}</div>
                        <span>${this.escapeHtml(post.authorName)}</span>
                    </div>
                    <span>•</span>
                    <span>${date}</span>
                    <div class="post-stats">
                        <div class="post-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>${replyCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show post detail modal
    showPostDetail(postId) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        this.currentPostId = postId;
        const modal = document.getElementById('post-detail-modal');
        document.getElementById('post-detail-title').textContent = post.title;

        const replies = this.getReplies();
        const postReplies = replies.filter(r => r.postId === postId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const date = new Date(post.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const content = `
            <div class="post-detail-header">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                    <span class="post-category">${this.getCategoryLabel(post.category)}</span>
                </div>
                <div class="post-detail-meta">
                    <div class="post-author">
                        <div class="author-avatar">${post.authorName.charAt(0).toUpperCase()}</div>
                        <span>${this.escapeHtml(post.authorName)}</span>
                    </div>
                    <span>•</span>
                    <span>${date}</span>
                </div>
            </div>
            <div class="post-detail-body">${this.escapeHtml(post.content)}</div>
            <div class="replies-section">
                <div class="replies-header">
                    <h3>Replies (${postReplies.length})</h3>
                </div>
                <div class="replies-list">
                    ${postReplies.map(reply => this.renderReply(reply)).join('')}
                </div>
                <div class="reply-form">
                    <h4 style="margin-bottom: 12px; color: var(--text-dark);">Add a Reply</h4>
                    <form id="reply-form">
                        <textarea id="reply-content" rows="4" placeholder="Write your reply..." required></textarea>
                        <div style="display: flex; justify-content: flex-end; gap: 12px;">
                            <button type="submit" class="btn btn-primary">Post Reply</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('post-detail-content').innerHTML = content;

        // Setup reply form
        document.getElementById('reply-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createReply(postId);
        });

        modal.style.display = 'flex';
    }

    // Render a reply
    renderReply(reply) {
        const date = new Date(reply.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="reply-card">
                <div class="reply-header">
                    <div class="reply-author">
                        <div class="author-avatar">${reply.authorName.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-dark);">${this.escapeHtml(reply.authorName)}</div>
                            <div class="reply-date">${date}</div>
                        </div>
                    </div>
                </div>
                <div class="reply-body">${this.escapeHtml(reply.content)}</div>
            </div>
        `;
    }

    // Create a reply
    createReply(postId) {
        const user = this.getCurrentUser();
        if (!user) {
            alert('You must be logged in to reply');
            return;
        }

        const content = document.getElementById('reply-content').value.trim();
        if (!content) {
            alert('Please enter a reply');
            return;
        }

        const replies = this.getReplies();
        const newReply = {
            id: Date.now().toString(),
            postId: postId,
            content: content,
            authorId: user.id,
            authorName: user.name,
            createdAt: new Date().toISOString()
        };

        replies.push(newReply);
        this.saveReplies(replies);

        // Reload post detail
        document.getElementById('reply-content').value = '';
        this.showPostDetail(postId);
    }

    // Show new post modal
    showNewPostModal() {
        document.getElementById('new-post-modal').style.display = 'flex';
        document.getElementById('post-title').focus();
    }

    // Hide new post modal
    hideNewPostModal() {
        document.getElementById('new-post-modal').style.display = 'none';
        document.getElementById('new-post-form').reset();
    }

    // Hide post detail modal
    hidePostDetailModal() {
        document.getElementById('post-detail-modal').style.display = 'none';
        this.currentPostId = null;
    }

    // Get category label
    getCategoryLabel(category) {
        const labels = {
            'general': 'General',
            'tips': 'Tips & Tricks',
            'support': 'Support',
            'suggestions': 'Suggestions'
        };
        return labels[category] || category;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize forum system
const forum = new ForumSystem();







