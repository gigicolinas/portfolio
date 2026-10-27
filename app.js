(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js-enabled');
  const q = (selector) => document.querySelector(selector);
  const all = (selector) => Array.from(document.querySelectorAll(selector));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualMotion = false;
  let motionEnabled = !prefersReduced.matches;
  try {
    const saved = localStorage.getItem('gg-aperitivo-motion');
    if (saved !== null) { motionEnabled = saved === 'on'; manualMotion = true; }
  } catch (_) { /* Motion preference also works without storage. */ }

  const motionToggle = q('#motion-toggle');
  function applyMotion(enabled, manual = false) {
    motionEnabled = enabled;
    if (manual) manualMotion = true;
    root.classList.toggle('reduced-motion', !enabled);
    root.classList.toggle('motion-override', manualMotion);
    motionToggle.setAttribute('aria-pressed', String(enabled));
    motionToggle.setAttribute('aria-label', enabled ? 'Desactivar animaciones' : 'Activar animaciones');
    q('#motion-label').textContent = enabled ? 'MOVIMIENTO' : 'PAUSA';
    if (manual) { try { localStorage.setItem('gg-aperitivo-motion', enabled ? 'on' : 'off'); } catch (_) {} }
    requestTick();
  }
  motionToggle.addEventListener('click', () => applyMotion(!motionEnabled, true));
  prefersReduced.addEventListener('change', (event) => { if (!manualMotion) applyMotion(!event.matches); });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -15px 0px' });
  all('.reveal').forEach((element, index) => {
    element.style.transitionDelay = (index % 2) * 70 + 'ms';
    revealObserver.observe(element);
  });

  const flavours = {
    paprika: {
      title: ['Almendra con', 'pimentón ahumado'],
      description: 'Una propuesta de tueste, humo y un final especiado. Pensada para explorar maridajes con bebidas secas y cítricas.',
      word: 'AHUMADO'
    },
    lemon: {
      title: ['Almendra con', 'limón y romero'],
      description: 'Una propuesta cítrica y herbal, con una sensación fresca. Pensada para probar con bebidas de aperitivo, tés fríos y opciones sin alcohol.',
      word: 'CÍTRICO'
    }
  };
  function setLines(element, lines) {
    element.replaceChildren();
    lines.forEach((line, index) => {
      if (index) element.append(document.createElement('br'));
      element.append(document.createTextNode(line));
    });
  }
  function selectFlavour(key) {
    const selected = flavours[key];
    if (!selected) return;
    all('.flavour-tab').forEach((button) => {
      const active = button.dataset.flavour === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    setLines(q('#flavour-name'), selected.title);
    q('#flavour-description').textContent = selected.description;
    q('#flavour-stage-word').textContent = selected.word;
    q('#flavour-stage').dataset.active = key;
    q('#flavour-panel').setAttribute('aria-labelledby', 'flavour-tab-' + key);
    all('.flavour-product').forEach((image) => {
      const active = image.id === 'flavour-image-' + key;
      image.classList.toggle('active', active);
      image.setAttribute('aria-hidden', String(!active));
    });
  }
  all('.flavour-tab').forEach((button) => button.addEventListener('click', () => selectFlavour(button.dataset.flavour)));

  const brands = {
    casa: {
      kicker: 'MARCA NUEVA RESPALDADA POR SOL DE ALBA',
      name: 'Casa Alba',
      description: 'Una casa de aperitivos mediterráneos con identidad propia. El producto conecta supermercados de importación, tiendas gourmet, regalo y compra para casa.',
      opportunity: 'Construir un universo gastronómico propio, con espacio para varias categorías.',
      tradeoff: 'La preferencia y el precio aceptado deben justificar el esfuerzo de crear una marca.',
      image: 'assets/casa-alba-doypack-v2.webp',
      alt: 'Maqueta de la nueva marca Casa Alba con dos bolsas y una caja degustación',
      caption: 'MAQUETA CONCEPTUAL · NOMBRE PROVISIONAL'
    },
    crunchers: {
      kicker: 'EXTENSIÓN PROPUESTA DE LA GAMA ACTUAL',
      name: 'Crunchers Aperitivo',
      description: 'Una colección premium dentro de Crunchers. La cultura del aperitivo español se concreta en sabores, presentación y una nueva ocasión de consumo.',
      opportunity: 'Concentrar el desarrollo en el producto y el canal, apoyándose en una gama que la empresa ya impulsa.',
      tradeoff: 'El valor premium debe sostenerse en la experiencia y convivir con el resto de la gama.',
      image: 'assets/crunchers.webp',
      alt: 'Maqueta de la extensión Crunchers Aperitivo con dos bolsas y una caja degustación',
      caption: 'EDICIÓN APERITIVO PROPUESTA · ENVASE CONCEPTUAL'
    }
  };
  let brandImageVersion = 0;
  function selectBrand(key) {
    const selected = brands[key];
    if (!selected) return;
    all('.brand-switch [role=tab]').forEach((button) => {
      const active = button.dataset.brand === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    q('#brand-panel').setAttribute('aria-labelledby', 'brand-tab-' + key);
    q('#brand-kicker').textContent = selected.kicker;
    q('#brand-name').textContent = selected.name;
    q('#brand-description').textContent = selected.description;
    q('#brand-opportunity').textContent = selected.opportunity;
    q('#brand-tradeoff').textContent = selected.tradeoff;
    q('.image-caption').textContent = selected.caption;
    const image = q('#brand-image');
    const version = ++brandImageVersion;
    image.style.opacity = motionEnabled ? '0.15' : '1';
    const swap = () => {
      if (version !== brandImageVersion) return;
      image.alt = selected.alt;
      image.onload = () => { if (version === brandImageVersion) image.style.opacity = '1'; };
      image.src = selected.image;
      if (image.complete) image.style.opacity = '1';
    };
    if (motionEnabled) window.setTimeout(swap, 150); else swap();
  }
  all('.brand-switch [role=tab]').forEach((button) => button.addEventListener('click', () => selectBrand(button.dataset.brand)));
  const brandPreload = new Image(); brandPreload.src = brands.crunchers.image;

  const cities = {
    shanghai: { stamp: 'SH', phase: 'PRIMER PILOTO', venue: ['Flair Rooftop', 'Restaurant & Bar'], hotel: 'The Ritz-Carlton Shanghai, Pudong', idea: 'Presentar las dos referencias en una degustación con el equipo de bar. Medir coste por servicio, aceptación y primer pedido repetido.', url: 'https://www.ritzcarlton.com/en/hotels/shasz-the-ritz-carlton-shanghai-pudong/dining/' },
    guangzhou: { stamp: 'GZ', phase: 'SEGUNDA PRUEBA', venue: ['The Churchill', 'Bar'], hotel: 'The Ritz-Carlton, Guangzhou', idea: 'Explorar una activación con un equipo de coctelería local. Introducir el producto si la primera prueba valida aceptación, precio y suministro.', url: 'https://www.ritzcarlton.com/en/hotels/canrz-the-ritz-carlton-guangzhou/dining/' },
    beijing: { stamp: 'BJ', phase: 'EXPANSIÓN CONDICIONADA', venue: ['XuanLang', 'Bar & Lounge'], hotel: 'The Ritz-Carlton Beijing, Financial Street', idea: 'Adaptar la presentación al equipo de F&B y a su carta. Ampliar con pedidos y costes reales, después de contrastar la recompra en los pilotos.', url: 'https://www.ritzcarlton.com/en/hotels/bjsfs-the-ritz-carlton-beijing-financial-street/dining/' },
    chengdu: { stamp: 'CD', phase: 'EXPANSIÓN CONDICIONADA', venue: ['FLAIR'], hotel: 'The Ritz-Carlton, Chengdu', idea: 'Desarrollar un maridaje con el equipo residente y contrastar su encaje sensorial. La decisión depende de margen, rotación y capacidad de reposición.', url: 'https://www.ritzcarlton.com/en/hotels/cturz-the-ritz-carlton-chengdu/dining/' }
  };
  function selectCity(key) {
    const selected = cities[key];
    if (!selected) return;
    all('.city-tab').forEach((button) => {
      const active = button.dataset.city === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    q('#city-panel').setAttribute('aria-labelledby', 'city-tab-' + key);
    q('#city-stamp').textContent = selected.stamp;
    q('#city-phase').textContent = selected.phase;
    setLines(q('#city-venue'), selected.venue);
    q('#city-hotel').textContent = selected.hotel;
    q('#city-idea').textContent = selected.idea;
    q('#city-source').href = selected.url;
    if (motionEnabled && q('#city-venue').animate) q('#city-venue').animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
  }
  all('.city-tab').forEach((button) => button.addEventListener('click', () => selectCity(button.dataset.city)));

  function rovingTabs(selector) {
    const buttons = all(selector);
    buttons.forEach((button, index) => button.addEventListener('keydown', (event) => {
      let target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = buttons.length - 1;
      if (target !== undefined) { event.preventDefault(); buttons[target].click(); buttons[target].focus(); }
    }));
  }
  rovingTabs('.flavour-tab');
  rovingTabs('.brand-switch [role=tab]');
  rovingTabs('.city-tab');

  function setCommerceStep(step, focusNext = false) {
    step = clamp(step, 0, 2);
    all('.commerce-step').forEach((button) => {
      const active = Number(button.dataset.step) === step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    all('.phone-screen').forEach((screen) => {
      const active = Number(screen.dataset.screen) === step;
      screen.hidden = !active;
      screen.classList.toggle('active', active);
    });
    if (focusNext) q('.phone-screen-' + step + ' .phone-cta').focus({ preventScroll: true });
  }
  all('.commerce-step').forEach((button) => button.addEventListener('click', () => setCommerceStep(Number(button.dataset.step))));
  q('#phone-discover').addEventListener('click', () => setCommerceStep(1, true));
  q('#phone-choose').addEventListener('click', () => setCommerceStep(2, true));
  q('#phone-restart').addEventListener('click', () => setCommerceStep(0, true));
  all('[data-phone-back]').forEach((button) => button.addEventListener('click', () => setCommerceStep(Number(button.dataset.phoneBack), true)));

  const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' });
  const number = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' });
  const decimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const months = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const economics = window.CasaAlbaEconomics;
  const packNumber = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
  const fields = {
    stores: q('#stores'), storePacksPerDay: q('#store-packs'), onlineBoxes: q('#online'),
    guest: q('#guest'), hotels: q('#hotels'), unitsPerDay: q('#units'), entryCost: q('#entry-cost')
  };
  const monthLabel = (value) => value === null ? 'Sin recuperación' : months.format(value) + ' meses';
  function calculate() {
    const input = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, Number(field.value)]));
    const result = economics.calculate(input);
    q('#stores-value').textContent = number.format(input.stores);
    q('#store-packs-value').textContent = packNumber.format(input.storePacksPerDay);
    q('#hotels-value').textContent = number.format(input.hotels);
    q('#units-value').textContent = number.format(input.unitsPerDay);
    q('#online-value').textContent = number.format(input.onlineBoxes);
    q('#guest-value').textContent = euro.format(input.guest);
    q('#entry-cost-value').textContent = euro.format(input.entryCost);
    const paybackElement = q('#payback-result');
    if (result.paybackMonths === null) paybackElement.textContent = 'Sin ventas';
    else {
      paybackElement.replaceChildren(document.createTextNode(months.format(result.paybackMonths) + ' '));
      const suffix = document.createElement('small'); suffix.textContent = 'meses'; paybackElement.append(suffix);
    }
    q('#contribution-result').textContent = euro.format(result.contribution);
    q('#campaign-result').textContent = euro.format(result.campaign);
    q('#investment-result').textContent = euro.format(result.investment);
    q('#after-investment').textContent = euro.format(result.afterInvestmentFirstYear);
    q('#viability-fill').style.width = clamp(result.firstYearContribution / result.investment) * 100 + '%';
    q('#viability-fill').style.background = result.afterInvestmentFirstYear >= 0 ? '#173d8b' : '#9b652b';
    q('#viability-text').textContent = result.afterInvestmentFirstYear >= 0
      ? 'Al mes 12, la contribución cubre la inversión y deja ' + euro.format(result.afterInvestmentFirstYear) + ' antes de estructura e impuestos.'
      : 'En 12 meses se recuperan ' + euro.format(result.firstYearContribution) + ' de los ' + euro.format(result.investment) + ' planteados.';
    q('#recovery-followup').textContent = result.afterInvestmentFirstYear >= 0 ? 'El presupuesto modelado queda cubierto dentro del primer año.' : 'La contribución de los meses siguientes cubre el saldo pendiente.';
    q('#campaign-payback').textContent = monthLabel(result.campaignPaybackMonths);
    q('#first-year-contribution').textContent = euro.format(result.firstYearContribution);
    q('#channel-units').textContent = [result.retailUnits, result.hotelUnits, result.onlineUnits].map(v => number.format(v)).join(' / ');
    q('#factory-revenue').textContent = euro.format(result.factoryRevenue);
    q('#required-stores').textContent = result.requiredStores12 === null ? 'Sin rotación retail' : number.format(result.requiredStores12) + ' puntos de venta';
    q('#budget-guest').textContent = euro.format(input.guest);
    q('#budget-total').textContent = euro.format(result.campaign);
    q('#budget-entry').textContent = euro.format(input.entryCost);
    q('#budget-launch').textContent = euro.format(result.investment);
    q('#sensitivity-note').textContent = 'Si el coste variable sube 0,10 €/bolsa, la recuperación del lanzamiento pasa a ' + monthLabel(result.higherCostPaybackMonths).toLowerCase() + '. Un retraso en el alta de las cuentas desplazaría también el calendario.';
    ['retail', 'hotel', 'online'].forEach(channel => {
      q('#' + channel + '-channel-units').textContent = number.format(result[channel + 'Units']);
      q('#' + channel + '-channel-contribution').textContent = euro.format(result[channel + 'Contribution']);
    });
    q('#annual-units').textContent = number.format(result.annualUnits);
    q('#channel-contribution-total').textContent = euro.format(result.contribution);
    setLines(q('#economic-formula'), [
      number.format(input.stores) + ' tiendas × ' + packNumber.format(input.storePacksPerDay) + ' packs × 10 bolsas × 360 días × 0,30 €',
      '+ (' + number.format(input.hotels) + ' espacios × ' + number.format(input.unitsPerDay) + ' bolsas × 360 días + ' + number.format(input.onlineBoxes) + ' cajas × 10) × 0,50 €',
      '= ' + euro.format(result.contribution) + ' de contribución anual a ritmo estable.'
    ]);
  }
  Object.values(fields).forEach(input => input.addEventListener('input', calculate));
  q('#reset-calculator').addEventListener('click', () => {
    Object.entries(fields).forEach(([key, field]) => { field.value = String(economics.defaults[key]); });
    calculate();
  });
  calculate();
  [ ['slow', 10, 0.5], ['base', 20, 1], ['fast', 30, 1.5] ].forEach(([name, stores, storePacksPerDay]) => {
    const result = economics.calculate({ stores, storePacksPerDay });
    q('#scenario-' + name + '-campaign').textContent = monthLabel(result.campaignPaybackMonths);
    q('#scenario-' + name + '-total').textContent = monthLabel(result.paybackMonths);
  });
  const retail = economics.retail();
  q('#retail-factory').textContent = '¥' + decimal.format(retail.factory);
  q('#retail-vat').textContent = '¥' + decimal.format(retail.vat);
  q('#retail-contribution').textContent = '¥' + decimal.format(retail.contribution);
  [[168, '#retail-low'], [198, '#retail-base'], [218, '#retail-high']].forEach(([price, selector]) => { q(selector).textContent = '¥' + decimal.format(economics.retail(price).contribution); });

  const journey = q('#viaje');
  const nightWorld = q('#night-world');
  const hero = q('#inicio');
  const nav = q('#nav');
  const progress = q('#nav-progress');
  const heroPaprika = q('.hero-pack-paprika');
  const heroLemon = q('.hero-pack-lemon');
  const topLink = q('#to-top');
  const pagePosition = q('#page-position');
  let tickScheduled = false;
  let pointerX = 0;
  let pointerY = 0;
  function requestTick() {
    if (tickScheduled) return;
    tickScheduled = true;
    requestAnimationFrame(renderScroll);
  }
  function renderScroll() {
    tickScheduled = false;
    const scroll = window.scrollY;
    const viewport = window.innerHeight;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - viewport);
    progress.style.transform = 'scaleX(' + clamp(scroll / scrollable) + ')';
    nav.classList.toggle('scrolled', scroll > 30);
    topLink.classList.toggle('visible', scroll > viewport * 0.7);
    pagePosition.classList.toggle('visible', scroll > viewport * 0.8);

    const journeyRect = journey.getBoundingClientRect();
    const journeyProgress = clamp(-journeyRect.top / Math.max(1, journeyRect.height - viewport));
    journey.style.setProperty('--jp', journeyProgress.toFixed(4));
    q('#journey-location').textContent = journeyProgress > 0.5 ? 'DE GRANADA' : 'GRANADA';
    const nightRect = nightWorld.getBoundingClientRect();
    const inNight = (journeyRect.top <= 65 && journeyRect.bottom > 65 && journeyProgress > 0.53)
      || (nightRect.top <= 65 && nightRect.bottom > 65);
    nav.classList.toggle('night', inNight);
    pagePosition.classList.toggle('night', inNight);
    let position = 'GRANADA / EL ORIGEN';
    if (q('#producto').getBoundingClientRect().top < viewport * .4) position = 'GRANADA / EL PRODUCTO';
    if (q('#marcas').getBoundingClientRect().top < viewport * .4) position = 'DOS RUTAS / UNA HIPÓTESIS';
    if (journeyRect.top < viewport * .4) position = journeyProgress > .5 ? 'SHANGHÁI / EL NUEVO ESCENARIO' : 'GRANADA → ASIA';
    if (q('#ciudades').getBoundingClientRect().top < viewport * .4) position = 'CHINA / CUATRO CIUDADES';
    if (q('#compra').getBoundingClientRect().top < viewport * .4) position = 'REDNOTE / DEL BAR A CASA';
    if (q('#piloto').getBoundingClientRect().top < viewport * .4) position = 'EL PILOTO / LOS SUPUESTOS';
    if (q('#autor').getBoundingClientRect().top < viewport * .4) position = 'GG / EL AUTOR';
    q('#position-label').textContent = position;

    if (motionEnabled && scroll < hero.offsetHeight + viewport * .15) {
      const movement = clamp(scroll / viewport);
      heroPaprika.style.transform = 'translate3d(' + pointerX * 12 + 'px,' + (movement * -45 + pointerY * 8) + 'px,0) rotate(' + (-10 + movement * 13 + pointerX * 3) + 'deg)';
      heroLemon.style.transform = 'translate3d(' + pointerX * -17 + 'px,' + (movement * -90 + pointerY * -10) + 'px,0) rotate(' + (11 - movement * 15 - pointerX * 3) + 'deg)';
    }
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !motionEnabled) return;
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    requestTick();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; requestTick(); });
  window.addEventListener('load', requestTick, { once: true });
  applyMotion(motionEnabled);
  document.fonts.ready.then(requestTick);
})();
