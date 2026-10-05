const toast = document.querySelector('#toast');
const accountDialog = document.querySelector('#accountDialog');
const profileDialog = document.querySelector('#profileDialog');
const profilesKey = 'merchant-mesh-demo-profiles';
const activeKey = 'merchant-mesh-active-profile';
let toastTimer;
let profiles = readProfiles();
const savedActiveId = safeGet(activeKey);
let activeProfile = profiles.find(profile => profile.id === savedActiveId) || null;

if (!profiles.length) {
  profiles = [{ id: createId(), name: 'Vyomesh Rao', store: 'Vijay Kirana', area: 'Indiranagar, Bengaluru', requests: 248 }];
  activeProfile = profiles[0];
  saveProfiles();
  safeSet(activeKey, activeProfile.id);
}
if (activeProfile) safeSet(activeKey, activeProfile.id);

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* The demo remains usable if storage is disabled. */ }
}
function readProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(profilesKey) || '[]');
    return Array.isArray(saved) ? saved.filter(profile => profile && profile.id && profile.name && profile.store) : [];
  } catch { return []; }
}
function saveProfiles() {
  safeSet(profilesKey, JSON.stringify(profiles));
}
function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function renderProfile() {
  const app = document.querySelector('.app-shell');
  const auth = document.querySelector('#authScreen');
  const signedIn = Boolean(activeProfile);
  app.hidden = !signedIn;
  auth.hidden = signedIn;
  if (!signedIn) {
    renderProfileChoices();
    return;
  }
  const firstName = activeProfile.name.trim().split(/\s+/)[0];
  document.querySelector('#topAccountButton').textContent = initials(activeProfile.name);
  document.querySelector('.store-switch b').textContent = activeProfile.store;
  document.querySelector('.store-switch small').textContent = activeProfile.area;
  const greeting = document.querySelector('#greeting');
  greeting.firstChild.textContent = `Welcome, ${firstName} `;
  document.querySelector('#requestCount').innerHTML = `${activeProfile.requests || 0} <small>this month</small>`;
  document.querySelector('#authSubtitle').textContent = 'Choose a saved demo profile to continue, or create a new one.';
}
function renderProfileChoices() {
  const list = document.querySelector('#profileList');
  list.replaceChildren();
  document.querySelector('#authTitle').textContent = profiles.length ? 'Welcome back' : 'Create your first profile';
  document.querySelector('#authSubtitle').textContent = profiles.length
    ? 'Choose a saved demo profile to continue, or create a new one.'
    : 'Create a local demo profile to explore the Merchant Mesh dashboard.';
  for (const profile of profiles) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-option';
    const badge = document.createElement('span');
    badge.className = 'profile-badge';
    badge.textContent = initials(profile.name);
    const details = document.createElement('span');
    const name = document.createElement('b');
    name.textContent = profile.name;
    const store = document.createElement('small');
    store.textContent = `${profile.store} · ${profile.area}`;
    details.append(name, store);
    const arrow = document.createElement('span');
    arrow.className = 'profile-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    button.append(badge, details, arrow);
    button.addEventListener('click', () => selectProfile(profile.id));
    list.append(button);
  }
}
function selectProfile(id) {
  activeProfile = profiles.find(profile => profile.id === id) || null;
  if (activeProfile) safeSet(activeKey, activeProfile.id);
  renderProfile();
}
function openProfileForm() {
  accountDialog.close();
  profileDialog.showModal();
  document.querySelector('#profileName').focus();
}
function signOut() {
  activeProfile = null;
  try { localStorage.removeItem(activeKey); } catch { /* The sign-out screen still opens. */ }
  accountDialog.close();
  renderProfile();
}

