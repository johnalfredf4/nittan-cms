const token = localStorage.getItem("token");
const roles = JSON.parse(localStorage.getItem("roles") || "[]");

const isAdmin =
  roles.includes("IT - CMS Admin") || roles.includes("Execom - CEO");

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const form = document.getElementById("userForm");
const headerTitle = document.getElementById("headerTitle");
const rolesList = document.getElementById("rolesList");
const passwordInput = document.getElementById("passwordInput");
const statusSelect = document.getElementById("statusSelect");

/* ---------------------------
   Auth Guard
---------------------------- */
if (!token) {
  window.location = "login.html";
}

/* ---------------------------
   Init
---------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadRoles();

  if (!isAdmin && statusSelect) {
    statusSelect.style.display = "none";
  }

  if (userId && isAdmin) {
    document.getElementById("tempPasswordSection").style.display = "block";
  }

  if (userId) {
    headerTitle.innerText = "Edit User";
    passwordInput.placeholder = "Leave blank to keep current password";
    passwordInput.required = false;
    await loadUser(userId);
  } else {
    headerTitle.innerText = "Create User";
    passwordInput.required = true;
  }

  form.addEventListener("submit", saveUser);
});

/* ---------------------------
   Load Roles
---------------------------- */
async function loadRoles() {
  const res = await fetch("/roles", {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    alert("Failed to load roles");
    return;
  }

  const roles = await res.json();
  rolesList.innerHTML = "";

  roles.forEach((role) => {
    const opt = document.createElement("option");
    opt.value = role.name;
    opt.textContent = role.name;
    rolesList.appendChild(opt);
  });
}

/* ---------------------------
   Load User (Edit)
---------------------------- */
async function loadUser(id) {
  const res = await fetch(`/users/${id}`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    alert("Failed to load user");
    return;
  }

  const user = await res.json();

  form.username.value = user.username;
  form.emailAddress.value = user.emailAddress;
  form.firstName.value = user.firstName;
  form.middleName.value = user.middleName || "";
  form.lastName.value = user.lastName;
  form.status.value = user.status;

  // Preselect roles
  const userRoles = user.roles.map((r) => r.name);
  Array.from(rolesList.options).forEach((opt) => {
    if (userRoles.includes(opt.value)) {
      opt.selected = true;
    }
  });
}

/* ---------------------------
   Save User
---------------------------- */
async function saveUser(e) {
  e.preventDefault();

  const selectedRoles = Array.from(rolesList.selectedOptions).map(
    (o) => o.value
  );

  const body = {
    username: form.username.value.trim(),
    emailAddress: form.emailAddress.value.trim(),
    firstName: form.firstName.value.trim(),
    middleName: form.middleName.value.trim(),
    lastName: form.lastName.value.trim(),
    roleNames: selectedRoles,
  };

  // Status only sent by admins
  if (isAdmin && form.status) {
    body.status = Number(form.status.value);
  }

  // Password only if provided
  if (form.password.value.trim()) {
    body.password = form.password.value;
  }

  const method = userId ? "PUT" : "POST";
  const url = userId ? `/users/${userId}` : "/users";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    window.location = "users.html";
  } else {
    const msg = await res.text();
    alert("Failed to save user:\n" + msg);
  }

  async function generateTempPassword() {
    if (!confirm("Generate a temporary password for this user?")) return;
  
    const res = await fetch(
      `/users/${userId}/generate-temp-password`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
  
    const data = await res.json();
  
    if (!res.ok) {
      alert(data.message || "Failed to generate password");
      return;
    }
  
    alert(
      `Temporary password generated:\n\n${data.tempPassword}\n\nUser will be required to change it on next login.`
    );
  }

}
