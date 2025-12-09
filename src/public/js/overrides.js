const BASE_URL = "/loanreceivable-assignment";

let currentAssignments = [];

async function searchAssignments() {
    const agentId = document.getElementById("searchAgentId").value;

    if (!agentId) {
        alert("Please enter an Agent ID");
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}${BASE_URL}/agent-load?agentId=${agentId}`,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            console.error("Failed response", response.status);
            alert("No assignments found.");
            return;
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            alert("No assignments found.");
            return;
        }

        currentAssignments = data;
        console.log("Assignments loaded:", currentAssignments);

        renderTable(agentId);

    } catch (err) {
        console.error("Error fetching assignments", err);
        alert("Unable to retrieve assignments");
    }
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
            <td class="px-2 py-1">${a.dpd ?? '-'}</td>
            <td class="px-2 py-1">${a.status}</td>
            <td class="px-2 py-1">${new Date(a.retentionUntil).toLocaleDateString()}</td>
            <td class="px-2 py-1 text-center">
                <input type="number" id="toAgent_${a.id}" 
                    placeholder="New Agent ID"
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

    if (!newAgent) return alert("Enter new agent ID.");

    const ok = confirm(`Override assignment #${assignmentId} from Agent ${fromAgent} → ${newAgent}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/override-single/${assignmentId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ toAgentId: Number(newAgent) })
    });

    alert("Assignment updated successfully!");
    searchAssignments();
}

async function bulkOverride() {
    const fromAgentId = document.getElementById("searchedAgent").innerText;
    const toAgentId = document.getElementById("bulkNewAgentId").value;

    if (!toAgentId) return alert("Enter replacement Agent ID");

    const ok = confirm(`Override ALL assignments from Agent ${fromAgentId} → ${toAgentId}?`);
    if (!ok) return;

    await fetch(`${apiUrl}${BASE_URL}/bulk-override`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fromAgentId: Number(fromAgentId),
            toAgentId: Number(toAgentId),
        })
    });

    alert("Bulk override completed!");
    searchAssignments();
}
