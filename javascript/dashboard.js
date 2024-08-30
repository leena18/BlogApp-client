document.addEventListener('DOMContentLoaded', function () {
    const postsList = document.getElementById('posts');
    const createPostForm = document.getElementById('createPostForm');
    const articleDetails = document.getElementById('article-details');
    const articleTitle = document.getElementById('articleTitle');
    const articleSubtitle = document.getElementById('articleSubtitle');
    const articleBody = document.getElementById('articleBody');
    const articleImage = document.getElementById('articleImage');
    const token = sessionStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
        return;
    }

    // Fetch the user's posts
    fetch('http://localhost:8080/articles', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(articles => {
        postsList.innerHTML = '';

        if (articles.length === 0) {
            postsList.innerHTML = '<li>You have not posted any articles yet.</li>';
        } else {
            articles.forEach(article => {
                const li = document.createElement('li');
                li.textContent = `${article.title} - ${article.subtitle}`;
                li.dataset.articleId = article.id;
                li.addEventListener('click', function () {
                    displayArticleDetails(article.id);
                });
                postsList.appendChild(li);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching posts:', error);
    });

    // Handle new post creation
    createPostForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const newPost = {
            title: document.getElementById('title').value,
            subtitle: document.getElementById('subtitle').value,
            body: document.getElementById('body').value,
            imageLink: document.getElementById('imageLink').value
        };

        fetch('http://localhost:8080/articles', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create post');
            }
        })
        .then(data => {
            alert('Post created successfully!');
            // Reload to see the new post
            window.location.reload();
        })
        .catch(error => {
            console.error('Error creating post:', error);
            alert('Failed to create post.');
        });
    });

    // Handle logout
    document.getElementById('logoutButton').addEventListener('click', function () {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // Display article details
    function displayArticleDetails(articleId) {
        fetch(`http://localhost:8080/articles/${articleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(article => {
            articleTitle.textContent = article.title;
            articleSubtitle.textContent = article.subtitle;
            articleBody.textContent = article.body;
            articleImage.src = article.imageLink;
            articleDetails.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching article details:', error);
        });
    }

    // Handle editing an article
    document.getElementById('editArticleButton').addEventListener('click', function () {
        // Implement edit functionality here
    });

    // Handle deleting an article
    document.getElementById('deleteArticleButton').addEventListener('click', function () {
        // Implement delete functionality here
    });

    // Go back to dashboard
    document.getElementById('backToDashboardButton').addEventListener('click', function () {
        articleDetails.style.display = 'none';
        postsList.style.display = 'block';
    });
});
