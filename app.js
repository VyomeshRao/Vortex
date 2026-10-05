const dialog = document.querySelector('#requestDialog');
const toast = document.querySelector('#toast');
let requests = 248;
let toastTimer;
function openRequest() {
  dialog.showModal();
  document.querySelector('#productName').focus();
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
document.querySelector('#addRequest').addEventListener('click', openRequest);
document.querySelector('#logFromPanel').addEventListener('click', openRequest);
document.querySelector('#requestForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const product = document.querySelector('#productName').value.trim();
  const quantity = Number(document.querySelector('#requestCountInput').value);
  if (!product) return;
  requests += quantity;
  document.querySelector('#requestCount').innerHTML = `${requests} <small>this month</small>`;
  dialog.close();
  event.currentTarget.reset();
  showToast(`Request added — ${product} is now part of your local demand signal.`);
});
document.querySelector('#viewAll').addEventListener('click', () => {
  document.querySelector('#demandList').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Showing this week’s top neighbourhood requests.');
});
document.querySelector('#coordinateBtn').addEventListener('click', () => {
  showToast('Group buying interest shared with 5 nearby shops.');
});
document.querySelectorAll('.row-arrow').forEach(button => button.addEventListener('click', () => {
  const product = button.closest('.demand-row').querySelector('.product-info b').childNodes[0].textContent.trim();
  showToast(`${product}: demand is rising across nearby shops.`);
}));
document.querySelector('#chartPeriod').addEventListener('change', event => {
  showToast(`Neighbourhood pulse updated to ${event.target.value.toLowerCase()}.`);
});
