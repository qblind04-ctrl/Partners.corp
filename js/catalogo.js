const grid=document.getElementById('talentGrid'), countEl=document.getElementById('resultsCount'), searchEl=document.getElementById('talentSearch'), coverageEl=document.getElementById('coverageFilter'), sortEl=document.getElementById('sortTalents'), emptyEl=document.getElementById('emptyCatalog'), clearBtn=document.getElementById('clearFilters'), modal=document.getElementById('profileModal'), profileContent=document.getElementById('profileContent');
const category=document.body.dataset.category||'all'; let talents=[]; const PHONE='59177979971';
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const labelFor=c=>({hombres:'Maestro de ceremonia',mujeres:'Maestra de ceremonia',promotores:'Promotor/a'}[c]||'Talento Partners');
const normalize=v=>(v||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function whatsapp(t){const msg=`Hola, quisiera consultar disponibilidad de ${t.nombre} para un evento. Vi su perfil en Partners Corp.`;return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;}
function tags(t){return Array.isArray(t.especializaciones)?t.especializaciones.filter(Boolean):[];}
function fmtTime(v){const n=Math.max(0,Number(v)||0);return `0:${String(Math.floor(n)).padStart(2,'0')}`;}
function audioPreview(t){
  if(!t.audio_url)return '';
  return `<div class="profile-audio-preview" data-audio-preview><div class="audio-preview-head"><div><span>Preview de voz</span><strong>Escucha una muestra del talento</strong></div><small>Máx. 15 s</small></div><div class="audio-preview-player"><button type="button" class="audio-preview-play" data-audio-play aria-label="Reproducir preview de ${esc(t.nombre)}">▶</button><div class="audio-preview-track"><input type="range" min="0" max="15" value="0" step="0.01" data-audio-range aria-label="Progreso del audio"><div class="audio-preview-time" data-audio-time>0:00 / 0:15</div></div><audio data-audio-element preload="metadata" src="${esc(t.audio_url)}"></audio></div></div>`;
}
function setupProfileAudio(){
  const wrap=profileContent.querySelector('[data-audio-preview]');
  if(!wrap)return;
  const audio=wrap.querySelector('[data-audio-element]'),play=wrap.querySelector('[data-audio-play]'),range=wrap.querySelector('[data-audio-range]'),time=wrap.querySelector('[data-audio-time]');
  let limit=15;
  const sync=()=>{const now=Math.min(audio.currentTime||0,limit);range.value=String(now);time.textContent=`${fmtTime(now)} / ${fmtTime(limit)}`;};
  audio.addEventListener('loadedmetadata',()=>{limit=Math.min(Number.isFinite(audio.duration)?audio.duration:15,15);range.max=String(limit);sync();});
  audio.addEventListener('timeupdate',()=>{if(audio.currentTime>=limit){audio.pause();audio.currentTime=limit;play.textContent='↻';play.classList.remove('playing');}sync();});
  audio.addEventListener('ended',()=>{play.textContent='↻';play.classList.remove('playing');sync();});
  play.addEventListener('click',async()=>{try{if(audio.currentTime>=limit-.05)audio.currentTime=0;if(audio.paused){await audio.play();play.textContent='Ⅱ';play.classList.add('playing');}else{audio.pause();play.textContent='▶';play.classList.remove('playing');}}catch(e){console.warn('No se pudo reproducir el audio:',e);}});
  range.addEventListener('input',()=>{audio.currentTime=Math.min(Number(range.value)||0,limit);sync();});
  audio.addEventListener('pause',()=>{if(audio.currentTime<limit-.05){play.textContent='▶';play.classList.remove('playing');}});
  sync();
}
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
function openProfile(id){const t=talents.find(x=>String(x.id)===String(id));if(!t)return;const ts=tags(t).map(x=>`<span>${esc(x)}</span>`).join('');profileContent.innerHTML=`<div class="profile-image"><img src="${esc(t.imagen_url||'assets/hero.jpg')}" alt="${esc(t.nombre)}">${t.premium?'<span class="premium-badge modal-premium">Premium</span>':''}</div><div class="profile-copy"><div class="profile-details"><span class="kicker">${esc(labelFor(t.categoria))}</span><h2>${esc(t.nombre)}</h2><div class="profile-location">${esc(t.ciudad||'Bolivia')} · Cobertura ${esc(t.cobertura||'Local')}</div><div class="profile-tags">${ts}</div>${audioPreview(t)}<div class="profile-price"><small>Tarifa desde</small><strong>${Number(t.precio||0).toLocaleString('es-BO')} Bs</strong></div><p>Consulta disponibilidad y detalles del servicio directamente con Partners Corp.</p></div><div class="profile-action"><a class="button gold full-button" href="${whatsapp(t)}" target="_blank" rel="noopener">Consultar disponibilidad ↗</a></div></div>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');const details=profileContent.querySelector('.profile-details');if(details)details.scrollTop=0;setupProfileAudio();}
function closeProfile(){const a=profileContent.querySelector('[data-audio-element]');if(a){a.pause();a.currentTime=0;}modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
[searchEl,coverageEl,sortEl].forEach(el=>el&&el.addEventListener(el===searchEl?'input':'change',apply));document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();searchEl?.focus();}if(e.key==='Escape')closeProfile();});grid.addEventListener('click',e=>{const btn=e.target.closest('[data-profile]');if(btn)openProfile(btn.dataset.profile);});document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeProfile));clearBtn?.addEventListener('click',()=>{searchEl.value='';coverageEl.value='';sortEl.value='featured';apply();});
load();
