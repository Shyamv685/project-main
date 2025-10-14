const API_BASE = 'http://127.0.0.1:5000/api';

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function analyzeText() {
  const text = document.getElementById('inputText').value;
  if (!text.trim()) {
    alert('Please paste some text first');
    return;
  }
  
  document.getElementById('summary').innerHTML = '<span class="loading">Analyzing...</span>';
  clearResults();
  
  try {
    const result = await postJson(API_BASE + '/analyze_text', {text});
    showResult(result);
  } catch (e) {
    document.getElementById('summary').innerHTML = `<span class="error">Error: ${e.message}</span>`;
  }
}

async function analyzeFile() {
  const fileInput = document.getElementById('fileInput');
  if (!fileInput.files.length) {
    alert('Please choose a file to upload');
    return;
  }
  
  const file = fileInput.files[0];
  const validTypes = ['text/plain', 'application/json', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(txt|json|jpg|jpeg|png|gif|bmp|tiff)$/i)) {
    alert('Please upload a valid text file or image');
    return;
  }

  const fd = new FormData();
  fd.append('file', file);
  
  document.getElementById('summary').innerHTML = '<span class="loading">Uploading and analyzing file...</span>';
  clearResults();
  
  try {
    const res = await fetch(API_BASE + '/analyze_file', {method: 'POST', body: fd});
    const result = await res.json();
    
    if (res.ok) {
      showResult(result);
    } else {
      document.getElementById('summary').innerHTML = `<span class="error">${result.error || 'File analysis failed'}</span>`;
    }
  } catch (e) {
    document.getElementById('summary').innerHTML = `<span class="error">Error: ${e.message}</span>`;
  }
}

function clearResults() {
  document.getElementById('classification').innerHTML = '';
  document.getElementById('evidence').innerHTML = '';
  document.getElementById('entities').innerHTML = '';
}

function clearAll() {
  document.getElementById('inputText').value = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('summary').innerText = 'No analysis yet.';
  clearResults();
}

function showResult(result) {
  document.getElementById('summary').innerText = result.summary || '';
  
  const classDiv = document.getElementById('classification');
  classDiv.innerHTML = `<strong>Classification:</strong> ${result.classification.label} (confidence: ${result.classification.confidence.toFixed(2)})`;

  const ev = result.evidence;
  const evidenceDiv = document.getElementById('evidence');
  evidenceDiv.innerHTML = '';
  
  const evidenceItems = [
    {key: 'emails', label: 'Emails'},
    {key: 'phones', label: 'Phone Numbers'},
    {key: 'ips', label: 'IP Addresses'},
    {key: 'urls', label: 'URLs'},
    {key: 'money', label: 'Money'},
    {key: 'dates', label: 'Dates'}
  ];

  evidenceItems.forEach(item => {
    if (ev[item.key] && ev[item.key].length) {
      const node = document.createElement('div');
      node.innerHTML = `<strong>${item.label}:</strong> ${ev[item.key].map(x => 
        `<span class="badge">${escapeHtml(x)}</span>`).join(' ')}`;
      evidenceDiv.appendChild(node);
    }
  });

  const ents = result.evidence.entities;
  const entDiv = document.getElementById('entities');
  entDiv.innerHTML = '';
  
  const entityTypes = [
    {key: 'PERSON', label: 'People'},
    {key: 'ORG', label: 'Organizations'},
    {key: 'GPE', label: 'Locations'}
  ];

  entityTypes.forEach(type => {
    if (ents[type.key] && ents[type.key].length) {
      const node = document.createElement('div');
      node.innerHTML = `<strong>${type.label}:</strong> ${ents[type.key].map(x => 
        `<span class="badge">${escapeHtml(x)}</span>`).join(' ')}`;
      entDiv.appendChild(node);
    }
  });
}

function escapeHtml(s) { 
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById('analyzeTextBtn').addEventListener('click', analyzeText);
document.getElementById('analyzeFileBtn').addEventListener('click', analyzeFile);
document.getElementById('clearBtn').addEventListener('click', clearAll);

// Allow Enter key to analyze text
document.getElementById('inputText').addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    analyzeText();
  }
});
