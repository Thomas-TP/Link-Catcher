// popup.js

// --- i18n Dictionaries ---
const i18nData = {
  fr: {
    header_subtitle: "Vos liens instantanés", tab_shortcuts: "Mes raccourcis", tab_add: "Nouveau", tab_data: "Données",
    form_new: "Nouveau Raccourci", form_edit: "Modifier Raccourci", placeholder_keyword: "Mot précis (ex: proj)", placeholder_url: "URL associée (https://...)",
    btn_cancel: "Annuler", btn_add: "Ajouter", btn_update: "Mettre à", btn_export: "Exporter", btn_import: "Importer JSON", btn_wipe: "Supprimer tout",
    data_title: "Import / Export", data_desc: "Sauvegardez vos liens ou restaurez-les depuis un fichier JSON.",
    settings_title: "Paramètres", settings_theme: "Thème", settings_lang: "Langue", theme_dark: "Sombre", theme_light: "Clair", settings_tooltip: "Paramètres",
    empty_state: "Aucun lien enregistré.<br>Allez dans \"Nouveau\" pour commencer !",
    toast_import_success: "Importation réussie !", toast_import_error: "Format JSON invalide.", toast_copy: "Texte copié", toast_wipe: "Toutes les données ont été effacées.", toast_delete: "Raccourci supprimé.", toast_add: "Raccourci sauvegardé.",
    btn_edit_tooltip: "Modifier", btn_del_tooltip: "Supprimer", view_list: "Vue Liste", view_grid: "Vue Grille", sort_asc: "A-Z", sort_desc: "Z-A",
    confirm_del_title: "Supprimer ?", confirm_del_msg: "Voulez-vous supprimer ce raccourci ?", btn_yes: "Supprimer", btn_no: "Annuler",
    confirm_wipe_title: "Effacer les données ?", confirm_wipe_msg: "Cette action est irréversible. Voulez-vous sauvegarder avant de supprimer ?", btn_wipe_backup: "Sauvegarder & Supprimer", btn_wipe_direct: "Supprimer définitivement"
  },
  en: {
    header_subtitle: "Your instant shortcuts", tab_shortcuts: "Shortcuts", tab_add: "Add New", tab_data: "Data",
    form_new: "New Shortcut", form_edit: "Edit Shortcut", placeholder_keyword: "Exact keyword (e.g. proj)", placeholder_url: "Target URL (https://...)",
    btn_cancel: "Cancel", btn_add: "Add Shortcut", btn_update: "Update", btn_export: "Export JSON", btn_import: "Import JSON", btn_wipe: "Clear all data",
    data_title: "Import / Export", data_desc: "Save your links or restore them from a JSON backup.",
    settings_title: "Settings", settings_theme: "Theme", settings_lang: "Language", theme_dark: "Dark", theme_light: "Light", settings_tooltip: "Settings",
    empty_state: "No shortcuts saved yet.<br>Go to \"Add New\" to create one!",
    toast_import_success: "Successfully imported!", toast_import_error: "Invalid JSON format.", toast_copy: "Copied!", toast_wipe: "All data cleared.", toast_delete: "Shortcut deleted.", toast_add: "Shortcut saved.",
    btn_edit_tooltip: "Edit", btn_del_tooltip: "Delete", view_list: "List View", view_grid: "Grid View", sort_asc: "A-Z", sort_desc: "Z-A",
    confirm_del_title: "Delete?", confirm_del_msg: "Are you sure you want to delete this shortcut?", btn_yes: "Delete", btn_no: "Cancel",
    confirm_wipe_title: "Clear all data?", confirm_wipe_msg: "This action cannot be undone. Do you want to backup first?", btn_wipe_backup: "Backup & Delete", btn_wipe_direct: "Delete without backup"
  },
  es: {
    header_subtitle: "Tus enlaces", tab_shortcuts: "Accesos", tab_add: "Nuevo", tab_data: "Datos",
    form_new: "Nuevo Acceso", form_edit: "Editar", placeholder_keyword: "Palabra clave", placeholder_url: "URL destino",
    btn_cancel: "Cancelar", btn_add: "Añadir", btn_update: "Modificar", btn_export: "Exportar", btn_import: "Importar JSON", btn_wipe: "Borrar todo",
    data_title: "Importar / Exportar", data_desc: "Guarde sus enlaces o restáurelos desde un archivo JSON.",
    settings_title: "Ajustes", settings_theme: "Tema", settings_lang: "Idioma", theme_dark: "Oscuro", theme_light: "Claro", settings_tooltip: "Ajustes",
    empty_state: "No hay enlaces libres.<br>Añade uno nuevo.",
    toast_import_success: "Importado!", toast_import_error: "Formato no válido.", toast_copy: "Copiado", toast_wipe: "Borrados.", toast_delete: "Eliminado.", toast_add: "Guardado.",
    btn_edit_tooltip: "Editar", btn_del_tooltip: "Borrar", view_list: "Lista", view_grid: "Cuadrícula", sort_asc: "A-Z", sort_desc: "Z-A",
    confirm_del_title: "¿Borrar?", confirm_del_msg: "¿Eliminar este acceso?", btn_yes: "Borrar", btn_no: "Cancelar",
    confirm_wipe_title: "¿Borrar datos?", confirm_wipe_msg: "Irreversible. ¿Quiere guardar una copia?", btn_wipe_backup: "Guardar & Borrar", btn_wipe_direct: "Borrar directo"
  },
  de: {
    header_subtitle: "Schnelle Links", tab_shortcuts: "Links", tab_add: "Neu", tab_data: "Daten",
    form_new: "Neuer Link", form_edit: "Bearbeiten", placeholder_keyword: "Schlüsselwort", placeholder_url: "Ziel-URL",
    btn_cancel: "Abbrechen", btn_add: "Speichern", btn_update: "Aktualisieren", btn_export: "Exportieren", btn_import: "JSON Import", btn_wipe: "Alles löschen",
    data_title: "Import / Export", data_desc: "Sichere deine Links.", settings_tooltip: "Einstellungen",
    settings_title: "Einstellungen", settings_theme: "Design", settings_lang: "Sprache", theme_dark: "Dunkel", theme_light: "Hell",
    empty_state: "Noch keine Links.<br>Füge einen hinzu!",
    toast_import_success: "Erfolgreich geladen!", toast_import_error: "Ungültiges Format.", toast_copy: "Kopiert!", toast_wipe: "Gelöscht.", toast_delete: "Link gelöscht.", toast_add: "Link gespeichert.",
    btn_edit_tooltip: "Bearbeiten", btn_del_tooltip: "Löschen", view_list: "Liste", view_grid: "Gitter", sort_asc: "A-Z", sort_desc: "Z-A",
    confirm_del_title: "Löschen?", confirm_del_msg: "Wirklich löschen?", btn_yes: "Löschen", btn_no: "Abbrechen",
    confirm_wipe_title: "Alles löschen?", confirm_wipe_msg: "Dies ist unwiderruflich.", btn_wipe_backup: "Sichern & Löschen", btn_wipe_direct: "Löschen"
  }
};

