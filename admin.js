(function () {
  const form = document.getElementById('propertyForm');
  const list = document.getElementById('adminPropertyList');
  const statusText = document.getElementById('adminStatus');
  const resultsCount = document.getElementById('adminResultsCount');
  const formTitle = document.getElementById('formTitle');
  const loginSection = document.getElementById('adminLoginSection');
  const adminPanelSection = document.getElementById('adminPanelSection');
  const loginForm = document.getElementById('adminLoginForm');
  const loginStatus = document.getElementById('loginStatus');
  const adminUserLabel = document.getElementById('adminUserLabel');
  const signOutButton = document.getElementById('signOutButton');

  if (!form || !list) return;

  let properties = [];
  let auth = null;
  let firebaseMode = false;
  let isReady = false;

  const CLOUDINARY_CONFIG = {
    cloudName: 'dkw2nrrg4',
    uploadPreset: 'ir_properties_unsigned',
    folder: 'ir-caribbean/properties',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize: 10000000
  };

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
    uploadMainImageButton: document.getElementById('uploadMainImageButton'),
    uploadGalleryImagesButton: document.getElementById('uploadGalleryImagesButton'),
    galleryUrls: document.getElementById('galleryUrls'),
    imagePreview: document.getElementById('imagePreview'),
    galleryPreview: document.getElementById('galleryPreview'),
    description: document.getElementById('description'),
    featured: document.getElementById('featured'),
    isPublished: document.getElementById('isPublished')
  };

  function defaultImage() {
    return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  }

  function setStatus(message) {
    if (statusText) statusText.textContent = message;
  }

  function setLoginStatus(message) {
    if (loginStatus) loginStatus.textContent = message;
  }

  function showAdminPanel(user) {
    loginSection?.classList.add('is-hidden');
    document.querySelectorAll('.admin-only').forEach((section) => section.classList.remove('is-hidden'));
    adminPanelSection?.classList.remove('is-hidden');
    if (adminUserLabel) adminUserLabel.textContent = user?.email ? `Signed in as ${user.email}` : 'Signed in';
  }

  function showLoginPanel() {
    loginSection?.classList.remove('is-hidden');
    document.querySelectorAll('.admin-only').forEach((section) => section.classList.add('is-hidden'));
    adminPanelSection?.classList.add('is-hidden');
  }

  function makeId() {
    return `IR-${Date.now()}-${Math.floor(Math.random() * 999)}`;
  }


  function parseGalleryUrls() {
    try {
      const parsed = JSON.parse(fields.galleryUrls?.value || '[]');
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function renderMediaPreview(mainImage = '', galleryUrls = []) {
    if (fields.imagePreview) {
      fields.imagePreview.innerHTML = mainImage
        ? `<img src="${escapeHtml(mainImage)}" alt="Selected main property preview" />`
        : '<span>No main image selected yet.</span>';
    }

    if (fields.galleryPreview) {
      if (!galleryUrls.length) {
        fields.galleryPreview.innerHTML = '<span>No gallery images uploaded yet.</span>';
      } else {
        fields.galleryPreview.innerHTML = galleryUrls
          .map((url) => `<img src="${escapeHtml(url)}" alt="Gallery property preview" />`)
          .join('');
      }
    }
  }

  function hasCloudinaryWidget() {
    return Boolean(window.cloudinary && typeof window.cloudinary.createUploadWidget === 'function');
  }

  function setGalleryUrls(urls = []) {
    const cleanUrls = urls.filter(Boolean);
    if (fields.galleryUrls) fields.galleryUrls.value = JSON.stringify(cleanUrls);
    renderMediaPreview(fields.image.value.trim(), cleanUrls);
  }

  function openCloudinaryUploader({ multiple = false, onUpload }) {
    if (!hasCloudinaryWidget()) {
      setStatus('Cloudinary widget is not available yet. Refresh the page and try again.');
      return;
    }

    const uploadedUrls = [];
    const widget = cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder,
        sources: ['local', 'url', 'camera'],
        multiple,
        maxFiles: multiple ? 20 : 1,
        resourceType: 'image',
        clientAllowedFormats: CLOUDINARY_CONFIG.allowedFormats,
        maxFileSize: CLOUDINARY_CONFIG.maxFileSize,
        cropping: false,
        showAdvancedOptions: false
      },
      (error, result) => {
        if (error) {
          console.error(error);
          setStatus(`Cloudinary upload failed: ${error.message || 'Unknown error'}`);
          return;
        }

        if (result && result.event === 'success') {
          const imageUrl = result.info?.secure_url;
          if (!imageUrl) return;
          uploadedUrls.push(imageUrl);
          onUpload(imageUrl, uploadedUrls);
          setStatus(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} uploaded with Cloudinary. Save the property to publish the new links.`);
        }
      }
    );

    widget.open();
  }

  async function attachUploadedImages(property) {
    property.galleryUrls = Array.isArray(property.galleryUrls) ? property.galleryUrls : [];
    property.image = property.image || defaultImage();
    return property;
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
      image: fields.image.value.trim(),
      galleryUrls: parseGalleryUrls(),
      description: fields.description.value.trim(),
      featured: fields.featured.checked,
      isPublished: fields.isPublished ? fields.isPublished.checked : true
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
    if (fields.galleryUrls) fields.galleryUrls.value = JSON.stringify(Array.isArray(property.galleryUrls) ? property.galleryUrls : []);
    renderMediaPreview(property.image || '', Array.isArray(property.galleryUrls) ? property.galleryUrls : []);
    fields.description.value = property.description || '';
    fields.featured.checked = Boolean(property.featured);
    if (fields.isPublished) fields.isPublished.checked = property.isPublished !== false;
    formTitle.textContent = 'Edit property';
  }

  function resetForm() {
    form.reset();
    fields.propertyId.value = '';
    fields.currency.value = 'USD';
    if (fields.galleryUrls) fields.galleryUrls.value = '[]';
    renderMediaPreview('', []);
    if (fields.isPublished) fields.isPublished.checked = true;
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
          <p>Add your first listing with the form above. When Firebase is configured, saved listings update the public page automatically.</p>
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
                ${property.isPublished === false ? '<span class="property-badge">Hidden</span>' : '<span class="property-badge">Public</span>'}
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
    if (isReady) return;
    isReady = true;

    if (firebaseMode) {
      const firebaseProperties = await loadFirebaseProperties(true);
      properties = firebaseProperties || [];
      setStatus('Connected to Firebase. Saved changes publish to the public sales page automatically.');
    } else {
      const local = getStoredProperties();
      if (local && local.length) {
        properties = local;
        setStatus('Firebase is not configured yet. Using properties stored in this browser for local testing.');
      } else {
        properties = await loadProperties();
        saveToLocal();
        setStatus('Firebase is not configured yet. No demo listings are loaded. Add real listings after admin login.');
      }
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
    setStatus('Exported a backup properties.json file.');
  }

  async function importJson(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('The imported JSON must be an array of properties.');
    }

    properties = parsed.map((property) => ({ ...property, isPublished: property.isPublished !== false }));

    if (firebaseMode) {
      await importPropertiesToFirebase(properties);
      properties = (await loadFirebaseProperties(true)) || properties;
      setStatus('Imported JSON into Firebase successfully.');
    } else {
      saveToLocal();
      setStatus('Imported JSON locally. Configure Firebase to publish automatically.');
    }

    renderList();
    resetForm();
  }



  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let property = readFormData();

    if (!property.title || !property.country || !property.region || !property.city || !property.type || !property.status || !property.price) {
      setStatus('Please complete the required fields before saving.');
      return;
    }

    try {
      property = await attachUploadedImages(property);

      if (firebaseMode) {
        const saved = await saveFirebaseProperty(property);
        const existingIndex = properties.findIndex((item) => item.id === saved.id);
        if (existingIndex >= 0) properties[existingIndex] = saved;
        else properties.unshift(saved);
        properties = (await loadFirebaseProperties(true)) || properties;
        setStatus(`Saved ${property.title} to Firebase.`);
      } else {
        const existingIndex = properties.findIndex((item) => item.id === property.id);
        if (existingIndex >= 0) {
          properties[existingIndex] = property;
          setStatus(`Updated ${property.title} locally.`);
        } else {
          properties.unshift(property);
          setStatus(`Added ${property.title} locally.`);
        }
        saveToLocal();
      }

      renderList();
      resetForm();
    } catch (error) {
      console.error(error);
      setStatus(`Save failed: ${error.message}`);
    }
  });

  list.addEventListener('click', async (event) => {
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

      try {
        if (firebaseMode) {
          await deleteFirebaseProperty(deleteId);
          properties = (await loadFirebaseProperties(true)) || properties.filter((item) => item.id !== deleteId);
          setStatus(`Deleted ${property.title} from Firebase.`);
        } else {
          properties = properties.filter((item) => item.id !== deleteId);
          saveToLocal();
          setStatus(`Deleted ${property.title} locally.`);
        }
        renderList();
      } catch (error) {
        console.error(error);
        setStatus(`Delete failed: ${error.message}`);
      }
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!auth) {
      setLoginStatus('Firebase is not configured yet. Fill firebase-config.js first.');
      return;
    }

    const email = document.getElementById('adminEmail')?.value.trim();
    const password = document.getElementById('adminPassword')?.value;
    if (!email || !password) return;

    try {
      setLoginStatus('Checking credentials...');
      await auth.signInWithEmailAndPassword(email, password);
      loginForm.reset();
    } catch (error) {
      console.error(error);
      setLoginStatus(`Login failed: ${error.message}`);
    }
  });

  signOutButton?.addEventListener('click', async () => {
    if (auth) await auth.signOut();
  });

  document.getElementById('exportJsonButton')?.addEventListener('click', exportJson);
  document.getElementById('resetFormButton')?.addEventListener('click', resetForm);
  document.getElementById('cancelEditButton')?.addEventListener('click', resetForm);
  fields.image?.addEventListener('input', () => renderMediaPreview(fields.image.value.trim(), parseGalleryUrls()));

  fields.uploadMainImageButton?.addEventListener('click', () => {
    openCloudinaryUploader({
      multiple: false,
      onUpload: (imageUrl) => {
        fields.image.value = imageUrl;
        renderMediaPreview(imageUrl, parseGalleryUrls());
      }
    });
  });

  fields.uploadGalleryImagesButton?.addEventListener('click', () => {
    openCloudinaryUploader({
      multiple: true,
      onUpload: (imageUrl) => {
        const updatedGallery = parseGalleryUrls().concat(imageUrl);
        setGalleryUrls(updatedGallery);
      }
    });
  });

  document.getElementById('clearGalleryButton')?.addEventListener('click', () => {
    if (fields.galleryUrls) fields.galleryUrls.value = '[]';
    renderMediaPreview(fields.image.value.trim(), []);
    setStatus('Gallery cleared in the form. Save the property to apply this change.');
  });

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

  try {
    auth = getFirebaseAuth();
    firebaseMode = Boolean(auth && getFirebaseFirestore());
  } catch (error) {
    console.warn('Firebase admin mode is unavailable.', error);
    firebaseMode = false;
  }

  if (firebaseMode) {
    showLoginPanel();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        showAdminPanel(user);
        setLoginStatus('Access granted.');
        await loadInitial();
      } else {
        isReady = false;
        properties = [];
        renderList();
        showLoginPanel();
        setLoginStatus('Firebase login required.');
      }
    });
  } else {
    showAdminPanel({ email: 'Local test mode' });
    setLoginStatus('Firebase is not configured yet. Local test mode is open.');
    loadInitial();
  }
})();
