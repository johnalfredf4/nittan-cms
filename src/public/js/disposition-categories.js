const apiUrl = "/disposition-categories";

async function loadCategories() {
    const tbody = document.getElementById("categoryRows");

    const res = await fetch(apiUrl);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="py-2">${item.categoryName}</td>
            <td class="py-2">${item.description || ""}</td>
            <td class="py-2">
                <span class="px-2 py-1 rounded text-white text-xs ${item.isActive ? "bg-green-600" : "bg-gray-500"}">
                    ${item.isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td class="py-2">
                <button onclick="editCategory(${item.id})" class="px-2 py-1 text-blue-600 hover:text-blue-800">Edit</button>
                <button onclick="toggleActive(${item.id})" class="px-2 py-1 text-yellow-600 hover:text-yellow-800">
                    ${item.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onclick="removeCategory(${item.id})" class="px-2 py-1 text-red-600 hover:text-red-800">Delete</button>
                <button onclick="viewDispositions(${item.id}, '${item.categoryName}')" class="px-2 py-1 text-green-600 hover:text-green-800">View</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function editCategory(id) {
    location.href = `disposition-category-form.html?id=${id}`;
}

function viewDispositions(id, categoryName) {
    localStorage.setItem("selectedCategoryName", categoryName);
    location.href = `dispositions.html?categoryId=${id}`;
}

async function toggleActive(id) {
    if (!confirm("Are you sure?")) return;

    await fetch(`${apiUrl}/${id}/toggle-active`, { method: "PATCH" });

    loadCategories();
}

async function removeCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });

    loadCategories();
}

loadCategories();
