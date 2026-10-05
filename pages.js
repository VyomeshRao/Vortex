const pageContent = document.querySelector('.page-content');
const existing = {
  welcome: pageContent.querySelector('.welcome-row'),
  stats: pageContent.querySelector('.stats-grid'),
  demand: document.querySelector('#demand'),
  opportunity: document.querySelector('#opportunities'),
  activity: pageContent.querySelector('.activity-panel'),
  network: document.querySelector('#network'),
  footer: pageContent.querySelector('footer')
};

function makePage(id, eyebrow, title, description) {
  const page = document.createElement('section');
  page.className = 'page-view';
  page.id = `view-${id}`;
  page.dataset.page = id;
  page.innerHTML = `<header class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><span class="page-heading-mark">✳</span></header>`;
  return page;
}

const overviewPage = document.createElement('section');
overviewPage.className = 'page-view';
overviewPage.id = 'view-overview';
overviewPage.dataset.page = 'overview';
overviewPage.append(existing.welcome, existing.stats);
overviewPage.insertAdjacentHTML('beforeend', `
  <section class="overview-hero">
    <div class="hero-copy"><span class="hero-kicker"><i></i> YOUR SHOP, IN THE LOOP</span><h2>Good decisions start<br>with a better signal.</h2><p>Track what customers ask for, find patterns nearby, and turn missed sales into your next opportunity.</p><a class="hero-link" href="#demand">Explore demand signals <span>↗</span></a></div>
    <div class="hero-art" aria-hidden="true"><div class="hero-ring ring-a"></div><div class="hero-ring ring-b"></div><span class="hero-dot dot-a">🥛</span><span class="hero-dot dot-b">🌾</span><span class="hero-dot dot-c">🧴</span><span class="hero-center"><b>MM</b><i>✳</i></span><span class="hero-orbit-label">LOCAL PULSE · SAMPLE</span></div>
    <div class="hero-index"><b>01</b><span>LISTEN<br>LOCALLY</span></div>
  </section>
  <div class="section-lead"><div><div class="eyebrow">YOUR WORKSPACE</div><h2>Where do you want to go?</h2></div><span>Choose a view to explore</span></div>
  <section class="launch-grid" aria-label="Workspace pages">
    <a class="launch-card launch-demand" href="#demand"><span class="launch-icon">⌁</span><span class="launch-number">01 / LISTEN</span><h3>Demand signals</h3><p>Browse the requests customers are making around your shop.</p><span class="launch-bottom">Explore signals <b>↗</b></span></a>
    <a class="launch-card launch-network" href="#network"><span class="launch-icon">◎</span><span class="launch-number">02 / CONNECT</span><h3>Merchant network</h3><p>See how local shops can spot shared demand together.</p><span class="launch-bottom">Explore network <b>↗</b></span></a>
    <a class="launch-card launch-opportunity" href="#opportunities"><span class="launch-icon">↗</span><span class="launch-number">03 / GROW</span><h3>Opportunities</h3><p>Turn sample demand patterns into ideas worth exploring.</p><span class="launch-bottom">Explore ideas <b>↗</b></span></a>
  </section>
  <section class="overview-guide panel" aria-label="A simple way to use Merchant Mesh"><div class="guide-title"><span class="eyebrow">A SIMPLE WAY TO USE MERCHANT MESH</span><h2>Listen, spot a pattern, try a small step.</h2></div><div class="guide-steps"><article><span>01 · LISTEN</span><b>Capture the request</b><p>Note the item customers ask for and how often it comes up.</p></article><article><span>02 · SPOT A PATTERN</span><b>Look for repeats</b><p>Check whether the same need appears across customers or nearby shops.</p></article><article><span>03 · TRY A SMALL STEP</span><b>Review before restocking</b><p>Test a manageable quantity, then see how customers respond.</p></article></div></section>
  <div class="overview-note"><span>✳</span><p>Merchant Mesh is a demo. Demand and forecast figures are sample data; profiles and request counts stay in this browser.</p></div>
`);

const demandPage = makePage('demand', 'CUSTOMER VOICE', 'Demand signals', 'See which items customers request, how often they come up, and where nearby shops report the same need. Use repeat patterns to consider a small stock test.');
const demandLayout = document.createElement('div');
demandLayout.className = 'page-layout demand-layout';
demandLayout.append(existing.demand, existing.activity);
demandPage.append(demandLayout);
demandPage.insertAdjacentHTML('beforeend', `<aside class="page-guide"><span class="guide-symbol">⌁</span><div><b>Read requests as clues, not confirmed orders.</b><p>Look for repeat interest across customers and shops. Counts and trends here are illustrative sample data.</p></div></aside>`);

