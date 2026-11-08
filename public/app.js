const input = document.querySelector('#file-input');
const dropZone = document.querySelector('#drop-zone');
const filePanel = document.querySelector('#file-panel');
const fileName = document.querySelector('#file-name');
const fileSize = document.querySelector('#file-size');
const progressBar = document.querySelector('#progress-bar');
const progressValue = document.querySelector('#progress-value');
const warning = document.querySelector('#warning');
const errorMessage = document.querySelector('#error');
const results = document.querySelector('#results');
const sampleRows = document.querySelector('#sample-rows');
const megabyte = 1024 * 1024;

function formatBytes(bytes) {
  if (bytes >= megabyte) return (bytes / megabyte).toFixed(1) + ' MB';
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
  return bytes + ' B';
}
function setProgress(value) {
  const percentage = Math.min(100, Math.round(value));
  progressBar.style.width = percentage + '%';
  progressValue.textContent = percentage + '%';
}
function setBusy(isBusy) {
  input.disabled = isBusy;
  dropZone.classList.toggle('is-busy', isBusy);
}
function renderSamples(samples) {
  const fragment = document.createDocumentFragment();
  samples.forEach((sample) => {
    const row = document.createElement('tr');
    [sample.index, formatBytes(sample.bytes), formatBytes(sample.accumulated), sample.type]
      .forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    fragment.append(row);
  });
  sampleRows.replaceChildren(fragment);
}
function renderResult(data) {
  document.querySelector('#metric-size').textContent = formatBytes(data.totalBytes);
  document.querySelector('#metric-blocks').textContent = data.blocks;
  document.querySelector('#metric-largest').textContent = formatBytes(data.largestBlock);
  document.querySelector('#metric-time').textContent = data.durationMs + ' ms';
  document.querySelector('#hash-value').textContent = data.sha256;
  renderSamples(data.samples);
  results.hidden = false;
  setProgress(100);
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function upload(file) {
  if (!file) return;
  errorMessage.hidden = true;
  warning.hidden = file.size >= 10 * megabyte && file.size <= 30 * megabyte;
  if (!warning.hidden) {
    warning.textContent = 'Este archivo está fuera del rango recomendado de 10 a 30 MB, pero puede analizarse.';
  }
  if (file.size > 35 * megabyte) {
    errorMessage.textContent = 'Selecciona un archivo de máximo 35 MB.';
    errorMessage.hidden = false;
    return;
  }
  results.hidden = true;
  filePanel.hidden = false;
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size) + ' · ' + (file.type || 'tipo desconocido');
  setProgress(0);
  setBusy(true);
  const request = new XMLHttpRequest();
  request.open('POST', '/api/analyze');
  request.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
  request.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
  request.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) setProgress((event.loaded / event.total) * 100);
  });
  request.addEventListener('load', () => {
    setBusy(false);
    try {
      const data = JSON.parse(request.responseText);
      if (request.status !== 200) throw new Error(data.error);
      renderResult(data);
    } catch (error) {
      errorMessage.textContent = error.message || 'No fue posible analizar el archivo.';
      errorMessage.hidden = false;
    }
  });
  request.addEventListener('error', () => {
    setBusy(false);
    errorMessage.textContent = 'Se perdió la conexión durante la carga.';
    errorMessage.hidden = false;
  });
  request.send(file);
}
input.addEventListener('change', () => upload(input.files[0]));
['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (!input.disabled) dropZone.classList.add('is-dragging');
  });
});
['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  });
});
dropZone.addEventListener('drop', (event) => upload(event.dataTransfer.files[0]));
dropZone.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && !input.disabled) {
    event.preventDefault();
    input.click();
  }
});
