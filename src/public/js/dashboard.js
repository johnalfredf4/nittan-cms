document.addEventListener("DOMContentLoaded", async () => {
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

  const counts = {
    ACTIVE: users.filter((u) => u.status === "ACTIVE").length,
    INACTIVE: users.filter((u) => u.status === "INACTIVE").length,
    DELETED: users.filter((u) => u.status === "DELETED").length,
  };

  const ctx = document.getElementById("usersChart");
  // eslint-disable-next-line no-undef
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["ACTIVE", "INACTIVE", "DELETED"],
      datasets: [
        {
          label: "Users",
          data: [counts.ACTIVE, counts.INACTIVE, counts.DELETED],
        },
      ],
    },
  });
});
