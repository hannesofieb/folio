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

         // ✅ Set background color based on `filter` column
        const projectContext = document.getElementById('project-context');
        const returnToHome = document.getElementById('return-to-home');

        if (workProject.filter) {
            const filterValue = workProject.filter.trim().toLowerCase(); // Normalize text
            console.log(`🎨 Applying background for filter: ${filterValue}`);

            if (filterValue.startsWith('ux')) {
                projectContext.style.backgroundColor = 'var(--red)';
                returnToHome.style.backgroundColor = 'var(--red)';
            } else if (filterValue.startsWith('branding')) {
                projectContext.style.backgroundColor = 'var(--yellow-buttermilk)';
                returnToHome.style.backgroundColor = 'var(--yellow-buttermilk)';
            } else if (filterValue.startsWith('service-design')) {
                projectContext.style.backgroundColor = 'var(--green)';
                returnToHome.style.backgroundColor = 'var(--green)';
            } else if (filterValue.startsWith('game-design')) {
                projectContext.style.backgroundColor = 'var(--pink)';
                returnToHome.style.backgroundColor = 'var(--pink)';
            } else if (filterValue.startsWith('creative-coding')) {
                projectContext.style.backgroundColor = 'var(--blue-light)';
                returnToHome.style.backgroundColor = 'var(--blue-light)';
            } else {
                console.log("⚪ No matching color category, keeping default.");
            }
        } else {
            console.warn("⚠️ No filter value found, skipping background color change.");
        }

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

    // ✅ Step 6: Parsing logic for para: fields
    // Splits a top-level content string on commas that are NOT nested inside brackets.
    function splitTopLevel(content) {
        let parts = [];
        let current = "";
        let depth = 0;
        for (let i = 0; i < content.length; i++) {
        let char = content[i];
        if (char === '[') {
            depth++;
            current += char;
        } else if (char === ']') {
            depth--;
            current += char;
        } else if (char === ',' && depth === 0) {
            // Top-level comma: push the current chunk.
            parts.push(current.trim());
            current = "";
        } else {
            current += char;
        }
        }
        if (current.trim()) {
        parts.push(current.trim());
        }
        return parts;
    }
  
    // Process a single tag definition (one chunk that should look like "tagName[innerContent]")
    // This function also handles extra classes and id if the tag name contains '.' or '#'.
    // (It also includes your special handling for img tags.)
    function parseSingleTag(content) {
        // Find the first '['
        let tagNameEnd = content.indexOf('[');
        if (tagNameEnd === -1) return null; // no valid tag found
    
        let rawTagName = content.substring(0, tagNameEnd).trim();
    
        // Use a regular expression to capture the base tag and any extra class or id parts.
        // Example rawTagName: "div.multi-carousel#unique"
        let tagMatch = rawTagName.match(/^([a-zA-Z0-9]+)(([.#][^.#]+)*)$/);
        let tagName = "";
        let idName = "";
        let extraClasses = [];
        if (tagMatch) {
        tagName = tagMatch[1];
        if (tagMatch[2]) {
            let groups = tagMatch[2].match(/([.#])([^.#]+)/g);
            if (groups) {
            groups.forEach(g => {
                if (g.startsWith('.')) {
                extraClasses.push(g.substring(1).trim());
                } else if (g.startsWith('#')) {
                idName = g.substring(1).trim();
                }
            });
            }
        }
        } else {
        tagName = rawTagName;
        }
    
        // Find the matching closing ']' for this tag.
        let bracketDepth = 1;
        let j = tagNameEnd + 1;
        while (j < content.length && bracketDepth > 0) {
        if (content[j] === '[') {
            bracketDepth++;
        } else if (content[j] === ']') {
            bracketDepth--;
        }
        j++;
        }
        // The inner content is the substring between the first '[' and its matching ']'
        let innerContent = content.substring(tagNameEnd + 1, j - 1);
    
        // Special handling for img tags.
        if (tagName.toLowerCase() === 'img') {
        let imgEl = document.createElement('img');
        let altText = '';
        let captionText = '';
        let srcText = innerContent;
        let altStart = innerContent.indexOf('{');
        if (altStart !== -1) {
            // Everything before '{' is the source.
            srcText = innerContent.substring(0, altStart).trim();
            let altEnd = innerContent.lastIndexOf('}');
            if (altEnd !== -1 && altEnd > altStart) {
            let altCaption = innerContent.substring(altStart + 1, altEnd).trim();
            let parts = altCaption.split(';');
            if (parts.length >= 1) {
                altText = parts[0].trim();
            }
            if (parts.length >= 2) {
                captionText = parts[1].trim();
            }
            }
        }
        imgEl.src = srcText;
        imgEl.alt = altText;
        if (captionText) {
            imgEl.setAttribute('data-caption', captionText);
        }
        return imgEl;
        } else {
        // For other tags, create the element normally.
        let parentEl = document.createElement(tagName);
        // For div tags, always add the default class "same-topic"
        if (tagName.toLowerCase() === 'div') {
            parentEl.classList.add('same-topic');
        }
        extraClasses.forEach(cls => parentEl.classList.add(cls));
        if (idName) {
            parentEl.id = idName;
        }
        // Process inner content using your nested parser.
        let childFragments = parseNestedContent(innerContent);
        childFragments.forEach(child => parentEl.appendChild(child));
        return parentEl;
        }
    }
    
    // New parseTagContent uses splitTopLevel() and then processes each chunk.
    function parseTagContent(content) {
        const chunks = splitTopLevel(content);
        let elements = [];
        chunks.forEach(chunk => {
        let el = parseSingleTag(chunk);
        if (el) elements.push(el);
        });
        return elements;
    }
  
    function parseNestedContent(text) {
        let fragments = [];
        let i = 0;
      
        while (i < text.length) {
          if (text[i] === '{') {
            // Found a nested block; find its matching '}'
            let curlyDepth = 1;
            let j = i + 1;
            while (j < text.length && curlyDepth > 0) {
              if (text[j] === '{') {
                curlyDepth++;
              } else if (text[j] === '}') {
                curlyDepth--;
              }
              j++;
            }
            // Extract the nested block content without the outer braces.
            let nestedString = text.substring(i + 1, j - 1);
      
            // Expect nestedString to be like: nestedTag[child content]
            let bracketIdx = nestedString.indexOf('[');
            if (bracketIdx !== -1) {
              let nestedTag = nestedString.substring(0, bracketIdx).trim();
              let nestedClassName = '';
              let nestedIdName = '';
      
              // Handle class and ID for nested elements
              if (nestedTag.includes('.')) {
                [nestedTag, nestedClassName] = nestedTag.split('.');
              }
              if (nestedTag.includes('#')) {
                  [nestedTag, nestedIdName] = nestedTag.split('#');
              }
      
              // Get the inner content (everything after the '[' up to the last character before the closing bracket)
              let nestedChildContent = nestedString.substring(bracketIdx + 1, nestedString.length - 1);
              let nestedEl;
      
              // Special handling for an img tag in nested context:
              if (nestedTag.toLowerCase() === 'img') {
                nestedEl = document.createElement('img');
                let altText = '';
                let srcText = nestedChildContent; // by default, the whole inner content is the source
                let altStart = srcText.indexOf('{');
                if (altStart !== -1) {
                  // Everything before the '{' is the source.
                  srcText = srcText.substring(0, altStart).trim();
                  // Look for the last '}' in the child content.
                  let altEnd = nestedChildContent.lastIndexOf('}');
                  if (altEnd !== -1 && altEnd > altStart) {
                    altText = nestedChildContent.substring(altStart + 1, altEnd).trim();
                  }
                }
                nestedEl.src = srcText;
                nestedEl.alt = altText;
                // (Optionally add class or id if provided)
                if (nestedClassName) nestedEl.classList.add(nestedClassName);
                if (nestedIdName) nestedEl.id = nestedIdName;
              }
              // Special handling for "ul": split on semicolons into <li> elements.
              else if (nestedTag.toLowerCase() === 'ul') {
                nestedEl = document.createElement('ul');
                if (nestedClassName) nestedEl.classList.add(nestedClassName);
                if (nestedIdName) nestedEl.id = nestedIdName;
                nestedChildContent.split(';')
                  .map(item => item.trim())
                  .filter(item => item !== '')
                  .forEach(item => {
                    let li = document.createElement('li');
                    li.textContent = item;
                    nestedEl.appendChild(li);
                  });
              }
              // Handling for dash-separated nested tags (e.g. "p-em")
              else if (nestedTag.indexOf('-') !== -1) {
                let parts = nestedTag.split('-');
                let parentTag = parts[0].trim();
                let childTag = parts[1].trim();
      
                nestedEl = document.createElement(parentTag);
                let childEl = document.createElement(childTag);
                childEl.textContent = nestedChildContent;
                nestedEl.appendChild(childEl);
              }
              // For all other nested tags, create the element and set its text content.
              else {
                nestedEl = document.createElement(nestedTag);
                if (nestedClassName) nestedEl.classList.add(nestedClassName);
                if (nestedIdName) nestedEl.id = nestedIdName;
                nestedEl.textContent = nestedChildContent;
              }
              fragments.push(nestedEl);
            }
            i = j; // Move past the nested block.
          } else {
            // Gather plain text until the next '{'
            let nextCurly = text.indexOf('{', i);
            if (nextCurly === -1) {
              let remainingText = text.substring(i);
              if (remainingText) {
                fragments.push(document.createTextNode(remainingText));
              }
              break;
            } else {
              let plainText = text.substring(i, nextCurly);
              if (plainText) {
                fragments.push(document.createTextNode(plainText));
              }
              i = nextCurly;
            }
          }
        }
        return fragments;
    }
      
    // ✅ Start Data Fetch
    fetchData();


    // --------------------------------------------------lightbox image feature
    // Create the lightbox modal and append it inside #project-content
    function createLightboxModal() {
        const projectContent = document.getElementById('project-content');

        // Create the modal container (with id "myModal")
        const modal = document.createElement('div');
        modal.id = 'myModal';
        modal.classList.add('modal');

        // Create the close button and add it to modal
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeModal;
        modal.appendChild(closeBtn);

        // Create the modal-content container
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        modal.appendChild(modalContent);

        // Create a container for the slides; this is what you'll update.
        const slidesContainer = document.createElement('div');
        slidesContainer.id = 'slidesContainer';
        modalContent.appendChild(slidesContainer);

        // Create a caption container.
        const captionContainer = document.createElement('div');
        captionContainer.classList.add('caption-container');
        const captionPara = document.createElement('p');
        captionPara.id = 'caption';
        captionContainer.appendChild(captionPara);
        modalContent.appendChild(captionContainer);

        // Create a previous arrow (if needed)
        const prevSlide = document.createElement('a');
        prevSlide.classList.add('prevNext-slide');
        prevSlide.id = 'prev-slide';
        prevSlide.textContent = '←';
        // Set previous arrow click handler.
        prevSlide.onclick = function() { plusSlides(-1); };
        modal.appendChild(prevSlide);

        // Create a next arrow.
        const nextSlide = document.createElement('a');
        nextSlide.classList.add('prevNext-slide');
        nextSlide.id = 'next-slide';
        nextSlide.textContent = '→';
        // Corrected: assign an anonymous function that calls plusSlides(1)
        nextSlide.onclick = function() { plusSlides(1); };
        modal.appendChild(nextSlide);

        // Create the thumbnail-container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.id = 'thumbnail-container';
        modal.appendChild(thumbnailContainer);

        // Append the modal to #project-content
        projectContent.appendChild(modal);
    }


    createLightboxModal();
    function openModal() {
        document.getElementById("myModal").style.display = "block";
    }
    
    function closeModal() {
        document.getElementById("myModal").style.display = "none";
    }

    // If you have multiple slides (gallery mode), you can use plusSlides and currentSlide.
    let slideIndex = 1;
    showSlides(slideIndex);

    function plusSlides(n) {
    showSlides(slideIndex += n);
    }

    // Thumbnail image controls
    function currentSlide(n) {
    showSlides(slideIndex = n);
    }

    function showSlides(n) {
        let slides = document.getElementsByClassName("mySlides");
        let captionText = document.getElementById("caption");
        
        // If there are no slides, exit early.
        if (slides.length === 0) {
            console.warn("No slides found.");
            return;
        }
        
        // Adjust slideIndex if out-of-range.
        if (n > slides.length) { 
            slideIndex = 1; 
        }    
        if (n < 1) { 
            slideIndex = slides.length; 
        }
        
        // Hide all slides.
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        
        // Show the current slide.
        if (slides[slideIndex - 1]) {  // Defensive check
            slides[slideIndex - 1].style.display = "block";  
            // Update the caption text from the data attribute of the image inside the slide.
            let slideImg = slides[slideIndex - 1].querySelector('img');
            captionText.textContent = slideImg ? slideImg.getAttribute("data-caption") || "" : "";
        } else {
            console.error("Slide index out of range: ", slideIndex);
        }
    }
    


      

    // Attach click event listeners to all images inside #project-content
    document.getElementById('project-content').addEventListener('click', function(e) {
        if (e.target.tagName.toLowerCase() === 'img') {
        openModal();  // Open the modal
        
        const slidesContainer = document.getElementById('slidesContainer');
        slidesContainer.innerHTML = "";  // Clear any existing slides
    
        // Try to see if the clicked image is inside a multi-carousel container.
        // Using closest() ensures that if the image is nested, we get the ancestor with class "multi-carousel".
        let multiCarouselContainer = e.target.closest('div.multi-carousel');
        let imgs, clickedIndex = 0;
        
        if (multiCarouselContainer) {
            // Get all images inside that multi-carousel container.
            imgs = multiCarouselContainer.querySelectorAll('img');
            imgs.forEach((img, idx) => {
            // Create a slide for each image.
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('mySlides');
            const cloneImg = img.cloneNode(true);
            cloneImg.style.width = "100%";

            // If the image has a data-caption attribute, carry it over.
            if (img.getAttribute('data-caption')) {
                cloneImg.setAttribute('data-caption', img.getAttribute('data-caption'));
            }
            slideDiv.appendChild(cloneImg);
            slidesContainer.appendChild(slideDiv);
            // If this is the clicked image, record its index.
            if (img === e.target) {
                clickedIndex = idx;
            }
            });
        } else {
            // Otherwise, only the clicked image becomes a slide.
            imgs = [e.target];
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('mySlides');
            const cloneImg = e.target.cloneNode(true);
            cloneImg.style.width = "100%";
            if (e.target.getAttribute('data-caption')) {
            cloneImg.setAttribute('data-caption', e.target.getAttribute('data-caption'));
            }
            slideDiv.appendChild(cloneImg);
            slidesContainer.appendChild(slideDiv);
            clickedIndex = 0;
        }

            // Set slideIndex based on the clicked image (slides are 1-indexed).
    slideIndex = clickedIndex + 1;
    showSlides(slideIndex);
    
    // Optionally update the caption immediately from the clicked image.
    let currentSlideImg = slidesContainer.querySelector('.mySlides:nth-child(' + slideIndex + ') img');
    let caption = currentSlideImg ? currentSlideImg.getAttribute('data-caption') || "" : "";
    document.getElementById('caption').textContent = caption;
    }
        
    });
  
    
});
