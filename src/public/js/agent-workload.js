const API = '/loanreceivable-assignment/agent-workload';
const agentId = document.getElementById('agentId');
const status = document.getElementById('status');
const minDpd = document.getElementById('minDpd');
const maxDpd = document.getElementById('maxDpd');

const workloadRows = document.getElementById('workloadRows');

const reassignModal = document.getElementById('reassignModal');
const assignmentId = document.getElementById('assignmentId');
const toAgentId = document.getElementById('toAgentId');

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

async function loadAgents() {
  const select = document.getElementById('agentId');
  if (!select) {
    console.warn('agentId select not found');
    return;
  }

  const res = await fetch(`${API}/agents`);
  if (!res.ok) return;

  const agents = await res.json();

  agents.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.agentId;
    opt.textContent = a.fullName;
    select.appendChild(opt);
  });
}


function openModal(id, agentName, agentIdValue) {
  assignmentId.value = id;

  // Show current agent
  const currentAgentDiv = document.getElementById('currentAgent');
  if (currentAgentDiv) {
    currentAgentDiv.textContent = `${agentName} (ID: ${agentIdValue})`;
  }

  // Load dropdown excluding current agent
  loadReassignAgents(agentIdValue);

  reassignModal.classList.remove('hidden');
  reassignModal.classList.add('flex');
}


function closeModal() {
  reassignModal.classList.add('hidden');
  reassignModal.classList.remove('flex');
}

async function loadReassignAgents(currentAgentId) {
  if (!toAgentId) return;

  const res = await fetch(`${API}/agents`);
  if (!res.ok) return;

  const agents = await res.json();
  toAgentId.innerHTML = '<option value="">Select Agent</option>';

  agents.forEach(a => {
    // Prevent reassigning to same agent
    if (a.agentId === currentAgentId) return;

    const opt = document.createElement('option');
    opt.value = a.agentId;
    opt.textContent = `${a.fullName} (ID: ${a.agentId})`;
    toAgentId.appendChild(opt);
  });
}



async function confirmReassign() {
  const payload = {
    assignmentId: Number(assignmentId.value),
    toAgentId: Number(toAgentId.value),
  };

  if (!payload.toAgentId) {
    alert('Please enter agent ID');
    return;
  }

  const res = await fetch(`${API}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    alert('Failed to reassign');
    return;
  }

  closeModal();
  loadWorkload();
}

// Initial load
loadAgents();
loadWorkload();
