async function loadWorkload() {
  const params = new URLSearchParams();

  if (agentId.value) params.append('agentId', agentId.value);
  if (status.value) params.append('status', status.value);
  if (minDpd.value) params.append('minDpd', minDpd.value);
  if (maxDpd.value) params.append('maxDpd', maxDpd.value);

  const res = await fetch(`${API}?${params.toString()}`);

  if (!res.ok) {
    console.error('Failed to load workload');
    return;
  }

  const rows = await res.json();
  const tbody = document.getElementById('workloadRows');
  tbody.innerHTML = '';

  if (!Array.isArray(rows) || rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-6 text-gray-400">
          No records found
        </td>
      </tr>
    `;
    return;
  }

  rows.forEach(r => {
    tbody.innerHTML += `
      <tr class="border-t">
        <td class="px-3 py-2">${r.assignmentId}</td>

        <td class="px-3 py-2">
          ${r.agentFullName ?? r.agentId}
        </td>

        <!-- ✅ Acct (ApplicationCode) -->
        <td class="px-3 py-2 font-medium text-green-800">
          ${r.acct ?? '-'}
        </td>

        <td class="px-3 py-2">${r.dpd}</td>
        <td class="px-3 py-2">${r.dpdCategory}</td>

        <td class="px-3 py-2">
          ${r.retentionDays ?? '-'}
        </td>

        <td class="px-3 py-2">${r.status}</td>

        <td class="px-3 py-2">
          <button
            onclick="openModal(
              ${r.assignmentId},
              '${r.agentFullName ?? ''}',
              ${r.agentId}
            )"
            class="text-green-700 hover:underline text-sm"
          >
            Reassign
          </button>
        </td>
      </tr>
    `;
  });
}
