const API = 'http://localhost:3000/loanreceivable-assignment/retention-rules';


async function loadRules() {
  const res = await fetch(API);

  if (!res.ok) {
    console.error('Failed to load retention rules', await res.text());
    return;
  }

  const rules = await res.json();

  if (!Array.isArray(rules)) {
    console.error('Expected array, got:', rules);
    return;
  }

  const tbody = document.getElementById('retentionRows');
  tbody.innerHTML = '';

  rules.forEach(r => {
    tbody.innerHTML += `
      <tr class="border-t">
        <td class="px-3 py-2">${r.categoryCode}</td>
        <td class="px-3 py-2">${r.dpdMin} – ${r.dpdMax}</td>
        <td class="px-3 py-2">${r.retentionDays}</td>
        <td class="px-3 py-2">${r.label || ''}</td>
        <td class="px-3 py-2">
          <span class="${r.isActive ? 'text-green-600' : 'text-red-500'}">
            ${r.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    `;
  });
}

async function toggle(id, isActive) {
  await fetch(`${API}/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  loadRules();
}

async function removeRule(id) {
  if (!confirm('Delete this rule?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadRules();
}

loadRules();