let currentLang = 'fr';
let currentTheme = 'dark';
let currentView = 'list'; // list or grid
let currentSort = 'asc'; // asc, desc, manual
let customOrder = [];

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const keywordInput = document.getElementById('keyword-input');
    const urlInput = document.getElementById('url-input');
    const addBtn = document.getElementById('add-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const listContainer = document.getElementById('shortcuts-list');
    const formTitle = document.getElementById('form-title');
    
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const wipeBtn = document.getElementById('wipe-data-btn');
    const dragZone = document.getElementById('drag-zone');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    
    // Tools
    const btnViewList = document.getElementById('view-list');
    const btnViewGrid = document.getElementById('view-grid');
    const btnSortAsc = document.getElementById('sort-asc');
    const btnSortDesc = document.getElementById('sort-desc');

    let isEditing = false;
    let editingOriginalKwd = null;

    // --- INITIALIZATION ---
    function initPrefs() {
        chrome.storage.sync.get(['theme', 'lang', 'view', 'sort', 'customOrder'], (res) => {
            if (res.theme) currentTheme = res.theme;
            if (res.lang && i18nData[res.lang]) currentLang = res.lang;
            if (res.view) currentView = res.view;
            if (res.sort) currentSort = res.sort;
            if (res.customOrder) customOrder = res.customOrder;
            
            // Set Custom Selects
            updateCustomSelect('theme-custom-select', currentTheme);
            updateCustomSelect('lang-custom-select', currentLang);
            
            applyTheme();
            applyLanguage();
            applyViewSettings();
            loadShortcuts(); 
        });
    }

    // --- CUSTOM SELECT LOGIC ---
    function updateCustomSelect(id, value) {
        const sel = document.getElementById(id);
        sel.setAttribute('data-value', value);
        const options = sel.querySelectorAll('.select-items div');
        let txt = '';
        options.forEach(opt => {
            if(opt.getAttribute('data-value') === value) txt = opt.innerHTML;
        });
        sel.querySelector('.select-selected span').innerHTML = txt;
    }

    document.querySelectorAll('.custom-select').forEach(customSelect => {
        const selected = customSelect.querySelector('.select-selected');
        const items = customSelect.querySelector('.select-items');
        
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllSelects(customSelect);
            items.classList.toggle('select-hide');
            
            if(items.classList.contains('select-up')) {
                customSelect.classList.toggle('active-up');
            } else {
                customSelect.classList.toggle('active');
            }
        });

        items.querySelectorAll('div').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.getAttribute('data-value');
                const txt = opt.innerHTML;
                customSelect.setAttribute('data-value', val);
                selected.querySelector('span').innerHTML = txt;
                items.classList.add('select-hide');
                customSelect.classList.remove('active', 'active-up');
                
                // Trigger change action
                if(customSelect.id === 'theme-custom-select') {
                    currentTheme = val;
                    chrome.storage.sync.set({ theme: val });
                    applyTheme();
                } else if(customSelect.id === 'lang-custom-select') {
                    currentLang = val;
                    chrome.storage.sync.set({ lang: val });
                    applyLanguage();
                    // Re-render select texts dynamically
                    updateCustomSelect('theme-custom-select', currentTheme);
                    loadShortcuts();
                }
            });
        });
    });

    function closeAllSelects(except) {
        document.querySelectorAll('.custom-select').forEach(sel => {
            if(sel !== except) {
                sel.classList.remove('active', 'active-up');
                sel.querySelector('.select-items').classList.add('select-hide');
            }
        });
    }
    document.addEventListener('click', () => closeAllSelects(null));

    // --- TOASTS ---
    function showToast(msg, isError=false) {
        const container = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${isError ? 'error' : ''}`;
        t.textContent = msg;
        container.appendChild(t);
        setTimeout(() => t.remove(), 2800);
    }

    // --- CONFIRM DIALOG ---
    function showConfirmDialog(title, message, buttons) {
        const overlay = document.getElementById('confirm-overlay');
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        
        const actions = document.getElementById('confirm-actions');
        actions.innerHTML = ''; // clear

        buttons.forEach(b => {
             const btn = document.createElement('button');
             btn.className = b.class || 'btn-outline';
             btn.textContent = b.text;
             btn.onclick = () => {
                 overlay.classList.remove('active');
                 b.action();
             };
             actions.appendChild(btn);
        });
        overlay.classList.add('active');
    }

    // --- THEME & LANG ---
    function applyTheme() {
        document.body.className = currentTheme + '-theme';
    }

    function applyLanguage() {
        const dict = i18nData[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (dict[el.getAttribute('data-i18n')]) el.innerHTML = dict[el.getAttribute('data-i18n')];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            if (dict[el.getAttribute('data-i18n-placeholder')]) el.placeholder = dict[el.getAttribute('data-i18n-placeholder')];
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            if (dict[el.getAttribute('data-i18n-title')]) el.title = dict[el.getAttribute('data-i18n-title')];
        });
        if (isEditing) {
            formTitle.textContent = dict.form_edit; addBtn.textContent = dict.btn_update;
        } else {
            formTitle.textContent = dict.form_new; addBtn.textContent = dict.btn_add;
        }
    }

    // --- SETTINGS OVERLAY & OUTSIDE CLICKS ---
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('active'));
    closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('active'));

    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // --- TABS ---
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        tabContents.forEach(tc => tc.style.display = tc.id === targetId ? 'flex' : 'none');
        if (targetId !== 'tab-add' && isEditing) resetForm();
      });
    });
    function switchTab(tabId) { tabBtns.forEach(b => { if (b.getAttribute('data-tab') === tabId) b.click(); }); }
  
    // --- LIST RENDER & TOOLBAR ---
    function applyViewSettings() {
        [btnViewList, btnViewGrid, btnSortAsc, btnSortDesc].forEach(b => b.classList.remove('active'));
        if (currentView === 'list') { btnViewList.classList.add('active'); listContainer.classList.remove('grid-view'); } 
        else { btnViewGrid.classList.add('active'); listContainer.classList.add('grid-view'); }
        if (currentSort === 'asc') btnSortAsc.classList.add('active');
        else if (currentSort === 'desc') btnSortDesc.classList.add('active');
    }

    [btnViewList, btnViewGrid].forEach(b => b.addEventListener('click', () => {
        currentView = b.id === 'view-list' ? 'list' : 'grid';
        chrome.storage.sync.set({ view: currentView });
        applyViewSettings();
    }));

    [btnSortAsc, btnSortDesc].forEach(b => b.addEventListener('click', () => {
        currentSort = b.id === 'sort-asc' ? 'asc' : 'desc';
        chrome.storage.sync.set({ sort: currentSort });
        applyViewSettings();
        loadShortcuts();
    }));

    function loadShortcuts() {
      chrome.storage.sync.get(['shortcuts'], (result) => {
        renderList(result.shortcuts || {});
      });
    }
  
    function renderList(shortcuts) {
      listContainer.innerHTML = '';
      let keys = Object.keys(shortcuts);
      const dict = i18nData[currentLang];
  
      if (keys.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">${dict.empty_state}</div>`;
        return;
      }
      
      if(currentSort === 'manual' && customOrder) {
          const missing = keys.filter(k => !customOrder.includes(k));
          keys = customOrder.filter(k => keys.includes(k)).concat(missing);
      } else {
          keys.sort((a,b) => currentSort === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
      }

      keys.forEach(key => {
        const url = shortcuts[key];
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.setAttribute('data-kwd', key);
        
        item.innerHTML = `
          <div class="shortcut-info">
             <span class="shortcut-kwd">${key}</span>
             <span class="shortcut-url" title="${url}">${url}</span>
          </div>
          <div class="actions">
             <button class="icon-btn edit-b" title="${dict.btn_edit_tooltip}">
               <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
             </button>
             <button class="icon-btn delete delete-b" title="${dict.btn_del_tooltip}">
               <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
             </button>
          </div>
        `;
        item.querySelector('.edit-b').onclick = () => startEdit(key, url);
        item.querySelector('.delete-b').onclick = () => confirmDeleteShortcut(key);
        
        // DRAG & DROP LOGIC
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            const newOrder = Array.from(listContainer.querySelectorAll('.shortcut-item')).map(el => el.getAttribute('data-kwd'));
            chrome.storage.sync.set({ customOrder: newOrder, sort: 'manual' }, () => {
                currentSort = 'manual'; customOrder = newOrder; applyViewSettings();
            });
        });
        item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            const dragging = listContainer.querySelector('.dragging');
            if (dragging && dragging !== this) {
                const children = Array.from(listContainer.children);
                const dragIndex = children.indexOf(dragging);
                const targetIndex = children.indexOf(this);
                if (dragIndex < targetIndex) this.parentNode.insertBefore(dragging, this.nextSibling);
                else this.parentNode.insertBefore(dragging, this);
            }
        });

        listContainer.appendChild(item);
      });
    }
  
    // --- FORM LOGIC ---
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
    function saveShortcut() {
      let kwd = keywordInput.value.trim(); let url = urlInput.value.trim();
      if (!kwd || !url) return;
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
      chrome.storage.sync.get(['shortcuts'], (res) => {
        let shortcuts = res.shortcuts || {};
        if (isEditing && editingOriginalKwd !== kwd) delete shortcuts[editingOriginalKwd];
        shortcuts[kwd] = url;
        chrome.storage.sync.set({ shortcuts }, () => {
          resetForm(); loadShortcuts(); switchTab('tab-list');
          showToast(i18nData[currentLang].toast_add);
        });
      });
    }
    function confirmDeleteShortcut(key) {
        const dict = i18nData[currentLang];
        showConfirmDialog(dict.confirm_del_title, dict.confirm_del_msg, [
            { text: dict.btn_no, class: 'btn-outline', action: () => {} },
            { text: dict.btn_yes, class: 'btn-danger', action: () => {
                chrome.storage.sync.get(['shortcuts'], (res) => {
                    let shortcuts = res.shortcuts || {}; delete shortcuts[key];
                    chrome.storage.sync.set({ shortcuts }, () => {
                        loadShortcuts(); showToast(dict.toast_delete);
                    });
                });
            }}
        ]);
    }
  
    // --- IMPORT/EXPORT/WIPE ---
    function doExport() {
      chrome.storage.sync.get(['shortcuts'], (result) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.shortcuts || {}, null, 2));
        const anchor = document.createElement('a'); anchor.href = dataStr; anchor.download = "link_catcher_backup.json"; anchor.click();
      });
    }
    exportBtn.addEventListener('click', doExport);

    function processImportData(jsonString) {
        const dict = i18nData[currentLang];
        try {
            const imported = JSON.parse(jsonString);
            if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error("Format");
            for (const [key, val] of Object.entries(imported)) {
                if (typeof key !== 'string' || typeof val !== 'string' || (!val.startsWith('http://') && !val.startsWith('https://'))) throw new Error("Invalid");
            }
            chrome.storage.sync.get(['shortcuts'], (res) => {
                const merged = { ...(res.shortcuts || {}), ...imported };
                chrome.storage.sync.set({ shortcuts: merged }, () => {
                    showToast(dict.toast_import_success);
                    loadShortcuts(); switchTab('tab-list');
                });
            });
        } catch (err) { showToast(dict.toast_import_error, true); }
    }

    importFile.addEventListener('change', (e) => {
      if (!e.target.files[0]) return;
      const reader = new FileReader();
      reader.onload = (event) => { processImportData(event.target.result); importFile.value = ''; };
      reader.readAsText(e.target.files[0]);
    });

    dragZone.addEventListener('dragover', (e) => { e.preventDefault(); dragZone.classList.add('dragover'); });
    dragZone.addEventListener('dragleave', (e) => { e.preventDefault(); dragZone.classList.remove('dragover'); });
    dragZone.addEventListener('drop', (e) => {
        e.preventDefault(); dragZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type !== "application/json" && !file.name.endsWith('.json')) { showToast(i18nData[currentLang].toast_import_error, true); return; }
            const reader = new FileReader();
            reader.onload = (ev) => processImportData(ev.target.result);
            reader.readAsText(file);
        }
    });

    wipeBtn.addEventListener('click', () => {
        const dict = i18nData[currentLang];
        showConfirmDialog(dict.confirm_wipe_title, dict.confirm_wipe_msg, [
            { text: dict.btn_cancel, class: 'btn-outline', action: () => {} },
            { text: dict.btn_wipe_backup, class: 'btn-outline', action: () => {
                doExport();
                chrome.storage.sync.set({ shortcuts: {} }, () => { loadShortcuts(); showToast(dict.toast_wipe); });
            }},
            { text: dict.btn_wipe_direct, class: 'btn-danger', action: () => {
                chrome.storage.sync.set({ shortcuts: {} }, () => { loadShortcuts(); showToast(dict.toast_wipe); });
            }}
        ]);
    });

    // --- BINDINGS ---
    addBtn.addEventListener('click', saveShortcut);
    cancelEditBtn.addEventListener('click', () => { resetForm(); switchTab('tab-list'); });
    keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') urlInput.focus(); });
    urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveShortcut(); });

    initPrefs();
});
