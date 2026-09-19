const form = document.getElementById('qr-form');
const input = document.getElementById('url-input');
const message = document.getElementById('form-message');
const preview = document.getElementById('preview');
const badge = document.getElementById('result-badge');
const pngButton = document.getElementById('download-png');
const svgButton = document.getElementById('download-svg');
const copyButton = document.getElementById('copy-png');
const copyMessage = document.getElementById('copy-message');
const foregroundInput = document.getElementById('foreground-color');
const backgroundInput = document.getElementById('background-color');
const foregroundValue = document.getElementById('foreground-value');
const backgroundValue = document.getElementById('background-value');
const colorHint = document.getElementById('color-hint');
const languageButtons = document.querySelectorAll('.language-button');

const translations = {
  cs: {
    title: 'QR Studio — QR kód z odkazu', description: 'Vytvořte QR kód z URL a stáhněte ho jako PNG nebo SVG. Zdarma a bez registrace.',
    brandLabel: 'Evalytics QR Studio – úvodní stránka', headerNote: 'Bez registrace, cookies a poplatků',
    heroFirst: 'URL', heroEmphasis: 'QR zdarma',
    heroCopy: 'Vlož URL adresu, vygeneruj kód a stáhni si ho v kvalitě, kterou potřebuješ. Bez přihlášení a bez zbytečností.',
    generatorLabel: 'Generátor QR kódu', stepOne: 'VLOŽ ODKAZ', formHeading: 'Kam má QR kód vést?',
    formCopy: 'Zadej adresu webu, kterou chceš sdílet.', urlLabel: 'URL adresa', urlPlaceholder: 'např. https://moje-stranka.cz',
    inputHint: 'Adresu můžeš zadat i bez https://', generate: 'Vygenerovat QR kód',
    colorsHeading: 'BARVY QR KÓDU', foregroundLabel: 'Čtverečky', backgroundLabel: 'Pozadí',
    colorHint: 'Pro snadné načtení zvol kontrastní barvy.', lowContrast: 'Tyto barvy mohou zhoršit čitelnost QR kódu.',
    privacy: 'Tvůj odkaz se zpracuje přímo v prohlížeči.', stepTwo: 'TVŮJ QR KÓD', previewLabel: 'Náhled QR kódu',
    emptyState: 'Tady se objeví tvůj QR kód', downloadAs: 'STÁHNOUT JAKO', copyImage: 'Kopírovat obrázek',
    copied: 'Obrázek je zkopírovaný do schránky.',
    copyUnavailable: 'Kopírování obrázků vyžaduje HTTPS a podporovaný prohlížeč.',
    copyError: 'Obrázek se nepodařilo zkopírovat. Zkus stažení PNG.',
    formatNote: 'PNG pro běžné použití · SVG pro tisk a škálování',
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
    brandLabel: 'Evalytics QR Studio – home', headerNote: 'No sign-up, cookies or fees',
    heroFirst: 'Free URL', heroEmphasis: 'QR',
    heroCopy: 'Paste a URL, generate a code and download it in the format you need. No account, no fuss.',
    generatorLabel: 'QR code generator', stepOne: 'PASTE A LINK', formHeading: 'Where should your QR code lead?',
    formCopy: 'Enter the website address you want to share.', urlLabel: 'URL address', urlPlaceholder: 'e.g. https://your-website.com',
    inputHint: 'You can enter the address without https://', generate: 'Generate QR code',
    colorsHeading: 'QR CODE COLORS', foregroundLabel: 'Squares', backgroundLabel: 'Background',
    colorHint: 'Choose contrasting colors for easy scanning.', lowContrast: 'These colors may make the QR code harder to scan.',
    privacy: 'Your link is processed directly in your browser.', stepTwo: 'YOUR QR CODE', previewLabel: 'QR code preview',
    emptyState: 'Your QR code will appear here', downloadAs: 'DOWNLOAD AS', copyImage: 'Copy image',
    copied: 'Image copied to clipboard.',
    copyUnavailable: 'Copying images requires HTTPS and a supported browser.',
    copyError: 'Could not copy the image. Try downloading the PNG instead.',
    formatNote: 'PNG for everyday use · SVG for print and scaling',
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
let copyMessageKey = '';
let colorWarning = false;

const COLOR_STORAGE_KEYS = {
  foreground: 'qr-studio-foreground-color',
  background: 'qr-studio-background-color'
};

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || '');
}