document.querySelector('#addRequest').addEventListener('click', () => {
  const dialog = document.querySelector('#requestDialog');
  dialog.showModal();
  document.querySelector('#productName').focus();
});
document.querySelector('#logFromPanel').addEventListener('click', () => document.querySelector('#requestDialog').showModal());
document.querySelector('#requestForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const product = document.querySelector('#productName').value.trim();
  const quantity = Number(document.querySelector('#requestCountInput').value);
  if (!product || !activeProfile) return;
  activeProfile.requests = (Number(activeProfile.requests) || 0) + quantity;
  saveProfiles();
  renderProfile();
  document.querySelector('#requestDialog').close();
  event.currentTarget.reset();
  showToast(`Request added — ${product} is now part of your local demo data.`);
});
document.querySelectorAll('.account-trigger').forEach(button => {
  button.addEventListener('click', () => accountDialog.showModal());
});
document.querySelector('#closeAccount').addEventListener('click', () => accountDialog.close());
document.querySelector('#switchProfileButton').addEventListener('click', () => {
  accountDialog.close();
  activeProfile = null;
  renderProfile();
});
document.querySelector('#logoutButton').addEventListener('click', signOut);
document.querySelector('#newProfileButton').addEventListener('click', openProfileForm);
document.querySelector('#createFromAccount').addEventListener('click', openProfileForm);
document.querySelector('#profileForm').addEventListener('submit', event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const name = document.querySelector('#profileName').value.trim();
  const store = document.querySelector('#profileStore').value.trim();
  const area = document.querySelector('#profileArea').value.trim();
  if (!name || !store || !area) return;
  const profile = { id: createId(), name, store, area, requests: 0 };
  profiles.push(profile);
  saveProfiles();
  profileDialog.close();
  event.currentTarget.reset();
  selectProfile(profile.id);
  showToast(`Profile created for ${name}.`);
});
document.querySelector('#viewAll').addEventListener('click', () => {
  document.querySelector('#demandList').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Showing this week’s sample neighbourhood requests.');
});
document.querySelector('#coordinateBtn').addEventListener('click', () => {
  showToast('Group buying preview: interest from 5 nearby sample shops.');
});
document.querySelectorAll('.row-arrow').forEach(button => button.addEventListener('click', () => {
  const product = button.closest('.demand-row').querySelector('.product-info b').childNodes[0].textContent.trim();
  showToast(`${product}: sample demand is rising across nearby shops.`);
}));
const demandCharts = {
  'This week': {
    title: 'Weekly demand pulse',
    values: [12, 18, 15, 22, 19, 31, 27],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    max: 40,
    ticks: [40, 30, 20, 10, 0],
    unit: 'day'
  },
  'This month': {
    title: 'Monthly demand pulse',
    values: [68, 82, 74, 96],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    max: 120,
    ticks: [120, 90, 60, 30, 0],
    unit: 'week'
  }
};
function renderDemandChart(period) {
  const chart = demandCharts[period];
  if (!chart) return;
  const points = chart.values.map((value, index) => ({
    x: index * (600 / (chart.values.length - 1)),
    y: 160 - (value / chart.max) * 130
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const area = `${line} L600 180 L0 180 Z`;
  document.querySelector('#demandChartTitle').textContent = chart.title;
  document.querySelector('#demandYAxis').replaceChildren(...chart.ticks.map(value => {
    const label = document.createElement('span');
    label.textContent = value;
    return label;
  }));
  const xLabels = document.querySelector('.x-labels');
  xLabels.replaceChildren(...chart.labels.map(value => {
    const label = document.createElement('span');
    label.textContent = value;
    return label;
  }));
  document.querySelector('.chart-line').setAttribute('d', line);
  document.querySelector('.area').setAttribute('d', area);
  const endPoint = points[points.length - 1];
  const marker = document.querySelector('.chart svg circle');
  marker.setAttribute('cx', endPoint.x);
  marker.setAttribute('cy', endPoint.y);
  document.querySelector('.chart svg').setAttribute('aria-label', `${chart.title}; sample requests per ${chart.unit}: ${chart.values.join(', ')}`);
}
document.querySelector('#chartPeriod').addEventListener('change', event => {
  renderDemandChart(event.target.value);
  showToast(`Showing separate sample totals by ${demandCharts[event.target.value].unit}.`);
});
renderDemandChart(document.querySelector('#chartPeriod').value);

renderProfile();
