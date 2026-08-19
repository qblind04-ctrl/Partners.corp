const roster=document.getElementById('adminRoster');
const form=document.getElementById('talentForm');
const statusEl=document.getElementById('formStatus');
const toast=document.getElementById('toast');
const searchEl=document.getElementById('adminSearch');
const catEl=document.getElementById('adminCategory');
const viewPanels=[...document.querySelectorAll('[data-view-panel]')];
const viewLinks=[...document.querySelectorAll('[data-view-target]')];
const BUCKET='talentos';
let talents=[];
let currentView='dashboard';
let crop={img:null,baseScale:1,zoom:1,x:0,y:0,drag:false,lastX:0,lastY:0};

const canvas=document.getElementById('cropCanvas');
const ctx=canvas.getContext('2d');
const placeholder=document.getElementById('cropPlaceholder');
const range=document.getElementById('zoomRange');
const existing=document.getElementById('existingImage');
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const labels={hombres:'Maestro',mujeres:'Maestra',promotores:'Promotor/a'};

function notify(text,type='ok'){
  toast.textContent=text;
  toast.className=`toast show ${type}`;
  setTimeout(()=>toast.className='toast',2600);
}

async function requireSession(){
  const {data:{session},error}=await supabaseClient.auth.getSession();
  if(error) console.error(error);
  if(!session){location.replace('login.html');return false;}
  document.getElementById('sessionEmail').textContent=session.user?.email||'Administrador';
  return true;
}

function setView(view,{pushHash=true}={}){
  if(!['dashboard','create','talents'].includes(view)) view='dashboard';
  currentView=view;
  viewPanels.forEach(panel=>{
    const active=panel.dataset.viewPanel===view;
    panel.hidden=!active;
    panel.classList.toggle('active',active);
  });
  viewLinks.forEach(link=>link.classList.toggle('active',link.dataset.viewTarget===view));
  if(pushHash){
    const hash={dashboard:'resumen',create:'nuevo-talento',talents:'talentos'}[view];
    if(location.hash!==`#${hash}`) history.replaceState(null,'',`#${hash}`);
  }
  window.scrollTo({top:0,behavior:'auto'});
  if(view==='talents') render();
}

function viewFromHash(){
  const hash=location.hash.replace('#','');
  return ({resumen:'dashboard','nuevo-talento':'create',talentos:'talents'})[hash]||'dashboard';
}

function stats(){
  document.getElementById('statTotal').textContent=talents.length;
  document.getElementById('statPremium').textContent=talents.filter(t=>t.premium).length;
  document.getElementById('statHosts').textContent=talents.filter(t=>t.categoria==='hombres'||t.categoria==='mujeres').length;
  document.getElementById('statPromoters').textContent=talents.filter(t=>t.categoria==='promotores').length;
}

function render(){
  if(!roster) return;
  const q=(searchEl.value||'').toLowerCase();
  const cat=catEl.value;
  const list=talents
    .filter(t=>!q||[t.nombre,t.ciudad,...(Array.isArray(t.especializaciones)?t.especializaciones:[])].join(' ').toLowerCase().includes(q))
    .filter(t=>!cat||t.categoria===cat);
  if(!list.length){
    roster.innerHTML='<div class="admin-empty"><strong>No hay perfiles para mostrar.</strong><span>Prueba otro filtro o añade un talento.</span></div>';
    return;
  }
  roster.innerHTML=list.map(t=>`<article class="admin-talent-card">
    <div class="admin-card-image"><img src="${esc(t.imagen_url||'assets/hero.jpg')}" alt="${esc(t.nombre)}">${t.premium?'<span class="admin-premium-badge">Premium</span>':''}</div>
    <div class="admin-card-content">
      <div class="admin-card-topline"><span>${esc(labels[t.categoria]||'Talento')} · ${esc(t.cobertura||'Local')}</span><strong>${Number(t.precio||0).toLocaleString('es-BO')} Bs</strong></div>
      <h3>${esc(t.nombre)}</h3>
      <div class="admin-card-location">${esc(t.ciudad||'Bolivia')}</div>
      <div class="admin-card-tags">${(Array.isArray(t.especializaciones)?t.especializaciones:[]).slice(0,4).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
      <div class="admin-card-actions"><button data-edit="${esc(t.id)}">Editar</button><button class="danger" data-delete="${esc(t.id)}">Eliminar</button></div>
    </div>
  </article>`).join('');
}

