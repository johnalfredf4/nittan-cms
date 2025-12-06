const categoryUrl = "/disposition-categories";

const form = document.getElementById("categoryForm");
const idField = document.getElementById("id");
const nameInput = document.getElementById("categoryName");
const descInput = document.getElementById("description");
const isActiveInput = document.getElementById("isActive");
const heading = document.getElementById("formHeading");

async function loadForEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        isActiveInput.checked = true;
        return;
    }

    heading.textContent = "Edit Category";

    const res = await fetch(`${categoryUrl}/${id}`);
    const data = await res.json();

    idField.value = data.id;
    nameInput.value = data.categoryName;
    descInput.value = data.description || "";
    isActiveInput.checked = data.isActive;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        categoryName: nameInput.value.trim(),
        description: descInput.value.trim(),
        isActive: isActiveInput.checked
    };

    let url = categoryUrl;
    let method = "POST";

    if (idField.value) {
        url = `${categoryUrl}/${idField.value}`;
        method = "PATCH";
    }

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    location.href = "disposition-categories.html";
});

loadForEdit();
