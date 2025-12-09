const BASE_URL = "/loanreceivable-assignment";

let currentAssignments = [];

async function searchAssignments() {
    const agentId = document.getElementById("searchAgentId").value;
    if (!agentId) return alert("Enter Agent ID");

    document.getElementById("resultsWrap").classList.add("hidden");

    const res = await fetch(`${BASE_URL}/agent-load?agentId=${agentId}`);
    const data = await res.json();

    if (!data.length || !data[0].assignments.length) {
        alert("No active assignments found for this agent.");
        return;
    }

    currentAssignments = data[0].assignments;
    renderTable(agentId);
}

function renderTable(agentId) {
    const rows = document.getElementById("assignmentRows");
    rows.innerHTML = "";

    document.getElementById("searchedAgent").textContent = agentId;
    document.getElementById("resultsWrap").classList.remove("hidden");

    currentAssignments.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="px-2 py-1">${a.loanReceivableId}</td>
            <td class="px-2 py-1">${a.dpd}</td>
            <td class="px-2 py-1">${a.status}</td>
            <td class="px-2 py-1">${new Date(a.retentionUntil).toLocaleDateString()}</td>
            <td class="px-2 py-1 text-center">
                <input type="number" id="toAgent_${a.id}"
                       placeholder="Agent ID"
                       class="border px-2 py-1 rounded w-28 mr-2"/>
                <button onclick="overrideSingle(${a.id}, ${a.agentId})"
                        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                        Override
                </button>
            </td>
        `;

        rows.appendChild(tr);
    });
}

async function overrideSingle(assignmentId, fromAgent) {
    const newAgent = document.getElementById(`toAgent_${assignmentId}`).value;
    if (!newAgent) return alert("Enter new agent ID");

    const ok = confirm(`Override assignment #${assignmentId} from ${fromAgent} → ${newAgent}?`);
    if (!ok) return;

    await fetch(`${BASE_URL}/override/${assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromAgentId: fromAgent, toAgentId: newAgent })
    });

    alert("Assignment updated!");
    searchAssignments();
}

async function bulkOverride() {
    const fromAgentId = document.getElementById("searchAgentId").value;
    const toAgentId = document.getElementById("bulkNewAgentId").value;

    if (!toAgentId) return alert("Enter new agent ID");

    const ok = confirm(`Override ALL assignments from ${fromAgentId} → ${toAgentId}?`);
    if (!ok) return;

    await fetch(`${BASE_URL}/bulk-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fromAgentId,
            toAgentId
        })
    });

    alert("Bulk override completed!");
    searchAssignments();
}
