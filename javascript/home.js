document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('postsContainer');
    
    // Fetch all articles
    fetch('http://localhost:8080/articles')
        .then(response => response.json())
        .then(data => {
            data.forEach(article => {
                // Create a card for each post
                const postCard = document.createElement('div');
                postCard.classList.add('post-card');
                
                const postTitle = document.createElement('h2');
                postTitle.textContent = article.title;
                
                const postSubtitle = document.createElement('p');
                postSubtitle.textContent = article.subtitle;
                
                const postAuthor = document.createElement('p');
                postAuthor.classList.add('author');
                postAuthor.textContent = `By: ${article.author.firstName} ${article.author.lastName}`;
                
                postCard.appendChild(postTitle);
                postCard.appendChild(postSubtitle);
                postCard.appendChild(postAuthor);
                
                postsContainer.appendChild(postCard);
            });
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            postsContainer.textContent = 'Failed to load posts.';
        });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
});
