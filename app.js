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
function updateCurrentDate() {
  const now = new Date();
  document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  }).format(now).toUpperCase();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  setTimeout(updateCurrentDate, nextMidnight.getTime() - now.getTime() + 50);
}
const categoryExamples = {
  'Dairy & alternatives': ['milk', 'oat milk', 'soy milk', 'almond milk', 'yogurt', 'yoghurt', 'curd', 'paneer', 'cheese', 'butter', 'cream'],
  'Grains & staples': ['atta', 'gluten free atta', 'rice', 'basmati rice', 'millet', 'flour', 'bread', 'oats', 'pasta', 'noodles', 'lentils', 'dal'],
  'Home & personal care': ['detergent', 'laundry liquid', 'cleaning products', 'refill cleaner', 'dish soap', 'floor cleaner', 'hand wash', 'shampoo', 'toothpaste'],
  'Pantry & snacks': ['peanut butter', 'unsweetened peanut butter', 'almonds', 'roasted nuts', 'biscuits', 'chips', 'coffee', 'tea', 'honey', 'cooking oil', 'spices', 'cereal'],
  'Fresh produce': ['tomatoes', 'onions', 'potatoes', 'spinach', 'apples', 'bananas', 'lemons', 'vegetables', 'fruits', 'coriander']
};
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}
const categoryModel = (() => {
  const vocabulary = new Set();
  const models = Object.entries(categoryExamples).map(([name, examples]) => {
    const counts = new Map();
    let total = 0;
    examples.flatMap(tokenize).forEach(token => {
      vocabulary.add(token);
      counts.set(token, (counts.get(token) || 0) + 1);
      total += 1;
    });
    return { name, examples: examples.length, counts, total };
  });
  return { vocabulary, models, totalExamples: models.reduce((sum, model) => sum + model.examples, 0) };
})();
function categorizeRequest(item) {
  const tokens = tokenize(item).filter(token => categoryModel.vocabulary.has(token));
  if (!tokens.length) return 'General groceries';
  const scored = categoryModel.models.map(model => {
    let score = Math.log(model.examples / categoryModel.totalExamples);
    const denominator = model.total + categoryModel.vocabulary.size;
    for (const token of tokens) score += Math.log(((model.counts.get(token) || 0) + 1) / denominator);
    return { name: model.name, score };
  });
  return scored.sort((a, b) => b.score - a.score)[0].name;
}
function renderRequestHistory() {
  const list = document.querySelector('#userRequestList');
  if (!list) return;
  const requests = Array.isArray(activeProfile?.requestLog) ? activeProfile.requestLog.slice(-5).reverse() : [];
  list.replaceChildren(...requests.map(request => {
    const row = document.createElement('li');
    const details = document.createElement('span');
    const name = document.createElement('b');
    const meta = document.createElement('small');
    name.textContent = request.item;
    meta.textContent = `${request.category} · ${request.countLabel}`;
    details.append(name, meta);
    const date = document.createElement('time');
    date.dateTime = request.createdAt;
    date.textContent = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(request.createdAt));
    row.append(details, date);
    return row;
  }));
  document.querySelector('#emptyRequestHistory').hidden = requests.length > 0;
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
  renderRequestHistory();
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
  const countLabel = document.querySelector('#requestCountInput').selectedOptions[0].textContent;
  const category = categorizeRequest(product);
  activeProfile.requestLog = Array.isArray(activeProfile.requestLog) ? activeProfile.requestLog : [];
  activeProfile.requestLog.push({ item: product, category, countLabel, createdAt: new Date().toISOString() });
  activeProfile.requests = (Number(activeProfile.requests) || 0) + quantity;
  saveProfiles();
  renderProfile();
  document.querySelector('#requestDialog').close();
  event.currentTarget.reset();
  document.querySelector('#categoryPreview').innerHTML = `Suggested category: ${category} <small>On-device ML demo model · check the suggestion</small>`;
  document.querySelector('#voiceStatus').textContent = 'Request saved to your local profile.';
  showToast(`Request saved locally — ${product} · ${category}.`);
});
const productInput = document.querySelector('#productName');
productInput.addEventListener('input', () => {
  const category = categorizeRequest(productInput.value);
  document.querySelector('#categoryPreview').innerHTML = `Suggested category: ${category} <small>On-device ML demo model · check the suggestion</small>`;
});
const voiceButton = document.querySelector('#voiceInput');
const voiceStatus = document.querySelector('#voiceStatus');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceButton.addEventListener('click', () => {
    voiceStatus.textContent = 'Voice input is not supported in this browser. Type the request instead.';
  });
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  voiceButton.addEventListener('click', () => {
    voiceStatus.textContent = 'Listening… speak the product name now.';
    try { recognition.start(); } catch { voiceStatus.textContent = 'Voice capture is already starting. Please try again in a moment.'; }
  });
  recognition.addEventListener('result', event => {
    productInput.value = event.results[0][0].transcript.trim().slice(0, 60);
    productInput.dispatchEvent(new Event('input', { bubbles: true }));
    voiceStatus.textContent = 'Voice captured. Check the text and category, then add the request.';
  });
  recognition.addEventListener('error', event => {
    voiceStatus.textContent = event.error === 'not-allowed'
      ? 'Microphone permission was blocked. Allow microphone access in Chrome site settings and try again.'
      : 'Could not capture speech. Try again or type the request.';
  });
  recognition.addEventListener('end', () => {
    if (voiceStatus.textContent.startsWith('Listening')) voiceStatus.textContent = 'No speech detected. Try again or type the request.';
  });
}
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
updateCurrentDate();

