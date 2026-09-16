const form = document.getElementById('qr-form');
const input = document.getElementById('url-input');
const message = document.getElementById('form-message');
const preview = document.getElementById('preview');
const badge = document.getElementById('result-badge');
const pngButton = document.getElementById('download-png');
const svgButton = document.getElementById('download-svg');
const languageButtons = document.querySelectorAll('.language-button');

const translations = {
  cs: {
    title: 'QR Studio — QR kód z odkazu', description: 'Vytvořte QR kód z URL a stáhněte ho jako PNG nebo SVG. Zdarma a bez registrace.',
    brandLabel: 'QR Studio – úvodní stránka', headerNote: 'Bez registrace, cookies a poplatků', eyebrow: 'TVŮJ ODKAZ, TVŮJ KÓD',
    heroFirst: 'Z odkazu na ', heroEmphasis: 'QR kód.', heroSecond: 'Za pár vteřin.',
    heroCopy: 'Vlož URL adresu, vygeneruj kód a stáhni si ho v kvalitě, kterou potřebuješ. Bez přihlášení a bez zbytečností.',
    generatorLabel: 'Generátor QR kódu', stepOne: 'VLOŽ ODKAZ', formHeading: 'Kam má QR kód vést?',
    formCopy: 'Zadej adresu webu, kterou chceš sdílet.', urlLabel: 'URL adresa', urlPlaceholder: 'např. https://moje-stranka.cz',
    inputHint: 'Adresu můžeš zadat i bez https://', generate: 'Vygenerovat QR kód',
    privacy: 'Tvůj odkaz se zpracuje přímo v prohlížeči.', stepTwo: 'TVŮJ QR KÓD', previewLabel: 'Náhled QR kódu',
    emptyState: 'Tady se objeví tvůj QR kód', downloadAs: 'STÁHNOUT JAKO',
    formatNote: 'PNG pro běžné použití · SVG pro tisk a škálování',
    footnote: 'Jednoduchý nástroj pro odkazy, které stojí za sdílení.', footerTagline: 'Vytvořeno s jednoduchostí na mysli.',
    ready: 'PŘIPRAVENO', done: 'HOTOVO', qrLabel: 'QR kód',
    missingUrl: 'Zadej URL adresu.', invalidUrl: 'Zadej platnou URL adresu.',
    invalidProtocol: 'Zadej platnou webovou adresu začínající http:// nebo https://.',
    incompleteHost: 'Zadej úplnou adresu webu, například moje-stranka.cz.',
    libraryError: 'Knihovnu pro QR kódy se nepodařilo načíst. Zkontroluj připojení a obnov stránku.',
    generateError: 'QR kód se nepodařilo vytvořit. Zkus kratší adresu.', success: 'QR kód je připravený ke stažení.',
    pngError: 'PNG se nepodařilo vytvořit v tomto prohlížeči.'
  },
  en: {
    title: 'QR Studio — QR code from a link', description: 'Create a QR code from a URL and download it as PNG or SVG. Free, no sign-up required.',
    brandLabel: 'QR Studio – home', headerNote: 'No sign-up, cookies or fees', eyebrow: 'YOUR LINK, YOUR CODE',
    heroFirst: 'Turn a link into a ', heroEmphasis: 'QR code.', heroSecond: 'In seconds.',
    heroCopy: 'Paste a URL, generate a code and download it in the format you need. No account, no fuss.',
    generatorLabel: 'QR code generator', stepOne: 'PASTE A LINK', formHeading: 'Where should your QR code lead?',
    formCopy: 'Enter the website address you want to share.', urlLabel: 'URL address', urlPlaceholder: 'e.g. https://your-website.com',
    inputHint: 'You can enter the address without https://', generate: 'Generate QR code',
    privacy: 'Your link is processed directly in your browser.', stepTwo: 'YOUR QR CODE', previewLabel: 'QR code preview',
    emptyState: 'Your QR code will appear here', downloadAs: 'DOWNLOAD AS',
    formatNote: 'PNG for everyday use · SVG for print and scaling',
    footnote: 'A simple tool for links worth sharing.', footerTagline: 'Made with simplicity in mind.',
    ready: 'READY', done: 'DONE', qrLabel: 'QR code',
    missingUrl: 'Enter a URL address.', invalidUrl: 'Enter a valid URL address.',
    invalidProtocol: 'Enter a website address starting with http:// or https://.',
    incompleteHost: 'Enter a full website address, such as your-website.com.',
    libraryError: 'Could not load the QR code library. Check your connection and refresh the page.',
    generateError: 'Could not create the QR code. Try a shorter address.', success: 'Your QR code is ready to download.',
    pngError: 'Could not create a PNG in this browser.'
  }
};

