let editId = null;

async function initUserForm() {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const username = localStorage.getItem("username");
  const branchSelect = document.getElementById("branchSelect");
  
  const isAdmin =
    roles.includes("IT - CMS Admin") || roles.includes("Execom - CEO");

  if (!token) {
    window.location = "login.html";
    return;
  }

  // Navbar user + logout
  document.getElementById("userLabel").innerText = username || "";
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location = "login.html";
  });

  const params = new URLSearchParams(window.location.search);
  editId = params.get("id");

  /* ---------------------------
     Load Roles
  ---------------------------- */
  const rolesRes = await fetch("/roles", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!rolesRes.ok) {
    alert("Failed to load roles");
    return;
  }

  const rolesList = await rolesRes.json();
  const rolesSelect = document.getElementById("rolesList");
  rolesSelect.innerHTML = "";

  rolesList.forEach((r) => {
    const option = document.createElement("option");
    option.value = r.name;
    option.textContent = r.name;
    rolesSelect.appendChild(option);
  });
  
  await loadBranches();

  /* ---------------------------
     Status control (admin only)
  ---------------------------- */
  const statusSelect = document.querySelector("select[name=status]");
  if (!isAdmin && statusSelect) {
    statusSelect.style.display = "none";
  }

  /* ---------------------------
     Edit mode
  ---------------------------- */
  if (editId) {
    document.getElementById("headerTitle").innerText = "Edit User";

    const res = await fetch(`/users/${editId}`, {
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      alert("User not found");
      return;
    }

    const u = await res.json();

    // Populate fields
    document.querySelector("input[name=username]").value = u.username || "";
    document.querySelector("input[name=emailAddress]").value = u.emailAddress || "";
    document.querySelector("input[name=employeeId]").value = u.employeeId ?? "";
    if (branchSelect && u.branchId) {
      branchSelect.value = String(u.branchId);
    }
    document.querySelector("input[name=firstName]").value = u.firstName || "";
    document.querySelector("input[name=middleName]").value = u.middleName || "";
    document.querySelector("input[name=lastName]").value = u.lastName || "";

    if (statusSelect) {
      statusSelect.value = String(u.status);
    }

    // Username should not be editable
    document.querySelector("input[name=username]").disabled = true;

    // Password optional on edit
    document.querySelector("input[name=password]").placeholder =
      "Leave blank to keep current password";

    // Preselect roles
    (u.roles || []).forEach((role) => {
      const opt = [...rolesSelect.options].find(
        (o) => o.value === role.name
      );
      if (opt) opt.selected = true;
    });
  } else {
    // Create mode
    document.getElementById("headerTitle").innerText = "Create User";
    document.querySelector("input[name=password]").required = true;
  }

  /* ---------------------------
     Submit
  ---------------------------- */
  document.querySelector("#userForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const payload = {
      emailAddress: form.get("emailAddress")?.trim(),
      firstName: form.get("firstName")?.trim(),
      middleName: form.get("middleName")?.trim(),
      lastName: form.get("lastName")?.trim(),
      roleNames: [...rolesSelect.selectedOptions].map((o) => o.value),
    };
    // Branch selection (only if chosen)
    if (branchSelect && branchSelect.value) {
      payload.branchId = Number(branchSelect.value);
    }

    // Username only on CREATE
    if (!editId) {
      payload.username = form.get("username")?.trim();
    }

    // Admin-only status
    if (isAdmin && statusSelect) {
      payload.status = Number(form.get("status"));
    }

    // Password handling
    const pwd = form.get("password");
    if (!editId || (pwd && pwd.trim())) {
      payload.password = pwd;
    }

    const url = editId ? `/users/${editId}` : "/users";
    const method = editId ? "PATCH" : "POST";

    const resSave = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    if (!resSave.ok) {
      const msg = await resSave.text();
      alert("Error saving user:\n" + msg);
      return;
    }

    window.location = "users.html";
  });
}

async function loadBranches() {
  const token = localStorage.getItem("token");

  const res = await fetch("/branches", {
    headers: {
      Authorization: "Bearer " + token, // ✅ REQUIRED
    },
  });

  if (!res.ok) {
    console.error("Failed to load branches");
    return;
  }

  const branches = await res.json();
  const branchSelect = document.getElementById("branchSelect");

  branchSelect.innerHTML = `<option value="">Select Branch</option>`;

  branches.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name;
    branchSelect.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", initUserForm);
