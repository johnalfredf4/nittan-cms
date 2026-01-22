const API = '/api/loanreceivable-assignment/retention-rules';
const params = new URLSearchParams(location.search);
const id = params.get('id');

if (id) {
  fetch(`${API}/${id}`)
    .then(res => res.json())
    .then(r => {
      document.getElementById('formTitle').innerText = 'Edit Retention Rule';
      Object.keys(r).forEach(k => {
        const el = document.getElementById(k);
        if (!el) return;
        el.type === 'checkbox' ? el.checked = r[k] : el.value = r[k];
      });
    });
}

document.getElementById('ruleForm').addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    categoryCode: categoryCode.value,
    dpdMin: +dpdMin.value,
    dpdMax: +dpdMax.value,
    retentionDays: +retentionDays.value,
    label: label.value,
    isActive: isActive.checked,
  };

  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${API}/${id}` : API;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  location.href = 'retention-rules.html';
});
