let editId = null;

async function initUserForm() {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const username = localStorage.getItem("username");

  const isAdmin =
    roles.includes("IT - CMS Admin") || roles.includes("Execom - CEO");

  if (!token) {
    alert("Unauthorized");
    window.location = "dashboard.html";
    return;
  }


  document.getElementById("userLabel").innerText = username || '';

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location = "login.html";
  });

  const params = new URLSearchParams(window.location.search);
  editId = params.get("id");

  const rolesRes = await fetch("/roles", {
    headers: { Authorization: "Bearer " + token },
  });
  const rolesList = await rolesRes.json();

  const rolesSelect = document.getElementById("rolesList");
  rolesList.forEach((r) => {
    const option = document.createElement("option");
    option.value = r.name;
    option.textContent = r.name;
    rolesSelect.appendChild(option);
  });

  if (editId) {
    document.getElementById("headerTitle").innerText = "Edit User";

    console.log("Fetching user:", `/users/${editId}`);

    const res = await fetch(`/users/${editId}`, {
      headers: { Authorization: "Bearer " + token },
    });

    console.log("Response status:", res.status);

    let u = null;

    try {
      u = await res.json();
      console.log("Response data:", u);
    } catch (err) {
      console.error("Failed to parse JSON", err);
      alert("Error loading user data");
      return;
    }

    if (!u || !u.id) {
      console.error("No user data returned!");
      alert("User not found");
      return;
    }

    document.querySelector("input[name=username]").value = u.username || "";
    document.querySelector("input[name=firstName]").value = u.firstName || "";
    document.querySelector("input[name=middleName]").value = u.middleName || "";
    document.querySelector("input[name=lastName]").value = u.lastName || "";
    document.querySelector("select[name=status]").value = u.status || "ACTIVE";

    (u.roles || []).forEach((role) => {
      const opt = [...rolesSelect.options].find(o => o.value === role.name);
      if (opt) opt.selected = true;
    });
}


  document
    .querySelector("#userForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);

      const payload: any = {
        firstName: form.get("firstName"),
        middleName: form.get("middleName"),
        lastName: form.get("lastName"),
        status: form.get("status"),
        roleNames: [...document.querySelector("#rolesList").selectedOptions].map(
          (o) => o.value,
        ),
      };

      if (!editId) {
        payload.username = form.get("username");
        payload.password = form.get("password");
      } else {
        const pwd = form.get("password");
        if (pwd) payload.password = pwd;
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
        alert("Error saving user");
        return;
      }

      window.location = "users.html";
    });
}

document.addEventListener("DOMContentLoaded", initUserForm);
