const BASE_URL = "/loanreceivable-assignment";
const apiUrl = ""; // leave empty if same domain

let currentAssignments = [];

async function searchAssignments() {
    const agentId = document.getElementById("searchAgentId").value;
    if (!agentId) return alert("Enter agent ID first");

    try {
        const endpoint = `${apiUrl}${BASE_URL}/assignments?agentId=${agentId}`;
        console.log("🔍 Loading:", endpoint);

        const res = await fetch(endpoint);
        if (!res.ok) {
            alert("Failed to load assignments.");
            return;
        }

        const data = await res.json();
        console.log("📌 Assignments received:", data);

        if (!Array.isArray(data) || data.length === 0) {
            document.getElementById("resultsWrap").classList.add("hidden");
            alert("No assignments found.");
            return;
        }

        currentAssignments = data;
        renderTable(agentId);

    } catch (error) {
        console.error("💥 Error:", error);
        alert("Error retrieving assignments.");
    }
}

@Get('assignments')
async getAssignments(@Query('agentId') agentId: number) {
  return this.service.getAssignmentsByAgent(agentId);
}

async getAssignmentsByAgent(agentId: number) {
  return this.assignmentRepo.find({
      where: { agentId, status: AssignmentStatus.ACTIVE },
      order: { retentionUntil: 'ASC' }
  });
}

function renderTable(agentId) {
    document.getElementById("searchedAgent").textContent = agentId;
    document.getElementById("resultsWrap").classList.remove("hidden");

    const tbody = document.getElementById("assignmentRows");
    tbody.innerHTML = "";

    currentAssignments.forEach(a => {
        const retention = a.retentionUntil
            ? new Date(a.retentionUntil).toLocaleDateString()
            : "-";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="px-2 py-1 border">${a.loanReceivableId ?? "-"}</td>
            <td class="px-2 py-1 border">${a.dpd ?? "-"}</td>
            <td class="px-2 py-1 border">${a.status ?? "-"}</td>
            <td class="px-2 py-1 border">${retention}</td>

            <td class="px-2 py-1 border text-center">
                <input type="number" id="newAgent_${a.id}" class="px-2 py-1 border rounded w-28" placeholder="Agent ID"/>

                <button onclick="overrideSingle(${a.id}, ${a.agentId})"
                    class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                    Apply
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

async function overrideSingle(assignmentId, fromAgent) {
    const input = document.getElementById(`newAgent_${assignmentId}`);
    if (!input.value) return alert("Enter replacement agent");

    const ok = confirm(`Override #${assignmentId} from Agent ${fromAgent} → Agent ${input.value}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/override/${assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fromAgentId: fromAgent,
            toAgentId: parseInt(input.value)
        })
    });

    alert("Override saved!");
    searchAssignments();
}

async function bulkOverride() {
    const fromAgent = document.getElementById("searchAgentId").value;
    const toAgent = document.getElementById("bulkNewAgentId").value;

    if (!toAgent) return alert("Enter new agent ID");

    const ok = confirm(`Override ALL assignments from Agent ${fromAgent} → Agent ${toAgent}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/bulk-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fromAgentId: parseInt(fromAgent),
            toAgentId: parseInt(toAgent)
        })
    });

    alert("Bulk override completed!");
    searchAssignments();
}
