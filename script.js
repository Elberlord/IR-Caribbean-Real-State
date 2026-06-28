const CONFIG = {
  companyName: 'I&R Caribbean Real Estate',
  whatsappNumber: '50688977592',
  whatsappDisplay: '+506 8897 7592',
  whatsappMessage: 'Hello, I would like information about your properties.',
  email: 'rogelioguevara.pearson@gmail.com',
  emailSubject: 'Property inquiry',
  emailBody: 'Hello, I would like more information about your properties.'
};

const PROPERTY_STORAGE_KEY = 'irPropertiesData';
const PROPERTY_DATA_PATH = 'data/properties.json';
const FIREBASE_COLLECTION_NAME = window.IR_FIREBASE_COLLECTION || 'properties';

const SAMPLE_PROPERTIES = [];


function buildWhatsappLink(number, message) {
  const cleanNumber = String(number).replace(/\D/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${text}`;
}

function buildMailtoLink(email, subject, body) {
  const safeSubject = encodeURIComponent(subject);
  const safeBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${safeSubject}&body=${safeBody}`;
}

function formatCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function applyContactLinks() {
  const whatsappLink = buildWhatsappLink(CONFIG.whatsappNumber, CONFIG.whatsappMessage);
  const mailtoLink = buildMailtoLink(CONFIG.email, CONFIG.emailSubject, CONFIG.emailBody);

  const whatsappIds = [
    'headerWhatsapp',
    'heroWhatsapp',
    'contactWhatsapp',
    'floatingWhatsapp',
    'sidebarWhatsapp'
  ];

  const emailIds = ['heroEmail', 'contactEmail', 'sidebarEmail'];

  whatsappIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.href = whatsappLink;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
  });

  emailIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.href = mailtoLink;
    }
  });

  const whatsappDisplay = document.getElementById('whatsappDisplay');
  const emailDisplay = document.getElementById('emailDisplay');

  if (whatsappDisplay) whatsappDisplay.textContent = CONFIG.whatsappDisplay;
  if (emailDisplay) emailDisplay.textContent = CONFIG.email;

  document.title = document.title.includes('|') ? document.title : CONFIG.companyName;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-delay');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach((item) => item.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function getStoredProperties() {
  try {
    const raw = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Could not parse local properties.', error);
    return null;
  }
}

function hasValidFirebaseConfig() {
  const config = window.IR_FIREBASE_CONFIG;
  return Boolean(
    config &&
      config.apiKey &&
      config.projectId &&
      !String(config.apiKey).includes('PASTE_') &&
      !String(config.projectId).includes('PASTE_')
  );
}

function getFirebaseApp() {
  if (!hasValidFirebaseConfig() || !window.firebase) return null;
  if (!firebase.apps.length) {
    firebase.initializeApp(window.IR_FIREBASE_CONFIG);
  }
  return firebase.app();
}

function getFirebaseFirestore() {
  const app = getFirebaseApp();
  if (!app || !firebase.firestore) return null;
  return firebase.firestore();
}

function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app || !firebase.auth) return null;
  return firebase.auth();
}

function getFirebaseStorage() {
  const app = getFirebaseApp();
  if (!app || !firebase.storage) return null;
  return firebase.storage();
}

function cleanFirebaseProperty(id, data = {}) {
  return {
    id: data.id || id,
    title: data.title || '',
    badge: data.badge || '',
    country: data.country || '',
    region: data.region || '',
    city: data.city || '',
    type: data.type || '',
    status: data.status || 'For Sale',
    currency: data.currency || 'USD',
    price: Number(data.price) || 0,
    beds: data.beds || '',
    baths: data.baths || '',
    area: data.area || '',
    image: data.image || '',
    galleryUrls: Array.isArray(data.galleryUrls) ? data.galleryUrls.filter(Boolean) : [],
    description: data.description || '',
    featured: Boolean(data.featured),
    isPublished: data.isPublished !== false,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

async function loadFirebaseProperties(includeUnpublished = false) {
  const db = getFirebaseFirestore();
  if (!db) return null;

  const snapshot = await db.collection(FIREBASE_COLLECTION_NAME).get();
  const docs = [];
  snapshot.forEach((doc) => {
    const property = cleanFirebaseProperty(doc.id, doc.data());
    if (includeUnpublished || property.isPublished) docs.push(property);
  });

  docs.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });

  return docs;
}

