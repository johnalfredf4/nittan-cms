const apiUrl = "/product-types";

const form = document.getElementById("productTypeForm");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const idField = document.getElementById("id");
const isActiveInput = document.getElementById("isActive");
const formHeading = document.getElementById("formHeading");

async function loadForEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // If no id → NEW MODE
    if (!id) {
        isActiveInput.checked = true; // New ones default to active
        return;
    }

    // Switch to edit mode
    formHeading.textContent = "Edit Product Type";

    const res = await fetch(`${apiUrl}/${id}`);

    if (!res.ok) {
        alert("Product Type not found");
        return;
    }

    const data = await res.json();

    idField.value = data.id;
    nameInput.value = data.name;
    descInput.value = data.description || "";
    isActiveInput.checked = data.isActive;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        name: nameInput.value.trim(),
        description: descInput.value.trim(),
        isActive: isActiveInput.checked
    };

    let url = apiUrl;
    let method = "POST";

    if (idField.value) {
        url = `${apiUrl}/${idField.value}`;
        method = "PATCH";
    }

    const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        alert("Something went wrong while saving.");
        return;
    }

    location.href = "product-types.html";
});

loadForEdit();
