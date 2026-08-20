(() => {
  const menuButton=document.getElementById('menuButton'), mobileNav=document.getElementById('mobileNav');
  if(menuButton&&mobileNav){menuButton.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuButton.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));});mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');menuButton.classList.remove('open');}));}
  const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();
  const reveal=()=>document.querySelectorAll('.reveal').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight-60)el.classList.add('visible')}); reveal(); addEventListener('scroll',reveal,{passive:true});
})();