let currentQr = null;
let currentSvg = '';
let language = 'cs';
let messageKey = '';

function t(key) { return translations[language][key]; }

function setLanguage(nextLanguage) {
  language = nextLanguage === 'en' ? 'en' : 'cs';
  document.documentElement.lang = language;
  document.title = t('title');
  document.querySelector('meta[name="description"]').content = t('description');
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  languageButtons.forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  badge.textContent = t(currentQr ? 'done' : 'ready');
  const emptyLabel = preview.querySelector('.empty-state p');
  if (emptyLabel) emptyLabel.textContent = t('emptyState');
  if (currentQr) preview.querySelector('svg').setAttribute('aria-label', t('qrLabel'));
  message.textContent = messageKey ? t(messageKey) : '';
  try { localStorage.setItem('qr-studio-language', language); } catch { /* Storage may be disabled. */ }
}

languageButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
try { setLanguage(localStorage.getItem('qr-studio-language') || 'cs'); } catch { setLanguage('cs'); }

document.getElementById('year').textContent = new Date().getFullYear();

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('missingUrl');

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('invalidUrl');
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new Error('invalidProtocol');
  }
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
    throw new Error('incompleteHost');
  }
  return url.href;
}

function svgFromQr(qr) {
  const modules = qr.getModuleCount();
  const margin = 4;
  const size = modules + margin * 2;
  const parts = [];

  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (qr.isDark(y, x)) parts.push(`M${x + margin} ${y + margin}h1v1h-1z`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="${t('qrLabel')}"><rect width="${size}" height="${size}" fill="#fff"/><path fill="#172c26" d="${parts.join('')}"/></svg>`;
}

function setMessage(key, isError = false) {
  messageKey = key;
  message.textContent = key ? t(key) : '';
  message.classList.toggle('is-error', isError);
  input.setAttribute('aria-invalid', String(isError));
}

function clearResult() {
  currentQr = null;
  currentSvg = '';
  pngButton.disabled = true;
  svgButton.disabled = true;
  badge.textContent = t('ready');
  badge.classList.remove('is-ready');
  preview.innerHTML = '<div id="empty-state" class="empty-state"><div class="empty-qr" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><p>Tady se objeví tvůj QR kód</p></div>';
  preview.querySelector('.empty-state p').textContent = t('emptyState');
}

function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearResult();

  try {
    const url = normalizeUrl(input.value);
    if (typeof qrcode !== 'function') {
      throw new Error('libraryError');
    }

    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    currentQr = qr;
    currentSvg = svgFromQr(qr);
    preview.innerHTML = currentSvg;
    input.value = url;
    pngButton.disabled = false;
    svgButton.disabled = false;
    badge.textContent = t('done');
    badge.classList.add('is-ready');
    setMessage('success');
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    setMessage(detail in translations[language] ? detail : 'generateError', true);
  }
});

input.addEventListener('input', () => {
  setMessage('');
  if (currentQr) clearResult();
});

svgButton.addEventListener('click', () => {
  if (!currentSvg) return;
  downloadBlob(new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' }), 'qr-kod.svg');
});

pngButton.addEventListener('click', () => {
  if (!currentQr) return;
  const modules = currentQr.getModuleCount();
  const margin = 4;
  const cellSize = Math.max(8, Math.floor(1024 / (modules + margin * 2)));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (modules + margin * 2) * cellSize;
  const context = canvas.getContext('2d');
  if (!context) {
    setMessage('pngError', true);
    return;
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#172c26';
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (currentQr.isDark(y, x)) context.fillRect((x + margin) * cellSize, (y + margin) * cellSize, cellSize, cellSize);
    }
  }
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, 'qr-kod.png');
    else setMessage('pngError', true);
  }, 'image/png');
});
