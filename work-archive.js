document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 4;
    let currentPage = 1;
    const tableBody = document.querySelector('#archive-table tbody');
    const pageNumbers = document.querySelector('#page-numbers');
    const prevButton = document.querySelector('#prev');
    const nextButton = document.querySelector('#next');
    const filterButtons = document.querySelectorAll('#work-archive button');
    const nav = document.querySelector('nav');

    let data = [];
    let filteredData = []; // To store the filtered rows

    // Fetch CSV data
    function fetchData() {
        Papa.parse('work-archive.csv', {
            download: true,
            header: true,
            complete: function(results) {
                data = results.data;
                filteredData = data; // Initialize filteredData with all data
                renderTable(currentPage);
            }
        });
    }

    function renderTable(page) {
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = filteredData.slice(start, end); // Use filteredData

        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            const skillset = row.skillset.split(';').map(skill => skill.trim()).join(', ');
            tr.innerHTML = `
                <td>${row['end-date']}</td>
                <td class="proj-title">
                    ${row.title}
                    <img src="${row['hero-img']}" class="hero-img" alt="${row.title}">
                </td>
                <td>${row.description}</td>
                <td>${skillset}</td>
            `;
            tr.addEventListener('mouseover', () => {
                console.log('Row filter value:', row.filter); // Debug the filter value
                if (row.filter.startsWith('UX')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--red)';
                    nav.style.backgroundColor = 'var(--red)';
                } else if (row.filter.startsWith('branding')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--yellow-buttermilk)';
                    nav.style.backgroundColor = 'var(--yellow-buttermilk)';
                } else if (row.filter.startsWith('service-design')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--green)';
                    nav.style.backgroundColor = 'var(--green)';
                } else if (row.filter.startsWith('game-design')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--pink)';
                    nav.style.backgroundColor = 'var(--pink)';
                } else if (row.filter.startsWith('creative-coding')) {
                    document.body.style.transition = 'background-color 0.5s';
                    nav.style.transition = 'background-color 0.5s';
                    document.body.style.backgroundColor = 'var(--blue-light)';
                    nav.style.backgroundColor = 'var(--blue-light)';
                }
            });
            
            tr.addEventListener('mouseout', () => {
                document.body.style.transition = 'background-color 0.5s';
                nav.style.transition = 'background-color 0.5s';
                document.body.style.backgroundColor = 'var(--white)';
                nav.style.backgroundColor = 'var(--white)';
            });
            tableBody.appendChild(tr);
        });

        renderPagination();
    }

    // Render pagination
    function renderPagination() {
        pageNumbers.innerHTML = '';
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    // Filter data based on the button clicked
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.id.toLowerCase(); // Button ID corresponds to filter value
            if (filter === 'all-work') {
                filteredData = [...data]; // Show all rows
            } else if (filter === 'favourite') {
                filteredData = data.filter(row => row.remarked.toLowerCase() === 'yes');
                console.log('favs');
            } else {
                filteredData = data.filter(row =>
                    row.filter && row.filter.toLowerCase().includes(filter)
                );
            }

            // Reset to the first page and re-render the table
            currentPage = 1;
            renderTable(currentPage);
        });
    });

    // Pagination buttons

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
        }
    });

    fetchData();
});