const assistantPanel = document.querySelector('#assistantPanel');
const assistantMessages = document.querySelector('#assistantMessages');
const assistantStatus = document.querySelector('#assistantStatus');
const assistantHistory = [];
let assistantBusy = false;
fetch(new URL('api/assistant', window.location.href))
  .then(response => response.ok ? response.json() : Promise.reject(new Error('Assistant endpoint unavailable')))
  .then(status => {
    assistantStatus.textContent = status.configured ? 'Gemini ready · Merchant Mesh guide' : 'Gemini not configured · demo mode';
  })
  .catch(() => {
    assistantStatus.textContent = 'Gemini not connected · demo mode';
  });
function appendAssistantMessage(text, kind, action, source) {
  const message = document.createElement('div');
  message.className = `assistant-message ${kind === 'user' ? 'assistant-user' : 'assistant-reply'}`;
  message.textContent = text;
  if (source && kind !== 'user') {
    const label = document.createElement('small');
    label.className = 'assistant-source';
    label.textContent = source;
    message.append(label);
  }
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'assistant-action';
    button.textContent = action.label;
    button.addEventListener('click', action.run);
    message.append(button);
  }
  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}
function answerAssistant(question) {
  const text = question.toLowerCase();
  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return { text: 'Hello! Ask me about demand, recording requests, product categories, or how this demo stores data.' };
  }
  if (/stock|recommend|opportunit|what.*sell|what.*buy|what.*order/.test(text)) {
    return {
      text: 'Oat milk is highlighted in this demo: 32 sample requests across 5 sample shops. It is a signal to investigate, not a sales forecast or a live recommendation. Consider a small test and check your costs.',
      action: { label: 'Open Opportunities', run: () => { location.hash = 'opportunities'; closeAssistant(); } }
    };
  }
  if (/voice|speak|microphone|record|log.*request|add.*request/.test(text)) {
    return {
      text: 'Open Demand Signals and choose “Log a customer request”. In the form, tap “Use voice”, allow microphone access, review the transcription and category, then save. Browser speech recognition may use your browser’s speech service.',
      action: { label: 'Open request form', run: () => { location.hash = 'demand'; document.querySelector('#requestDialog').showModal(); closeAssistant(); } }
    };
  }
  if (/categor|classif|understand|model|\bai\b|artificial intelligence/.test(text)) {
    return { text: 'The request form uses a small text classifier trained on built-in sample product phrases. It runs in this browser and suggests a category; please review it. The chat can use Gemini when the secure hosting endpoint is configured.' };
  }
  if (/privacy|private|anonymous|data|save|stored|share/.test(text)) {
    return { text: 'Profiles and saved request notes stay in this browser on this device; this demo does not aggregate them across shops. Voice transcription uses the browser speech service, whose audio handling depends on your browser provider.' };
  }
  if (/network|nearby shop|merchant|aggregate|group buy|buying together/.test(text)) {
    return { text: 'The Merchant Network page illustrates how shops could compare shared demand. The shops and counts shown are sample data; no other merchants are connected and no group orders are being created.' };
  }
  if (/chart|trend|forecast|month|week|request count/.test(text)) {
    return { text: 'The demand chart switches between separate sample totals by day and by week. These numbers are illustrative; there is no live demand feed or forecasting service connected.' };
  }
  return { text: 'I can help with demand signals, stock ideas, voice capture, product categories, privacy, and the sample merchant network. Gemini chat requires the secure hosting endpoint to be configured.' };
}
async function submitAssistantQuestion(question) {
  const clean = question.trim();
  if (!clean || assistantBusy) return;
  assistantBusy = true;
  appendAssistantMessage(clean, 'user');
  const thinking = document.createElement('div');
  thinking.className = 'assistant-message assistant-reply assistant-thinking';
  thinking.textContent = 'Connecting to Gemini…';
  assistantMessages.append(thinking);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  try {
    const response = await fetch(new URL('api/assistant', window.location.href), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...assistantHistory, { role: 'user', content: clean }].slice(-12) })
    });
    if (!response.ok) throw new Error('Assistant endpoint unavailable');
    const data = await response.json();
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty assistant reply');
    assistantHistory.push({ role: 'user', content: clean }, { role: 'assistant', content: data.reply });
    assistantHistory.splice(0, Math.max(0, assistantHistory.length - 12));
    assistantStatus.textContent = 'Gemini connected · Merchant Mesh guide';
    thinking.remove();
    appendAssistantMessage(data.reply, 'assistant', null, 'Gemini');
  } catch {
    thinking.remove();
    assistantStatus.textContent = 'Gemini not connected · demo mode';
    const answer = answerAssistant(clean);
    appendAssistantMessage(`${answer.text}\n\nGemini is not connected yet, so this is a built-in demo reply.`, 'assistant', answer.action, 'Demo reply');
  } finally {
    assistantBusy = false;
  }
}
const assistantToggle = document.querySelector('#assistantToggle');
function closeAssistant() {
  assistantPanel.hidden = true;
  assistantToggle.setAttribute('aria-expanded', 'false');
}
assistantToggle.addEventListener('click', () => {
  assistantPanel.hidden = !assistantPanel.hidden;
  assistantToggle.setAttribute('aria-expanded', String(!assistantPanel.hidden));
  if (!assistantPanel.hidden) document.querySelector('#assistantInput').focus();
});
document.querySelector('#assistantClose').addEventListener('click', () => {
  closeAssistant();
  assistantToggle.focus();
});
document.querySelector('#assistantForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#assistantInput');
  submitAssistantQuestion(input.value);
  input.value = '';
});
assistantMessages.addEventListener('click', event => {
  const suggestion = event.target.closest('[data-prompt]');
  if (suggestion) submitAssistantQuestion(suggestion.dataset.prompt);
});

