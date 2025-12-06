async function loadTemplates() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized");
    location.href = "login.html";
    return;
  }

  const res = await fetch("/email-templates", {
    headers: { Authorization: "Bearer " + token },
  });

  const list = await res.json();
  console.log("Templates:", list);

  const tbody = document.getElementById("templateRows");
  tbody.innerHTML = "";

  list.forEach(t => {
    tbody.innerHTML += `
    <tr class="border-b">
      <td class="py-2">${t.code}</td>
      <td class="py-2">${t.name}</td>
      <td class="py-2">${t.status}</td>
      <td class="py-2 flex gap-2">
        <button onclick="editTemplate(${t.id})" class="text-blue-600 mr-2">Edit</button>
            
        ${t.status === "ACTIVE"
          ? `<button onclick="deactivateTemplate(${t.id})" class="text-blue-600 mr-2">Deactivate</button>`
          : `<button onclick="activateTemplate(${t.id})" class="text-blue-600 mr-2">Activate</button>`
        }
    
        <button onclick="deleteTemplate(${t.id})" class="text-red-600">Delete</button>
      </td>
    </tr>
    ;
  });
}

function editTemplate(id) {
  location.href = `email-template-form.html?id=${id}`;
}

async function activateTemplate(id) {
  const token = localStorage.getItem("token");
  await fetch(`/email-templates/${id}/activate`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token }
  });
  loadTemplates();
}

async function deactivateTemplate(id) {
  const token = localStorage.getItem("token");
  await fetch(`/email-templates/${id}/deactivate`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token }
  });
  loadTemplates();
}

async function deleteTemplate(id) {
  if (!confirm("Are you sure?")) return;
  const token = localStorage.getItem("token");

  await fetch(`/email-templates/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  loadTemplates();
}

document.addEventListener("DOMContentLoaded", loadTemplates);
