window.onload = async () => {
    await loadQueue();
};

async function loadQueue() {
    // backend must use req.user.id
    const res = await fetch('/api/loan-assignments/my-queue');
    const rows = await res.json();

    const tbody = document.getElementById('myQueueRows');
    tbody.innerHTML = '';

    rows.forEach(row => {
        tbody.innerHTML += `
        <tr class="border-b ${row.dpd > 0 ? 'bg-red-100' : ''}">
            <td class="px-2 py-2">${row.loanApplicationId}</td>
            <td class="px-2 py-2">${formatDate(row.dueDate)}</td>
            <td class="px-2 py-2 font-semibold">${row.dpd}</td>
            <td class="px-2 py-2">${row.accountClass}</td>
        </tr>
        `;
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}
