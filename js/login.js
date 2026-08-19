const form=document.getElementById('loginForm');
const msg=document.getElementById('loginMessage');
const btn=document.getElementById('loginButton');
const toggle=document.getElementById('togglePassword');
const pass=document.getElementById('password');

toggle.addEventListener('click',()=>{
  const show=pass.type==='password';
  pass.type=show?'text':'password';
  toggle.textContent=show?'Ocultar':'Ver';
});

(async()=>{
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(session) location.replace('admin.html');
})();

form.addEventListener('submit',async e=>{
  e.preventDefault();
  msg.className='form-status';
  msg.textContent='Verificando acceso…';
  btn.disabled=true;
  const email=document.getElementById('email').value.trim();
  const {error}=await supabaseClient.auth.signInWithPassword({email,password:pass.value});
  btn.disabled=false;
  if(error){
    console.error(error);
    msg.className='form-status error';
    msg.textContent='Correo o contraseña incorrectos.';
    return;
  }
  msg.className='form-status success';
  msg.textContent='Acceso correcto. Abriendo panel…';
  setTimeout(()=>location.replace('admin.html'),250);
});
