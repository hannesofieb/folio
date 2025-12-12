/**
 * Footer Favourites - Project Cards
 * Populates footer with project cards from work-archive.csv
 * Only shows projects with 'favourite' in their filter attribute
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        csvPath: 'work-archive.csv',
        containerSelector: '.favs',
        filterKeyword: 'favourite',
        excludeCurrentProject: true  // Don't show current project in footer
    };

    /**
     * Get current project ID from URL
     */
    function getCurrentProjectId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('project-id');
    }

    /**
     * Check if project has 'favourite' in filter
     */
    function isFavourite(project) {
        const filter = project.filter ? project.filter.toLowerCase() : '';
        return filter.includes(CONFIG.filterKeyword);
    }

    /**
     * Create a project card element
     */
    function createProjectCard(project) {
        // Card container
        const card = document.createElement('div');
        card.classList.add('project-card');
        card.setAttribute('data-project-id', project['project-id']);

        // Content wrapper (image, tags, description)
        const content = document.createElement('div');
        content.classList.add('content');
        
        // Image
        const img = document.createElement('img');
        img.src = project['hero-img'];
        img.alt = project.title;
        img.classList.add('card-image');
        
        // Title
        const title = document.createElement('h3');
        title.textContent = project.title;
        title.classList.add('card-title');
        
        // Skillset tags
        const skillsetContainer = document.createElement('div');
        skillsetContainer.classList.add('card-skillset');
        
        if (project.skillset) {
            const skills = project.skillset.split(';').map(s => s.trim());
            skills.forEach(skill => {
                const tag = document.createElement('span');
                tag.textContent = skill;
                tag.classList.add('skill-tag');
                skillsetContainer.appendChild(tag);
            });
        }
        
        // Description
        const description = document.createElement('p');
        description.textContent = project.description;
        description.classList.add('card-description');
        
        // Assemble content
        content.appendChild(img);
        content.appendChild(title);
        content.appendChild(skillsetContainer);
        content.appendChild(description);
        
        // Link wrapper (read more arrow)
        const link = document.createElement('div');
        link.classList.add('link');
        
        const readMore = document.createElement('a');
        readMore.href = `project.html?project-id=${project['project-id']}`;
        readMore.textContent = 'Read more ↗';
        readMore.classList.add('card-read-more');
        
        link.appendChild(readMore);
        
        // Assemble card
        card.appendChild(content);
        card.appendChild(link);
        
        return card;
    }

    /**
     * Populate the footer with favourite projects
     */
    function populateFavourites() {
        const container = document.querySelector(CONFIG.containerSelector);
        
        if (!container) {
            console.warn(`⚠️ Container "${CONFIG.containerSelector}" not found`);
            return;
        }

        const currentProjectId = getCurrentProjectId();
        
        // Parse CSV
        Papa.parse(CONFIG.csvPath, {
            download: true,
            header: true,
            complete: function(results) {
                console.log('📊 CSV loaded:', results.data.length, 'projects');
                
                // Filter for favourites
                const favourites = results.data.filter(project => {
                    // Must have favourite in filter
                    if (!isFavourite(project)) return false;
                    
                    // Exclude current project if enabled
                    if (CONFIG.excludeCurrentProject && project['project-id'] === currentProjectId) {
                        return false;
                    }
                    
                    // Must have required fields
                    return project.title && project['hero-img'];
                });
                
                console.log('⭐ Found', favourites.length, 'favourite projects');
                
                if (favourites.length === 0) {
                    container.innerHTML = '<p class="no-favourites">No favourite projects found.</p>';
                    return;
                }
                
                // Clear container
                container.innerHTML = '';
                
                // Create and append cards
                favourites.forEach(project => {
                    const card = createProjectCard(project);
                    container.appendChild(card);
                });
                
                console.log('✅ Footer populated with', favourites.length, 'project cards');
                
                // Initialize custom cursor for cards
                initCardCursor();
            },
            error: function(error) {
                console.error('❌ Error loading CSV:', error);
                container.innerHTML = '<p class="error">Failed to load projects.</p>';
            }
        });
    }



    /**
     * Initialize when DOM is ready
     */
    function init() {
        // Check if Papa Parse is loaded
        if (typeof Papa === 'undefined') {
            console.error('❌ Papa Parse not loaded! Add this to your HTML:');
            console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>');
            return;
        }
        
        populateFavourites();
    }

    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();