async function load(){
  if(roster) roster.innerHTML='<div class="admin-loading">Sincronizando con Supabase…</div>';
  const {data,error}=await supabaseClient.from('talentos').select('*').order('created_at',{ascending:false});
  if(error){
    console.error(error);
    talents=[];
    stats();
    if(roster) roster.innerHTML='<div class="admin-empty"><strong>No se pudieron cargar los talentos.</strong><span>Revisa la conexión o las políticas de Supabase.</span></div>';
    notify('Error al cargar talentos','error');
    return;
  }
  talents=data||[];
  stats();
  render();
}

function resetForm(){
  form.reset();
  document.getElementById('talentId').value='';
  document.getElementById('formKicker').textContent='Editor de perfil';
  document.getElementById('formTitle').textContent='Añadir talento';
  document.getElementById('saveTalentBtn').textContent='Guardar talento';
  statusEl.textContent='';
  statusEl.className='form-status';
  resetCrop();
  existing.hidden=true;
}

function openCreate(t=null){
  resetForm();
  if(t){
    document.getElementById('talentId').value=t.id||'';
    document.getElementById('formKicker').textContent='Editar perfil';
    document.getElementById('formTitle').textContent='Editar talento';
    document.getElementById('saveTalentBtn').textContent='Guardar cambios';
    document.getElementById('nombre').value=t.nombre||'';
    document.getElementById('categoria').value=t.categoria||'';
    document.getElementById('precio').value=t.precio??'';
    document.getElementById('especializaciones').value=Array.isArray(t.especializaciones)?t.especializaciones.join(', '):'';
    document.getElementById('ciudad').value=t.ciudad||'';
    document.getElementById('cobertura').value=t.cobertura||'';
    document.getElementById('premium').checked=!!t.premium;
    if(t.imagen_url){existing.hidden=false;existing.querySelector('img').src=t.imagen_url;}
  }
  setView('create');
  setTimeout(()=>document.getElementById('nombre').focus(),120);
}

function resetCrop(){
  crop={img:null,baseScale:1,zoom:1,x:0,y:0,drag:false,lastX:0,lastY:0};
  ctx.clearRect(0,0,canvas.width,canvas.height);
  placeholder.hidden=false;
  range.value='1';
}

function fit(){
  if(!crop.img)return;
  crop.baseScale=Math.max(canvas.width/crop.img.naturalWidth,canvas.height/crop.img.naturalHeight);
  crop.zoom=1;
  range.value='1';
  const w=crop.img.naturalWidth*crop.baseScale,h=crop.img.naturalHeight*crop.baseScale;
  crop.x=(canvas.width-w)/2;
  crop.y=(canvas.height-h)/2;
  draw();
}

function clamp(){
  if(!crop.img)return;
  const s=crop.baseScale*crop.zoom,w=crop.img.naturalWidth*s,h=crop.img.naturalHeight*s;
  crop.x=Math.min(0,Math.max(canvas.width-w,crop.x));
  crop.y=Math.min(0,Math.max(canvas.height-h,crop.y));
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!crop.img)return;
  clamp();
  const s=crop.baseScale*crop.zoom;
  ctx.drawImage(crop.img,crop.x,crop.y,crop.img.naturalWidth*s,crop.img.naturalHeight*s);
}

function setZoom(v){
  if(!crop.img)return;
  const old=crop.baseScale*crop.zoom,newZoom=Math.max(1,Math.min(2.4,Number(v))),ns=crop.baseScale*newZoom;
  const cx=canvas.width/2,cy=canvas.height/2;
  crop.x=cx-(cx-crop.x)*(ns/old);
  crop.y=cy-(cy-crop.y)*(ns/old);
  crop.zoom=newZoom;
  range.value=String(newZoom);
  draw();
}

function canvasBlob(){
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo procesar la imagen.')),'image/jpeg',.9);
  });
}

async function uploadImage(blob){
  const filePath=`${crypto.randomUUID()}.jpg`;
  const {error}=await supabaseClient.storage.from(BUCKET).upload(filePath,blob,{contentType:'image/jpeg',upsert:false});
  if(error) throw error;
  const {data}=supabaseClient.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

function storagePathFromUrl(url){
  if(!url||!/^https?:\/\//i.test(url)) return null;
  const marker=`/storage/v1/object/public/${BUCKET}/`;
  const i=url.indexOf(marker);
  if(i<0) return null;
  return decodeURIComponent(url.slice(i+marker.length).split('?')[0]);
}

async function removeStoredImage(url){
  const path=storagePathFromUrl(url);
  if(!path) return;
  const {error}=await supabaseClient.storage.from(BUCKET).remove([path]);
  if(error) console.warn('No se pudo eliminar la imagen anterior:',error.message);
}

viewLinks.forEach(link=>link.addEventListener('click',()=>setView(link.dataset.viewTarget)));
document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.jump==='create') openCreate(); else setView(btn.dataset.jump);
}));
window.addEventListener('hashchange',()=>setView(viewFromHash(),{pushHash:false}));

