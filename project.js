/**
 * Project Detail Page - Main Script
 * Handles dynamic project content loading, image carousels, navigation, and responsive behaviors
 */

// =============================================================================
// INITIALIZATION & DATA LOADING
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const projectId = getProjectIdFromUrl();
    if (!projectId) {
        console.error("❌ No project-id found in the URL.");
        return;
    }

    // State management
    let workArchiveData = [];
    let projectsData = [];

    // Start the data loading process
    fetchData();

    /**
     * Get project ID from URL parameters
     */
    function getProjectIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('project-id');
    }

    /**
     * Fetch and parse both CSV files
     */
    function fetchData() {
        Promise.all([
            fetchCsvFile('work-archive.csv'),
            fetchCsvFile('projects.csv')
        ]).then(([workData, projectData]) => {
            workArchiveData = workData;
            projectsData = projectData;
            processData();
        });
    }

    /**
     * Fetch a single CSV file
     */
    function fetchCsvFile(filename) {
        return new Promise(resolve => {
            Papa.parse(filename, {
                download: true,
                header: true,
                complete: function (results) {
                    resolve(results.data);
                }
            });
        });
    }

    // =============================================================================
    // DATA PROCESSING & PAGE POPULATION
    // =============================================================================

    /**
     * Main data processing function - orchestrates page setup
     */
    /**
     * Main data processing function - orchestrates page setup
     */
    function processData() {
        // Find project data in both CSV files
        const workProject = workArchiveData.find(p => p['project-id'].trim() === projectId);
        const projectData = projectsData.find(p => p['project-id'].trim() === projectId);

        if (!workProject || !projectData) {
            console.error(`❌ Project not found with ID: ${projectId}`);
            return;
        }

        console.log("✅ Matched project:", workProject, projectData);

        // Populate page sections
        populateBasicInfo(workProject, projectData);
        populateHeroImage(workProject);
        populateTimeline(workProject, projectData);
        populateMetadata(projectData);
        populateProjectContent(projectData);
        // updateProjectNavigation(projectId);

        // Apply styling and initialize features
        setTimeout(() => colouring(workProject), 600);
        setTimeout(initializeFeatures, 500);
    }

    /**
     * Parse overview text with support for {br} and {a[text;url]} syntax
     * 
     * Examples:
     * - {br} = line break
     * - {a[Click here;https://example.com]} = link
     */
    function parseOverviewToFragments(overviewText) {
        if (!overviewText) return [];
        
        const fragments = [];
        let currentIndex = 0;
        
        while (currentIndex < overviewText.length) {
            // Look for special syntax
            const brIndex = overviewText.indexOf('{br}', currentIndex);
            const aIndex = overviewText.indexOf('{a[', currentIndex);
            
            let nextSpecial = -1;
            let specialType = null;
            
            // Determine which comes first
            if (brIndex !== -1 && (aIndex === -1 || brIndex < aIndex)) {
                nextSpecial = brIndex;
                specialType = 'br';
            } else if (aIndex !== -1) {
                nextSpecial = aIndex;
                specialType = 'a';
            }
            
            // If no special syntax found, add remaining text
            if (nextSpecial === -1) {
                const remainingText = overviewText.substring(currentIndex);
                if (remainingText) {
                    fragments.push(document.createTextNode(remainingText));
                }
                break;
            }
            
            // Add text before the special syntax
            const textBefore = overviewText.substring(currentIndex, nextSpecial);
            if (textBefore) {
                fragments.push(document.createTextNode(textBefore));
            }
            
            // Handle special syntax
            if (specialType === 'br') {
                fragments.push(document.createElement('br'));
                fragments.push(document.createElement('br'));
                currentIndex = nextSpecial + 4; // Move past "{br}"
                console.log("📄 Added line break to overview");
            } else if (specialType === 'a') {
                const anchorStart = nextSpecial + 3; // After "{a["
                const anchorEnd = overviewText.indexOf(']}', anchorStart);
                
                if (anchorEnd !== -1) {
                    const anchorContent = overviewText.substring(anchorStart, anchorEnd);
                    const parts = anchorContent.split(';');
                    
                    if (parts.length === 2) {
                        const anchor = document.createElement('a');
                        anchor.textContent = parts[0].trim();
                        anchor.href = parts[1].trim();
                        anchor.setAttribute('target', '_blank');
                        fragments.push(anchor);
                        currentIndex = anchorEnd + 2; // Move past "]}"
                        console.log(`🔗 Added link to overview: "${anchor.textContent}" → ${anchor.href}`);
                    } else {
                        // Invalid syntax, treat as plain text
                        console.warn("⚠️ Invalid link syntax, treating as plain text");
                        fragments.push(document.createTextNode(overviewText.substring(nextSpecial, anchorEnd + 2)));
                        currentIndex = anchorEnd + 2;
                    }
                } else {
                    // No closing found, treat as plain text
                    console.warn("⚠️ No closing ]} found for link, treating as plain text");
                    fragments.push(document.createTextNode(overviewText.substring(nextSpecial)));
                    break;
                }
            }
        }
        
        return fragments;
    }


    /**
     * Populate basic project information
     */
    function populateBasicInfo(workProject, projectData) {
        document.getElementById('project-title').textContent = workProject.title;
        
        // Parse and populate overview with br and link support
        const briefInfo = document.getElementById('brief-info');
        if (briefInfo && projectData.overview) {
            briefInfo.innerHTML = ''; // Clear existing content
            
            const parsedContent = parseOverviewToFragments(projectData.overview);
            parsedContent.forEach(fragment => {
                briefInfo.appendChild(fragment);
            });
            
            console.log("✅ Overview parsed with", parsedContent.length, "fragments");
        }
        
        document.title = `${workProject.title} by HS`;
    }

    /**
     * Populate and display hero image
     */
    function populateHeroImage(workProject) {
        const heroFrame = document.getElementById('hero-frame');
        if (!heroFrame) {
            console.error("❌ #hero-frame not found in DOM");
            return;
        }

        let heroImgPath = workProject['hero-img'] ? workProject['hero-img'].trim() : "";
        
        // Clean up path
        if (heroImgPath.startsWith('./')) {
            heroImgPath = heroImgPath.substring(2);
        }

        heroFrame.innerHTML = '';
        
        if (heroImgPath) {
            const heroImg = document.createElement('img');
            heroImg.src = heroImgPath;
            heroImg.alt = workProject.title || "Project Image";
            
            heroImg.onload = () => console.log(`✅ Image loaded: ${heroImgPath}`);
            heroImg.onerror = () => console.error(`🚨 Image failed to load: ${heroImgPath}`);
            
            heroFrame.appendChild(heroImg);
        } else {
            console.warn(`⚠️ No hero image found for project ${workProject.title}`);
        }
    }

    /**
     * Calculate and display project timeline
     */
    function populateTimeline(workProject, projectData) {
        const startDate = parseDate(projectData['start-date']);
        const endDate = parseDate(workProject['end-date']);

        if (startDate && endDate) {
            const year = startDate.getFullYear();
            const weeks = Math.round((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
            document.getElementById('period').innerHTML = 
                `<h3 class="timeline-label">Timeline</h3> ${year} — ${weeks} weeks`;
        } else {
            console.error("❌ Invalid date:", projectData['start-date'], workProject['end-date']);
            document.getElementById('period').innerHTML = 
                `<span class="timeline-label">Timeline</span> Unknown`;
        }
    }

    /**
     * Parse date string in DD.MM.YYYY format
     */
    function parseDate(dateString) {
        if (!dateString) return null;
        const parts = dateString.split('.');
        if (parts.length !== 3) return null;
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }

    /**
     * Populate roles, tools, and remarks metadata
     */
    function populateMetadata(projectData) {
        populateList(document.querySelector('#roles + ul'), projectData.roles);
        populateList(document.querySelector('#tools + ul'), projectData.tools);
        
        const remarksContainer = document.getElementById('remarks');
        if (projectData.remarked && projectData.remarked.trim()) {
            populateList(remarksContainer.querySelector('ul'), projectData.remarked);
            remarksContainer.style.display = window.innerWidth > 800 ? 'block' : 'none';
        } else {
            remarksContainer.style.display = 'none';
        }
    }

    /**
     * Populate a list element from semicolon-separated CSV values
     */
    function populateList(ulElement, csvValue) {
        if (!ulElement) return;
        
        ulElement.innerHTML = '';
        
        if (csvValue) {
            csvValue.split(';').forEach(item => {
                const li = document.createElement('li');
                const arrowIndex = item.indexOf('→');
                
                if (arrowIndex !== -1) {
                    const boldPart = item.substring(0, arrowIndex).trim();
                    const restPart = item.substring(arrowIndex).trim();
                    
                    const boldSpan = document.createElement('span');
                    boldSpan.style.fontWeight = 'bold';
                    boldSpan.textContent = boldPart + ' ';
                    
                    li.appendChild(boldSpan);
                    li.appendChild(document.createTextNode(restPart));
                } else {
                    li.textContent = item.trim();
                }
                
                ulElement.appendChild(li);
            });
        }
    }

    // =============================================================================
    // PROJECT CONTENT PARSING
    // =============================================================================

    /**
     * Parse and populate main project content sections
     */
    function populateProjectContent(projectData) {
        const projectContent = document.getElementById('project-content');
        projectContent.querySelectorAll('.para').forEach(para => para.remove());

        Object.keys(projectData).forEach(key => {
            const trimmedKey = key.trim();

            if (trimmedKey.startsWith('para')) {
                const content = projectData[key];
                if (!content || !content.trim()) return;

                console.log(`🔍 Processing ${trimmedKey}:`, content);

                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('para');

                const parsedElements = parseTagContent(content);

                if (parsedElements.length > 0) {
                    parsedElements.forEach(el => sectionDiv.appendChild(el));
                    projectContent.appendChild(sectionDiv);
                } else {
                    console.warn(`⚠️ No parsed elements found for ${trimmedKey}`);
                }
            }
        });
    }

    /**
     * Split content on top-level commas (not nested in brackets)
     */
    function splitTopLevel(content) {
        const parts = [];
        let current = "";
        let depth = 0;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (char === '[') {
                depth++;
                current += char;
            } else if (char === ']') {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0) {
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

    /**
     * Parse tag content into DOM elements
     */
    function parseTagContent(content) {
        const chunks = splitTopLevel(content);
        const elements = [];

        chunks.forEach(chunk => {
            const el = parseSingleTag(chunk);
            if (el) elements.push(el);
        });

        return elements;
    }

    /**
     * Parse a single tag definition (e.g., "div.class#id[content]")
     */
    function parseSingleTag(content) {
        const tagNameEnd = content.indexOf('[');
        if (tagNameEnd === -1) return null;

        const rawTagName = content.substring(0, tagNameEnd).trim();

        // Extract tag name, classes, and ID
        const { tagName, classes, id } = parseTagIdentifier(rawTagName);

        // Find matching closing bracket
        const innerContent = extractInnerContent(content, tagNameEnd);

        // Handle special tags
        if (tagName.toLowerCase() === 'img') {
            return createImageElement(innerContent, classes, id);
        } else if (tagName.toLowerCase() === 'a') {
            return createLinkElement(innerContent, classes, id);
        } else if (tagName.toLowerCase() === 'iframe') {
            return createIframeElement(innerContent);
        } else {
            return createGenericElement(tagName, innerContent, classes, id);
        }
    }

    /**
 * Parse tag identifier (e.g., "div.class1;class2#myid" or "div.class1.class2#myid")
 * Supports both dot and semicolon as class separators
 */
function parseTagIdentifier(rawTagName) {
    let tagName = "";
    let id = "";
    const classes = [];

    // First, extract ID if present
    let workingString = rawTagName;
    const hashIndex = workingString.indexOf('#');
    
    if (hashIndex !== -1) {
        id = workingString.substring(hashIndex + 1).trim();
        workingString = workingString.substring(0, hashIndex);
    }

    // Extract tag name (everything before first dot or semicolon)
    const firstDot = workingString.indexOf('.');
    const firstSemi = workingString.indexOf(';');
    
    let classStartIndex = -1;
    
    if (firstDot !== -1 && firstSemi !== -1) {
        classStartIndex = Math.min(firstDot, firstSemi);
    } else if (firstDot !== -1) {
        classStartIndex = firstDot;
    } else if (firstSemi !== -1) {
        classStartIndex = firstSemi;
    }

    if (classStartIndex !== -1) {
        tagName = workingString.substring(0, classStartIndex).trim();
        const classString = workingString.substring(classStartIndex + 1);
        
        // Split by both dots and semicolons
        const classNames = classString.split(/[.;]/).map(c => c.trim()).filter(c => c !== '');
        classes.push(...classNames);
    } else {
        tagName = workingString.trim();
    }

    return { tagName, classes, id };
}

    /**
     * Extract content between matching brackets
     */
    function extractInnerContent(content, startPos) {
        let bracketDepth = 1;
        let j = startPos + 1;

        while (j < content.length && bracketDepth > 0) {
            if (content[j] === '[') bracketDepth++;
            else if (content[j] === ']') bracketDepth--;
            j++;
        }

        return content.substring(startPos + 1, j - 1);
    }

    /**
     * Create image element with alt text and caption
     */
    function createImageElement(innerContent, classes, id) {
        const imgEl = document.createElement('img');
        let srcText = innerContent;
        let altText = '';
        let captionText = '';

        // Parse format: src{alt;caption}
        const altStart = innerContent.indexOf('{');
        if (altStart !== -1) {
            srcText = innerContent.substring(0, altStart).trim();
            const altEnd = innerContent.indexOf('}', altStart + 1);
            
            if (altEnd !== -1 && altEnd > altStart) {
                const altCaption = innerContent.substring(altStart + 1, altEnd).trim();
                const parts = altCaption.split(";", 2);
                altText = parts[0].trim();
                if (parts.length > 1) {
                    captionText = parts[1].trim();
                }
            }
        }

        imgEl.src = srcText;
        imgEl.alt = altText;
        if (captionText) {
            imgEl.setAttribute('data-caption', captionText);
        }
        
        classes.forEach(cls => imgEl.classList.add(cls));
        if (id) imgEl.id = id;

        console.log(`🖼️ Created image: src="${imgEl.src}", alt="${imgEl.alt}", caption="${captionText}"`);
        return imgEl;
    }

    /**
     * Create link element that opens in new tab
     */
    function createLinkElement(innerContent, classes, id) {
        const aEl = document.createElement('a');
        aEl.setAttribute('target', '_blank');

        // Parse format: text;url
        if (innerContent.indexOf(';') !== -1) {
            const parts = innerContent.split(";", 2);
            aEl.textContent = parts[0].trim();
            aEl.href = parts[1].trim();
        } else {
            aEl.textContent = innerContent;
            aEl.href = "#";
        }

        classes.forEach(cls => aEl.classList.add(cls));
        if (id) aEl.id = id;

        return aEl;
    }

    /**
     * Create responsive iframe element
     */
    function createIframeElement(innerContent) {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = innerContent;
        const iframe = tempContainer.firstElementChild;

        iframe.style.width = "100%";

        const originalWidth = iframe.getAttribute('width');
        const originalHeight = iframe.getAttribute('height');
        
        if (originalWidth && originalHeight) {
            iframe.style.aspectRatio = `${originalWidth} / ${originalHeight}`;
            iframe.removeAttribute('width');
            iframe.removeAttribute('height');
        }

        return iframe;
    }

    /**
     * Create generic HTML element
     */
    function createGenericElement(tagName, innerContent, classes, id) {
        const element = document.createElement(tagName);

        // Add default class for divs
        if (tagName.toLowerCase() === 'div') {
            element.classList.add('same-topic');
        }

        classes.forEach(cls => element.classList.add(cls));
        if (id) element.id = id;

        const childFragments = parseNestedContent(innerContent);
        childFragments.forEach(child => element.appendChild(child));

        return element;
    }

    /**
     * Parse nested content with curly braces
     */
    function parseNestedContent(text) {
        const fragments = [];
        let i = 0;

        while (i < text.length) {
            if (text[i] === '{') {
                const nestedElement = parseNestedBlock(text, i);
                if (nestedElement.element) {
                    fragments.push(nestedElement.element);
                    i = nestedElement.endIndex;
                } else {
                    i++;
                }
            } else {
                const textNode = extractPlainText(text, i);
                if (textNode.text) {
                    fragments.push(document.createTextNode(textNode.text));
                }
                i = textNode.endIndex;
            }
        }

        return fragments;
    }

    /**
     * Parse a nested block wrapped in curly braces
     */
    function parseNestedBlock(text, startIndex) {
        let curlyDepth = 1;
        let j = startIndex + 1;

        while (j < text.length && curlyDepth > 0) {
            if (text[j] === '{') curlyDepth++;
            else if (text[j] === '}') curlyDepth--;
            j++;
        }

        const nestedString = text.substring(startIndex + 1, j - 1);
        const bracketIdx = nestedString.indexOf('[');

        if (bracketIdx === -1) {
            return { element: null, endIndex: j };
        }

        const { tagName, classes, id } = parseNestedTagIdentifier(nestedString.substring(0, bracketIdx).trim());
        const nestedChildContent = nestedString.substring(bracketIdx + 1, nestedString.length - 1);

        let element = createNestedElement(tagName, nestedChildContent, classes, id);

        return { element, endIndex: j };
    }

    /**
 * Parse nested tag identifier
 * Supports both dot and semicolon as class separators
 */
function parseNestedTagIdentifier(rawTag) {
    let tagName = rawTag;
    let idName = '';
    const classes = [];

    // Extract ID first
    const hashIndex = rawTag.indexOf('#');
    if (hashIndex !== -1) {
        idName = rawTag.substring(hashIndex + 1).trim();
        rawTag = rawTag.substring(0, hashIndex);
    }

    // Extract tag name and classes
    const firstDot = rawTag.indexOf('.');
    const firstSemi = rawTag.indexOf(';');
    
    let classStartIndex = -1;
    
    if (firstDot !== -1 && firstSemi !== -1) {
        classStartIndex = Math.min(firstDot, firstSemi);
    } else if (firstDot !== -1) {
        classStartIndex = firstDot;
    } else if (firstSemi !== -1) {
        classStartIndex = firstSemi;
    }

    if (classStartIndex !== -1) {
        tagName = rawTag.substring(0, classStartIndex).trim();
        const classString = rawTag.substring(classStartIndex + 1);
        const classNames = classString.split(/[.;]/).map(c => c.trim()).filter(c => c !== '');
        classes.push(...classNames);
    } else {
        tagName = rawTag.trim();
    }

    return { tagName, classes, id: idName };
}

    /**
     * Create element from nested tag definition
     */
    function createNestedElement(tagName, content, classes, id) {
    const tag = tagName.toLowerCase();

    // Image element
    if (tag === 'img') {
        return createImageElement(content, classes, id);
    }

    // Link element
    if (tag === 'a') {
        return createLinkElement(content, classes, id);
    }

    // ✅ NEW: Iframe element (for nested contexts like carousels)
    if (tag === 'iframe') {
        return createIframeElement(content);
    }

    // Hover element (custom component)
    if (tag === 'hover') {
        return createHoverElement(content);
    }

    // Unordered list
    if (tag === 'ul') {
        return createListElement(content, classes, id);
    }

    // Compound tag (e.g., "p-em")
    if (tagName.indexOf('-') !== -1) {
        return createCompoundElement(tagName, content);
    }

    // Generic element
    const element = document.createElement(tagName);
    classes.forEach(cls => element.classList.add(cls));
    if (id) element.id = id;
    element.textContent = content;

    return element;
}

    /**
     * Create hover element with image
     */
    function createHoverElement(content) {
        const hoverEl = document.createElement('p');
        hoverEl.classList.add('hover');

        if (content.indexOf(';') !== -1) {
            const parts = content.split(";", 2);
            const textContent = parts[0].trim();
            const imgPath = parts[1].trim();

            hoverEl.textContent = textContent;

            const imgEl = document.createElement('img');
            imgEl.src = imgPath;
            imgEl.alt = "";
            imgEl.classList.add('hover-img');

            hoverEl.appendChild(imgEl);
        } else {
            hoverEl.textContent = content;
        }

        return hoverEl;
    }

    /**
     * Create list element from semicolon-separated items
     */
    function createListElement(content, classes, id) {
        const ul = document.createElement('ul');
        classes.forEach(cls => ul.classList.add(cls));
        if (id) ul.id = id;

        content.split(';')
            .map(item => item.trim())
            .filter(item => item !== '')
            .forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });

        return ul;
    }

    /**
     * Create compound element (e.g., p-em creates <p><em>content</em></p>)
     */
    function createCompoundElement(tagName, content) {
        const parts = tagName.split('-');
        const parentTag = parts[0].trim();
        const childTag = parts[1].trim();

        const parentEl = document.createElement(parentTag);
        const childEl = document.createElement(childTag);
        childEl.textContent = content;
        parentEl.appendChild(childEl);

        return parentEl;
    }

    /**
     * Extract plain text until next special character
     */
    function extractPlainText(text, startIndex) {
        const nextCurly = text.indexOf('{', startIndex);
        
        if (nextCurly === -1) {
            return {
                text: text.substring(startIndex),
                endIndex: text.length
            };
        }

        return {
            text: text.substring(startIndex, nextCurly),
            endIndex: nextCurly
        };
    }

    // =============================================================================
    // STYLING & THEMING
    // =============================================================================

    /**
     * Apply color theme based on project filter
     */
    function colouring(workProject) {
        console.log("=== Applying color theme ===");

        if (!workProject.filter) {
            console.warn("⚠️ No filter value found, skipping color theme");
            return;
        }

        const filterValue = workProject.filter.trim().toLowerCase();
        const chosenColor = getColorForFilter(filterValue);

        if (!chosenColor) {
            console.log("⚪ No matching color category");
            return;
        }

        console.log("Final chosen color:", chosenColor);

        // Apply colors to main elements
        applyColorToElements(chosenColor);

        // Inject dynamic CSS for hover effects
        injectDynamicStyles(chosenColor);

        // Observe future reflection elements
        // observeReflections(chosenColor);
    }

    /**
     * Get color based on filter category
     */
    function getColorForFilter(filterValue) {
        const colorMap = {
            'ux': 'var(--red)',
            'branding': 'var(--yellow-buttermilk)',
            'service-design': 'var(--green)',
            'game-design': 'var(--pink)',
            'creative-coding': 'var(--blue-light)'
        };

        let color = null;

        for (const [key, value] of Object.entries(colorMap)) {
            if (filterValue.startsWith(key)) {
                color = value;
                break;
            }
        }

        // Resolve CSS variable
        if (color && color.startsWith('var(')) {
            const varName = color.slice(4, -1).trim();
            const computedValue = getComputedStyle(document.documentElement)
                .getPropertyValue(varName).trim();
            return computedValue;
        }

        return color;
    }

    /**
     * Apply color to various page elements
     */
    function applyColorToElements(color) {
        // Set CSS custom property for dynamic elements
        document.documentElement.style.setProperty('--project-accent-color', color);        
        
        // Main elements
        const returnToHome = document.getElementById('return-to-home');

        if (returnToHome) returnToHome.style.backgroundColor = color;

        // Reflection elements
        const reflections = document.querySelectorAll('.para .reflection');
        console.log("Applying color to", reflections.length, "reflection elements");
        
        reflections.forEach((el, index) => {
            
        });

        // Underline elements
        const underlineElements = document.querySelectorAll('.underline');
        console.log("Applying color to", underlineElements.length, "underline elements");
        
        underlineElements.forEach(el => {
            el.style.backgroundColor = color;
        });

        // Active navigation indicator - inject dynamic CSS for ::before pseudo-element
        const navActiveStyle = document.createElement('style');
        navActiveStyle.id = 'nav-active-color-style';
        navActiveStyle.innerHTML = `
            #project-nav ul li a.active::before {
                background-color: ${color} !important;
            }

            #project-nav ul li a:hover{
            border-left: 2px solid ${color} !important;
          }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('nav-active-color-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(navActiveStyle);
        console.log("Applied active nav color:", color);
    }

    /**
     * Inject dynamic CSS styles
     */
    function injectDynamicStyles(color) {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `.para a:hover { color: ${color} !important; }`;
        document.head.appendChild(styleEl);
        console.log("Injected dynamic CSS for link hover effects");
    }

    /**
     * Observe and color future reflection elements
     */
    function observeReflections(color) {
        const targetNode = document.getElementById('project-content');
        if (!targetNode) return;

        const config = { childList: true, subtree: true };
        
        const callback = (mutationsList, observer) => {
            const newReflections = document.querySelectorAll('.para .reflection');
            console.log("MutationObserver: Found", newReflections.length, "reflections");
            
            newReflections.forEach(el => {
                el.style.backgroundColor = color;
                el.style.borderWidth = "20px";
                el.style.borderStyle = "solid";
                el.style.borderColor = color;
            });
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    
    // =============================================================================
    // IMAGE GALLERIES & CAROUSELS
    // =============================================================================

    /**
     * Initialize multi-image carousels
     */
    function initCarousels() {
        const carousels = document.querySelectorAll('.multi-carousel');
        console.log("Initializing", carousels.length, "carousel(s)");
        carousels.forEach(carousel => initCarousel(carousel));
    }

    /**
     * Initialize a single carousel
     */
    function initCarousel(carousel) {
        // Wrap images in containers
        const images = Array.from(carousel.querySelectorAll('img'));
        images.forEach(img => {
            if (!img.parentElement.classList.contains('thumbnail-container')) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('thumbnail-container');
                
                const underline = document.createElement('div');
                underline.classList.add('underline');
                
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
                wrapper.appendChild(underline);
            }
        });

        // Create flexbox container for carousel and display window
        const flexContainer = document.createElement('div');
        flexContainer.classList.add('carousel-flex-container');

        // Check if this carousel is in a "Design Decisions" section
        const parentPara = carousel.closest('.para');
        let isDesignDecisions = false;
        
        if (parentPara) {
            const h2 = parentPara.querySelector('h2');
            if (h2 && h2.textContent.includes('Design Decisions')) {
                isDesignDecisions = true;
                flexContainer.classList.add('design-decisions');
            }
        }

        console.log(`Carousel in "${parentPara?.querySelector('h2')?.textContent || 'unknown'}" section - Design Decisions: ${isDesignDecisions}`);

        // Create display window
        const displayWindow = createDisplayWindow();

        // Insert flex container after carousel
        carousel.insertAdjacentElement('afterend', flexContainer);

        // Move carousel into flex container
        flexContainer.appendChild(carousel);

        // Add display window to flex container (appears after carousel in DOM)
        flexContainer.appendChild(displayWindow);

        // Add expand/collapse toggle for Design Decisions sections
        if (isDesignDecisions) {
            const toggleButton = createExpandToggle();
            // Insert toggle BEFORE the flex container, not inside it
            flexContainer.insertAdjacentElement('beforebegin', toggleButton);
            setupExpandToggle(toggleButton, flexContainer, displayWindow);
        }

        // Add event listeners
        setupCarouselEvents(carousel, displayWindow, images);

        // Show first image
        if (images.length > 0) {
            updateDisplay(carousel, displayWindow, 0);
            displayWindow.classList.remove('hidden');
            displayWindow.classList.add('visible');
        }

        console.log("✅ Carousel initialized with", images.length, "images", isDesignDecisions ? "(column layout)" : "(row layout)");
    }
    
/**
 * Create expand/collapse toggle button
 */
function createExpandToggle() {
    const toggle = document.createElement('div');
    toggle.classList.add('carousel-view-toggle');
    toggle.innerHTML = `
        <label class="toggle-option">
            <input type="radio" name="carousel-view" value="condensed" checked>
            <span class="toggle-label">Condensed view</span>
        </label>
        <label class="toggle-option">
            <input type="radio" name="carousel-view" value="expanded">
            <span class="toggle-label">See all</span>
        </label>
        <div class="toggle-underline"></div>
    `;
    return toggle;
}

/**
 * Setup expand/collapse toggle functionality
 */
function setupExpandToggle(toggleButton, flexContainer, displayWindow) {
    const carousel = flexContainer.querySelector('.multi-carousel');
    const radios = toggleButton.querySelectorAll('input[type="radio"]');
    const underline = toggleButton.querySelector('.toggle-underline');
    const labels = toggleButton.querySelectorAll('.toggle-option');
    let soloContainer = null;
    let originalThumbnails = [];

    // Position underline on initial load
    requestAnimationFrame(() => {
        updateUnderlinePosition(labels[0], underline);
    });

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const isExpanded = this.value === 'expanded';
            const activeLabel = this.closest('.toggle-option');
            
            // Animate underline
            updateUnderlinePosition(activeLabel, underline);

            if (isExpanded) {
                // --- EXPAND: Convert to solo images ---
                
                // Hide display window
                displayWindow.style.display = 'none';
                
                // Store original thumbnails
                originalThumbnails = Array.from(carousel.querySelectorAll('.thumbnail-container'));
                
                // Create container for solo images
                soloContainer = document.createElement('div');
                soloContainer.classList.add('solo-images-container');
                
                // Convert each thumbnail to solo image
                originalThumbnails.forEach(thumb => {
                    const img = thumb.querySelector('img');
                    if (!img) return;
                    
                    // Create wrapper for zoom overflow handling
                    const imgWrapper = document.createElement('div');
                    imgWrapper.classList.add('solo-image-wrapper');
                    
                    // Clone the image
                    const soloImg = img.cloneNode(true);
                    soloImg.classList.add('solo');
                    
                    // Add to wrapper
                    imgWrapper.appendChild(soloImg);
                    
                    // Add wrapper to solo container
                    soloContainer.appendChild(imgWrapper);
                    
                    // Setup zoom on this solo image
                    setupImageZoom(soloImg, imgWrapper);
                    
                    // Add caption if exists
                    const caption = img.getAttribute('data-caption');
                    if (caption) {
                        const captionP = document.createElement('p');
                        captionP.classList.add('solo-caption');
                        captionP.textContent = caption;
                        soloContainer.appendChild(captionP);
                    }
                });
                
                // Hide carousel and insert solo images
                carousel.style.display = 'none';
                flexContainer.appendChild(soloContainer);
                
                console.log("📖 Carousel expanded - images converted to solo with zoom enabled");
                
            } else {
                // --- COLLAPSE: Restore carousel ---
                
                // Show display window
                displayWindow.style.display = '';
                
                // Remove solo container
                if (soloContainer) {
                    soloContainer.remove();
                    soloContainer = null;
                }
                
                // Show carousel
                carousel.style.display = '';
                
                console.log("📕 Carousel condensed - restored to carousel view");
            }
        });
    });
}

/**
 * Update underline position with smooth animation
 */
function updateUnderlinePosition(activeLabel, underline) {
    const labelRect = activeLabel.getBoundingClientRect();
    const parentRect = activeLabel.parentElement.getBoundingClientRect();
    
    const left = activeLabel.offsetLeft;
    const width = activeLabel.offsetWidth;
    
    underline.style.left = `${left}px`;
    underline.style.width = `${width}px`;
}

/**
 * Create display window for carousel
 */
function createDisplayWindow() {
    const displayWindow = document.createElement('div');
    displayWindow.classList.add('display-window', 'hidden');

    // Create wrapper for zoom containment
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('displayed-img-wrapper');

    const displayImg = document.createElement('img');
    displayImg.classList.add('displayed-img');

    imgWrapper.appendChild(displayImg);

    // Create caption container with counter and caption
    const captionContainer = document.createElement('div');
    captionContainer.classList.add('caption-container');

    const counter = document.createElement('span');
    counter.classList.add('display-counter');

    const caption = document.createElement('p');
    caption.classList.add('display-caption');

    captionContainer.appendChild(counter);
    captionContainer.appendChild(caption);

    displayWindow.appendChild(imgWrapper);
    displayWindow.appendChild(captionContainer);

    return displayWindow;
}

/**
 * Setup carousel event listeners
 */
function setupCarouselEvents(carousel, displayWindow, images) {
    const thumbnails = carousel.querySelectorAll('.thumbnail-container');

    thumbnails.forEach((thumb, idx) => {
        thumb.addEventListener('click', function(e) {
            e.stopPropagation();
            updateDisplay(carousel, displayWindow, idx);
        });
    });

    // Setup zoom on display image (use wrapper as container)
    const displayImg = displayWindow.querySelector('.displayed-img');
    const imgWrapper = displayWindow.querySelector('.displayed-img-wrapper');
    setupImageZoom(displayImg, imgWrapper);
}

/**
 * Update zoom transform origin based on mouse position
 */
function updateZoomOrigin(img, e) {
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
}

/**
 * Update zoom transform origin based on touch position
 */
function updateZoomOriginFromTouch(img, touch) {
    const rect = img.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
}

/**
 * Calculate distance between two touch points
 */
function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Setup zoom functionality for an image element
 */
function setupImageZoom(img, container) {
    let isZoomed = false;
    let leaveTimeout;
    let lastTap = 0;
    let initialDistance = 0;
    let currentScale = 1;

    // Helper to set global zoom state
    function setGlobalZoomState(zoomed) {
        isZoomed = zoomed;
        if (zoomed) {
            document.body.classList.add('image-zoomed');
        } else {
            document.body.classList.remove('image-zoomed');
        }
    }

    // Desktop: Click to zoom in/out
    img.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (isZoomed) {
            // Zoom out
            img.classList.remove('zoomed');
            img.style.transform = '';
            setGlobalZoomState(false);
            img.style.transformOrigin = 'center center';
        } else {
            // Zoom in at click position
            updateZoomOrigin(img, e);
            img.classList.add('zoomed');
            setGlobalZoomState(true);
        }
    });

    // Desktop: Track mouse movement when zoomed
    img.addEventListener('mousemove', (e) => {
        if (isZoomed) {
            updateZoomOrigin(img, e);
        }
    });

    // Desktop: Reset zoom when mouse leaves for 1.5s
    img.addEventListener('mouseleave', () => {
        if (isZoomed) {
            leaveTimeout = setTimeout(() => {
                img.classList.remove('zoomed');
                img.style.transform = '';
                setGlobalZoomState(false);
                img.style.transformOrigin = 'center center';
            }, 1500);
        }
    });

    // Desktop: Cancel reset if mouse re-enters
    img.addEventListener('mouseenter', () => {
        clearTimeout(leaveTimeout);
    });

    // Desktop: Click outside image to reset zoom (on container)
    if (container) {
        container.addEventListener('click', (e) => {
            if (e.target !== img && isZoomed) {
                img.classList.remove('zoomed');
                img.style.transform = '';
                setGlobalZoomState(false);
                img.style.transformOrigin = 'center center';
            }
        });
    }

    // Mobile: Double tap to zoom
    img.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            e.preventDefault();
            
            if (isZoomed) {
                img.classList.remove('zoomed');
                img.style.transform = '';
                setGlobalZoomState(false);
                img.style.transformOrigin = 'center center';
                currentScale = 1;
            } else {
                // Zoom in at tap position
                const touch = e.changedTouches[0];
                updateZoomOriginFromTouch(img, touch);
                img.classList.add('zoomed');
                setGlobalZoomState(true);
            }
        }
        lastTap = currentTime;
    });

    // Mobile: Pinch to zoom
    img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getPinchDistance(e.touches);
            
            // Set transform origin to center of pinch
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const rect = img.getBoundingClientRect();
            const x = ((centerX - rect.left) / rect.width) * 100;
            const y = ((centerY - rect.top) / rect.height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        }
    }, { passive: false });

    img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getPinchDistance(e.touches);
            const scale = currentDistance / initialDistance;
            
            currentScale = Math.min(Math.max(scale, 1), 3); // Clamp between 1 and 3
            img.style.transform = `scale(${currentScale})`;
            
            if (currentScale > 1) {
                setGlobalZoomState(true);
                img.classList.add('zoomed');
            }
        }
    }, { passive: false });

    img.addEventListener('touchend', (e) => {
        if (e.touches.length === 0 && currentScale !== 1) {
            // Snap to either zoomed (scale 2) or normal (scale 1)
            if (currentScale < 1.5) {
                img.style.transform = '';
                img.classList.remove('zoomed');
                setGlobalZoomState(false);
                currentScale = 1;
            } else {
                img.style.transform = 'scale(2)';
                currentScale = 2;
            }
        }
    });

    return {
        resetZoom: () => {
            img.classList.remove('zoomed');
            img.style.transform = '';
            setGlobalZoomState(false);
            currentScale = 1;
            img.style.transformOrigin = 'center center';
        }
    };
}

/**
 * Calculate distance between two touch points
 */
function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Update carousel display to show specific image
 */
function updateDisplay(carousel, displayWindow, index) {
    const images = Array.from(carousel.querySelectorAll('img'));
    if (index < 0 || index >= images.length) return;

    const displayImg = displayWindow.querySelector('.displayed-img');
    const caption = displayWindow.querySelector('.display-caption');
    const counter = displayWindow.querySelector('.display-counter');

    displayImg.src = images[index].src;
    displayImg.setAttribute('data-index', index);
    caption.textContent = images[index].getAttribute('data-caption') || "";
    
    // Update counter (index + 1 for human-readable numbering)
    counter.textContent = `${index + 1} / ${images.length}`;

    // Update thumbnail selection
    const thumbnails = carousel.querySelectorAll('.thumbnail-container');
    thumbnails.forEach((thumb, idx) => {
        thumb.classList.toggle('selected', idx === index);
        const underline = thumb.querySelector('.underline');
        if (underline) {
            underline.style.display = idx === index ? 'block' : 'none';
        }
    });

    displayWindow.classList.remove('hidden');
    displayWindow.classList.add('visible');

    console.log("Updated carousel display to image", index + 1, "of", images.length);
}

    /**
 * Initialize prototypes carousel with special behavior
 */
function initPrototypesCarousel() {
    const prototypes = document.querySelector('#project-content .prototypes-mobile, #project-content .prototypes-mac');
    if (!prototypes) {
        console.log("No prototypes carousel found");
        return;
    }

    // Wrap images
    const imgs = Array.from(prototypes.querySelectorAll('img'));
    imgs.forEach(img => {
        if (!img.parentElement.classList.contains('prototype-container')) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('prototype-container');
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
        }
    });

    // Create caption container with counter and caption
    let captionContainer = document.querySelector('.prototypes-caption-container');
    if (!captionContainer) {
        captionContainer = document.createElement('div');
        captionContainer.classList.add('prototypes-caption-container');

        const counter = document.createElement('span');
        counter.classList.add('prototypes-counter');

        const caption = document.createElement('p');
        caption.classList.add('prototypes-caption');

        captionContainer.appendChild(counter);
        captionContainer.appendChild(caption);

        prototypes.insertAdjacentElement('afterend', captionContainer);
    }

    // Setup event listeners
    setupPrototypesEvents(imgs, captionContainer, prototypes);

    // Initialize with first image selected
    if (imgs.length > 0) {
        setPrototypesSelected(0, imgs, captionContainer);
    }

    console.log("✅ Prototypes carousel initialized");
}

    /**
     * Setup prototypes carousel events
     */
    function setupPrototypesEvents(imgs, captionContainer, prototypes) {
        // Mouse and click events
        imgs.forEach((img, index) => {
            img.addEventListener('mouseenter', () => {
                setPrototypesSelected(index, imgs, captionContainer);
            });
            img.addEventListener('click', () => {
                setPrototypesSelected(index, imgs, captionContainer);
            });
        });

        // Scroll event
        let scrollTimeout;
        prototypes.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updatePrototypesSelectionOnScroll(prototypes, captionContainer);
            }, 100);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            handlePrototypesKeyboardNav(e, imgs, captionContainer, prototypes);
        });
    }

    /**
 * Set selected prototype image
 */
function setPrototypesSelected(selectedIndex, imgs, captionContainer) {
    const counter = captionContainer.querySelector('.prototypes-counter');
    const caption = captionContainer.querySelector('.prototypes-caption');

    imgs.forEach((img, idx) => {
        if (idx === selectedIndex) {
            img.classList.add('selected');
            caption.textContent = img.getAttribute('data-caption') || "";
            counter.textContent = `${selectedIndex + 1} / ${imgs.length}`;
        } else {
            img.classList.remove('selected');
        }
    });
}

    /**
     * Update prototypes selection based on scroll position
     */
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

    /**
     * Handle keyboard navigation for prototypes
     */
    function handlePrototypesKeyboardNav(e, imgs, captionContainer, prototypes) {
        const rect = prototypes.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleRatio = visibleHeight / rect.height;

        // Only handle if at least 30% visible
        if (visibleRatio < 0.3) return;

        let currentIndex = imgs.findIndex(img => img.classList.contains('selected'));
        if (currentIndex === -1) currentIndex = 0;

        if (e.key === "ArrowLeft") {
            currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
            setPrototypesSelected(currentIndex, imgs, captionContainer);
            imgs[currentIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        } else if (e.key === "ArrowRight") {
            currentIndex = (currentIndex + 1) % imgs.length;
            setPrototypesSelected(currentIndex, imgs, captionContainer);
            imgs[currentIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }
    }

    /**
     * Add captions to solo images
     */
    function addSoloCaptions() {
        const soloImages = document.querySelectorAll('img.solo');
        
        soloImages.forEach(img => {
            const captionText = img.getAttribute('data-caption');
            if (captionText) {
                const captionP = document.createElement('p');
                captionP.classList.add('solo-caption');
                captionP.textContent = captionText;
                img.parentNode.insertBefore(captionP, img.nextSibling);
            }
        });

        console.log("Added captions for", soloImages.length, "solo images");
    }

    // =============================================================================
    // KEYBOARD NAVIGATION (GLOBAL)
    // =============================================================================

    /**
     * Global keyboard navigation for carousels
     */
    document.addEventListener('keydown', function(event) {
        const activeDisplays = Array.from(document.querySelectorAll('.display-window.visible'));
        if (!activeDisplays.length) return;

        // Find display in viewport
        let targetDisplay = activeDisplays.find(display => {
            const rect = display.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        });

        if (!targetDisplay) targetDisplay = activeDisplays[0];

        const carousel = targetDisplay.previousElementSibling;
        if (!carousel || !carousel.classList.contains('multi-carousel')) return;

        const images = Array.from(carousel.querySelectorAll('img'));
        if (images.length === 0) return;

        const currentIndex = parseInt(targetDisplay.querySelector('.displayed-img').getAttribute('data-index')) || 0;
        let newIndex = currentIndex;

        if (event.key === "ArrowLeft" && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (event.key === "ArrowRight" && currentIndex < images.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return;
        }

        updateDisplay(carousel, targetDisplay, newIndex);
    });

    // =============================================================================
    // ANIMATIONS
    // =============================================================================

    /**
     * Animate sections on scroll
     */
    function animateOnScroll() {
        const paras = document.querySelectorAll('.para');
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.03
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        paras.forEach(para => observer.observe(para));
    }

    // =============================================================================
    // MOBILE SPECIFIC
    // =============================================================================

    /**
     * Initialize mobile-specific features
     */
    function initMobileFeatures() {
        if (window.innerWidth >= 800) return;

        // Auto-select first carousel image
        const multiCarousel = document.querySelector('.multi-carousel');
        if (multiCarousel) {
            const displayWindow = document.getElementById('display-window');
            if (displayWindow) {
                displayWindow.classList.remove('hidden');
                displayWindow.classList.add('visible');
            }
        }
    }

    

    // =============================================================================
    // FEATURE INITIALIZATION
    // =============================================================================

    /**
     * Initialize all features after content is loaded
     */
    function initializeFeatures() {
        setTimeout(() => {
            initCarousels();
            initPrototypesCarousel();
            addSoloCaptions();
            populateNavigationBar();
            animateOnScroll();
            initMobileFeatures();
        }, 500);
    }
});