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

    document.querySelector("input[name=code]").value = t.code || "";
    document.querySelector("input[name=name]").value = t.name || "";
    document.querySelector("input[name=subject]").value = t.subject || "";

    const bodyInput = document.getElementById("bodyInput");

    if (bodyInput) {
      bodyInput.innerHTML = t.body || "";
    } else {
      const bodyField = document.querySelector("textarea[name=body]");
      if (bodyField) {
        bodyField.value = t.body || "";
      }
    }
  }

  document.querySelector("#templateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const bodyInput = document.getElementById("bodyInput");
  if (bodyInput) {
    document.getElementById("bodyHidden").value = bodyInput.innerHTML;
  }

  const form = new FormData(e.target);

  const payload = {
    code: form.get("code"),
    name: form.get("name"),
    subject: form.get("subject"),
    body: form.get("body"), // now contains formatted HTML
  };

  const url = editId ? `/email-templates/${editId}` : `/email-templates`;
  const method = editId ? "PATCH" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(payload),
  });

  location.href = "email-templates.html";
});

}

document.addEventListener("DOMContentLoaded", initTemplateForm);

function execCmd(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

function addLink() {
  const url = prompt("Enter link URL:");
  if (url) document.execCommand("createLink", false, url);
}

function removeLink() {
  document.execCommand("unlink", false, null);
}

function setColor() {
  const color = prompt("Enter text color HEX e.g. #ff0000:");
  if (color) execCmd("foreColor", color);
}

function setHighlight() {
  const color = prompt("Enter highlight background HEX e.g. #ffff00:");
  if (color) execCmd("hiliteColor", color);
}

function setFontSize(size) {
  if (!size) return;
  execCmd("fontSize", size);
}

