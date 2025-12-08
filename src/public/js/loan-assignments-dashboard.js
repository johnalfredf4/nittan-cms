const apiUrl = "/loan-assignment";

async function loadAgents() {
    const dropdown = document.getElementById("agentFilter");

    try {
        const res = await fetch(`${apiUrl}/agents`);
        const agents = await res.json();

async function loadAgents() {
    const dropdown = document.getElementById("agentFilter");

    try {
        const res = await fetch(`${apiUrl}/agents`);
        let agents = await res.json();

        // Ensure result is array
        if (!Array.isArray(agents)) {
            console.warn("Agents API did not return an array:", agents);
            agents = [];
        }

        dropdown.innerHTML = `<option value="">All Agents</option>`;

        agents.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a.agentId;
            opt.textContent =
                a.name
                    ? `${a.name} (${a.agentId})`
                    : `Agent ${a.agentId}`;
            dropdown.appendChild(opt);
        });
    } catch (err) {
        console.error("Failed to load agents", err);
        dropdown.innerHTML = `<option value="">(No Agents Found)</option>`;
    }
}

async function loadAssignments() {
    const tbody = document.getElementById("assignmentRows");
    const agentId = document.getElementById("agentFilter").value;

    try {
        let url = `${apiUrl}/all`;
        if (agentId) url = `${apiUrl}/agent/${agentId}`;

        const res = await fetch(url);
        let items = await res.json();

        // Ensure result is array
        if (!Array.isArray(items)) {
            console.warn("Assignments API did not return an array:", items);
            items = [];
        }

        tbody.innerHTML = "";

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="py-4 text-center text-gray-500">
                        No assignments found
                    </td>
                </tr>
            `;
            return;
        }

        items.forEach(item => {
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
                        class="px-2 py-1 text-blue-600 hover:text-blue-800 underline">
                        Reassign
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load loan assignments", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="py-4 text-center text-red-600">
                    Error loading assignments. Please try again.
                </td>
            </tr>
        `;
    }
}

async function reassign(assignmentId) {
    const newAgent = prompt("Enter new Agent ID:");
    if (!newAgent) return;

    try {
        const res = await fetch(`${apiUrl}/reassign/${assignmentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newAgentId: Number(newAgent) }),
        });

        const result = await res.json();
        alert(result.message || "Successfully reassigned 🚀");
    } catch {
        alert("Failed to reassign, please retry ❌");
    }

    loadAssignments();
}

// Filter buttons
document.getElementById("filterBtn").addEventListener("click", loadAssignments);
document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("agentFilter").value = "";
    loadAssignments();
});

// Utilities
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

loadAgents();
loadAssignments();

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
