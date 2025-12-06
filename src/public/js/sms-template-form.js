const API_BASE_URL = '/api/sms-templates';
const form = document.getElementById('smsTemplateForm');
const idInput = document.getElementById('id');

document.getElementById('userLabel').innerText = localStorage.getItem('username') || '';

document.addEventListener('DOMContentLoaded', loadTemplateForEdit);

async function loadTemplateForEdit() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has('id')) return; // new mode

    const id = params.get('id');
    idInput.value = id;

    const res = await fetch(`${API_BASE_URL}/${id}`);
    const data = await res.json();

    document.getElementById('templateCode').value = data.templateCode;
    document.getElementById('title').value = data.title;
    document.getElementById('message').value = data.message;
    document.getElementById('isActive').checked = data.isActive;
}

form.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
        templateCode: document.getElementById('templateCode').value,
        title: document.getElementById('title').value,
        message: document.getElementById('message').value,
        isActive: document.getElementById('isActive').checked,
    };

    const id = idInput.value;

    // Decide if Create or Update
    let endpoint = API_BASE_URL;
    let method = 'POST';

    if (id) {
        endpoint = `${API_BASE_URL}/${id}`;
        method = 'PATCH';
    }

    const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Template saved!');
        location.href = 'sms-templates.html';
    } else {
        const result = await res.json();
        alert('Error: ' + result.message);
    }
});
