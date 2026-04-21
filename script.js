const CONFIG = {
  companyName: 'I&R Caribbean Real Estate',
  whatsappNumber: '10000000000',
  whatsappDisplay: '+1 000 000 0000',
  whatsappMessage: 'Hello, I would like information about your properties.',
  email: 'info@yourdomain.com',
  emailSubject: 'Property inquiry',
  emailBody: 'Hello, I would like more information about your properties.'
};

const PROPERTY_STORAGE_KEY = 'irPropertiesData';
const PROPERTY_DATA_PATH = 'data/properties.json';

const SAMPLE_PROPERTIES = [
  {
    id: 'IR-1001',
    title: 'Oceanview Villa in Cap Cana',
    badge: 'Featured',
    country: 'Dominican Republic',
    region: 'La Altagracia',
    city: 'Punta Cana',
    type: 'Villa',
    status: 'For Sale',
    currency: 'USD',
    price: 1850000,
    beds: 5,
    baths: 5.5,
    area: 620,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    description: 'A high-end villa with sea views, generous outdoor living, and a polished luxury feel that matches the brand.',
    featured: true
  },
  {
    id: 'IR-1002',
    title: 'Contemporary Condo Near the Marina',
    badge: 'New',
    country: 'Puerto Rico',
    region: 'San Juan',
    city: 'Condado',
    type: 'Condo',
    status: 'For Sale',
    currency: 'USD',
    price: 690000,
    beds: 3,
    baths: 2,
    area: 184,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
    description: 'Elegant urban-caribbean living with walkable access, modern interiors, and strong lifestyle appeal for buyers.',
    featured: true
  },
  {
    id: 'IR-1003',
    title: 'Family Residence with Garden Privacy',
    badge: 'Move-in Ready',
    country: 'Costa Rica',
    region: 'Guanacaste',
    city: 'Tamarindo',
    type: 'House',
    status: 'For Sale',
    currency: 'USD',
    price: 540000,
    beds: 4,
    baths: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
    description: 'A warm and practical home for families who want comfort, security, and proximity to the beach lifestyle.',
    featured: true
  },
  {
    id: 'IR-1004',
    title: 'Boutique Investment Building',
    badge: 'Investment',
    country: 'Mexico',
    region: 'Quintana Roo',
    city: 'Tulum',
    type: 'Multi-unit',
    status: 'For Sale',
    currency: 'USD',
    price: 1250000,
    beds: 8,
    baths: 8,
    area: 510,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
    description: 'A boutique building designed for clients looking at rental potential, curated hospitality, and location upside.',
    featured: false
  },
  {
    id: 'IR-1005',
    title: 'Hillside Lot with Ocean Outlook',
    badge: 'Land Opportunity',
    country: 'Costa Rica',
    region: 'Puntarenas',
    city: 'Jacó',
    type: 'Land',
    status: 'For Sale',
    currency: 'USD',
    price: 285000,
    beds: '',
    baths: '',
    area: 1450,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    description: 'A compelling land option for future luxury development, private retreat planning, or medium-term investment.',
    featured: false
  },
  {
    id: 'IR-1006',
    title: 'Refined Beachfront Penthouse',
    badge: 'Premium',
    country: 'Dominican Republic',
    region: 'Samaná',
    city: 'Las Terrenas',
    type: 'Penthouse',
    status: 'For Sale',
    currency: 'USD',
    price: 980000,
    beds: 3,
    baths: 3.5,
    area: 240,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
    description: 'Beachfront elevation, strong design lines, and the kind of presentation that feels instantly premium to buyers.',
    featured: false
  }
];

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

async function loadProperties() {
  const stored = getStoredProperties();
  if (stored && stored.length) return stored;

  try {
    const response = await fetch(PROPERTY_DATA_PATH, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load properties: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Falling back to bundled sample properties.', error);
    return typeof structuredClone !== 'undefined' ? structuredClone(SAMPLE_PROPERTIES) : JSON.parse(JSON.stringify(SAMPLE_PROPERTIES));
  }
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
      <img class="property-image" src="${escapeHtml(image)}" alt="${escapeHtml(property.title)}" loading="lazy" />
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

document.addEventListener('DOMContentLoaded', () => {
  applyContactLinks();
  setupMobileNav();
  setupReveal();
});
