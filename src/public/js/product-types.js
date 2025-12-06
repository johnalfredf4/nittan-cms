const apiUrl = "/product-types";

async function loadProductTypes() {
    const tbody = document.getElementById("productTypeRows");

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        tbody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="py-2">${item.name}</td>
                <td class="py-2">${item.description || ""}</td>
                <td class="py-2">
                    <span class="px-2 py-1 rounded text-white text-xs ${item.isActive ? "bg-green-600" : "bg-gray-500"}">
                        ${item.isActive ? "Active" : "Inactive"}
                    </span>
                </td>
                <td class="py-2">
                    <button onclick="edit(${item.id})" class="px-2 py-1 text-blue-600 hover:text-blue-800">Edit</button>
                    <button onclick="toggleActive(${item.id})" class="px-2 py-1 text-yellow-600 hover:text-yellow-800">
                        ${item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onclick="removeType(${item.id})" class="px-2 py-1 text-red-600 hover:text-red-800">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load product types", err);
    }
}

function edit(id) {
    location.href = `product-type-form.html?id=${id}`;
}

async function toggleActive(id) {
    if (!confirm("Are you sure you want to change status?")) return;

    await fetch(`${apiUrl}/${id}/toggle-active`, { method: "PATCH" });

    loadProductTypes();
}

async function removeType(id) {
    if (!confirm("Are you sure you want to delete this?")) return;

    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });

    loadProductTypes();
}

loadProductTypes();
