const CONFIG = {
  companyName: 'I&R Caribbean Real Estate',
  whatsappNumber: '10000000000',
  whatsappDisplay: '+1 000 000 0000',
  whatsappMessage: 'Hello, I would like information about your properties.',
  email: 'info@yourdomain.com',
  emailSubject: 'Property inquiry',
  emailBody: 'Hello, I would like more information about your properties.'
};

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

function applyContactLinks() {
  const whatsappLink = buildWhatsappLink(CONFIG.whatsappNumber, CONFIG.whatsappMessage);
  const mailtoLink = buildMailtoLink(CONFIG.email, CONFIG.emailSubject, CONFIG.emailBody);

  const whatsappIds = [
    'headerWhatsapp',
    'heroWhatsapp',
    'contactWhatsapp',
    'floatingWhatsapp'
  ];

  const emailIds = ['heroEmail', 'contactEmail'];

  whatsappIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.href = whatsappLink;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
  });

  ['propertyWhatsapp1', 'propertyWhatsapp2', 'propertyWhatsapp3'].forEach((id, index) => {
    const element = document.getElementById(id);
    if (!element) return;

    const messages = [
      'Hello, I am interested in the oceanfront villa listing.',
      'Hello, I would like details about the family residence.',
      'Hello, I want information about your investment properties.'
    ];

    element.href = buildWhatsappLink(CONFIG.whatsappNumber, messages[index]);
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
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

  document.title = CONFIG.companyName;
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

document.addEventListener('DOMContentLoaded', () => {
  applyContactLinks();
  setupMobileNav();
  setupReveal();
});
