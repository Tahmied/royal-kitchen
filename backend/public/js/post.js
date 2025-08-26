// Dynamic Blog Post JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Extract project ID from URL
    function getProjectIdFromUrl() {
        const path = window.location.pathname;
        const segments = path.split('/');
        // For URL format like /projects/{projectId}
        const projectIdIndex = segments.indexOf('projects') + 1;
        return segments[projectIdIndex];
    }

    // Format date to user-friendly string
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    function calculateReadingTime(htmlContent) {
        const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
        const wordCount = textContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        return `${readingTime} min read`;
    }

    // Show loading state
    function showLoading() {
        document.querySelector('.blog-post-title').textContent = 'Loading...';
        document.querySelector('.blog-post-content').innerHTML = '<p>Loading content...</p>';
    }

    // Show error state
    function showError(message) {
        document.querySelector('.blog-post-title').textContent = 'Error Loading Post';
        document.querySelector('.blog-post-content').innerHTML = `<p>Error: ${message}</p>`;
        document.title = 'Error | Your Blog';
    }

    // Main function to load and render blog post
    async function loadBlogPost() {
        const projectId = getProjectIdFromUrl();
        
        if (!projectId) {
            showError('No project ID found in URL');
            return;
        }

        showLoading();

        try {
            // Fetch project data from API
            const response = await fetch(`/api/v1/projects/public/${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const apiResponse = await response.json();
            
            // Extract the actual project data from the API response
            const projectData = apiResponse.data;

            // Update page title
            document.title = `${projectData.projectName} | Royal Kitchen`;

            // Update main heading
            document.querySelector('.blog-post-title').textContent = projectData.projectName;

            // Update hero image
            const heroImageContainer = document.querySelector('.blog-post-hero-image img');
            if (projectData.homepageImages && projectData.homepageImages.length > 0) {
                heroImageContainer.src = projectData.homepageImages[0];
                heroImageContainer.alt = projectData.projectName;
            } else if (projectData.videoThumbnailPath) {
                // Fallback to video thumbnail if no homepage images
                heroImageContainer.src = projectData.videoThumbnailPath;
                heroImageContainer.alt = projectData.projectName;
            }


           

            // Update main content using innerHTML to render HTML content
            const contentContainer = document.querySelector('.blog-post-content');
            if (projectData.projectContent) {
                contentContainer.innerHTML = projectData.projectContent;
                
                // Re-apply fade-in animation to new content
                setTimeout(() => {
                    contentContainer.classList.add('in-view');
                    // Also observe new content children for scroll animations
                    observeContentChildren();
                }, 100);
            } else {
                contentContainer.innerHTML = '<p>No content available.</p>';
            }

            // If there's a video, you might want to add video functionality
            if (projectData.videoPath) {
                // You can add logic here to handle video display if needed
                console.log('Video available:', projectData.videoPath);
            }

        } catch (error) {
            console.error('Error fetching project data:', error);
            showError(`Failed to load project: ${error.message}`);
        }
    }

    // Function to observe content children (will be called after content is loaded)
    function observeContentChildren() {
        const contentChildren = document.querySelectorAll('.blog-post-content > *');
        contentChildren.forEach(child => {
            observer.observe(child);
        });
    }

    // Load the blog post
    loadBlogPost();

    // Animation for content reveal on scroll (existing functionality)
    const content = document.querySelector('.blog-post-content');
    
    // Intersection Observer for elements
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);
    
    // Load the blog post when page loads
    loadBlogPost();
});