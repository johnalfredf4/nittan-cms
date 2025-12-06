let editId = null;

async function initTemplateForm() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized");
    location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  editId = params.get("id");

  if (editId) {
    document.getElementById("headerTitle").innerText = "Edit Email Template";

    const res = await fetch(`/email-templates/${editId}`, {
      headers: { Authorization: "Bearer " + token },
    });

    const t = await res.json();
    console.log("Fetched template", t);

    // 🔥 HERE IS THE RIGHT PLACE
    document.querySelector("input[name=code]").value = t.code || "";
    document.querySelector("input[name=name]").value = t.name || "";
    document.querySelector("input[name=subject]").value = t.subject || "";

    const bodyInput = document.getElementById("bodyInput");

    if (bodyInput) {
      // Using rich editor
      bodyInput.innerHTML = t.body || "";
    } else {
      // Using simple textarea
      document.querySelector("textarea[name=body]").value = t.body || "";
    }
  }

  document.querySelector("#templateForm").addEventListener("submit", async e => {
    e.preventDefault();

    // 🔥 Capture HTML body if editor exists
    const bodyInput = document.getElementById("bodyInput");
    if (bodyInput) {
      document.getElementById("bodyHidden").value = bodyInput.innerHTML;
    }

    const form = new FormData(e.target);

    const payload = {
      code: form.get("code"),
      name: form.get("name"),
      subject: form.get("subject"),
      body: form.get("body"), // takes hidden input or textarea
    };

    const url = editId ? `/email-templates/${editId}` : `/email-templates`;
    const method = editId ? "PATCH" : "POST";

    const resSave = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload),
    });

    if (!resSave.ok) {
      alert("Error saving");
      return;
    }

    location.href = "email-templates.html";
  });
}

document.addEventListener("DOMContentLoaded", initTemplateForm);