async function saveFirebaseProperty(property) {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firebase is not configured.');
  const id = property.id || `IR-${Date.now()}-${Math.floor(Math.random() * 999)}`;
  const payload = {
    ...property,
    id,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  await db.collection(FIREBASE_COLLECTION_NAME).doc(id).set(payload, { merge: true });
  return { ...property, id };
}

async function deleteFirebaseProperty(id) {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firebase is not configured.');
  await db.collection(FIREBASE_COLLECTION_NAME).doc(id).delete();
}

async function importPropertiesToFirebase(properties) {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firebase is not configured.');
  const batch = db.batch();
  properties.forEach((property) => {
    const id = property.id || `IR-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    const ref = db.collection(FIREBASE_COLLECTION_NAME).doc(id);
    batch.set(ref, { ...property, id, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
  await batch.commit();
}

async function loadProperties() {
  try {
    const firebaseProperties = await loadFirebaseProperties(false);
    if (firebaseProperties !== null) return firebaseProperties;
  } catch (error) {
    console.warn('Could not load Firebase properties. Showing an empty public list until admin listings are saved.', error);
  }

  try {
    const response = await fetch(PROPERTY_DATA_PATH, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load properties: ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length) return data;
  } catch (error) {
    console.warn('Could not load data/properties.json.', error);
  }

  const stored = getStoredProperties();
  if (stored && stored.length) return stored;

  console.warn('No published properties found yet.');
  return [];
}

function buildPropertyWhatsappMessage(property) {
  const parts = [
    'Hello, I would like information about this property:',
    property.title,
    `${property.city}, ${property.region}, ${property.country}`,
    `Reference: ${property.id}`
  ];
  return parts.join(' ');
}

function propertyCardMarkup(property) {
  const image = property.image || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  const galleryUrls = Array.isArray(property.galleryUrls) ? property.galleryUrls.filter(Boolean).slice(0, 4) : [];
  const price = formatCurrency(property.price, property.currency || 'USD');
  const location = [property.city, property.region, property.country].filter(Boolean).join(', ');
  const whatsappLink = buildWhatsappLink(CONFIG.whatsappNumber, buildPropertyWhatsappMessage(property));
  const emailLink = buildMailtoLink(
    CONFIG.email,
    `${CONFIG.emailSubject}: ${property.title}`,
    `Hello, I would like more information about ${property.title} (${property.id}).`
  );

  return `
    <article class="property-card">
      <div class="property-media">
        <img class="property-image" src="${escapeHtml(image)}" alt="${escapeHtml(property.title)}" loading="lazy" />
        ${galleryUrls.length ? `<div class="property-gallery-strip">${galleryUrls.map((url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(property.title)} gallery image" loading="lazy" />`).join('')}</div>` : ''}
      </div>
      <div class="property-copy">
        <div class="property-badges">
          <span class="property-type">${escapeHtml(property.type || 'Property')}</span>
          <span class="status-pill">${escapeHtml(property.status || 'For Sale')}</span>
          ${property.badge ? `<span class="property-badge">${escapeHtml(property.badge)}</span>` : ''}
        </div>
        <h3>${escapeHtml(property.title)}</h3>
        <div class="property-location">${escapeHtml(location)}</div>
        <div class="property-price">${escapeHtml(price)}</div>
        <p>${escapeHtml(property.description || '')}</p>
        <div class="property-meta">
          ${property.beds ? `<span>${escapeHtml(property.beds)} Beds</span>` : ''}
          ${property.baths ? `<span>${escapeHtml(property.baths)} Baths</span>` : ''}
          ${property.area ? `<span>${escapeHtml(property.area)} m²</span>` : ''}
        </div>
        <div class="property-actions">
          <a class="btn btn-gold" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a class="btn btn-outline" href="${emailLink}">Email</a>
        </div>
      </div>
    </article>
  `;
}

function setLocalProperties(properties) {
  window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(properties));
}


function setupHeroVideo() {
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');

  const startVideo = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((error) => {
        console.warn('Hero video autoplay was delayed by the browser.', error);
      });
    }
  };

  video.addEventListener('loadeddata', startVideo, { once: true });
  video.addEventListener('canplay', startVideo, { once: true });

  if (video.readyState >= 2) {
    startVideo();
  } else {
    video.load();
  }

  window.addEventListener('pageshow', startVideo);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) startVideo();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupHeroVideo();
  applyContactLinks();
  setupMobileNav();
  setupReveal();
});
