document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('archive-table');

    table.addEventListener('click', function(event) {
        const row = event.target.closest('tr');
        if (row) {
            const projectTitleElement = row.querySelector('.proj-title'); // ✅ Use correct class
            if (projectTitleElement) {
                const projectTitle = projectTitleElement.textContent.trim(); // ✅ Trim to remove whitespace
                fetchProjectId(projectTitle);
            } else {
                console.error('Project title element not found in the row.');
            }
        }
    });

    function fetchProjectId(title) {
        Papa.parse('work-archive.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const project = results.data.find(p => p.title.trim() === title);
                if (project) {
                    const projectId = project['project-id'];
                    window.location.href = `project.html?project-id=${projectId}`;
                } else {
                    console.error(`Project "${title}" not found in CSV.`);
                }
            }
        });
    }
});
