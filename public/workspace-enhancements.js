// @ts-nocheck -- standalone browser enhancement; DOM types are runtime-guarded.
(() => {
  const body = document.body;
  const toolbar = document.querySelector('.visha-app-toolbar-trailing');
  if (!body || !toolbar || document.querySelector('#visha-command-palette')) return;

  const readStore = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };
  const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

  const themeButton = document.createElement('button');
  themeButton.type = 'button';
  themeButton.className = 'visha-enhance-icon-button';
  themeButton.setAttribute('aria-label', 'Switch to dark appearance');
  themeButton.title = 'Toggle appearance';
  themeButton.innerHTML = '<span aria-hidden="true">◐</span>';
  toolbar.insertBefore(themeButton, toolbar.lastElementChild);

  const storedTheme = (() => { try { return localStorage.getItem('visha-workspace-theme'); } catch { return null; } })();
  const initialTheme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const applyTheme = theme => {
    body.dataset.vishaTheme = theme;
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance');
    themeButton.innerHTML = theme === 'dark' ? '<span aria-hidden="true">☼</span>' : '<span aria-hidden="true">◐</span>';
    try { localStorage.setItem('visha-workspace-theme', theme); } catch {}
  };
  applyTheme(initialTheme);
  themeButton.addEventListener('click', () => applyTheme(body.dataset.vishaTheme === 'dark' ? 'light' : 'dark'));

  const dialog = document.createElement('dialog');
  dialog.id = 'visha-command-palette';
  dialog.className = 'visha-command-palette';
  dialog.setAttribute('aria-labelledby', 'visha-command-title');
  dialog.innerHTML = '<div class="visha-command-shell"><div class="visha-command-heading"><span id="visha-command-title">Quick navigation</span><kbd>ESC</kbd></div><label class="visha-command-search-wrap"><span aria-hidden="true">⌕</span><input id="visha-command-search" type="search" placeholder="Search pages and guides…" autocomplete="off" /></label><div id="visha-command-results" class="visha-command-results" role="listbox" aria-label="Navigation results"></div><div class="visha-command-footer"><span>Navigate with your keyboard</span><span><kbd>↑</kbd> <kbd>↓</kbd> <kbd>↵</kbd></span></div></div>';
  body.append(dialog);

  const commands = [
    { label: 'Workspace overview', detail: 'Dashboard', href: '/dashboard/', icon: '⌂' },
    { label: 'Explore guide library', detail: 'Browse and filter all guides', href: '/dashboard/library/', icon: '▦' },
    { label: 'Saved guides', detail: 'Your private reading list', href: '/dashboard/saved/', icon: '☆' },
    { label: 'Product spotlight', detail: 'Product research and details', href: document.querySelector('.visha-app-category-nav') ? (document.querySelector('a[href*="/dashboard/products/"]')?.getAttribute('href') || '/dashboard/') : '/dashboard/', icon: '◇' },
    ...Array.from(document.querySelectorAll('a[href^="/dashboard/guides/"]')).map(link => ({
      label: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
      detail: 'Buying guide',
      href: link.getAttribute('href') || '',
      icon: '↗'
    })).filter(item => item.label && item.href)
  ];
  const recent = readStore('visha-workspace-recent', []);
  if (location.pathname.startsWith('/dashboard/')) {
    const current = { label: document.title.replace(/ \| Visha Shop$/, ''), href: location.pathname, detail: 'Recently viewed', icon: '◷' };
    const next = [current, ...recent.filter(item => item.href !== current.href)].slice(0, 5);
    writeStore('visha-workspace-recent', next);
  }
  for (const item of recent) if (!commands.some(command => command.href === item.href)) commands.push(item);

  const input = dialog.querySelector('#visha-command-search');
  const results = dialog.querySelector('#visha-command-results');
  let activeIndex = 0;
  let visibleCommands = [];
  const render = query => {
    const q = query.trim().toLocaleLowerCase();
    visibleCommands = commands.filter(item => (item.label + ' ' + item.detail).toLocaleLowerCase().includes(q)).slice(0, 12);
    activeIndex = 0;
    results.replaceChildren();
    if (!visibleCommands.length) {
      const empty = document.createElement('p');
      empty.className = 'visha-command-empty';
      empty.textContent = 'No matching pages. Try another search.';
      results.append(empty);
      return;
    }
    visibleCommands.forEach((item, index) => {
      const link = document.createElement('a');
      link.className = 'visha-command-item';
      link.href = item.href;
      link.setAttribute('role', 'option');
      link.setAttribute('aria-selected', String(index === activeIndex));
      const icon = document.createElement('span');
      icon.className = 'visha-command-item-icon';
      icon.textContent = item.icon || '↗';
      const copy = document.createElement('span');
      copy.className = 'visha-command-item-copy';
      const title = document.createElement('strong');
      title.textContent = item.label;
      const detail = document.createElement('small');
      detail.textContent = item.detail;
      copy.append(title, detail);
      const arrow = document.createElement('span');
      arrow.className = 'visha-command-item-arrow';
      arrow.textContent = '↗';
      link.append(icon, copy, arrow);
      link.addEventListener('mousemove', () => setActive(index));
      results.append(link);
    });
  };
  const setActive = index => {
    activeIndex = Math.max(0, Math.min(index, visibleCommands.length - 1));
    results.querySelectorAll('.visha-command-item').forEach((item, i) => item.setAttribute('aria-selected', String(i === activeIndex)));
  };
  const openPalette = () => {
    if (!dialog.open) dialog.showModal();
    input.value = '';
    render('');
    input.focus();
  };
  toolbar.querySelector('.visha-app-search-command')?.addEventListener('click', event => { event.preventDefault(); openPalette(); });
  themeButton.insertAdjacentHTML('afterend', '<button type="button" class="visha-enhance-command-button" aria-label="Open quick navigation" title="Quick navigation"><span aria-hidden="true">⌘</span><kbd>K</kbd></button>');
  toolbar.querySelector('.visha-enhance-command-button')?.addEventListener('click', openPalette);
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(activeIndex + 1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive(activeIndex - 1); }
    if (event.key === 'Enter' && visibleCommands[activeIndex]) { event.preventDefault(); location.assign(visibleCommands[activeIndex].href); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); }
  });
  render('');
})();