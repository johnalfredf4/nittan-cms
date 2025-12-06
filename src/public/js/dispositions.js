const dispUrl = "/dispositions";
const categoryUrl = "/disposition-categories";

async function loadDispositions() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("categoryId");

    const catTitle = document.getElementById("categoryTitle");
    const tbody = document.getElementById("dispositionRows");

    // Load category name for header
    const catRes = await fetch(`${categoryUrl}/${categoryId}`);
    const catData = await catRes.json();
    catTitle.textContent = catData.categoryName;

    // Load disposal items
    const res = await fetch(`${dispUrl}/category/${categoryId}`);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="py-2">${item.dispositionName}</td>
            <td class="py-2 text-center">${item.requiresNextSchedule ? "Yes" : "No"}</td>
            <td class="py-2">
                <span class="px-2 py-1 rounded text-white text-xs ${item.isActive ? "bg-green-600" : "bg-gray-500"}">
                    ${item.isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td class="py-2">
                <button onclick="editDisposition(${item.id})" class="px-2 py-1 text-blue-600 hover:text-blue-800">Edit</button>
                <button onclick="toggleActive(${item.id})" class="px-2 py-1 text-yellow-600 hover:text-yellow-800">
                    ${item.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onclick="removeDisposition(${item.id})" class="px-2 py-1 text-red-600 hover:text-red-800">Delete</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function editDisposition(id) {
    location.href = `disposition-form.html?id=${id}`;
}

async function toggleActive(id) {
    if (!confirm("Are you sure?")) return;

    await fetch(`${dispUrl}/${id}/toggle-active`, { method: "PATCH" });

    loadDispositions();
}

async function removeDisposition(id) {
    if (!confirm("Are you sure you want to delete this?")) return;

    await fetch(`${dispUrl}/${id}`, { method: "DELETE" });

    loadDispositions();
}

loadDispositions();
