const category = document.body.dataset.category;
const emptyMessage = document.body.dataset.empty || 'No hay talentos disponibles.';
const grid = document.getElementById('talentsGrid');
const searchInput = document.getElementById('talentSearch');
const sortSelect = document.getElementById('talentSort');
const resultsCount = document.getElementById('resultsCount');
const modal = document.getElementById('talentModal');
const modalContent = document.getElementById('modalContent');
const closeModalButton = document.getElementById('closeModal');
let allTalents = [];

const PHONE = '59177979971';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function formatPrice(value) {
  const n = Number(value || 0);
  return `${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(n)} Bs`;
}

function getSpecialties(talent) {
  return Array.isArray(talent.especializaciones) ? talent.especializaciones.filter(Boolean) : [];
}

function imageMarkup(talent, className = '') {
  if (talent.imagen_url) {
    return `<img class="${className}" src="${escapeHTML(talent.imagen_url)}" alt="${escapeHTML(talent.nombre)}" loading="lazy">`;
  }
  return `<div class="talent-image-placeholder"><img src="assets/logo.png" alt=""><span>Sin fotografía</span></div>`;
}

function cardMarkup(talent) {
  const tags = getSpecialties(talent).slice(0, 3).map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
  return `
    <article class="talent-card ${talent.premium ? 'is-premium' : ''}">
      <div class="talent-card-media">
        ${imageMarkup(talent)}
        ${talent.premium ? '<span class="premium-badge">PREMIUM</span>' : ''}
        <span class="coverage-badge">${escapeHTML(talent.cobertura || 'Local')}</span>
      </div>
      <div class="talent-card-body">
        <div class="talent-card-meta"><span>📍 ${escapeHTML(talent.ciudad || 'Bolivia')}</span><strong>${formatPrice(talent.precio)}</strong></div>
        <h2>${escapeHTML(talent.nombre)}</h2>
        <div class="card-tags">${tags || '<span>Profesional para eventos</span>'}</div>
        <div class="talent-card-actions">
          <button class="details-btn" type="button" data-action="details" data-id="${escapeHTML(talent.id)}">Ver perfil</button>
          <button class="contract-btn" type="button" data-action="contact" data-id="${escapeHTML(talent.id)}">Consultar <span>↗</span></button>
        </div>
      </div>
    </article>`;
}

function applyFilters() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  let list = allTalents.filter(talent => {
    const haystack = [talent.nombre, talent.ciudad, talent.cobertura, ...getSpecialties(talent)].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  const sort = sortSelect?.value || 'featured';
  list = [...list].sort((a, b) => {
    if (sort === 'price-asc') return Number(a.precio || 0) - Number(b.precio || 0);
    if (sort === 'price-desc') return Number(b.precio || 0) - Number(a.precio || 0);
    if (sort === 'name') return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    if (Boolean(a.premium) !== Boolean(b.premium)) return a.premium ? -1 : 1;
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });

  resultsCount.textContent = `${list.length} ${list.length === 1 ? 'perfil' : 'perfiles'}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><span>◇</span><h3>Sin resultados</h3><p>${query ? 'Prueba con otro nombre, ciudad o especialidad.' : escapeHTML(emptyMessage)}</p></div>`;
    return;
  }
  grid.innerHTML = list.map(cardMarkup).join('');
}

async function loadTalents() {
  const { data, error } = await supabaseClient.from('talentos').select('*').eq('categoria', category);
  if (error) {
    console.error(error);
    grid.innerHTML = '<div class="empty-state"><span>!</span><h3>No se pudieron cargar los perfiles</h3><p>Intenta nuevamente en unos minutos.</p></div>';
    resultsCount.textContent = '0 perfiles';
    return;
  }
  allTalents = data || [];
  applyFilters();
}

function openDetails(id) {
  const talent = allTalents.find(item => String(item.id) === String(id));
  if (!talent) return;
  const tags = getSpecialties(talent).map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
  modalContent.innerHTML = `
    <div class="modal-profile-grid">
      <div class="modal-profile-media">${imageMarkup(talent)}</div>
      <div class="modal-profile-info">
        ${talent.premium ? '<span class="premium-badge modal-premium">PREMIUM</span>' : '<span class="modal-kicker">PARTNERS CORP</span>'}
        <h2 id="modalTalentName">${escapeHTML(talent.nombre)}</h2>
        <div class="modal-tags">${tags || '<span>Profesional para eventos</span>'}</div>
        <div class="modal-facts">
          <div><small>CIUDAD</small><strong>${escapeHTML(talent.ciudad || 'No especificada')}</strong></div>
          <div><small>COBERTURA</small><strong>${escapeHTML(talent.cobertura || 'Local')}</strong></div>
          <div class="modal-price-block"><small>PRECIO REFERENCIAL</small><strong>${formatPrice(talent.precio)}</strong></div>
        </div>
        <button class="modal-whatsapp" type="button" data-action="contact" data-id="${escapeHTML(talent.id)}">Consultar disponibilidad por WhatsApp <span>↗</span></button>
        <p class="modal-note">La disponibilidad final se confirma directamente con Partners Corp.</p>
      </div>
    </div>`;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeDetails() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function contactTalent(id) {
  const talent = allTalents.find(item => String(item.id) === String(id));
  if (!talent) return;
  const message = `Hola Partners Corp, quiero consultar la disponibilidad de ${talent.nombre}. Vi el perfil en la web con un precio referencial de ${formatPrice(talent.precio)}. ¿Me dan más información?`;
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

searchInput?.addEventListener('input', applyFilters);
sortSelect?.addEventListener('change', applyFilters);
grid?.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'details') openDetails(button.dataset.id);
  if (button.dataset.action === 'contact') contactTalent(button.dataset.id);
});
modalContent?.addEventListener('click', event => {
  const button = event.target.closest('[data-action="contact"]');
  if (button) contactTalent(button.dataset.id);
});
closeModalButton?.addEventListener('click', closeDetails);
modal?.addEventListener('click', event => { if (event.target === modal) closeDetails(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal?.classList.contains('active')) closeDetails(); });

loadTalents();
