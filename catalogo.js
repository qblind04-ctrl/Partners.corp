const grid=document.getElementById('talentGrid'), countEl=document.getElementById('resultsCount'), searchEl=document.getElementById('talentSearch'), coverageEl=document.getElementById('coverageFilter'), sortEl=document.getElementById('sortTalents'), emptyEl=document.getElementById('emptyCatalog'), clearBtn=document.getElementById('clearFilters'), modal=document.getElementById('profileModal'), profileContent=document.getElementById('profileContent');
const category=document.body.dataset.category||'all'; let talents=[]; const PHONE='59177979971';
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const labelFor=c=>({hombres:'Maestro de ceremonia',mujeres:'Maestra de ceremonia',promotores:'Promotor/a'}[c]||'Talento Partners');
const normalize=v=>(v||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function whatsapp(t){const msg=`Hola, quisiera consultar disponibilidad de ${t.nombre} para un evento. Vi su perfil en Partners Corp.`;return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;}
function tags(t){return Array.isArray(t.especializaciones)?t.especializaciones.filter(Boolean):[];}
function card(t){const ts=tags(t).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('');return `<article class="talent-card-v2" data-id="${esc(t.id)}"><button class="talent-media" data-profile="${esc(t.id)}" aria-label="Ver perfil de ${esc(t.nombre)}"><img src="${esc(t.imagen_url||'assets/hero.jpg')}" alt="${esc(t.nombre)}" loading="lazy"><div class="talent-gradient"></div>${t.premium?'<span class="premium-badge">Premium</span>':''}<span class="coverage-badge">${esc(t.cobertura||'Local')}</span><div class="media-caption"><small>${esc(labelFor(t.categoria))}</small><strong>${esc(t.nombre)}</strong></div></button><div class="talent-info-v2"><div class="talent-meta"><span>${esc(t.ciudad||'Bolivia')}</span><i></i><span>${esc(t.cobertura||'Local')}</span></div><div class="talent-tags-v2">${ts||'<span>Eventos</span>'}</div><div class="talent-price-row"><div><small>Desde</small><strong>${Number(t.precio||0).toLocaleString('es-BO')} <em>Bs</em></strong></div><button class="circle-action" data-profile="${esc(t.id)}" aria-label="Ver perfil">↗</button></div></div></article>`;}
function apply(){const q=normalize(searchEl?.value), cov=coverageEl?.value;let out=talents.filter(t=>!q||[t.nombre,t.ciudad,t.cobertura,...tags(t)].some(v=>normalize(v).includes(q))).filter(t=>!cov||t.cobertura===cov); const s=sortEl?.value;if(s==='price-asc')out.sort((a,b)=>(a.precio||0)-(b.precio||0));else if(s==='price-desc')out.sort((a,b)=>(b.precio||0)-(a.precio||0));else if(s==='name')out.sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||'','es'));else out.sort((a,b)=>Number(b.premium)-Number(a.premium)||(a.nombre||'').localeCompare(b.nombre||'','es'));grid.innerHTML=out.map(card).join(''); countEl.textContent=`${out.length} ${out.length===1?'perfil':'perfiles'} disponibles`;emptyEl.hidden=out.length>0;grid.hidden=out.length===0;}
async function load(){
  countEl.textContent='Cargando talentos…';
  grid.hidden=false;
  grid.innerHTML='<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';
  let query=supabaseClient.from('talentos').select('*').order('created_at',{ascending:false});
  if(category!=='all') query=query.eq('categoria',category);
  const {data,error}=await query;
  if(error){
    console.error(error);
    talents=[];
    grid.innerHTML='';
    grid.hidden=true;
    emptyEl.hidden=false;
    emptyEl.querySelector('span').textContent='Error de conexión';
    emptyEl.querySelector('h2').textContent='No pudimos cargar los talentos.';
    countEl.textContent='0 perfiles disponibles';
    return;
  }
  talents=data||[];
  apply();
}
function openProfile(id){const t=talents.find(x=>String(x.id)===String(id));if(!t)return;const ts=tags(t).map(x=>`<span>${esc(x)}</span>`).join('');profileContent.innerHTML=`<div class="profile-image"><img src="${esc(t.imagen_url||'assets/hero.jpg')}" alt="${esc(t.nombre)}">${t.premium?'<span class="premium-badge modal-premium">Premium</span>':''}</div><div class="profile-copy"><span class="kicker">${esc(labelFor(t.categoria))}</span><h2>${esc(t.nombre)}</h2><div class="profile-location">${esc(t.ciudad||'Bolivia')} · Cobertura ${esc(t.cobertura||'Local')}</div><div class="profile-tags">${ts}</div><div class="profile-price"><small>Tarifa desde</small><strong>${Number(t.precio||0).toLocaleString('es-BO')} Bs</strong></div><p>Consulta disponibilidad y detalles del servicio directamente con Partners Corp.</p><a class="button gold full-button" href="${whatsapp(t)}" target="_blank" rel="noopener">Consultar disponibilidad ↗</a></div>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
function closeProfile(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
[searchEl,coverageEl,sortEl].forEach(el=>el&&el.addEventListener(el===searchEl?'input':'change',apply));document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();searchEl?.focus();}if(e.key==='Escape')closeProfile();});grid.addEventListener('click',e=>{const btn=e.target.closest('[data-profile]');if(btn)openProfile(btn.dataset.profile);});document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeProfile));clearBtn?.addEventListener('click',()=>{searchEl.value='';coverageEl.value='';sortEl.value='featured';apply();});
load();
