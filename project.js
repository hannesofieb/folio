document.addEventListener('DOMContentLoaded', function () {
    // ✅ Step 1: Get project ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project-id');
    if (!projectId) {
        console.error("❌ No project-id found in the URL.");
        return;
    }

    // ✅ Step 2: Fetch and process both CSV files
    let workArchiveData = [];
    let projectsData = [];

    // Fetch and parse both CSVs
    function fetchData() {
        return Promise.all([
            new Promise(resolve => {
                Papa.parse('work-archive.csv', {
                    download: true,
                    header: true,
                    complete: function (results) {
                        workArchiveData = results.data;
                        resolve();
                    }
                });
            }),
            new Promise(resolve => {
                Papa.parse('projects.csv', {
                    download: true,
                    header: true,
                    complete: function (results) {
                        projectsData = results.data;
                        resolve();
                    }
                });
            })
        ]).then(() => {
            processData();
        });
    }

    // ✅ Step 3: Process and match data
    function processData() {
        // Find project in work-archive.csv
        const workProject = workArchiveData.find(p => p['project-id'].trim() === projectId);
        if (!workProject) {
            console.error(`❌ No project found in work-archive.csv with project-id: ${projectId}`);
            return;
        }

        // Find project in projects.csv
        const projectData = projectsData.find(p => p['project-id'].trim() === projectId);
        if (!projectData) {
            console.error(`❌ No project found in projects.csv with project-id: ${projectId}`);
            return;
        }

        console.log("✅ Matched project:", workProject, projectData);

        // ✅ Step 4: Populate `project.html`
        document.getElementById('project-title').textContent = workProject.title;
        document.getElementById('brief-info').textContent = projectData.overview;

        // ✅ Ensure #hero-frame exists before manipulating it
        const heroFrame = document.getElementById('hero-frame');
        if (!heroFrame) {
            console.error("❌ #hero-frame not found in DOM");
            return;
        }

        // ✅ Insert the hero image from `work-archive.csv`
        let heroImgPath = workProject['hero-img'] ? workProject['hero-img'].trim() : "";
        console.log(`🖼️ Original Hero Image Path: "${heroImgPath}"`);

        // Remove `./` from the start if it exists
        if (heroImgPath.startsWith('./')) {
            heroImgPath = heroImgPath.substring(2);
        }
        console.log(`✅ Cleaned Hero Image Path: "${heroImgPath}"`);

        // Ensure the frame is empty before adding new content
        heroFrame.innerHTML = '';

        if (heroImgPath) {
            // Create the image element
            const heroImg = document.createElement('img');
            heroImg.src = heroImgPath;
            heroImg.alt = workProject.title || "Project Image";
            
            // 🔍 Debug: Check if image loads
            heroImg.onload = function () {
                console.log(`✅ Image loaded successfully: ${heroImgPath}`);
            };
            heroImg.onerror = function () {
                console.error(`🚨 Image failed to load: ${heroImgPath}`);
            };

            // Append to hero frame
            heroFrame.appendChild(heroImg);
            console.log(`✅ Final Image Path: ${heroImg.src}`);
        } else {
            console.warn(`⚠️ No hero image found for project ${workProject.title}`);
        }

        // 🔍 Debug: Check if image is inside hero-frame
        setTimeout(() => {
            console.log("🖼️ Hero Frame Content:", heroFrame.innerHTML);
        }, 1000); // Delay check to ensure rendering

            
        // Calculate and display PROJECT DURATION
        // Function to parse DD.MM.YYYY format into a JavaScript Date object
        function parseDate(dateString) {
            if (!dateString) return null;
            const parts = dateString.split('.'); // Split "23.07.2024" -> ["23", "07", "2024"]
            if (parts.length !== 3) return null;
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to "YYYY-MM-DD"
        }
        // Convert start and end dates properly
        const startDate = parseDate(projectData['start-date']);
        const endDate = parseDate(workProject['end-date']);
        // Ensure both dates are valid before calculating
        if (startDate && endDate) {
            const year = startDate.getFullYear(); // Extracts the year from the start date
            const weeks = Math.round((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
            document.getElementById('period').innerHTML = `<h3 class="timeline-label">Timeline</h3> ${year} — ${weeks} weeks`;
        } else {
            console.error("❌ Invalid date detected:", projectData['start-date'], workProject['end-date']);
            document.getElementById('period').innerHTML = `<span class="timeline-label">Timeline</span> Unknown`;
        }

        // Populate ROLES
        populateList(document.querySelector('#roles + ul'), projectData.roles);

        // Populate TOOLS
        populateList(document.querySelector('#tools + ul'), projectData.tools);

        // Populate remarks (if available)
        const remarksContainer = document.getElementById('remarks');
        if (projectData.remarked.trim()) {
            populateList(remarksContainer.querySelector('ul'), projectData.remarked);
            remarksContainer.style.display = 'block';
        } else {
            remarksContainer.style.display = 'none';
        }

        // Populate project content
        populateProjectContent(projectData);

        // Update next/prev project navigation
        updateProjectNavigation(projectId);
        console.log("📌 Checking projectData keys:", Object.keys(projectData));

    }

    // ✅ Update next/prev project navigation
    function updateProjectNavigation(currentProjectId) {
        const prevButton = document.getElementById('prev-proj');
        const nextButton = document.getElementById('next-proj');
    
        // Extract all project IDs from `projectsData`
        const projectIds = projectsData.map(p => p['project-id']).filter(Boolean); // Removes empty/null values
    
        // Find index of the current project
        const currentIndex = projectIds.indexOf(currentProjectId);
        if (currentIndex === -1) {
            console.error(`❌ Project ID ${currentProjectId} not found in project list.`);
            return;
        }
    
        // Determine previous and next project IDs
        const prevProjectId = currentIndex > 0 ? projectIds[currentIndex - 1] : null;
        const nextProjectId = currentIndex < projectIds.length - 1 ? projectIds[currentIndex + 1] : null;
    
        // Update previous button
        if (prevProjectId) {
            prevButton.style.cursor = "pointer";
            prevButton.addEventListener('click', () => {
                window.location.href = `project.html?project-id=${prevProjectId}`;
            });
        } else {
            prevButton.style.opacity = "0.3"; // Disable button visually
            prevButton.style.pointerEvents = "none"; // Prevent click
            prevButton.style.cursor = "not-allowed"; // ✅ Correct button
        }
    
        // Update next button
        if (nextProjectId) {
            nextButton.style.cursor = "pointer";
            nextButton.addEventListener('click', () => {
                window.location.href = `project.html?project-id=${nextProjectId}`;
            });
        } else {
            nextButton.style.opacity = "0.3"; // Disable button visually
            nextButton.style.pointerEvents = "none"; // Prevent click
            nextButton.style.cursor = "not-allowed"; // ✅ Correct button
        }
    }
    

    // ✅ Helper: Populate List Elements
    function populateList(ulElement, csvValue) {
        ulElement.innerHTML = '';
        if (csvValue) {
            csvValue.split(';').forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.trim();
                ulElement.appendChild(li);
            });
        }
    }

    // ✅ Step 5: Parse & Populate `#project-content`
    function populateProjectContent(projectData) {
        const projectContent = document.getElementById('project-content');
        function populateProjectContent(projectData) {
            const projectContent = document.getElementById('project-content');
            projectContent.querySelectorAll('.para').forEach(para => para.remove());
            
            Object.keys(projectData).forEach(key => {
                const trimmedKey = key.trim(); // 🔥 Fix: Remove leading/trailing spaces
        
                if (trimmedKey.startsWith('para')) {  // ✅ Now it correctly detects "para" fields
                    console.log(`🔍 Processing ${trimmedKey}:`, projectData[key]); // Debug
        
                    if (!projectData[key].trim()) return; // Skip empty fields
        
                    const sectionDiv = document.createElement('div');
                    sectionDiv.classList.add('para');
        
                    const parsedElements = parseTagContent(projectData[key]);
        
                    if (parsedElements.length > 0) {
                        parsedElements.forEach(el => sectionDiv.appendChild(el));
                        projectContent.appendChild(sectionDiv);
                    } else {
                        console.warn(`⚠️ No parsed elements found for ${trimmedKey}`);
                    }
                }
            });
        }        
        Object.keys(projectData).forEach(key => {
            const trimmedKey = key.trim(); // 🔥 Fix: Remove leading/trailing spaces
    
            if (trimmedKey.startsWith('para')) {  // ✅ Now it correctly detects "para" fields
                console.log(`🔍 Processing ${trimmedKey}:`, projectData[key]); // Debug
    
                if (!projectData[key].trim()) return; // Skip empty fields
    
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('para');
    
                const parsedElements = parseTagContent(projectData[key]);
    
                if (parsedElements.length > 0) {
                    parsedElements.forEach(el => sectionDiv.appendChild(el));
                    projectContent.appendChild(sectionDiv);
                } else {
                    console.warn(`⚠️ No parsed elements found for ${trimmedKey}`);
                }
            }
        });
    }
    
    

    // ✅ Step 6: Parsing logic for para: fields
    function parseTagContent(content) {
        const elements = [];
        const regex = /([a-zA-Z0-9-]+)\[([\s\S]+?)\]/g; // ✅ Improved regex
        let match;
    
        while ((match = regex.exec(content)) !== null) {
            const tag = match[1];  // Extracts tag name (h2, p, img, ul, etc.)
            let values = match[2].split(';');  // Splits multiple values
    
            if (tag.startsWith('collage-')) {
                // 🎨 Handle collage (images, iframes, videos together)
                const collageDiv = document.createElement('div');
                collageDiv.classList.add(values.length > 4 ? 'grid-collage' : 'small-collage');
    
                values.forEach(val => {
                    if (tag === 'collage-img' || tag === 'img') {
                        const [src, alt] = val.split('{');
                        const img = document.createElement('img');
                        img.src = src.trim();
                        img.alt = alt ? alt.replace('}', '').trim() : '';
                        collageDiv.appendChild(img);
                    } else if (tag === 'collage-video' || tag === 'video') {
                        const video = document.createElement('video');
                        video.src = val.trim();
                        video.controls = true;
                        collageDiv.appendChild(video);
                    } else if (tag === 'collage-iframe' || tag === 'iframe') {
                        const iframe = document.createElement('iframe');
                        iframe.src = val.trim();
                        iframe.allowFullscreen = true;
                        collageDiv.appendChild(iframe);
                    }
                });
    
                elements.push(collageDiv);
            } else if (tag === 'ul') {
                // 📜 Handle lists
                const ul = document.createElement('ul');
                values.forEach(val => {
                    const li = document.createElement('li');
                    li.textContent = val.trim();
                    ul.appendChild(li);
                });
                elements.push(ul);
            } else {
                // 📝 Handle text-based elements (h2, p, etc.)
                const wrapperDiv = document.createElement('div');
                wrapperDiv.classList.add('same-topic');
    
                values.forEach(val => {
                    const element = document.createElement(tag);
                    const nestedMatch = /\{(.+)\}/.exec(val);
    
                    if (nestedMatch) {
                        const text = val.split('{')[0].trim();
                        const nestedTag = document.createElement('ul');
                        nestedMatch[1].split(';').forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item.trim();
                            nestedTag.appendChild(li);
                        });
    
                        element.textContent = text;
                        wrapperDiv.appendChild(element);
                        wrapperDiv.appendChild(nestedTag);
                    } else {
                        element.textContent = val.trim();
                        wrapperDiv.appendChild(element);
                    }
                });
    
                elements.push(wrapperDiv);
            }
        }
    
        if (elements.length === 0) {
            console.warn("⚠️ No elements parsed from:", content);
        }
    
        return elements;
    }
    
    

    // ✅ Start Data Fetch
    fetchData();
});
