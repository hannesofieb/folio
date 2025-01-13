document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 4;
    let currentPage = 1;
    const tableBody = document.querySelector('#archive-table tbody');
    const pageNumbers = document.querySelector('#page-numbers');
    const prevButton = document.querySelector('#prev');
    const nextButton = document.querySelector('#next');

    const data = [
        // Example data, replace with actual data
        { date: '2023-01-01', title: 'Project 1', about: 'Description 1: this is a little test to see how it deals with more than one line of text and how that will reflect on the look of everything. Will it ever start and use multiple "rows" underneath? Hmm seems like i need to give each column a set width', tags: 'Tag1, Tag2', link: '#' },
        { date: '2023-02-01', title: 'Project 2', about: 'Description 2', tags: 'Tag3, Tag4', link: '#' },
        { date: '2023-03-01', title: 'Project 3', about: 'Description 3', tags: 'Tag5, Tag6', link: '#' },
        { date: '2023-04-01', title: 'Project 4', about: 'Description 4', tags: 'Tag7, Tag8', link: '#' },
        { date: '2023-05-01', title: 'Project 5', about: 'Description 5', tags: 'Tag9, Tag10', link: '#' },
        { date: '2023-06-01', title: 'Project 6', about: 'Description 6', tags: 'Tag11, Tag12', link: '#' },
        { date: '2023-07-01', title: 'Project 7', about: 'Description 7', tags: 'Tag13, Tag14', link: '#' },
        { date: '2023-08-01', title: 'Project 8', about: 'Description 8', tags: 'Tag15, Tag16', link: '#' },
    ];

    function renderTable(page) {
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.title}</td>
                <td>${row.about}</td>
                <td>${row.tags}</td>
            `;
            tableBody.appendChild(tr);
        });

        renderPagination();
    }

    function renderPagination() {
        pageNumbers.innerHTML = '';
        const totalPages = Math.ceil(data.length / rowsPerPage);

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

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(data.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
        }
    });

    renderTable(currentPage);
});

