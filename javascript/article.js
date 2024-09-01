document.addEventListener('DOMContentLoaded', function () {
    const articleContainer = document.getElementById('articleContainer');
    const token = sessionStorage.getItem('token');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const logoutButton = document.getElementById('logoutButton');

    // Modal Elements
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const saveConfirmationModal = document.getElementById('saveConfirmationModal');
    const editFormModal = document.getElementById('editFormModal');
    const closeModal = document.querySelectorAll('.close-modal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    const confirmSaveButton = document.getElementById('confirmSaveButton');
    const cancelSaveButton = document.getElementById('cancelSaveButton');

    // Edit form elements
    const editTitle = document.getElementById('editTitle');
    const editSubtitle = document.getElementById('editSubtitle');
    const editBody = document.getElementById('editBody');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const saveEditButton = document.getElementById('saveEditButton');

    let editorInstance;

    // Initialize CKEditor for the edit form
    ClassicEditor.create(editBody)
        .then(editor => {
            editorInstance = editor;
        })
        .catch(error => {
            console.error('There was a problem initializing the CKEditor:', error);
        });

    // Extract Article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
        return;
    }

    if (!articleId) {
        articleContainer.innerHTML = '<p>Invalid article ID.</p>';
        return;
    }

    // Function to fetch and display article
    function fetchArticle() {
        fetch(`http://localhost:8080/articles/${articleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 404) {
                throw new Error('Article not found.');
            }
            if (!response.ok) {
                throw new Error('Failed to fetch article.');
            }
            return response.json();
        })
        .then(article => {
            renderArticle(article);
        })
        .catch(error => {
            console.error('Error fetching article:', error);
            articleContainer.innerHTML = `<p>${error.message}</p>`;
        });
    }

    // Function to render article in the DOM
    function renderArticle(article) {
        const currentUserId = sessionStorage.getItem('userId'); // Assuming user ID is stored in sessionStorage
        const isAuthor = currentUserId && currentUserId == article.author.id;

        // Build the HTML
        const articleHTML = `
            <img src="${article.imageLink || 'images/default-image.jpg'}" alt="${article.title}" class="article-image">
            <h1 class="article-title">${article.title}</h1>
            <h3 class="article-subtitle">${article.subtitle || ''}</h3>
            <div class="article-body">${article.body}</div>
            ${isAuthor ? `
                <div class="action-buttons">
                    <button class="edit-button" id="editButton"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-button" id="deleteButton"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            ` : ''}
        `;

        articleContainer.innerHTML = articleHTML;

        // Attach event listeners to buttons if author
        if (isAuthor) {
            const editButton = document.getElementById('editButton');
            const deleteButton = document.getElementById('deleteButton');

            editButton.addEventListener('click', () => {
                openEditForm(article);
            });

            deleteButton.addEventListener('click', () => {
                openDeleteModal();
            });
        }
    }

    // Function to open the edit form in a modal
    function openEditForm(article) {
        editTitle.value = article.title;
        editSubtitle.value = article.subtitle || '';
        editorInstance.setData(article.body);

        editFormModal.style.display = 'block';

        saveEditButton.addEventListener('click', () => {
            openSaveModal();
        });

        cancelEditButton.addEventListener('click', () => {
            closeModalForm();
        });
    }

    // Close Modal Forms
    closeModal.forEach(close => {
        close.addEventListener('click', () => {
            closeModalForm();
        });
    });

    function closeModalForm() {
        editFormModal.style.display = 'none';
        saveConfirmationModal.style.display = 'none';
        deleteConfirmationModal.style.display = 'none';
    }

    // Function to open the save modal
    function openSaveModal() {
        saveConfirmationModal.style.display = 'block';
    }

    // Function to save the article changes
    confirmSaveButton.addEventListener('click', () => {
        const updatedArticle = {
            title: editTitle.value,
            subtitle: editSubtitle.value,
            body: editorInstance.getData()
        };

        fetch(`http://localhost:8080/articles/${articleId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedArticle)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save article.');
            }
            return response.json();
        })
        .then(article => {
            closeModalForm();
            fetchArticle(); // Refresh the article view
            displaySuccessMessage('Article updated successfully!');
        })
        .catch(error => {
            console.error('Error saving article:', error);
            displayErrorMessage('Failed to save article.');
        });
    });

    // Delete article
    function openDeleteModal() {
        deleteConfirmationModal.style.display = 'block';
    }

    confirmDeleteButton.addEventListener('click', () => {
        fetch(`http://localhost:8080/articles/${articleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete article.');
            }
            displaySuccessMessage('Article deleted successfully!');
            window.location.href = 'dashboard.html'; // Redirect to dashboard after deletion
        })
        .catch(error => {
            console.error('Error deleting article:', error);
            displayErrorMessage('Failed to delete article.');
        });
    });

    // Function to display success message
    function displaySuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }

    // Function to display error message
    function displayErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Fetch article when the page loads
    fetchArticle();
});
