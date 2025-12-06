const dispUrl = "/dispositions";
const categoryUrl = "/disposition-categories";

const form = document.getElementById("dispositionForm");
const idField = document.getElementById("id");
const nameInput = document.getElementById("dispositionName");
const categorySelect = document.getElementById("categoryId");
const requiresNextInput = document.getElementById("requiresNextSchedule");
const isActiveInput = document.getElementById("isActive");
const heading = document.getElementById("formHeading");

// Populate category dropdown
async function loadCategoriesDropdown() {
    const res = await fetch(categoryUrl);
    const data = await res.json();

    data.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.categoryName;
        categorySelect.appendChild(opt);
    });
}

// Load form for edit
async function loadForEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        isActiveInput.checked = true;
        await loadCategoriesDropdown();
        return;
    }

    await loadCategoriesDropdown();

    heading.textContent = "Edit Disposition";

    const res = await fetch(`${dispUrl}/${id}`);
    const data = await res.json();

    idField.value = data.id;
    nameInput.value = data.dispositionName;
    categorySelect.value = data.categoryId;
    requiresNextInput.checked = data.requiresNextSchedule;
    isActiveInput.checked = data.isActive;
}

// Submit
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        dispositionName: nameInput.value.trim(),
        categoryId: parseInt(categorySelect.value),
        requiresNextSchedule: requiresNextInput.checked,
        isActive: isActiveInput.checked
    };

    let url = dispUrl;
    let method = "POST";

    if (idField.value) {
        url = `${dispUrl}/${idField.value}`;
        method = "PATCH";
    }

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    location.href = `dispositions.html?categoryId=${payload.categoryId}`;
});

loadForEdit();
