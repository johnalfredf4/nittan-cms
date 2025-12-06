const apiUrl = "/product-types";

const form = document.getElementById("productTypeForm");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const idField = document.getElementById("productTypeId");
const title = document.getElementById("formTitle");

async function loadForEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    title.textContent = "Edit Product Type";

    const res = await fetch(`${apiUrl}/${id}`);
    const data = await res.json();

    idField.value = data.id;
    nameInput.value = data.name;
    descInput.value = data.description;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        name: nameInput.value.trim(),
        description: descInput.value.trim()
    };

    let url = apiUrl;
    let method = "POST";

    if (idField.value) {
        url = `${apiUrl}/${idField.value}`;
        method = "PATCH";
    }

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    location.href = "product-types.html";
});

loadForEdit();
