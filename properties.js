(function () {
  let allProperties = [];

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))].sort((a, b) =>
      a.localeCompare(b)
    );
  }

  function populateSelect(select, options, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    options.forEach((option) => {
      const element = document.createElement('option');
      element.value = option;
      element.textContent = option;
      select.appendChild(element);
    });
  }

  function renderFeaturedPreview(properties) {
    const container = document.getElementById('featuredPropertiesPreview');
    if (!container) return;

    const featured = properties.filter((item) => item.featured).slice(0, 3);
    const preview = featured.length ? featured : properties.slice(0, 3);
    container.innerHTML = preview.map(propertyCardMarkup).join('');
  }

  function applyFilters() {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    const search = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    const country = document.getElementById('countryFilter')?.value || '';
    const region = document.getElementById('regionFilter')?.value || '';
    const type = document.getElementById('typeFilter')?.value || '';

    const filtered = allProperties.filter((property) => {
      const haystack = [
        property.title,
        property.description,
        property.country,
        property.region,
        property.city,
        property.type,
        property.status,
        property.badge
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || haystack.includes(search);
      const matchesCountry = !country || property.country === country;
      const matchesRegion = !region || property.region === region;
      const matchesType = !type || property.type === type;

      return matchesSearch && matchesCountry && matchesRegion && matchesType;
    });

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`;
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No properties found</h3>
          <p>Try another country, another state or province, or clear the filters to see everything again.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(propertyCardMarkup).join('');
  }

  function updateRegionOptions() {
    const country = document.getElementById('countryFilter')?.value || '';
    const regionSelect = document.getElementById('regionFilter');
    if (!regionSelect) return;

    const regions = uniqueSorted(
      allProperties
        .filter((property) => !country || property.country === country)
        .map((property) => property.region)
    );

    const previousValue = regionSelect.value;
    populateSelect(regionSelect, regions, 'All states / provinces');
    if (regions.includes(previousValue)) {
      regionSelect.value = previousValue;
    }
  }

  function bindFilters() {
    const searchInput = document.getElementById('searchInput');
    const countryFilter = document.getElementById('countryFilter');
    const regionFilter = document.getElementById('regionFilter');
    const typeFilter = document.getElementById('typeFilter');
    const clearButton = document.getElementById('clearFilters');

    if (!countryFilter || !regionFilter || !typeFilter) return;

    [searchInput, regionFilter, typeFilter].forEach((element) => {
      element?.addEventListener('input', applyFilters);
      element?.addEventListener('change', applyFilters);
    });

    countryFilter.addEventListener('change', () => {
      updateRegionOptions();
      applyFilters();
    });

    clearButton?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      countryFilter.value = '';
      typeFilter.value = '';
      updateRegionOptions();
      regionFilter.value = '';
      applyFilters();
    });
  }

  async function init() {
    allProperties = await loadProperties();
    renderFeaturedPreview(allProperties);

    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    populateSelect(
      document.getElementById('countryFilter'),
      uniqueSorted(allProperties.map((property) => property.country)),
      'All countries'
    );

    populateSelect(
      document.getElementById('typeFilter'),
      uniqueSorted(allProperties.map((property) => property.type)),
      'All property types'
    );

    updateRegionOptions();
    bindFilters();
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
