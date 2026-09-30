(function () {
  var STORAGE_KEY = 'marea-agua-v1';

  function todayKey() {
    return dateToKey(new Date());
  }
  function dateToKey(d) {
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function keyToDate(k) {
    var parts = k.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { target: 12, days: {} };
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadState();
  if (!state.target) state.target = 12;
  if (!state.days) state.days = {};

  var currentKey = todayKey();
  var pendingTarget = state.target;

  var dayLabelEl = document.getElementById('day-label');
  var todayPillEl = document.getElementById('today-pill');
  var currentEl = document.getElementById('count-current');
  var targetEl = document.getElementById('count-target');
  var mlEl = document.getElementById('count-ml');
  var mlTargetEl = document.getElementById('count-ml-target');
  var glassBtn = document.getElementById('glass-btn');
  var undoBtn = document.getElementById('undo-btn');
  var prevBtn = document.getElementById('prev-day');
  var nextBtn = document.getElementById('next-day');
  var waterLayer = document.getElementById('water-layer');
  var celebrateEl = document.getElementById('celebrate-msg');
  var gearBtn = document.getElementById('gear-btn');
  var modalBackdrop = document.getElementById('modal-backdrop');
  var decTargetBtn = document.getElementById('dec-target');
  var incTargetBtn = document.getElementById('inc-target');
  var targetPreviewEl = document.getElementById('target-preview');
  var targetMlPreviewEl = document.getElementById('target-ml-preview');
  var saveSettingsBtn = document.getElementById('save-settings');

  var WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function formatDayLabel(key) {
    var d = keyToDate(key);
    var wd = WEEKDAYS[d.getDay()];
    return wd.charAt(0).toUpperCase() + wd.slice(1) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function render() {
    var count = state.days[currentKey] || 0;
    var target = state.target;
    var pct = Math.min(1, count / target);

    dayLabelEl.textContent = formatDayLabel(currentKey);
    todayPillEl.textContent = currentKey === todayKey() ? 'Hoy' : '';
    currentEl.textContent = count;
    targetEl.textContent = target;
    mlEl.textContent = (count * 350) + ' ml';
    mlTargetEl.textContent = (target * 350) + ' ml';

    waterLayer.style.height = (pct * 100) + '%';
    glassBtn.classList.toggle('maxed', count >= target);
    undoBtn.disabled = count <= 0;
    nextBtn.disabled = currentKey === todayKey();

    celebrateEl.textContent = (count >= target && target > 0) ? '¡Meta del día cumplida!' : '';
  }

  function addGlass() {
    var count = state.days[currentKey] || 0;
    state.days[currentKey] = count + 1;
    saveState();
    render();
  }
  function removeGlass() {
    var count = state.days[currentKey] || 0;
    if (count > 0) {
      state.days[currentKey] = count - 1;
      saveState();
      render();
    }
  }
  function shiftDay(delta) {
    var d = keyToDate(currentKey);
    d.setDate(d.getDate() + delta);
    var newKey = dateToKey(d);
    if (newKey > todayKey()) return;
    currentKey = newKey;
    render();
  }

  glassBtn.addEventListener('click', addGlass);
  undoBtn.addEventListener('click', removeGlass);
  prevBtn.addEventListener('click', function () { shiftDay(-1); });
  nextBtn.addEventListener('click', function () { shiftDay(1); });

  gearBtn.addEventListener('click', function () {
    pendingTarget = state.target;
    updateModalPreview();
    modalBackdrop.classList.add('open');
  });
  modalBackdrop.addEventListener('click', function (e) {
    if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
  });
  function updateModalPreview() {
    targetPreviewEl.textContent = pendingTarget;
    targetMlPreviewEl.textContent = (pendingTarget * 350) + ' ml';
  }
  decTargetBtn.addEventListener('click', function () {
    if (pendingTarget > 1) pendingTarget--;
    updateModalPreview();
  });
  incTargetBtn.addEventListener('click', function () {
    if (pendingTarget < 30) pendingTarget++;
    updateModalPreview();
  });
  saveSettingsBtn.addEventListener('click', function () {
    state.target = pendingTarget;
    saveState();
    modalBackdrop.classList.remove('open');
    render();
  });

  render();

  // Register service worker for offline support / installability.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {
        // Fails silently on file:// or unsupported environments; app still works online.
      });
    });
  }

  // Offer to install the app (Android/Chrome/Edge). The browser only fires
  // this event when the manifest + service worker qualify the page as
  // installable, so the button stays hidden until that happens.
  var installBtn = document.getElementById('install-btn');
  var deferredInstallPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (installBtn && !isStandalone) {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', function () {
      if (!deferredInstallPrompt) return;
      installBtn.hidden = true;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(function () {
        deferredInstallPrompt = null;
      });
    });

    window.addEventListener('appinstalled', function () {
      installBtn.hidden = true;
      deferredInstallPrompt = null;
    });
  }
})();
