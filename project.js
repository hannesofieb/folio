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
        // Populate remarks (if available) regardless of viewport size.
        const remarksContainer = document.getElementById('remarks');
        if (projectData.remarked.trim()) {
            populateList(remarksContainer.querySelector('ul'), projectData.remarked);
            // Now, if the viewport is wide (desktop), show the remarks;
            // otherwise, hide them (mobile).
            if (window.innerWidth > 800) {
                remarksContainer.style.display = 'block';
            } else {
                remarksContainer.style.display = 'none';
            }
        } else {
            remarksContainer.style.display = 'none';
        }
        


        // Populate project content
        populateProjectContent(projectData);

        // Update next/prev project navigation
        updateProjectNavigation(projectId);
        console.log("📌 Checking projectData keys:", Object.keys(projectData));

        setTimeout(initCarousels, 500);  // Adjust delay if needed
        addSoloCaptions();

        setTimeout(() => {
            initPrototypesCarousel();
        }, 500);


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
    
                // Check if the item contains an arrow
                const arrowIndex = item.indexOf('→');
                if (arrowIndex !== -1) {
                    const boldPart = item.substring(0, arrowIndex).trim(); // Text before arrow
                    const restPart = item.substring(arrowIndex).trim(); // Arrow + text after arrow
    
                    // Create bold element
                    const boldSpan = document.createElement('span');
                    boldSpan.style.fontWeight = 'bold';
                    boldSpan.textContent = boldPart + ' '; // Add space for separation
    
                    // Append elements to li
                    li.appendChild(boldSpan);
                    li.appendChild(document.createTextNode(restPart));
                } else {
                    li.textContent = item.trim();
                }
    
                ulElement.appendChild(li);
            });
        }
    }

    function addSoloCaptions() {
        // Select all images with the class "solo"
        const soloImages = document.querySelectorAll('img.solo');
        soloImages.forEach(img => {
          const captionText = img.getAttribute('data-caption');
          if (captionText) {
            // Create a new <p> element with class "caption"
            const captionP = document.createElement('p');
            captionP.classList.add('caption');
            captionP.textContent = captionText;
            // Insert the caption element right after the image
            img.parentNode.insertBefore(captionP, img.nextSibling);
          }
        });
        console.log("Added captions for", soloImages.length, "img.solo elements.");
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
// Special handling for img tags.
if (tagName.toLowerCase() === 'img') {
    let imgEl = document.createElement('img');
    let srcText = innerContent;  // default: the whole inner content
    let altText = '';
    let captionText = '';

    // Log to verify what innerContent is.
    console.log("Processing img innerContent:", innerContent);

    // Look for the first '{'
    let altStart = innerContent.indexOf('{');
    if (altStart !== -1) {
        // Everything before '{' is used as the src.
        srcText = innerContent.substring(0, altStart).trim();

        // Use indexOf() (not lastIndexOf) to find the first closing '}' after the '{'
        let altEnd = innerContent.indexOf('}', altStart + 1);
        if (altEnd !== -1 && altEnd > altStart) {
            // Extract the string inside the curly braces.
            let altCaption = innerContent.substring(altStart + 1, altEnd).trim();
            console.log("altCaption:", altCaption);
            // Split on the first semicolon only. Using split with a limit of 2 ensures we get at most two parts.
            let parts = altCaption.split(";", 2);
            console.log("Parts from altCaption:", parts);
            altText = parts[0].trim();
            if (parts.length > 1) {
                captionText = parts[1].trim();
            }
        }
    }
    imgEl.src = srcText;
    imgEl.alt = altText;
    // Set the data-caption attribute if a caption was provided.
    if (captionText) {
        imgEl.setAttribute('data-caption', captionText);
    }

    console.log(`🖼️ Processed Image: src="${imgEl.src}", alt="${imgEl.alt}", caption="${captionText}"`);
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
              // Inside parseNestedContent()
              if (nestedTag.toLowerCase() === 'img') {
                nestedEl = document.createElement('img');
                let altText = '';
                let captionText = '';
                let srcText = nestedChildContent; // by default, the entire content
                // Use indexOf to find the first '{'
                let altStart = nestedChildContent.indexOf('{');
                if (altStart !== -1) {
                    // Everything before '{' is used as the src.
                    srcText = nestedChildContent.substring(0, altStart).trim();
                    // Use indexOf (not lastIndexOf) to find the first '}' after altStart.
                    let altEnd = nestedChildContent.indexOf('}', altStart + 1);
                    if (altEnd !== -1 && altEnd > altStart) {
                        // Extract the string inside the curly braces.
                        let altCaption = nestedChildContent.substring(altStart + 1, altEnd).trim();
                        // Split on the first semicolon only.
                        let parts = altCaption.split(";", 2);
                        if (parts.length >= 1) {
                            altText = parts[0].trim();
                        }
                        if (parts.length >= 2) {
                            captionText = parts[1].trim();
                        }
                    }
                }
                nestedEl.src = srcText;
                nestedEl.alt = altText;
                if (captionText) {
                    nestedEl.setAttribute("data-caption", captionText);
                }
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



    // ------------------ New Display-Window Image Feature Code ------------------
// Initialize the prototypes carousel
function initPrototypesCarousel() {
    // Find the prototypes container within #project-content, for example:
    const prototypes = document.querySelector('#project-content .prototypes');
    if (!prototypes) {
      console.error("❌ No .prototypes element found.");
      return;
    }
  
    // Wrap each image in a .prototype-container if not already wrapped.
    const imgs = Array.from(prototypes.querySelectorAll('img'));
    imgs.forEach(img => {
      if (!img.parentElement.classList.contains('prototype-container')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('prototype-container');
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }
    });
    console.log("✅ Prototypes images wrapped in .prototype-container.");
  
    // Create a caption container for prototypes (if it doesn't already exist).
    let captionContainer = document.querySelector('.prototypes-caption-container');
    if (!captionContainer) {
      captionContainer = document.createElement('div');
      captionContainer.classList.add('prototypes-caption-container');
      // Append the caption container right after the prototypes container.
      prototypes.insertAdjacentElement('afterend', captionContainer);
    }
  
    // Set up event listeners on each prototypes image:
    imgs.forEach((img, index) => {
      // Mouse hover triggers selection.
      img.addEventListener('mouseenter', function () {
        setPrototypesSelected(index, imgs, captionContainer);
      });
      // Click also triggers selection.
      img.addEventListener('click', function () {
        setPrototypesSelected(index, imgs, captionContainer);
      });
    });
  
    // Add a scroll event listener to update selection on drag/scroll.
    // (Debounce the handler for performance.)
    let scrollTimeout;
    prototypes.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        updatePrototypesSelectionOnScroll(prototypes, captionContainer);
      }, 100);
    });
  
    // Add keydown event listener to allow left/right arrow navigation.
    document.addEventListener('keydown', function (e) {
      if (!prototypes) return;
      let currentIndex = imgs.findIndex(img => img.classList.contains('selected'));
      if (currentIndex === -1) currentIndex = 0;
      if (e.key === "ArrowLeft") {
        currentIndex = currentIndex - 1;
        if (currentIndex < 0) currentIndex = imgs.length - 1;
        setPrototypesSelected(currentIndex, imgs, captionContainer);
        imgs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else if (e.key === "ArrowRight") {
        currentIndex = currentIndex + 1;
        if (currentIndex >= imgs.length) currentIndex = 0;
        setPrototypesSelected(currentIndex, imgs, captionContainer);
        imgs[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }
  
  // Helper: Set the selected prototype image.
  function setPrototypesSelected(selectedIndex, imgs, captionContainer) {
    imgs.forEach((img, idx) => {
      if (idx === selectedIndex) {
        img.classList.add('selected');
        // The caption container gets updated with the data-caption attribute.
        captionContainer.textContent = img.getAttribute('data-caption') || "";
      } else {
        img.classList.remove('selected');
      }
    });
  }
  
  // Called when the prototypes container is scrolled.
  // Finds the image whose horizontal center is closest to the container’s center.
  function updatePrototypesSelectionOnScroll(prototypes, captionContainer) {
    const imgs = Array.from(prototypes.querySelectorAll('img'));
    if (imgs.length === 0) return;
    
    const containerRect = prototypes.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
  
    let closestIndex = 0;
    let minDistance = Infinity;
  
    imgs.forEach((img, index) => {
      const imgRect = img.getBoundingClientRect();
      const imgCenterX = imgRect.left + imgRect.width / 2;
      const distance = Math.abs(imgCenterX - containerCenterX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
  
    setPrototypesSelected(closestIndex, imgs, captionContainer);
  }
  
  // Call the prototypes initializer after all project content is loaded.
  // For example, call this at the end of your processData() function (or with a small delay).
  initPrototypesCarousel();
  
      
    // ----- Multi-Carousel Code Here -----
    function initCarousels() {
        console.log("initCarousels(): Found", document.querySelectorAll('.multi-carousel').length, "multi-carousel(s).");
        const carousels = document.querySelectorAll('.multi-carousel');
        
        carousels.forEach(carousel => {
        initCarousel(carousel);
        });
    }
    
    function initCarousel(carousel) {
        // 1. Wrap each image in a .thumbnail-container
        const images = Array.from(carousel.querySelectorAll('img'));
        images.forEach(img => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('thumbnail-container');
        const underline = document.createElement('div');
        underline.classList.add('underline');
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        wrapper.appendChild(underline);
        });
        console.log("Wrapped", images.length, "images in carousel:", carousel);
    
        // 2. Create a display window
        const displayWindow = document.createElement('div');
        displayWindow.classList.add('display-window', 'hidden');
        const displayImg = document.createElement('img');
        displayImg.classList.add('displayed-img');
        displayWindow.appendChild(displayImg);
        const caption = document.createElement('p');
        caption.classList.add('display-caption');
        displayWindow.appendChild(caption);
        carousel.insertAdjacentElement('afterend', displayWindow);
        console.log("Created display window for carousel:", carousel);
    
        // 3. Add click event listeners to thumbnails
        const thumbnails = carousel.querySelectorAll('.thumbnail-container');
        thumbnails.forEach((thumb, idx) => {
        thumb.addEventListener('click', function(e) {
            e.stopPropagation();
            updateDisplay(carousel, displayWindow, idx);
        });
        });
    
        // 4. Click on display image to hide display window
        displayImg.addEventListener('click', function() {
        displayWindow.classList.add('hidden');
        });
    
        // 5. Optionally, show first image on initialization
        if (images.length > 0) {
        updateDisplay(carousel, displayWindow, 0);
        displayWindow.classList.remove('hidden');
        displayWindow.classList.add('visible');
        }
    }
    
    function updateDisplay(carousel, displayWindow, index) {
        const images = Array.from(carousel.querySelectorAll('img'));
        if (index < 0 || index >= images.length) return;
        const displayImg = displayWindow.querySelector('.displayed-img');
        const caption = displayWindow.querySelector('.display-caption');
        displayImg.src = images[index].src;
        displayImg.setAttribute('data-index', index);
        caption.textContent = images[index].getAttribute('data-caption') || "";
        console.log("Updated display to image index", index, "with src:", displayImg.src);
    
        // Update thumbnail selection
        const thumbnails = carousel.querySelectorAll('.thumbnail-container');
        thumbnails.forEach(thumb => {
        thumb.classList.remove('selected');
        const ul = thumb.querySelector('.underline');
        if (ul) ul.style.display = 'none';
        });
        if (thumbnails[index]) {
        thumbnails[index].classList.add('selected');
        const ul = thumbnails[index].querySelector('.underline');
        if (ul) ul.style.display = 'block';
        }
        displayWindow.classList.remove('hidden');
        displayWindow.classList.add('visible');
    }
    
    document.addEventListener('keydown', function(event) {
        // Get all display windows that are currently visible.
        const activeDisplays = Array.from(document.querySelectorAll('.display-window.visible'));
        if (!activeDisplays.length) return;
    
        // Find the display window that is actually in the viewport.
        // (You could also choose the one closest to the cursor if you track that.)
        let targetDisplay = activeDisplays.find(display => {
        const rect = display.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
        });
    
        // If none are in viewport, default to the first visible display.
        if (!targetDisplay) targetDisplay = activeDisplays[0];
    
        // Now, assume the carousel is immediately preceding the display window.
        const carousel = targetDisplay.previousElementSibling;
        if (!carousel || !carousel.classList.contains('multi-carousel')) return;
        
        const images = Array.from(carousel.querySelectorAll('img'));
        if (images.length === 0) return;
        
        // Get current image index from the display window.
        const currentIndex = parseInt(targetDisplay.querySelector('.displayed-img').getAttribute('data-index')) || 0;
        let newIndex = currentIndex;
        if (event.key === "ArrowLeft" && currentIndex > 0) {
        newIndex = currentIndex - 1;
        } else if (event.key === "ArrowRight" && currentIndex < images.length - 1) {
        newIndex = currentIndex + 1;
        } else {
        return;
        }
        
        // Update the display for the target carousel.
        updateDisplay(carousel, targetDisplay, newIndex);
    });

    // --------------- MOBILE LAYOUT: toggle function for project context
    function toggleMoreDetails() {
        // Get the "more-details" element.
        const moreDetails = document.getElementById('more-details');
        // Get all the elements that should be toggled.
        // Here, we assume that the lists (roles, tools, remarks) are the elements to hide/show.
        const lists = document.querySelectorAll('#project-context .list');
        const remarks = document.querySelectorAll('#project-context .list #remarks');
      
        // Check if we are currently expanded.
        // We can use a data attribute "data-expanded" that defaults to "false".
        const isExpanded = moreDetails.getAttribute('data-expanded') === 'true';
      
        if (isExpanded) {
          // Collapse: hide all lists.
          lists.forEach(el => el.style.display = 'none');
          remarks.forEach(el => el.style.display = 'none');
          moreDetails.innerHTML = '<p>more details↘</p>';
          moreDetails.setAttribute('data-expanded', 'false');
          console.log("🔽 Collapsed additional details.");
        } else {
          // Expand: show all lists.
          lists.forEach(el => el.style.display = 'block');
          remarks.forEach(el => el.style.display = 'block');
          moreDetails.innerHTML = '<p>say less↗</p>';
          moreDetails.setAttribute('data-expanded', 'true');
          console.log("🔼 Expanded additional details.");
        }
      }
      
      // Set an initial state on mobile. (On larger screens the element is hidden by CSS.)
        // Check the viewport width.
        if (window.innerWidth < 800) {
            // On mobile ...
            //-------------- img[0] selected
            const multiCarousel = document.querySelector('.multi-carousel');
            if (multiCarousel) {
                // Select the images (not the thumbnail-container wrappers)
                const images = Array.from(multiCarousel.querySelectorAll("img"));
                const displayWindow = document.getElementById('display-window');
                if (displayWindow) {
                    // Remove the hidden class and add the visible class (make sure CSS for .visible is correct)
                    displayWindow.classList.remove('hidden');
                    displayWindow.classList.add('visible');
                }
                if (images.length > 0) {
                    // Automatically select the first image (index 0)
                    showImage(0, images);
                }
            }

            //-------------- hide the extra details (lists including remarks)
            const lists = document.querySelectorAll('#project-context .list');
            lists.forEach(el => el.style.display = 'none');

            // Also hide the remarks container (if not already hidden)
            const remarks = document.getElementById('remarks');
            if (remarks) {
                remarks.style.display = 'none';
            }
            
            const moreDetails = document.getElementById('more-details');
            if (moreDetails) {
                moreDetails.setAttribute('data-expanded', 'false');
                moreDetails.addEventListener('click', toggleMoreDetails);
                console.log("✅ 'More details' toggle enabled on mobile view.");
            }
        }
        
        
      
        
});
