const roles = JSON.parse(localStorage.getItem("roles") || "[]");
const isAdmin =
  roles.includes("IT - CMS Admin") || roles.includes("Execom - CEO");

async function loadUsers() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token) {
    window.location = "login.html";
    return;
  }

  document.getElementById("userLabel").innerText = username || '';

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location = "login.html";
  });

  if (!isAdmin) {
    const newUserBtn = document.getElementById("newUserBtn");
    if (newUserBtn) newUserBtn.style.display = "none";
  }

  const res = await fetch("/users", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      window.location = "login.html";
    }
    return;
  }

  const users = await res.json();
  const tbody = document.getElementById("usersTable");
  tbody.innerHTML = "";

  users.forEach((u) => {
    const actions = [];

    actions.push(
      `<a href="user-form.html?id=${u.id}" class="text-blue-600 mr-2">Edit</a>`,
    );

    if (isAdmin) {
      actions.push(
        `<button onclick="deleteUser(${u.id})" class="text-red-600">Delete</button>`,
      );
    }

    tbody.innerHTML += `
      <tr class="border-b">
        <td class="p-2">${u.username}</td>
        <td class="p-2">${u.firstName} ${u.lastName}</td>
        <td class="p-2">${u.status}</td>
        <td class="p-2 text-right space-x-2">${actions.join(' ')}</td>
      </tr>
    `;
  });
}

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const token = localStorage.getItem("token");

  await fetch(`/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  loadUsers();
}

document.addEventListener("DOMContentLoaded", loadUsers);
