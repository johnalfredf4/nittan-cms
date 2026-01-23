const API = '/loanreceivable-assignment/agent-workload';
const agentId = document.getElementById('agentId');
const status = document.getElementById('status');
const minDpd = document.getElementById('minDpd');
const maxDpd = document.getElementById('maxDpd');

const workloadRows = document.getElementById('workloadRows');

const reassignModal = document.getElementById('reassignModal');
const assignmentId = document.getElementById('assignmentId');
const toAgentId = document.getElementById('toAgentId');

/* ============================================================
   FETCH AGENT WORKLOAD (ADMIN VIEW)
   Cross-DB join FIXED for SQL Server + TypeORM
============================================================ */
async getWorkload(query: QueryAgentWorkloadDto) {
  const qb = this.assignmentRepo
    .createQueryBuilder('a')

    // Same-DB join (Nittan-App)
    .leftJoin(
      'User_Accounts',
      'u',
      'u.EmployeeId = a.agentId',
    )

    // ✅ FIXED: Cross-database join using raw expression
    .innerJoin(
      () => '[Nittan].[dbo].[tblLoanApplications]',
      'l',
      'l.ID = a.loanApplicationId',
    )

    .select([
      'a.id AS assignmentId',

      // ✅ ApplicationCode → Acct
      'l.ApplicationCode AS acct',

      'a.loanApplicationId AS loanApplicationId',
      'a.loanReceivableId AS loanReceivableId',
      'a.agentId AS agentId',
      'a.branchId AS branchId',
      'a.dpd AS dpd',
      'a.dpdCategory AS dpdCategory',
      'a.retentionDays AS retentionDays',
      'a.retentionUntil AS retentionUntil',
      'a.status AS status',

      `
      LTRIM(
        RTRIM(
          CONCAT(
            u.first_name, ' ',
            ISNULL(u.middle_name + ' ', ''),
            u.last_name
          )
        )
      ) AS agentFullName
      `,
    ])
    .orderBy('a.dpd', 'DESC');

  if (query.agentId) {
    qb.andWhere('a.agentId = :agentId', {
      agentId: query.agentId,
    });
  }

  if (query.status) {
    qb.andWhere('a.status = :status', {
      status: query.status,
    });
  }

  if (query.minDpd !== undefined) {
    qb.andWhere('a.dpd >= :minDpd', {
      minDpd: query.minDpd,
    });
  }

  if (query.maxDpd !== undefined) {
    qb.andWhere('a.dpd <= :maxDpd', {
      maxDpd: query.maxDpd,
    });
  }

  // REQUIRED for alias fields like `acct`
  return qb.getRawMany();
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
