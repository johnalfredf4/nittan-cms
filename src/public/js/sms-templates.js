const API_BASE_URL = '/api/sms-templates';

// Load user name
document.getElementById('userLabel').innerText = localStorage.getItem('username') || '';

// Load templates when page loads
document.addEventListener('DOMContentLoaded', loadTemplates);

async function loadTemplates() {
    const rows = document.getElementById('smsTemplateRows');
    rows.innerHTML = 'Loading...';

    try {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();

        if (!data.length) {
            rows.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">No templates found</td></tr>';
            return;
        }

        rows.innerHTML = data.map(t => `
            <tr class="border-b">
                <td class="py-2">${t.templateCode}</td>
                <td class="py-2">${t.title}</td>
                <td class="py-2">${t.isActive ? 'Active' : 'Inactive'}</td>
                <td class="py-2">
                    <button onclick="editTemplate(${t.id})" class="text-blue-600">Edit</button>
                     |
                    <button onclick="toggleActive(${t.id})" class="text-indigo-600">
                        ${t.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                     |
                    <button onclick="deleteTemplate(${t.id})" class="text-red-600">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading templates', err);
        rows.innerHTML = '<tr><td colspan="4" class="text-red-600 p-4">Failed to load data</td></tr>';
    }
}

function editTemplate(id) {
    location.href = `sms-template-form.html?id=${id}`;
}

async function deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

    loadTemplates();
}

async function toggleActive(id) {
    await fetch(`${API_BASE_URL}/${id}/toggle-active`, { method: 'PATCH' });
    loadTemplates();
}
