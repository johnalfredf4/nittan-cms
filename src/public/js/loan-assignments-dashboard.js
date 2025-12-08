const apiUrl = "/loan-assignment";

async function loadAgents() {
    const dropdown = document.getElementById("agentFilter");

    try {
        const res = await fetch(`${apiUrl}/agents`);
        const agents = await res.json();

        dropdown.innerHTML = `<option value="">All Agents</option>`;

        agents.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a.agentId;
            opt.textContent = `Agent ${a.agentId}`;
            dropdown.appendChild(opt);
        });
    } catch (err) {
        console.error("Failed to load agents", err);
    }
}

async function loadAssignments() {
    const tbody = document.getElementById("assignmentRows");
    const agentId = document.getElementById("agentFilter").value;

    try {
        let url = `${apiUrl}/all`;
        if (agentId) url = `${apiUrl}/agent/${agentId}`;

        const res = await fetch(url);
        const data = await res.json();
        tbody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="py-2 px-2">${item.loanApplicationId}</td>
                <td class="py-2 px-2">${item.agentId}</td>
                <td class="py-2 px-2">${item.branchId ?? "-"}</td>
                <td class="py-2 px-2">${formatDate(item.dueDate)}</td>
                <td class="py-2 px-2">${item.dpd ?? ""}</td>
                <td class="py-2 px-2">${item.accountClass ?? ""}</td>
                <td class="py-2 px-2">${formatDate(item.retentionUntil)}</td>
                <td class="py-2 px-2">
                    <button onclick="reassign(${item.id})"
                        class="px-2 py-1 text-blue-600 hover:text-blue-800">
                        Reassign
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load loan assignments", err);
    }
}

async function reassign(id) {
    const newAgent = prompt("Enter new Agent ID:");
    if (!newAgent) return;

    await fetch(`/loan-assignment/reassign/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newAgentId: Number(newAgent) }),
    });

    loadAssignments();
}

document.getElementById("filterBtn").addEventListener("click", loadAssignments);
document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("agentFilter").value = "";
    loadAssignments();
});

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

loadAgents();
loadAssignments();
