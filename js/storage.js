(() => {
  const TALENTS_KEY='partners_talentos_v1';
  const SESSION_KEY='partners_admin_session_v1';
  const ADMIN_EMAIL='admin@partners.local';
  const ADMIN_PASSWORD='Partners2026!';
  const seed=[{
    id:'demo-001',
    nombre:'Talento de Ejemplo',
    categoria:'mujeres',
    precio:450,
    especializaciones:['Eventos corporativos','Presentación','Protocolo'],
    ciudad:'Cochabamba',
    cobertura:'Nacional',
    premium:true,
    imagen_url:'assets/mujeres.jpg',
    created_at:new Date().toISOString()
  }];
  function readTalents(){
    try{
      const raw=localStorage.getItem(TALENTS_KEY);
      if(!raw){localStorage.setItem(TALENTS_KEY,JSON.stringify(seed));return structuredClone(seed);}
      const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed:structuredClone(seed);
    }catch(e){console.warn('No se pudo leer localStorage',e);return structuredClone(seed);}
  }
  function writeTalents(items){localStorage.setItem(TALENTS_KEY,JSON.stringify(items));return items;}
  function newId(){return `talent-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}
  function upsertTalent(payload,id){
    const items=readTalents();
    if(id){const i=items.findIndex(t=>String(t.id)===String(id));if(i<0)throw new Error('Talento no encontrado');items[i]={...items[i],...payload,id:items[i].id,updated_at:new Date().toISOString()};}
    else items.push({...payload,id:newId(),created_at:new Date().toISOString()});
    return writeTalents(items);
  }
  function deleteTalent(id){return writeTalents(readTalents().filter(t=>String(t.id)!==String(id)));}
  function login(email,password){
    const ok=email.trim().toLowerCase()===ADMIN_EMAIL && password===ADMIN_PASSWORD;
    if(ok)localStorage.setItem(SESSION_KEY,JSON.stringify({email:ADMIN_EMAIL,loggedAt:Date.now()}));
    return ok;
  }
  function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}
  function logout(){localStorage.removeItem(SESSION_KEY);}
  window.PartnersStore={readTalents,writeTalents,upsertTalent,deleteTalent,login,session,logout,ADMIN_EMAIL,ADMIN_PASSWORD};
})();
