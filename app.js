const hourlyRate = 2000; // HUF/óra

async function loadData() {
  const [emps, recs] = await Promise.all([
    fetch('employees.json').then(r => r.json()),
    fetch('records.json').then(r => r.json())
  ]);

  renderEmployees(emps);
  renderRecords(recs);
  renderSalaries(emps, recs);
  handleInstallPrompt();
}

function renderEmployees(emps) {
  const ul = document.getElementById('employeeList');
  ul.innerHTML = '';
  emps.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e.Name;
    li.className = 'list-group-item';
    ul.appendChild(li);
  });
}

function renderRecords(recs) {
  const tbody = document.getElementById('recordsTable');
  tbody.innerHTML = '';
  const entryTimes = {};

  recs.forEach(r => {
    const tr = document.createElement('tr');
    const eventType = r.IsEntry ? 'Belépés' : 'Kilépés';
    const time = new Date(r.Timestamp).toLocaleString('hu-HU');
    let durationText = '';

    if (r.IsEntry) {
      entryTimes[r.EmployeeName] = r.Timestamp;
    } else {
      const start = entryTimes[r.EmployeeName];
      if (start) {
        const diffMs = new Date(r.Timestamp) - new Date(start);
        durationText = new Date(diffMs).toISOString().substr(11, 8);
      }
    }

    tr.innerHTML = `
      <td>${r.EmployeeName}</td>
      <td>${eventType}</td>
      <td>${time}</td>
      <td>${durationText}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSalaries(emps, recs) {
  const tbody = document.getElementById('salariesTable');
  tbody.innerHTML = '';
  const totalMs = {};
  const entryTimes = {};

  recs.forEach(r => {
    if (r.IsEntry) {
      entryTimes[r.EmployeeName] = new Date(r.Timestamp);
    } else {
      const start = entryTimes[r.EmployeeName];
      if (start) {
        const elapsed = new Date(r.Timestamp) - start;
        totalMs[r.EmployeeName] = (totalMs[r.EmployeeName] || 0) + elapsed;
      }
    }
  });

  emps.forEach(e => {
    const ms = totalMs[e.Name] || 0;
    const hours = ms / 1000 / 3600;
    const pay = Math.round(hours * hourlyRate);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.Name}</td>
      <td>${hours.toFixed(2)}</td>
      <td>${pay.toLocaleString('hu-HU')}</td>
    `;
    tbody.appendChild(tr);
  });
}

// PWA install prompt kezelése
let deferredPrompt;
function handleInstallPrompt() {
  const btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = 'block';
    btn.onclick = () => {
      btn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => (deferredPrompt = null));
    };
  });
}

window.addEventListener('DOMContentLoaded', loadData);
