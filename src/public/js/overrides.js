const apiUrl = "";
const BASE_URL = "/loanreceivable-assignment";

let currentAssignments = [];

async function searchAssignments() {
    const agentId = document.getElementById("searchAgentId").value;
    if (!agentId) return alert("Enter agent ID first");

    try {
        const endpoint = `${apiUrl}${BASE_URL}/assignments?agentId=${agentId}`;
        console.log("🔍 Fetching:", endpoint);

        const res = await fetch(endpoint);
        if (!res.ok) {
            console.error("API error:", res.status);
            alert("Failed to fetch assignments");
            return;
        }

        const data = await res.json();
        console.log("📌 Result received:", data);

        if (!Array.isArray(data) || data.length === 0) {
            alert("No assignments found for this agent");
            return;
        }

        currentAssignments = data;
        renderTable(agentId);

    } catch (err) {
        console.error("Request failed:", err);
        alert("Error retrieving assignments");
    }
}

function renderTable(agentId) {
    const rows = document.getElementById("assignmentRows");
    rows.innerHTML = "";

    document.getElementById("searchedAgent").textContent = agentId;
    document.getElementById("resultsWrap").classList.remove("hidden");

    currentAssignments.forEach(a => {
        const dateStr = a.retentionUntil
            ? new Date(a.retentionUntil).toLocaleDateString()
            : "N/A";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="px-2 py-1">${a.loanReceivableId}</td>
            <td class="px-2 py-1">${a.dpd}</td>
            <td class="px-2 py-1">${a.status}</td>
            <td class="px-2 py-1">${dateStr}</td>
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
    const field = document.getElementById(`toAgent_${assignmentId}`);
    if (!field.value) return alert("Enter new agent ID");

    const newAgent = field.value;
    const ok = confirm(`Override assignment#${assignmentId} from ${fromAgent} → ${newAgent}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/override-single/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fromAgentId: fromAgent,
            toAgentId: Number(newAgent)
        })
    });

    alert("Updated successfully!");
    searchAssignments();
}

async function bulkOverride() {
    const fromAgentId = document.getElementById("searchAgentId").value;
    const toAgentId = document.getElementById("bulkNewAgentId").value;

    if (!toAgentId) return alert("Enter new agent ID");

    const ok = confirm(`Override ALL assignments from ${fromAgentId} → ${toAgentId}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/bulk-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fromAgentId: Number(fromAgentId),
            toAgentId: Number(toAgentId)
        })
    });

    alert("Bulk override completed!");
    searchAssignments();
}
