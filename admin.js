(function () {
  const form = document.getElementById('propertyForm');
  const list = document.getElementById('adminPropertyList');
  const statusText = document.getElementById('adminStatus');
  const resultsCount = document.getElementById('adminResultsCount');
  const formTitle = document.getElementById('formTitle');

  if (!form || !list) return;

  let properties = [];

  const fields = {
    propertyId: document.getElementById('propertyId'),
    title: document.getElementById('title'),
    badge: document.getElementById('badge'),
    country: document.getElementById('country'),
    region: document.getElementById('region'),
    city: document.getElementById('city'),
    type: document.getElementById('type'),
    status: document.getElementById('status'),
    currency: document.getElementById('currency'),
    price: document.getElementById('price'),
    beds: document.getElementById('beds'),
    baths: document.getElementById('baths'),
    area: document.getElementById('area'),
    image: document.getElementById('image'),
    description: document.getElementById('description'),
    featured: document.getElementById('featured')
  };

  function defaultImage() {
    return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  }

  function setStatus(message) {
    if (statusText) statusText.textContent = message;
  }

  function makeId() {
    return `IR-${Date.now()}-${Math.floor(Math.random() * 999)}`;
  }

  function readFormData() {
    return {
      id: fields.propertyId.value || makeId(),
      title: fields.title.value.trim(),
      badge: fields.badge.value.trim(),
      country: fields.country.value.trim(),
      region: fields.region.value.trim(),
      city: fields.city.value.trim(),
      type: fields.type.value.trim(),
      status: fields.status.value.trim(),
      currency: fields.currency.value.trim() || 'USD',
      price: Number(fields.price.value) || 0,
      beds: fields.beds.value ? Number(fields.beds.value) : '',
      baths: fields.baths.value ? Number(fields.baths.value) : '',
      area: fields.area.value ? Number(fields.area.value) : '',
      image: fields.image.value.trim() || defaultImage(),
      description: fields.description.value.trim(),
      featured: fields.featured.checked
    };
  }

  function fillForm(property) {
    fields.propertyId.value = property.id || '';
    fields.title.value = property.title || '';
    fields.badge.value = property.badge || '';
    fields.country.value = property.country || '';
    fields.region.value = property.region || '';
    fields.city.value = property.city || '';
    fields.type.value = property.type || '';
    fields.status.value = property.status || '';
    fields.currency.value = property.currency || 'USD';
    fields.price.value = property.price || '';
    fields.beds.value = property.beds || '';
    fields.baths.value = property.baths || '';
    fields.area.value = property.area || '';
    fields.image.value = property.image || '';
    fields.description.value = property.description || '';
    fields.featured.checked = Boolean(property.featured);
    formTitle.textContent = 'Edit property';
  }

  function resetForm() {
    form.reset();
    fields.propertyId.value = '';
    fields.currency.value = 'USD';
    formTitle.textContent = 'Add a new property';
  }

  function renderList() {
    if (resultsCount) {
      resultsCount.textContent = `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`;
    }

    if (!properties.length) {
      list.innerHTML = `
        <div class="empty-state">
          <h3>No properties yet</h3>
          <p>Add your first listing with the form above, then export the JSON when you're ready to publish.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = properties
      .map(
        (property) => `
          <article class="admin-list-card panel">
            <img class="admin-list-image" src="${escapeHtml(property.image || defaultImage())}" alt="${escapeHtml(property.title)}" />
            <div class="admin-list-copy">
              <div class="property-badges">
                <span class="property-type">${escapeHtml(property.type || 'Property')}</span>
                <span class="status-pill">${escapeHtml(property.status || 'For Sale')}</span>
                ${property.badge ? `<span class="property-badge">${escapeHtml(property.badge)}</span>` : ''}
              </div>
              <h3>${escapeHtml(property.title)}</h3>
              <div class="admin-list-meta">
                ${escapeHtml([property.city, property.region, property.country].filter(Boolean).join(', '))}<br />
                ${escapeHtml(formatCurrency(property.price, property.currency || 'USD'))} • Ref: ${escapeHtml(property.id)}
              </div>
            </div>
            <div class="admin-list-actions">
              <button class="btn btn-outline btn-sm" type="button" data-edit="${escapeHtml(property.id)}">Edit</button>
              <button class="btn btn-outline btn-sm" type="button" data-delete="${escapeHtml(property.id)}">Delete</button>
            </div>
          </article>
        `
      )
      .join('');
  }

  function saveToLocal() {
    setLocalProperties(properties);
  }

  async function loadInitial() {
    const local = getStoredProperties();
    if (local && local.length) {
      properties = local;
      setStatus('Using the properties currently stored in this browser.');
    } else {
      properties = await loadProperties();
      saveToLocal();
      setStatus('Loaded sample properties and saved them locally in this browser.');
    }
    renderList();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(properties, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'properties.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Exported properties.json. Replace data/properties.json in your GitHub repo with this file.');
  }

  async function importJson(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('The imported JSON must be an array of properties.');
    }
    properties = parsed;
    saveToLocal();
    renderList();
    resetForm();
    setStatus('Imported JSON successfully. These properties are now stored in this browser.');
  }

  async function resetToSample() {
    const sample = await loadProperties();
    properties = sample;
    saveToLocal();
    renderList();
    resetForm();
    setStatus('Reset to the sample properties from data/properties.json.');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const property = readFormData();

    if (!property.title || !property.country || !property.region || !property.city || !property.type || !property.status || !property.price) {
      setStatus('Please complete the required fields before saving.');
      return;
    }

    const existingIndex = properties.findIndex((item) => item.id === property.id);
    if (existingIndex >= 0) {
      properties[existingIndex] = property;
      setStatus(`Updated ${property.title}.`);
    } else {
      properties.unshift(property);
      setStatus(`Added ${property.title}.`);
    }

    saveToLocal();
    renderList();
    resetForm();
  });

  list.addEventListener('click', (event) => {
    const editId = event.target.getAttribute('data-edit');
    const deleteId = event.target.getAttribute('data-delete');

    if (editId) {
      const property = properties.find((item) => item.id === editId);
      if (!property) return;
      fillForm(property);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStatus(`Editing ${property.title}.`);
    }

    if (deleteId) {
      const property = properties.find((item) => item.id === deleteId);
      if (!property) return;
      const confirmed = window.confirm(`Delete ${property.title}?`);
      if (!confirmed) return;
      properties = properties.filter((item) => item.id !== deleteId);
      saveToLocal();
      renderList();
      setStatus(`Deleted ${property.title}.`);
    }
  });

  document.getElementById('exportJsonButton')?.addEventListener('click', exportJson);
  document.getElementById('resetFormButton')?.addEventListener('click', resetForm);
  document.getElementById('cancelEditButton')?.addEventListener('click', resetForm);
  document.getElementById('resetSampleButton')?.addEventListener('click', resetToSample);
  document.getElementById('importJsonInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importJson(file);
    } catch (error) {
      console.error(error);
      setStatus(`Import failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  });

  loadInitial();
})();
