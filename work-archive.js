document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 5;
    let currentPage = 1;
    const tableBody = document.querySelector('#archive-table tbody');
    const pageNumbers = document.querySelector('#page-numbers');
    const prevButton = document.querySelector('#prev');
    const nextButton = document.querySelector('#next');
    const filterButtons = document.querySelectorAll('#work-archive button:not(#pagination button)');
    const allWorkButton = document.querySelector('#all-work'); // Select the #all-work button
    const nav = document.querySelector('nav');
    const yPosMouseValue = window.innerHeight / 2;
    const cursor = document.getElementById('cursor'); // Custom cursor element

    let data = [];
    let filteredData = [];
    let activeFilters = new Set();
    let projectsData = [];


    // Fetch CSV data
    function fetchData() {
        Papa.parse('work-archive.csv', {
            download: true,
            header: true,
            complete: function (results) {
                data = results.data.map(row => {
                    // Ensure the 'filter' field exists and append 'all' if not already present
                    if (!row.filter) {
                        row.filter = "all";
                    } else if (!row.filter.toLowerCase().startsWith('all')) {
                        row.filter += ";all"; // Append 'all' if it's not there
                    }
                    return row;
                });

                filteredData = [...data]; // Initialize with all data
                renderTable(currentPage);
            }
        });
        Papa.parse('projects.csv', {
            download: true,
            header: true,
            complete: function (results) {
                projectsData = results.data.map(row => {
                    row['project-id'] = row['project-id'].trim(); // Ensure IDs match format
                    return row;
                });
                console.log("📁 Loaded projects.csv:", projectsData); // Debugging log
    
                // Now load work-archive.csv
                loadWorkArchive();
            }
        });
    }

    function loadWorkArchive() {
        Papa.parse('work-archive.csv', {
            download: true,
            header: true,
            complete: function (results) {
                data = results.data.map(row => {
                    row['project-id'] = row['project-id'].trim(); // Ensure IDs are properly formatted
                    
                    if (!row.filter) {
                        row.filter = "all";
                    } else if (!row.filter.toLowerCase().startsWith('all')) {
                        row.filter += ";all"; // Append 'all' if it's not there
                    }
                    return row;
                });
    
                console.log("📁 Loaded work-archive.csv:", data); // Debugging log
    
                filteredData = [...data]; // Initialize with all data
                renderTable(currentPage);
            }
        });
    }

    function renderTable(page) {
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // 🔹 Filter before paginating
        const filteredProjects = filteredData.filter(row => {
            console.log(`🔎 Checking project-id: "${row['project-id']}"`);
    
            // Ensure project IDs are correctly formatted
            const projectData = projectsData.find(p => p['project-id'].trim() === row['project-id'].trim());
    
            if (!projectData) {
                console.log(`❌ No matching project data for "${row['project-id']}"`);
                return false;
            }
    
            console.log(`✅ Found matching project for "${row['project-id']}":`, projectData);
    
            // ✅ Check if at least one .para field contains "div.reflection"
            const hasReflection = Object.keys(projectData).some(key => 
                key.startsWith("para") && projectData[key] && projectData[key].includes("div.reflection")
            );
    
            console.log(`🔎 Project "${row['project-id']}" has reflection? ${hasReflection}`);
            return hasReflection;
        });

        console.log(`📌 Projects to Show: ${filteredProjects.length}`);

        // 🔹 **Pagination Calculation (AFTER Filtering)**
        const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage)); // Always at least 1 page

        // 🔹 Slice data for pagination
        const paginatedData = filteredProjects.slice(start, end);

        // 🔹 Render Table Rows
        paginatedData.forEach(row => {
            let fullDate = row['end-date']; // Example: "23.07.2024"
            let yearOnly = fullDate.split('.')[2]; // Extracts "2024"

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-year="${yearOnly}">${fullDate}</td>
                <td class="proj-title">
                    ${row.title}
                    <img src="${row['hero-img']}" class="hero-img" alt="${row.title}" style="visibility: hidden;">
                </td>
                <td>${row.description || ''}</td>
                <td>${row.skillset ? row.skillset.split(';').map(skill => skill.trim()).join(', ') : ''}</td>
            `;
        
            // Select the image AFTER tr is created
            const img = tr.querySelector('.hero-img');
    
            // Mouseover: Show image and custom cursor
            // Mouseover: Show image and custom cursor
            tr.addEventListener('mouseover', () => {
                console.log('Row filter value:', row.filter); // Debug the filter value
                if (img) {
                    img.style.visibility = 'visible'; // ✅ Image is now visible on hover
                }
    
                cursor.classList.add('show');
                cursor.textContent = 'open \u2197'; // Add the glyph U+2197 at the end of 'open'
    
                if (row.filter.startsWith('UX')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--red)';
                    nav.style.backgroundColor = 'var(--red)';
                } else if (row.filter.startsWith('branding')) {
                    document.body.style.backgroundColor = 'var(--yellow-buttermilk)';
                    nav.style.backgroundColor = 'var(--yellow-buttermilk)';
                } else if (row.filter.startsWith('service-design')) {
                    document.body.style.backgroundColor = 'var(--green)';
                    nav.style.backgroundColor = 'var(--green)';
                } else if (row.filter.startsWith('game-design')) {
                    document.body.style.backgroundColor = 'var(--pink)';
                    nav.style.backgroundColor = 'var(--pink)';
                } else if (row.filter.startsWith('creative-coding')) {
                    document.body.style.backgroundColor = 'var(--blue-light)';
                    nav.style.backgroundColor = 'var(--blue-light)';
                }
            });
    
            // Mouseout: Hide image and custom cursor
            tr.addEventListener('mouseout', () => {
                document.body.style.transition = 'background-color 0.5s';
                nav.style.transition = 'background-color 0.5s';
                document.body.style.backgroundColor = 'var(--white)';
                nav.style.backgroundColor = 'var(--white)';
                if (img) img.style.visibility = 'hidden';
                cursor.classList.remove('show');
            });
    
            tableBody.appendChild(tr);
        });
    
        // 🔹 Call Pagination Rendering
        renderPagination(totalPages);
    }
    
    

    // Render pagination
    function renderPagination(totalPages) {
        pageNumbers.innerHTML = ''; // Clear pagination UI
    
        // 🔹 **Ensure at least page "1" is always shown**
        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            span.classList.add('page-number');
            if (i === currentPage) {
                span.classList.add('active');
            }
            span.addEventListener('click', () => {
                currentPage = i;
                renderTable(currentPage);
            });
            pageNumbers.appendChild(span);
        }
    
        // 🔹 **Control visibility of Previous & Next Arrows**
        prevButton.style.display = totalPages > 1 ? "inline-block" : "none";
        nextButton.style.display = totalPages > 1 ? "inline-block" : "none";
    
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage >= totalPages;
    }


    // Filter data based on the button clicked
    function applyFilters() {
        if (activeFilters.size === 0) {
            console.log("🔍 No filters selected. Showing all projects.");
            filteredData = data.filter(row => row.filter && row.filter.toLowerCase().includes("all"));
        } else {
            filteredData = data.filter(row =>
                Array.from(activeFilters).some(filter => {
                    if (filter === "ui" || filter === "favourite") {
                        // Special case: If 'UI' filter is selected, use includes()
                        return row.filter && row.filter.toLowerCase().includes(filter);
                    } else {
                        // Default behavior: check if filter startsWith()
                        return row.filter && row.filter.toLowerCase().startsWith(filter);
                    }
                })
            );
        }
    
        currentPage = 1;
        console.log(`🎯 Filters Applied: ${Array.from(activeFilters).join(", ")} | Items Now: ${filteredData.length}`);
        renderTable(currentPage);
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.id.toLowerCase();

            // If #all-work is clicked, reset filters and show all rows
            if (filter === 'all-work') {
                activeFilters.clear();
                filterButtons.forEach(btn => btn.classList.remove('active'));
                allWorkButton.classList.add('active'); // Keep #all-work active
                filteredData = [...data]; // Show all rows
            } else {
                allWorkButton.classList.remove('active'); // Clicking another filter removes .active from #all-work

                // Toggle active filter
                if (activeFilters.has(filter)) {
                    activeFilters.delete(filter);
                    button.classList.remove('active');
                } else {
                    activeFilters.add(filter);
                    button.classList.add('active');
                }
            }

            applyFilters();
        });
    });

    // Mobile: Use IntersectionObserver to simulate hover on scroll
    function checkRowHoverOnScroll() {
        const yPosMouseValue = window.innerHeight / 2;
        console.log(`📍 Checking Hover: yPosMouseValue = ${yPosMouseValue}`);
    
        const rows = document.querySelectorAll("#archive-table tbody tr");
        let foundHoveredRow = null;
    
        rows.forEach(tr => {
            const rect = tr.getBoundingClientRect();
            console.log(`🔍 Row "${tr.querySelector('.proj-title').textContent.trim()}" Top: ${rect.top}, Bottom: ${rect.bottom}`);
    
            // If the middle of the screen is inside this row
            if (rect.top <= yPosMouseValue && rect.bottom >= yPosMouseValue) {
                console.log(`✅ Hover detected on: "${tr.querySelector('.proj-title').textContent.trim()}"`);
                foundHoveredRow = tr;
            }
        });
    
        // 🔥 If a new row is detected, remove hover from the previous one
        if (foundHoveredRow !== lastHoveredRow) {
            if (lastHoveredRow) {
                console.log(`🚫 Removing hover from: "${lastHoveredRow.querySelector('.proj-title').textContent.trim()}"`);
                removeHover(lastHoveredRow);
            }
    
            if (foundHoveredRow) {
                console.log(`🎨 Applying hover effect to: "${foundHoveredRow.querySelector('.proj-title').textContent.trim()}"`);
                simulateHover(foundHoveredRow);
            }
    
            lastHoveredRow = foundHoveredRow; // Update last hovered row
        }
    }
    
    

    // Listen to scroll events to check row hover state
    window.addEventListener("scroll", checkRowHoverOnScroll);
    let lastHoveredRow = null;

    function simulateHover(tr) {
        if (!tr) return;
        if (lastHoveredRow === tr) return; // Prevent unnecessary updates
        lastHoveredRow = tr;
    
        const rowTitle = tr.querySelector('.proj-title').textContent.trim().replace(/\s+/g, ' ');
        const row = filteredData.find(row => 
            row.title.trim().replace(/\s+/g, ' ').toLowerCase() === rowTitle.toLowerCase()
        );
        if (!row) {
            console.warn("⚠️ No matching row found for:", rowTitle);
            return;
        }    
        tr.classList.add('hovered');
    
        // Show the image
        const img = tr.querySelector('.hero-img');
        if (img) {
            img.style.visibility = 'visible';
        }

        cursor.classList.add('show');
        cursor.textContent = 'open \u2197'; // Add the glyph U+2197 at the end of 'open'

        if (row.filter.startsWith('UX')) {
            document.body.style.backgroundColor = 'var(--red)';
            nav.style.backgroundColor = 'var(--red)';
        } else if (row.filter.startsWith('branding')) {
            document.body.style.backgroundColor = 'var(--yellow-buttermilk)';
            nav.style.backgroundColor = 'var(--yellow-buttermilk)';
        } else if (row.filter.startsWith('service-design')) {
            document.body.style.backgroundColor = 'var(--green)';
            nav.style.backgroundColor = 'var(--green)';
        } else if (row.filter.startsWith('game-design')) {
            document.body.style.backgroundColor = 'var(--pink)';
            nav.style.backgroundColor = 'var(--pink)';
        } else if (row.filter.startsWith('creative-coding')) {
            document.body.style.backgroundColor = 'var(--blue-light)';
            nav.style.backgroundColor = 'var(--blue-light)';
        } else {
            console.log("⚪ No matching color category, keeping white.");
        }
    }
    
    
    function removeHover(tr) {
        if (!tr) return; // Ensure we don't try to remove hover from null
        tr.classList.remove('hovered');
        
        // Find the image inside the row and hide it
        const img = tr.querySelector('.hero-img');
        if (img) {
            img.style.setProperty('visibility', 'hidden', 'important');
            console.log(`🖼️ Hiding image for "${tr.querySelector('.proj-title').textContent.trim()}"`);
        } else if (!img){
            console.warn("⚠️ No image found to hide.");
            return;
        } else {
            console.warn("⚠️ No image found to hide.");
        }
    
        document.body.style.backgroundColor = 'var(--white)';
        nav.style.backgroundColor = 'var(--white)';
        cursor.classList.remove('show');
    }
    

    // Function to check screen size and apply hover effect only for small screens
    function enableScrollHoverIfMobile() {
        if (window.matchMedia("(max-width: 800px)").matches) {
            console.log("📱 Mobile/Tablet detected: Enabling scroll-based hover effect.");
            window.addEventListener("scroll", checkRowHoverOnScroll);
            checkRowHoverOnScroll(); // Run once on load
        } else {
            console.log("💻 Desktop detected: Disabling scroll-based hover effect.");
            window.removeEventListener("scroll", checkRowHoverOnScroll);
            removeHover(lastHoveredRow); // Reset any applied hover
        }
    }

    // Listen for screen size changes
    window.addEventListener("resize", enableScrollHoverIfMobile);

    // Run on initial load
    enableScrollHoverIfMobile();


    // Pagination buttons
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            console.log(`⬅ Prev Clicked: Now on Page ${currentPage}`);
            renderTable(currentPage);
        }
    });
    
    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            console.log(`➡ Next Clicked: Now on Page ${currentPage}`);
            renderTable(currentPage);
        }
    });
    
    
    // ✅ New function to ensure data is correctly loaded
    function ensureDataLoaded() {
        if (filteredData.length === 0) {
            console.log("🔄 Reloading data...");
            filteredData = [...data]; // Ensure filteredData is populated
        }
        console.log(`📌 Current Page: ${currentPage}, Total Items: ${filteredData.length}`);
        renderTable(currentPage);
    }


    fetchData();
});

