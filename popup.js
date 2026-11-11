/* global LC, i18nData */
// popup.js — dépend de i18n.js (i18nData) et shared.js (LC)

let currentLang = 'fr';
let currentTheme = 'dark';
let currentView = 'list';  // list | grid
let currentSort = 'asc';   // asc | desc | manual
let customOrder = [];      // identifiants normalisés, dans l'ordre manuel
let currentFilter = '';    // texte de recherche normalisé

const MAX_IMPORT_BYTES = 1024 * 1024; // 1 Mo

// Traduction avec remplacement de {n}
function t(key, vars) {
  const dict = i18nData[currentLang] || i18nData.fr;
  let s = dict[key] !== undefined ? dict[key] : (i18nData.fr[key] || key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const keywordInput = document.getElementById('keyword-input');
  const urlInput = document.getElementById('url-input');
  const addBtn = document.getElementById('add-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const listContainer = document.getElementById('shortcuts-list');
  const formTitle = document.getElementById('form-title');
  const searchInput = document.getElementById('search-input');

  const exportBtn = document.getElementById('export-btn');
  const importFile = document.getElementById('import-file');
  const wipeBtn = document.getElementById('wipe-data-btn');
  const dragZone = document.getElementById('drag-zone');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const confirmOverlay = document.getElementById('confirm-overlay');

  const btnViewList = document.getElementById('view-list');
  const btnViewGrid = document.getElementById('view-grid');
  const btnSortAsc = document.getElementById('sort-asc');
  const btnSortDesc = document.getElementById('sort-desc');

  let isEditing = false;
  let editingOriginalKwd = null;

  // Exécute une opération de stockage et affiche une erreur claire si elle échoue (quota, etc.)
  async function guarded(fn) {
    try { return await fn(); }
    catch { showToast(t('toast_storage_error'), true); return undefined; }
  }

  // --- INITIALISATION ---
  async function initPrefs() {
    await LC.ready;
    const res = await chrome.storage.sync.get(['theme', 'lang', 'view', 'sort', 'customOrder', 'fallbackEngine']);
    if (res.theme === 'dark' || res.theme === 'light') currentTheme = res.theme;
    if (res.lang && i18nData[res.lang]) currentLang = res.lang;
    if (res.view === 'list' || res.view === 'grid') currentView = res.view;
    if (['asc', 'desc', 'manual'].includes(res.sort)) currentSort = res.sort;
    if (Array.isArray(res.customOrder)) customOrder = res.customOrder.map(LC.normalize);

    updateCustomSelect('theme-custom-select', currentTheme);
    updateCustomSelect('lang-custom-select', currentLang);
    updateCustomSelect('engine-custom-select', LC.FALLBACKS[res.fallbackEngine] ? res.fallbackEngine : 'google');

    applyTheme();
    applyLanguage();
    applyViewSettings();
    loadShortcuts();
  }

  // --- SELECTS PERSONNALISÉS (souris + clavier) ---
  function updateCustomSelect(id, value) {
    const sel = document.getElementById(id);
    sel.setAttribute('data-value', value);
    let txt = '';
    sel.querySelectorAll('.select-items div').forEach(opt => {
      const on = opt.getAttribute('data-value') === value;
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) txt = opt.innerHTML;
    });
    sel.querySelector('.select-selected span').innerHTML = txt;
  }

  function setSelectOpen(customSelect, open) {
    const items = customSelect.querySelector('.select-items');
    const selected = customSelect.querySelector('.select-selected');
    const cls = items.classList.contains('select-up') ? 'active-up' : 'active';
    items.classList.toggle('select-hide', !open);
    customSelect.classList.toggle(cls, open);
    if (!open) customSelect.classList.remove('active', 'active-up');
    selected.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function isSelectOpen(customSelect) {
    return !customSelect.querySelector('.select-items').classList.contains('select-hide');
  }

  function closeAllSelects(except) {
    document.querySelectorAll('.custom-select').forEach(sel => {
      if (sel !== except) setSelectOpen(sel, false);
    });
  }

  function chooseOption(customSelect, opt) {
    const val = opt.getAttribute('data-value');
    updateCustomSelect(customSelect.id, val);
    setSelectOpen(customSelect, false);
    customSelect.querySelector('.select-selected').focus();

    if (customSelect.id === 'theme-custom-select') {
      currentTheme = val;
      guarded(() => chrome.storage.sync.set({ theme: val }));
      applyTheme();
    } else if (customSelect.id === 'lang-custom-select') {
      currentLang = val;
      guarded(() => chrome.storage.sync.set({ lang: val }));
      applyLanguage();
      updateCustomSelect('theme-custom-select', currentTheme);
      loadShortcuts();
    } else if (customSelect.id === 'engine-custom-select') {
      guarded(() => chrome.storage.sync.set({ fallbackEngine: val }));
    }
  }

  document.querySelectorAll('.custom-select').forEach(customSelect => {
    const selected = customSelect.querySelector('.select-selected');
    const options = Array.from(customSelect.querySelectorAll('.select-items div'));

    selected.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllSelects(customSelect);
      setSelectOpen(customSelect, !isSelectOpen(customSelect));
    });

    selected.addEventListener('keydown', (e) => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        closeAllSelects(customSelect);
        setSelectOpen(customSelect, true);
        const cur = options.find(o => o.getAttribute('aria-selected') === 'true') || options[0];
        cur.focus();
      }
    });

    options.forEach((opt, i) => {
      opt.addEventListener('click', (e) => { e.stopPropagation(); chooseOption(customSelect, opt); });
      opt.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); options[Math.min(i + 1, options.length - 1)].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); options[Math.max(i - 1, 0)].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chooseOption(customSelect, opt); }
        else if (e.key === 'Tab') { setSelectOpen(customSelect, false); }
      });
    });
  });
  document.addEventListener('click', () => closeAllSelects(null));

  // --- TOASTS ---
  function showToast(msg, isError = false) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${isError ? 'error' : ''}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  // --- DIALOGUE DE CONFIRMATION ---
  function showConfirmDialog(title, message, buttons) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    const actions = document.getElementById('confirm-actions');
    actions.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = b.class || 'btn-outline';
      btn.textContent = b.text;
      btn.onclick = () => { confirmOverlay.classList.remove('active'); b.action(); };
      actions.appendChild(btn);
    });
    confirmOverlay.classList.add('active');
    actions.querySelector('button').focus();
  }

  // --- THÈME & LANGUE ---
  function applyTheme() { document.body.className = currentTheme + '-theme'; }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n'); if (i18nData[currentLang][k] !== undefined) el.innerHTML = t(k);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const txt = t(el.getAttribute('data-i18n-title'));
      el.title = txt; el.setAttribute('aria-label', txt);
    });
    keywordInput.setAttribute('aria-label', t('placeholder_keyword'));
    urlInput.setAttribute('aria-label', t('placeholder_url'));
    searchInput.setAttribute('aria-label', t('search_placeholder'));
    if (isEditing) { formTitle.textContent = t('form_edit'); addBtn.textContent = t('btn_update'); }
    else { formTitle.textContent = t('form_new'); addBtn.textContent = t('btn_add'); }
  }

  // --- RÉGLAGES, OVERLAYS & ÉCHAP ---
  settingsBtn.addEventListener('click', () => { settingsOverlay.classList.add('active'); closeSettingsBtn.focus(); });
  closeSettingsBtn.addEventListener('click', () => { settingsOverlay.classList.remove('active'); settingsBtn.focus(); });

  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = Array.from(document.querySelectorAll('.custom-select')).find(isSelectOpen);
    if (open) { setSelectOpen(open, false); open.querySelector('.select-selected').focus(); e.stopPropagation(); return; }
    if (confirmOverlay.classList.contains('active')) { confirmOverlay.classList.remove('active'); return; }
    if (settingsOverlay.classList.contains('active')) { settingsOverlay.classList.remove('active'); settingsBtn.focus(); }
  });

  // --- ONGLETS ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('data-tab');
      tabContents.forEach(tc => tc.style.display = tc.id === targetId ? 'flex' : 'none');
      if (targetId !== 'tab-add' && isEditing) resetForm();
    });
  });
  tabBtns.forEach(b => b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false'));
  function switchTab(tabId) { tabBtns.forEach(b => { if (b.getAttribute('data-tab') === tabId) b.click(); }); }

  // --- LISTE & BARRE D'OUTILS ---
  function applyViewSettings() {
    [btnViewList, btnViewGrid, btnSortAsc, btnSortDesc].forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    const on = (b) => { b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); };
    if (currentView === 'list') { on(btnViewList); listContainer.classList.remove('grid-view'); }
    else { on(btnViewGrid); listContainer.classList.add('grid-view'); }
    if (currentSort === 'asc') on(btnSortAsc);
    else if (currentSort === 'desc') on(btnSortDesc);
  }

  [btnViewList, btnViewGrid].forEach(b => b.addEventListener('click', () => {
    currentView = b.id === 'view-list' ? 'list' : 'grid';
    guarded(() => chrome.storage.sync.set({ view: currentView }));
    applyViewSettings();
  }));

  [btnSortAsc, btnSortDesc].forEach(b => b.addEventListener('click', () => {
    currentSort = b.id === 'sort-asc' ? 'asc' : 'desc';
    guarded(() => chrome.storage.sync.set({ sort: currentSort }));
    applyViewSettings();
    loadShortcuts();
  }));

  searchInput.addEventListener('input', () => {
    currentFilter = LC.normalize(searchInput.value);
    loadShortcuts();
  });

  async function loadShortcuts() {
    await LC.ready;
    const [list, usage] = await Promise.all([LC.getAll(), LC.getUsage()]);
    renderList(list, usage);
  }

  function sortList(list) {
    if (currentSort === 'manual') {
      const pos = new Map(customOrder.map((id, i) => [id, i]));
      return list.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : 1e9) - (pos.has(b.id) ? pos.get(b.id) : 1e9)
        || a.k.localeCompare(b.k));
    }
    return list.sort((a, b) => currentSort === 'asc' ? a.k.localeCompare(b.k) : b.k.localeCompare(a.k));
  }

  function renderList(all, usage) {
    listContainer.innerHTML = '';
    if (all.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">${t('empty_state')}</div>`;
      return;
    }
    let list = all;
    if (currentFilter) list = all.filter(s => s.id.includes(currentFilter) || s.u.toLowerCase().includes(currentFilter));
    if (list.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">${t('no_result')}</div>`;
      return;
    }
    sortList(list);

    list.forEach(({ id, k: key, u: url }) => {
      const item = document.createElement('div');
      item.className = 'shortcut-item';
      item.setAttribute('data-id', id);

      // Gabarit statique : aucune donnée utilisateur dans le HTML (voir textContent plus bas)
      item.innerHTML = `
        <div class="shortcut-info">
           <span class="shortcut-kwd"></span>
           <span class="shortcut-url"></span>
        </div>
        <div class="actions">
           <button class="icon-btn edit-b">
             <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
           </button>
           <button class="icon-btn delete delete-b">
             <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
           </button>
        </div>
      `;
      const kwdEl = item.querySelector('.shortcut-kwd');
      kwdEl.textContent = key;
      if (usage[id]) {
        const badge = document.createElement('span');
        badge.className = 'shortcut-count';
        badge.textContent = '×' + usage[id];
        badge.title = t('usage_tooltip');
        kwdEl.appendChild(badge);
      }
      const urlEl = item.querySelector('.shortcut-url');
      urlEl.textContent = url; urlEl.title = url;

      const editBtn = item.querySelector('.edit-b');
      editBtn.title = t('btn_edit_tooltip'); editBtn.setAttribute('aria-label', `${t('btn_edit_tooltip')}: ${key}`);
      editBtn.onclick = () => startEdit(key, url);
      const delBtn = item.querySelector('.delete-b');
      delBtn.title = t('btn_del_tooltip'); delBtn.setAttribute('aria-label', `${t('btn_del_tooltip')}: ${key}`);
      delBtn.onclick = () => confirmDeleteShortcut(id);

      // Glisser-déposer (désactivé pendant une recherche pour ne pas corrompre l'ordre)
      if (!currentFilter) {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', (e) => { e.dataTransfer.effectAllowed = 'move'; item.classList.add('dragging'); });
        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          const newOrder = Array.from(listContainer.querySelectorAll('.shortcut-item')).map(el => el.getAttribute('data-id'));
          currentSort = 'manual'; customOrder = newOrder; applyViewSettings();
          guarded(() => chrome.storage.sync.set({ customOrder: newOrder, sort: 'manual' }));
        });
        item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        item.addEventListener('dragenter', function (e) {
          e.preventDefault();
          const dragging = listContainer.querySelector('.dragging');
          if (dragging && dragging !== this) {
            const children = Array.from(listContainer.children);
            if (children.indexOf(dragging) < children.indexOf(this)) this.parentNode.insertBefore(dragging, this.nextSibling);
            else this.parentNode.insertBefore(dragging, this);
          }
        });
      }

      listContainer.appendChild(item);
    });
  }

  // --- FORMULAIRE ---
  function startEdit(kwd, url) {
    isEditing = true; editingOriginalKwd = kwd;
    keywordInput.value = kwd; urlInput.value = url;
    applyLanguage(); cancelEditBtn.style.display = 'block';
    switchTab('tab-add'); keywordInput.focus();
  }
  function resetForm() {
    isEditing = false; editingOriginalKwd = null;
    keywordInput.value = ''; urlInput.value = '';
    cancelEditBtn.style.display = 'none'; applyLanguage();
  }

  async function saveShortcut() {
    const url = LC.parseUrl(urlInput.value);
    // En création, "proj, p" crée deux alias vers la même URL. En édition, le champ est un seul mot.
    const kws = isEditing ? [keywordInput.value.trim()]
      : [...new Set(keywordInput.value.split(',').map(s => s.trim()).filter(Boolean))];
    if (!kws.length || kws.some(k => k.length > LC.MAX_KEYWORD || !LC.normalize(k))) { showToast(t('toast_kwd_invalid'), true); return; }
    if (!url) { showToast(t('toast_url_invalid'), true); return; }

    const ok = await guarded(async () => {
      await LC.saveMany(kws.map(k => ({ k, u: url })));
      if (isEditing && LC.normalize(editingOriginalKwd) !== LC.normalize(kws[0])) {
        await LC.remove(LC.normalize(editingOriginalKwd)); // supprimé seulement après sauvegarde réussie
      }
      return true;
    });
    if (!ok) return;
    resetForm(); loadShortcuts(); switchTab('tab-list');
    showToast(t('toast_add'));
  }

  function confirmDeleteShortcut(id) {
    showConfirmDialog(t('confirm_del_title'), t('confirm_del_msg'), [
      { text: t('btn_no'), class: 'btn-outline', action: () => {} },
      { text: t('btn_yes'), class: 'btn-danger', action: async () => {
        if (await guarded(async () => { await LC.remove(id); return true; })) { loadShortcuts(); showToast(t('toast_delete')); }
      } }
    ]);
  }

  // --- IMPORT / EXPORT / EFFACEMENT ---
  async function doExport() {
    const list = await LC.getAll();
    const obj = {};
    list.sort((a, b) => a.k.localeCompare(b.k)).forEach(s => { obj[s.k] = s.u; }); // format simple { mot: url }
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = href; a.download = 'link_catcher_backup.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  exportBtn.addEventListener('click', doExport);

  async function processImportData(jsonString) {
    let incoming;
    try {
      const imported = JSON.parse(jsonString);
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('format');
      const byId = new Map();
      for (const [k, v] of Object.entries(imported)) {
        const key = k.trim(); const url = typeof v === 'string' ? LC.parseUrl(v) : null;
        if (key && key.length <= LC.MAX_KEYWORD && LC.normalize(key) && url) byId.set(LC.normalize(key), { k: key, u: url });
      }
      if (byId.size === 0) throw new Error('empty');
      incoming = byId;
    } catch { showToast(t('toast_import_error'), true); return; }

    const existing = new Map((await LC.getAll()).map(s => [s.id, s]));
    const conflicts = [...incoming].filter(([id, it]) => existing.has(id) && existing.get(id).u !== it.u);

    const run = async (items) => {
      if (await guarded(async () => { await LC.saveMany(items); return true; })) {
        showToast(t('toast_import_count', { n: items.length }));
        loadShortcuts(); switchTab('tab-list');
      }
    };
    const all = [...incoming.values()];
    if (conflicts.length === 0) { run(all); return; }

    const conflictIds = new Set(conflicts.map(([id]) => id));
    showConfirmDialog(t('import_conflict_title'), t('import_conflict_msg', { n: conflicts.length }), [
      { text: t('btn_cancel'), class: 'btn-outline', action: () => {} },
      { text: t('btn_keep'), class: 'btn-outline', action: () => run([...incoming].filter(([id]) => !conflictIds.has(id)).map(([, it]) => it)) },
      { text: t('btn_replace'), class: 'btn-danger', action: () => run(all) }
    ]);
  }

  function readJsonFile(file) {
    if (file.size > MAX_IMPORT_BYTES) { showToast(t('toast_import_error'), true); return; }
    const reader = new FileReader();
    reader.onload = (ev) => processImportData(ev.target.result);
    reader.readAsText(file);
  }

  document.getElementById('upload-label').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); importFile.click(); }
  });
  importFile.addEventListener('change', (e) => {
    if (!e.target.files[0]) return;
    readJsonFile(e.target.files[0]);
    importFile.value = '';
  });

  dragZone.addEventListener('dragover', (e) => { e.preventDefault(); dragZone.classList.add('dragover'); });
  dragZone.addEventListener('dragleave', (e) => { e.preventDefault(); dragZone.classList.remove('dragover'); });
  dragZone.addEventListener('drop', (e) => {
    e.preventDefault(); dragZone.classList.remove('dragover');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) { showToast(t('toast_import_error'), true); return; }
    readJsonFile(file);
  });

  async function wipe() {
    if (await guarded(async () => { await LC.clear(); return true; })) { loadShortcuts(); showToast(t('toast_wipe')); }
  }
  wipeBtn.addEventListener('click', () => {
    showConfirmDialog(t('confirm_wipe_title'), t('confirm_wipe_msg'), [
      { text: t('btn_cancel'), class: 'btn-outline', action: () => {} },
      { text: t('btn_wipe_backup'), class: 'btn-outline', action: async () => { await doExport(); wipe(); } },
      { text: t('btn_wipe_direct'), class: 'btn-danger', action: wipe }
    ]);
  });

  // --- ÉVÉNEMENTS ---
  addBtn.addEventListener('click', saveShortcut);
  cancelEditBtn.addEventListener('click', () => { resetForm(); switchTab('tab-list'); });
  keywordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') urlInput.focus(); });
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveShortcut(); });

  initPrefs();
});