function loadSavedColors() {
  try {
    const foreground = localStorage.getItem(COLOR_STORAGE_KEYS.foreground);
    const background = localStorage.getItem(COLOR_STORAGE_KEYS.background);
    if (isHexColor(foreground)) foregroundInput.value = foreground;
    if (isHexColor(background)) backgroundInput.value = background;
  } catch { /* Storage may be disabled. */ }
}

function saveColors() {
  try {
    localStorage.setItem(COLOR_STORAGE_KEYS.foreground, foregroundInput.value);
    localStorage.setItem(COLOR_STORAGE_KEYS.background, backgroundInput.value);
  } catch { /* Storage may be disabled. */ }
}

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
  copyMessage.textContent = copyMessageKey ? t(copyMessageKey) : '';
  colorHint.textContent = t(colorWarning ? 'lowContrast' : 'colorHint');
  try { localStorage.setItem('qr-studio-language', language); } catch { /* Storage may be disabled. */ }
}

function getInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem('qr-studio-language');
    if (savedLanguage === 'cs' || savedLanguage === 'en') return savedLanguage;
  } catch { /* Storage may be disabled. */ }

  const browserLanguage = navigator.languages?.[0] || navigator.language || '';
  return browserLanguage.toLowerCase().startsWith('cs') ? 'cs' : 'en';
}

languageButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
setLanguage(getInitialLanguage());

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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="${t('qrLabel')}"><rect width="${size}" height="${size}" fill="${backgroundInput.value}"/><path fill="${foregroundInput.value}" d="${parts.join('')}"/></svg>`;
}

function colorLuminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  return channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function updateColors() {
  foregroundValue.textContent = foregroundInput.value.toUpperCase();
  backgroundValue.textContent = backgroundInput.value.toUpperCase();
  preview.style.setProperty('--qr-background', backgroundInput.value);
  const foregroundLuminance = colorLuminance(foregroundInput.value);
  const backgroundLuminance = colorLuminance(backgroundInput.value);
  const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  colorWarning = ratio < 4.5 || foregroundLuminance >= backgroundLuminance;
  colorHint.textContent = t(colorWarning ? 'lowContrast' : 'colorHint');
  colorHint.classList.toggle('is-warning', colorWarning);
  saveColors();
  if (currentQr) {
    currentSvg = svgFromQr(currentQr);
    preview.innerHTML = currentSvg;
    setCopyMessage('');
  }
}

[foregroundInput, backgroundInput].forEach((picker) => {
  picker.addEventListener('input', updateColors);
  picker.addEventListener('change', updateColors);
});
loadSavedColors();
updateColors();

function setMessage(key, isError = false) {
  messageKey = key;
  message.textContent = key ? t(key) : '';
  message.classList.toggle('is-error', isError);
  input.setAttribute('aria-invalid', String(isError));
}

function setCopyMessage(key, isError = false) {
  copyMessageKey = key;
  copyMessage.textContent = key ? t(key) : '';
  copyMessage.classList.toggle('is-error', isError);
}

function clearResult() {
  currentQr = null;
  currentSvg = '';
  pngButton.disabled = true;
  svgButton.disabled = true;
  copyButton.disabled = true;
  setCopyMessage('');
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
    copyButton.disabled = false;
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

function pngCanvasFromQr(qr) {
  const modules = qr.getModuleCount();
  const margin = 4;
  const cellSize = Math.max(8, Math.floor(1024 / (modules + margin * 2)));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (modules + margin * 2) * cellSize;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = backgroundInput.value;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = foregroundInput.value;
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (qr.isDark(y, x)) context.fillRect((x + margin) * cellSize, (y + margin) * cellSize, cellSize, cellSize);
    }
  }
  return canvas;
}

pngButton.addEventListener('click', () => {
  if (!currentQr) return;
  const canvas = pngCanvasFromQr(currentQr);
  if (!canvas) {
    setMessage('pngError', true);
    return;
  }
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, 'qr-kod.png');
    else setMessage('pngError', true);
  }, 'image/png');
});

copyButton.addEventListener('click', async () => {
  if (!currentQr) return;
  if (!window.isSecureContext || !navigator.clipboard?.write || typeof ClipboardItem === 'undefined' ||
      ClipboardItem.supports?.('image/png') === false) {
    setCopyMessage('copyUnavailable', true);
    return;
  }

  const canvas = pngCanvasFromQr(currentQr);
  if (!canvas) {
    setCopyMessage('copyError', true);
    return;
  }

  try {
    const png = new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG unavailable')), 'image/png');
    });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    setCopyMessage('copied');
  } catch {
    setCopyMessage('copyError', true);
  }
});
