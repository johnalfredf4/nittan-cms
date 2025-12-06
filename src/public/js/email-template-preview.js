async function loadPreview() {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch(`/email-templates/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const t = await res.json();

  document.getElementById("templateName").innerText = t.name;
  document.getElementById("templateSubject").innerText = t.subject;
  document.getElementById("bodyHTML").innerHTML = t.body;
}

document.addEventListener("DOMContentLoaded", loadPreview);