const networkPage = makePage('network', 'NEIGHBOURHOOD CONNECTIONS', 'Merchant network', 'Compare recurring customer needs across independent nearby shops. Shared patterns can guide supplier conversations while each shop keeps its own buying decisions.');
const networkLayout = document.createElement('div');
networkLayout.className = 'page-layout network-layout';
networkLayout.append(existing.network);
networkLayout.insertAdjacentHTML('beforeend', `
  <article class="network-story panel"><div class="eyebrow">WHY A MESH?</div><h2>Better signals, built together.</h2><p>One request may be easy to miss. When shops notice the same need, they can compare notes and decide whether a supplier conversation is worthwhile.</p><div class="network-steps"><div><span>01</span><b>Notice</b><small>Record the item and request count.</small></div><div><span>02</span><b>Compare</b><small>Look for the same need nearby.</small></div><div><span>03</span><b>Explore</b><small>Discuss options; each shop chooses.</small></div></div><p class="sample-caption">Illustrative network only: no other shops are connected and no orders are being coordinated.</p></article>
  <a class="network-cta" href="#opportunities"><span class="cta-orb">↗</span><span><b>Found a shared need?</b><small>See sample group buying ideas</small></span><span class="cta-arrow">→</span></a>
`);
networkPage.append(networkLayout);
const shopCountButton = existing.network.querySelector('.text-button');
const shopCountLabel = document.createElement('span');
shopCountLabel.className = 'sample-shop-count';
shopCountLabel.textContent = '12 sample shops';
shopCountButton.replaceWith(shopCountLabel);

const opportunitiesPage = makePage('opportunities', 'IDEAS TO EXPLORE', 'Opportunities', 'Turn repeat requests into practical, low-risk ideas. Weigh customer interest against supplier price, shelf life, and expected margin before changing your stock.');
const opportunityLayout = document.createElement('div');
opportunityLayout.className = 'page-layout opportunity-layout';
opportunityLayout.append(existing.opportunity);
opportunityLayout.insertAdjacentHTML('beforeend', `
  <div class="opportunity-side"><article class="opportunity-summary panel"><span class="opportunity-icon">✳</span><div class="eyebrow">THE IDEA</div><h2>Make a popular request easier to find.</h2><p>Try a small first order, ask regular customers what size they need, then review how it sells before restocking.</p><span class="idea-tag">LOW-RISK EXPERIMENT</span></article><article class="group-buy-card"><div><span class="eyebrow">BUYING TOGETHER</span><h2>Build a stronger order.</h2><p>Similar requests from nearby shops can make a supplier conversation easier.</p></div><button type="button" class="group-buy-link" id="openGroupBuying">Preview the idea <span>↗</span></button></article></div>
`);
opportunitiesPage.append(opportunityLayout);
opportunitiesPage.insertAdjacentHTML('beforeend', `<aside class="page-guide"><span class="guide-symbol">✳</span><div><b>Before you place an order</b><p>Check the supplier price, choose a test quantity you can manage, and set a date to review how it sells. The figures above are examples, not a sales forecast.</p></div></aside>`);

const footer = existing.footer;
pageContent.replaceChildren(overviewPage, demandPage, networkPage, opportunitiesPage, footer);

function navigateTo(pageName) {
  const page = document.querySelector(`#view-${pageName}`) || overviewPage;
  document.querySelectorAll('.page-view').forEach(view => view.classList.toggle('is-active', view === page));
  document.querySelectorAll('.nav-item').forEach(link => {
    const active = link.getAttribute('href') === `#${page.dataset.page}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const breadcrumb = document.querySelector('.breadcrumb b');
  const titles = { overview: 'Overview', demand: 'Demand signals', network: 'Merchant network', opportunities: 'Opportunities' };
  breadcrumb.textContent = titles[page.dataset.page] || 'Overview';
  document.querySelector('.main-content').scrollIntoView({ block: 'start' });
}

function readRoute() {
  const route = location.hash.slice(1);
  const pageName = route === 'demand' || route === 'network' || route === 'opportunities' ? route : 'overview';
  navigateTo(pageName);
}

window.addEventListener('hashchange', readRoute);
document.querySelector('#openGroupBuying').addEventListener('click', () => {
  document.querySelector('#coordinateBtn').click();
});
readRoute();
