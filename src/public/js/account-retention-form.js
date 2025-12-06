const apiUrl = "/account-retention";

const form = document.getElementById("retentionForm");
const idField = document.getElementById("id");
const accountClassInput = document.getElementById("accountClass");
const retentionDaysInput = document.getElementById("retentionDays");
const descInput = document.getElementById("description");
const isActiveCheckbox = document.getElementById("isActive");
const heading = document.getElementById("formHeading");

async function loadForEdit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        isActiveCheckbox.checked = true; 
        return;
    }

    heading.textContent = "Edit Retention Rule";

    const res = await fetch(`${apiUrl}/${id}`);

    if (!res.ok) {
        alert("Record not found!");
        return;
    }

    const data = await res.json();

    idField.value = data.id;
    accountClassInput.value = data.accountClass;
    retentionDaysInput.value = data.retentionDays;
    descInput.value = data.description || "";
    isActiveCheckbox.checked = data.isActive;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        accountClass: accountClassInput.value.trim(),
        retentionDays: parseInt(retentionDaysInput.value),
        description: descInput.value.trim(),
        isActive: isActiveCheckbox.checked
    };

    let url = apiUrl;
    let method = "POST";

    if (idField.value) {
        url = `${apiUrl}/${idField.value}`;
        method = "PATCH";
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        alert("Error saving record");
        return;
    }

    location.href = "account-retention.html";
});

loadForEdit();
