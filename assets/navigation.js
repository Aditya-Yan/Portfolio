// Hash routes keep this portable on static hosting and under any subdirectory.
(() => {
  const cache = new Map();
  let currentRoute = '';
  let navigationVersion = 0;
  let restoreFrame = 0;
  let saveTimer = 0;
  let transitionTimer = 0;
  let transitionEndTimer = 0;
  let transitionVersion = 0;
  let states = {};
  try { states = JSON.parse(sessionStorage.getItem('portfolio-views') || '{}'); } catch { /* Storage may be unavailable. */ }
  if (!states || typeof states !== 'object' || Array.isArray(states)) states = {};
  const projectIds = ['glancear', 'signvision', 'researchly', 'akpsi-gpt', 'vantage', 'sentiment-radar'];
  const roleIds = ['ibm', 'capital-one', 'acm-research-lead', 'alura', 'acm-research-intern'];
  const escape = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const readRoute = () => {
    let parts;
    try { parts = decodeURIComponent(location.hash.slice(1)).split('/'); } catch { return ''; }
    if (!Object.hasOwn(panelMeta, parts[0])) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2 && parts[0] === 'projects' && Object.hasOwn(caseStudies, parts[1])) return parts.join('/');
    if (parts.length === 2 && parts[0] === 'experience' && roleIds.includes(parts[1])) return parts.join('/');
    return parts[0];
  };
  const viewKey = route => route.startsWith('experience/') ? 'experience' : route;
  const persist = () => {
    try { sessionStorage.setItem('portfolio-views', JSON.stringify(states)); } catch { /* In-memory state still works. */ }
  };
  function saveView() {
    if (!currentRoute) return;
    const key = viewKey(currentRoute);
    states[key] = {
      scroll: panelShell.scrollTop,
      filter: panelBody.querySelector('.filter-btn.active')?.dataset.filter || 'all'
    };
    persist();
  }
  panelShell.addEventListener('scroll', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveView, 80);
  }, { passive: true });
  window.addEventListener('pagehide', saveView);

  const sectionNav = document.createElement('nav');
  sectionNav.className = 'section-nav';
  sectionNav.setAttribute('aria-label', 'Portfolio sections');
  sectionNav.innerHTML = Object.entries(panelMeta).map(([key, value]) => `<a href="#${key}">${escape(key === 'about' ? 'About' : key === 'skills' ? 'Skills' : value.title)}</a>`).join('');
  document.querySelector('.panel-topbar').append(sectionNav);

  const jump = document.getElementById('tide-transition');
  const streaks = document.createElement('div');
  streaks.className = 'jump-streaks';
  for (let i = 0; i < 64; i++) {
    const streak = document.createElement('span');
    streak.style.setProperty('--angle', `${i * 137.508}deg`);
    streak.style.setProperty('--distance', `${4 + (i * 17 % 30)}vmin`);
    streak.style.setProperty('--delay', `${i % 8 * 7}ms`);
    streaks.append(streak);
  }
  const gate = document.createElement('div'); gate.className = 'jump-gate';
  const network = document.createElement('div'); network.className = 'jump-network';
  network.innerHTML = '<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice"><path d="M0 160 180 80 320 270 460 120 630 240 800 70 1000 160M0 540 180 380 320 530 460 360 630 490 800 390 1000 560M180 80v300l140-110v260l140-410v240l170-120v250L800 70v320"/><g><circle cx="180" cy="80" r="3"/><circle cx="320" cy="270" r="3"/><circle cx="460" cy="120" r="3"/><circle cx="630" cy="240" r="3"/><circle cx="800" cy="390" r="3"/></g></svg>';
  jump.append(streaks, gate, network);

  function addArrival(section) {
    if (panelBody.querySelector(':scope > .arrival-scene')) return;
    const scene = document.createElement('div');
    scene.className = 'arrival-scene';
    scene.dataset.world = section;
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = '<div class="arrival-stars"></div><div class="arrival-grid"></div><div class="arrival-orbit orbit-a"></div><div class="arrival-orbit orbit-b"></div><div class="arrival-world"><i></i><b></b></div><div class="arrival-satellite"></div><svg class="arrival-constellation" viewBox="0 0 700 200"><path d="m40 130 90-85 120 95 100-100 120 110L600 55l65 75M130 45l220-5 250 15M250 140l220 10"/><g><circle cx="40" cy="130" r="3"/><circle cx="130" cy="45" r="4"/><circle cx="250" cy="140" r="4"/><circle cx="350" cy="40" r="5"/><circle cx="470" cy="150" r="4"/><circle cx="600" cy="55" r="4"/><circle cx="665" cy="130" r="3"/></g></svg>';
    panelBody.prepend(scene);
  }


  const evidence = [
    { links: [['ACM neural research', 'experience/acm-research-lead'], ['Computer vision · SignVision', 'projects/signvision']], tools: { 'PyTorch':'experience/acm-research-lead', 'CNNs':'experience/acm-research-intern', 'GNNs':'experience/acm-research-intern', 'RNNs / LSTMs':'experience/acm-research-lead', 'Computer Vision':'projects/signvision', 'Model evaluation':'experience/acm-research-lead' } },
    { links: [['IBM · context & guardrails', 'experience/ibm'], ['Researchly · agent loop', 'projects/researchly']], tools: { 'Google ADK':'projects/researchly', 'MCP':'projects/researchly', 'RAG':'projects/researchly', 'Multi-agent workflows':'projects/researchly', 'Preinvoke plugins':'experience/ibm', 'Conversation history':'experience/ibm', 'Multimodal inputs':'experience/ibm', 'Prompt-injection checks':'experience/ibm', 'Tool integration':'experience/alura' } },
    { links: [['AKPsi GPT · Flask + React', 'projects/akpsi-gpt'], ['Vantage · TypeScript + Python', 'projects/vantage']], tools: { 'Python':'projects/researchly', 'TypeScript':'projects/vantage', 'JavaScript':'projects/signvision', 'Flask':'projects/akpsi-gpt', 'React':'projects/akpsi-gpt' } },
    { links: [['Capital One · Spark pipelines', 'experience/capital-one'], ['Vantage · database design', 'projects/vantage']], tools: { 'AWS Glue':'experience/capital-one', 'AWS EMR':'experience/capital-one', 'Apache Spark':'experience/capital-one', 'Supabase':'projects/vantage', 'SQL':'projects/vantage', 'Google Cloud Platform':'projects/signvision' } },
    { links: [['SignVision · Vercel deployment', 'projects/signvision'], ['GlanceAR · prototype boundaries', 'projects/glancear']], tools: { 'Vercel':'projects/signvision' } }
  ];

  function enhanceSection(section) {
    if (section === 'projects') {
      panelBody.querySelectorAll('.project-card').forEach((card, index) => {
        const id = projectIds[index];
        if (!id) return;
        card.id = `project-${id}`;
        if (!Object.hasOwn(caseStudies, id)) return;
        let actions = card.querySelector('.project-links');
        if (!actions) { actions = document.createElement('div'); actions.className = 'project-links'; card.append(actions); }
        const link = document.createElement('a');
        link.className = 'case-study-link'; link.href = `#projects/${id}`; link.textContent = 'Read case study ↗';
        actions.prepend(link);
      });
    }
    if (section === 'experience') {
      panelBody.querySelectorAll('.timeline-item').forEach((role, index) => {
        role.id = roleIds[index]; role.tabIndex = -1;
      });
      const index = document.createElement('nav');
      index.className = 'role-index'; index.setAttribute('aria-label', 'Jump to an experience');
      const labels = ['IBM', 'Capital One', 'ACM · Research Lead', 'Alura', 'ACM · Research Intern'];
      labels.forEach((label, i) => {
        const link = document.createElement('a'); link.href = `#experience/${roleIds[i]}`;
        link.textContent = label; index.append(link);
      });
      panelBody.prepend(index);

    }
    if (section === 'skills') {
      panelBody.querySelectorAll('.skill-card').forEach((card, index) => {
        const item = evidence[index];
        if (!item) return;
        card.querySelectorAll('li').forEach(chip => {
          const label = chip.textContent.trim(), route = item.tools[label];
          if (!route) return;
          const link = document.createElement('a');
          link.href = route.startsWith('https://') ? route : `#${route}`; link.textContent = label;
          if (route.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
          link.setAttribute('aria-label', `${label}: see related work`);
          chip.replaceChildren(link); chip.classList.add('evidence-chip');
        });
        const links = document.createElement('div');
        links.className = 'evidence-links';
        links.innerHTML = '<span>See it in practice</span>' + item.links.map(([label, route]) => `<a href="#${route}">${escape(label)} ↗</a>`).join('');
        card.append(links);
      });
    }
  }

  function caseStudyMarkup(id) {
    const study = caseStudies[id];
    return `<article class="case-study" aria-label="${escape(study.title)} case study">
      <a class="case-back" href="#projects">← All projects</a>
      <header class="case-opening"><span class="section-index">${escape(study.label)}</span></header>
      <section class="case-architecture"><h3>Architecture</h3><p>${escape(study.architecture)}</p><ol class="case-flow">${study.flow.map((step, index) => `<li><span>0${index+1}</span>${escape(step)}</li>`).join('')}</ol></section>
      <section class="case-stack"><h3>Tech stack</h3><dl>${study.techStack.map(([layer, tools]) => `<div><dt>${escape(layer)}</dt><dd>${escape(tools)}</dd></div>`).join('')}</dl></section>
      <section class="case-details"><h3>Key features & challenges</h3><div class="case-pair"><div><h4>Key features</h4><ul>${study.features.map(feature => `<li>${escape(feature)}</li>`).join('')}</ul></div><div><h4>Challenges</h4><ul>${study.challenges.map(challenge => `<li>${escape(challenge)}</li>`).join('')}</ul></div></div></section>
      <section class="case-takeaway"><h3>Engineering takeaway</h3><p>${escape(study.takeaway)}</p></section>
    </article>`;
  }

  function commitRoute(route) {
    if (route === currentRoute) return;
    const wasOpen = !!currentRoute;
    saveView();
    cancelAnimationFrame(restoreFrame);
    if (currentRoute) {
      const fragment = document.createDocumentFragment();
      while (panelBody.firstChild) fragment.append(panelBody.firstChild);
      cache.set(viewKey(currentRoute), fragment);
    }
    currentRoute = route;
    const version = ++navigationVersion;
    if (!route) {
      panelOverlay.classList.remove('active');
      panelOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.querySelectorAll('.easter-egg').forEach(el => { el.inert = false; });
      document.querySelector('.hub').inert = false;
      document.title = 'Aditya Yanamala — Portfolio';
      if (wasOpen) {
        const target = lastTrigger?.closest('.destination-menu')?.querySelector('summary') || (lastTrigger?.isConnected && lastTrigger.getClientRects().length ? lastTrigger : document.querySelector('.bubble-projects'));
        target.focus({ preventScroll: true });
      }
      return;
    }
    const [section, id] = route.split('/');
    const key = viewKey(route);
    eggToast.hidden = true;
    document.querySelectorAll('.easter-egg').forEach(el => { el.inert = true; });
    document.querySelector('.hub').inert = true;
    panelShell.dataset.section = section;
    panelTitle.textContent = section === 'projects' && id ? caseStudies[id].title : panelMeta[section].title;
    panelKicker.textContent = section === 'projects' && id ? 'Project case study' : panelMeta[section].kicker;
    document.title = `${panelTitle.textContent} — Aditya Yanamala`;
    sectionNav.querySelectorAll('a').forEach(link => {
      if (link.hash === `#${section}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (cache.has(key)) panelBody.append(cache.get(key));
    else if (section === 'projects' && id) panelBody.innerHTML = caseStudyMarkup(id);
    else {
      panelBody.append(document.getElementById(`${section}-template`).content.cloneNode(true));
      bindDynamicUI(section);
      enhanceSection(section);
      const filter = states[key]?.filter;
      if (section === 'projects' && filter) {
        [...panelBody.querySelectorAll('.filter-btn')].find(button => button.dataset.filter === filter)?.click();
      }
    }
    addArrival(section);
    panelOverlay.classList.add('active');
    panelOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    panelShell.focus({ preventScroll: true });
    restoreFrame = requestAnimationFrame(() => {
      if (version !== navigationVersion) return;
      if (section === 'experience' && id) {
        const target = document.getElementById(id);
        const header = document.querySelector('.panel-topbar');
        panelShell.scrollTop += target.getBoundingClientRect().top - panelShell.getBoundingClientRect().top - header.offsetHeight - 24;
        target.focus({ preventScroll: true });
      } else panelShell.scrollTop = Math.max(0, Number(states[key]?.scroll) || 0);
    });
  }

  function renderRoute({ immediate = false } = {}) {
    const route = readRoute();
    const tide = document.getElementById('tide-transition');
    const token = ++transitionVersion;
    clearTimeout(transitionTimer);
    clearTimeout(transitionEndTimer);
    tide.classList.remove('playing');
    tide.style.pointerEvents = '';
    if (route === currentRoute) return;
    if (immediate || reduceMotion.matches) {
      commitRoute(route);
      return;
    }
    const section = (route || currentRoute).split('/')[0];
    tide.dataset.variant = route ? ({about:'lunar', experience:'slingshot', projects:'warp', skills:'constellation', contact:'signal'})[section] : 'return';
    document.dispatchEvent(new CustomEvent('portfolio:travel', { detail: { from: currentRoute, to: route } }));
    void tide.offsetWidth;
    tide.classList.add('playing');
    tide.style.pointerEvents = 'auto';
    // The jump is fully covered at 310ms before the destination appears.
    // Keep the outgoing view intact until that covered interval.
    transitionTimer = setTimeout(() => {
      if (token === transitionVersion) commitRoute(route);
    }, 310);
    transitionEndTimer = setTimeout(() => {
      if (token !== transitionVersion) return;
      tide.classList.remove('playing');
      tide.style.pointerEvents = '';
    }, 640);
  }

  function navigate(route, trigger) {
    if (trigger && !panelOverlay.contains(trigger)) lastTrigger = trigger;
    const hash = route ? `#${route}` : '';
    if (location.hash !== hash) history.pushState(null, '', `${location.pathname}${location.search}${hash}`);
    renderRoute();
  }
  window.openPanel = (name, trigger) => navigate(name, trigger);
  window.closePanel = () => navigate('');
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-open-panel],a[href^="#"]');
    if (!control || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const route = control.dataset.openPanel || control.getAttribute('href').slice(1);
    if (!Object.hasOwn(panelMeta, route.split('/')[0])) return;
    event.preventDefault(); navigate(route, control);
  });
  backBtn.addEventListener('click', () => navigate(''));
  panelOverlay.addEventListener('click', event => { if (event.target === panelOverlay) navigate(''); });
  window.addEventListener('popstate', () => renderRoute({ immediate: true }));
  window.addEventListener('hashchange', () => renderRoute({ immediate: true }));
  document.addEventListener('keydown', event => {
    if (!currentRoute || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') { event.preventDefault(); navigate(''); }
    if (event.key !== 'Tab') return;
    const focusable = [...panelShell.querySelectorAll('a[href],button')].filter(el => !el.closest('[hidden]') && el.getClientRects().length && !el.disabled);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelShell)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  window.portfolio = { navigate, saveView };
  renderRoute({ immediate: true });
})();