document.getElementById('imagen').addEventListener('change',e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(file.size>12*1024*1024){notify('La imagen supera 12 MB.','error');e.target.value='';return;}
  const url=URL.createObjectURL(file);
  const img=new Image();
  img.onload=()=>{crop.img=img;placeholder.hidden=true;existing.hidden=true;fit();URL.revokeObjectURL(url);};
  img.onerror=()=>{URL.revokeObjectURL(url);notify('No se pudo leer la imagen.','error');};
  img.src=url;
});
canvas.addEventListener('pointerdown',e=>{if(!crop.img)return;crop.drag=true;crop.lastX=e.clientX;crop.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!crop.drag)return;const sx=canvas.width/canvas.getBoundingClientRect().width,sy=canvas.height/canvas.getBoundingClientRect().height;crop.x+=(e.clientX-crop.lastX)*sx;crop.y+=(e.clientY-crop.lastY)*sy;crop.lastX=e.clientX;crop.lastY=e.clientY;draw();});
canvas.addEventListener('pointerup',()=>crop.drag=false);
canvas.addEventListener('pointercancel',()=>crop.drag=false);
range.addEventListener('input',e=>setZoom(e.target.value));
document.getElementById('zoomIn').addEventListener('click',()=>setZoom(crop.zoom+.1));
document.getElementById('zoomOut').addEventListener('click',()=>setZoom(crop.zoom-.1));
document.getElementById('autoFrame').addEventListener('click',fit);

form.addEventListener('submit',async e=>{
  e.preventDefault();
  const id=document.getElementById('talentId').value;
  const old=id?talents.find(t=>String(t.id)===String(id)):null;
  const btn=document.getElementById('saveTalentBtn');
  btn.disabled=true;
  statusEl.className='form-status';
  statusEl.textContent=crop.img?'Procesando y subiendo imagen…':'Guardando en Supabase…';
  let newImageUrl=null;
  try{
    const payload={
      nombre:document.getElementById('nombre').value.trim(),
      categoria:document.getElementById('categoria').value,
      precio:Number(document.getElementById('precio').value),
      especializaciones:document.getElementById('especializaciones').value.split(',').map(v=>v.trim()).filter(Boolean),
      ciudad:document.getElementById('ciudad').value.trim(),
      cobertura:document.getElementById('cobertura').value,
      premium:document.getElementById('premium').checked
    };
    if(crop.img){
      newImageUrl=await uploadImage(await canvasBlob());
      payload.imagen_url=newImageUrl;
    }
    let error;
    if(id){
      ({error}=await supabaseClient.from('talentos').update(payload).eq('id',id));
    }else{
      ({error}=await supabaseClient.from('talentos').insert(payload));
    }
    if(error) throw error;
    if(id&&newImageUrl&&old?.imagen_url&&old.imagen_url!==newImageUrl) await removeStoredImage(old.imagen_url);
    statusEl.className='form-status success';
    statusEl.textContent='Sincronizado correctamente con Supabase.';
    notify(id?'Talento actualizado':'Talento añadido');
    await load();
    setTimeout(()=>{resetForm();setView('talents');},350);
  }catch(err){
    console.error(err);
    if(newImageUrl) await removeStoredImage(newImageUrl);
    statusEl.className='form-status error';
    statusEl.textContent=err.message||'No se pudo guardar en Supabase.';
    notify('No se pudo guardar el talento','error');
  }finally{btn.disabled=false;}
});

async function removeTalent(id){
  const t=talents.find(x=>String(x.id)===String(id));
  if(!t||!confirm(`¿Eliminar a ${t.nombre}?`))return;
  const {error}=await supabaseClient.from('talentos').delete().eq('id',id);
  if(error){
    console.error(error);
    notify('No se pudo eliminar el talento','error');
    return;
  }
  await removeStoredImage(t.imagen_url);
  notify('Talento eliminado');
  await load();
}

roster.addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
  if(edit)openCreate(talents.find(t=>String(t.id)===String(edit.dataset.edit)));
  if(del)removeTalent(del.dataset.delete);
});
searchEl.addEventListener('input',render);
catEl.addEventListener('change',render);
document.getElementById('newTalentBtn').addEventListener('click',()=>openCreate());
['cancelForm','cancelTop'].forEach(id=>document.getElementById(id).addEventListener('click',()=>{resetForm();setView('talents');}));
document.getElementById('logoutBtn').addEventListener('click',async()=>{
  await supabaseClient.auth.signOut();
  location.replace('login.html');
});

(async()=>{
  if(await requireSession()){
    await load();
    setView(viewFromHash(),{pushHash:false});
  }
})();
