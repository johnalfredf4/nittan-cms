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

  document.getElementById("userLabel").innerText = username || "";

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
      `<a href="user-form.html?id=${u.id}" class="text-green-700 hover:underline mr-2">Edit</a>`
    );

    if (isAdmin) {
      actions.push(
        `<button onclick="deleteUser(${u.id})" class="text-red-600 hover:underline">Delete</button>`
      );
    }

    tbody.innerHTML += `
      <tr class="border-b hover:bg-green-50">
        <td class="p-3">${u.username}</td>
        <td class="p-3">${u.firstName} ${u.lastName}</td>
        <td class="p-3">${u.emailAddress ?? "-"}</td>
        <td class="p-3">${renderRoles(u.roles)}</td>
        <td class="p-3">${renderStatus(u.status)}</td>
        <td class="p-3 text-right space-x-2">${actions.join(" ")}</td>
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

/* ---------------------------
   Status Badge Renderer
---------------------------- */
function renderStatus(status) {
  switch (Number(status)) {
    case 1:
      return '<span class="text-green-700 font-semibold">Active</span>';
    case 2:
      return '<span class="text-yellow-600 font-semibold">Inactive</span>';
    case 3:
      return '<span class="text-red-600 font-semibold">Deleted</span>';
    default:
      return '<span class="text-gray-400">-</span>';
  }
}

/* ---------------------------
   Roles Renderer
---------------------------- */
function renderRoles(roles = []) {
  if (!roles.length) return '<span class="text-gray-400">-</span>';

  return roles
    .map(
      (r) =>
        `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mr-1 mb-1">${r.name}</span>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadUsers);
