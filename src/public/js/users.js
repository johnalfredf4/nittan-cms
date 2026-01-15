const roles = JSON.parse(localStorage.getItem("roles") || "[]");
const isAdmin =
  roles.includes("IT - CMS Admin") || roles.includes("Execom - CEO");

const PAGE_SIZE = 10;
let currentPage = 1;
let allUsers = [];

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

  allUsers = await res.json();
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const tbody = document.getElementById("usersTable");
  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  tbody.innerHTML = "";

  const totalPages = Math.max(
    1,
    Math.ceil(allUsers.length / PAGE_SIZE),
  );

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageUsers = allUsers.slice(start, end);

  pageUsers.forEach((u) => {
    const actions = [];

    actions.push(
      `<a href="user-form.html?id=${u.id}" class="text-green-700 hover:underline mr-2">Edit</a>`,
    );

    if (isAdmin) {
      actions.push(
        `<button onclick="deleteUser(${u.id})" class="text-red-600 hover:underline">Delete</button>`,
      );
    }

    const roleNames = (u.roles || [])
      .map((r) => r.name)
      .join(", ") || "-";

    const branchName = u.branch?.name || "-";

    tbody.innerHTML += `
      <tr class="hover:bg-green-50">
        <td class="p-3">${u.username}</td>
        <td class="p-3">${u.firstName} ${u.lastName}</td>
        <td class="p-3">${u.emailAddress || "-"}</td>
        <td class="p-3">${branchName}</td>
        <td class="p-3">${roleNames}</td>
        <td class="p-3">${renderStatus(u.status)}</td>
        <td class="p-3 text-right space-x-2">${actions.join(" ")}</td>
      </tr>
    `;
  });

  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

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

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const token = localStorage.getItem("token");

  await fetch(`/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  // Remove locally and rerender page
  allUsers = allUsers.filter((u) => u.id !== id);

  const maxPage = Math.max(
    1,
    Math.ceil(allUsers.length / PAGE_SIZE),
  );

  if (currentPage > maxPage) currentPage = maxPage;

  renderPage();
}

// Pagination buttons
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("prevPageBtn")
    .addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
      }
    });

  document
    .getElementById("nextPageBtn")
    .addEventListener("click", () => {
      const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
      }
    });

  loadUsers();
});
