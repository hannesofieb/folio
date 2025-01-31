document.addEventListener('DOMContentLoaded', function() {
    Papa.parse('/path/to/projects.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const projects = results.data;
            const projectId = getProjectIdFromURL();
            const project = projects.find(p => p['project-id'] === projectId);

            if (project) {
                document.getElementById('project-title').textContent = project['remarked'];
                document.getElementById('period').textContent = `Timeline: ${project['start-date']} - ${project['end-date']}`;
                document.getElementById('brief-info').textContent = project['overview'];

                populateList('roles', project['roles']);
                populateList('tools', project['tools']);
                populateList('remarks', project['remarked']);
            }
        }
    });

    function getProjectIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('project-id');
    }

    function populateList(elementId, items) {
        const listElement = document.querySelector(`#${elementId} ul`);
        if (items) {
            items.split(';').forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                listElement.appendChild(listItem);
            });
        } else {
            document.getElementById(elementId).style.display = 'none';
        }
    }
});
