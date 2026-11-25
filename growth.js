(() => {
  const root = document.body.dataset.root || '';
  const whatsapp = message => 'https://wa.me/584124784922?text=' + encodeURIComponent(message);
  document.querySelectorAll('.lead-form').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type=submit]');
      const status = form.querySelector('.form-status');
      button.disabled = true; status.textContent = 'Preparando tu correo de confirmación…'; delete status.dataset.error;
      try {
        if (location.protocol === 'file:') throw new Error('offline');
        const data = new FormData(form);
        const response = await fetch('/api/subscribe', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),website:data.get('website'),consent:data.has('consent'),marketing:form.dataset.kind==='newsletter'||data.has('marketing'),kind:form.dataset.kind})});
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'unavailable');
        status.textContent = 'Revisa tu correo: te enviamos un enlace para confirmar tu solicitud. Si no aparece, revisa spam.';
        form.reset();
      } catch (error) {
        status.dataset.error = 'true'; status.textContent = error.message === 'rate' ? 'Ya recibimos varias solicitudes. Espera un poco antes de intentarlo de nuevo.' : 'No pudimos enviar la confirmación. Puedes solicitarlo directamente a Maye. ';
        const link = document.createElement('a'); link.textContent = 'Escribir a Maye ↗'; link.href = whatsapp('Hola Maye, quiero recibir '+(form.dataset.kind==='checklist'?'la checklist gratuita de los 4 pilares.':'tu newsletter.'));link.target='_blank';link.rel='noopener noreferrer';status.append(link);
      } finally {button.disabled=false;}
    });
  });
  const confirm = document.querySelector('#confirm-email');
  if (confirm) {
    const token = new URLSearchParams(location.search).get('token');
    const status = document.querySelector('#confirmation-status');
    if (!token) { confirm.hidden=true; status.textContent='Abre esta página desde el enlace que recibiste en tu correo.'; }
    confirm.addEventListener('click',async()=>{
      confirm.disabled=true;
      try {
        const res=await fetch('/api/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const data=await res.json();if(!res.ok)throw Error();
        status.textContent=data.download?'Tu correo está confirmado. Ya puedes descargar la checklist.':'Tu suscripción está confirmada. Gracias por sumarte a las cartas de Maye.';confirm.hidden=true;
        if(data.download){const link=document.querySelector('#download-link');link.href=data.download;link.hidden=false;}
        document.querySelector('#confirmation-copy').textContent='Gracias por confirmar tu solicitud.';
      }catch{status.textContent='No pudimos confirmar el enlace. Puede haber caducado. Solicita uno nuevo desde el formulario de inicio.';confirm.disabled=false;}
    });
  }
  // Guided routing, not an AI or a live human chat. Questions leave the browser only through WhatsApp.
  const launcher=document.createElement('button');launcher.className='button button-primary chat-launcher';launcher.type='button';launcher.textContent='¿Por dónde empiezo?';launcher.setAttribute('aria-haspopup','dialog');
  const dialog=document.createElement('dialog');dialog.className='chat-dialog';dialog.setAttribute('aria-labelledby','chat-title');
  dialog.innerHTML='<div class="chat-top"><div><strong id="chat-title">Encuentra tu siguiente paso</strong><small>Asistente de orientación de Maye</small></div><button class="chat-close" aria-label="Cerrar asistente">×</button></div><div class="chat-body"></div>';
  document.body.append(launcher,dialog);launcher.addEventListener('click',()=>dialog.showModal());dialog.querySelector('.chat-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>launcher.focus());
  const body=dialog.querySelector('.chat-body');
  const routes=[['Ordenar mi empresa','Sistema de gestión de 4 pilares','sistema-4-pilares','Esta ruta permite revisar cómo se conectan las personas, los clientes, el dinero y las operaciones.'],['Organizar y formar al equipo','Gestión de personal + Clear Onboarding','gestion-personal','Esta consultoría conecta roles, documentación, incorporación y formación del equipo.'],['Aprender sobre RRHH','Oficina de RRHH de cero a experta','formacion-rrhh','La formación de 30 horas está en desarrollo. Maye puede explicarte el enfoque y la disponibilidad.'],['Empezar con un recurso breve','Minicurso de RRHH','minicurso-rrhh','El minicurso de 6 módulos está en preparación, con un precio previsto de $17 USD.']];
  function start(){body.innerHTML='<p>¿Qué te gustaría resolver primero?</p><div class="chat-options"></div><p class="chat-note">Este recorrido te orienta con información de los servicios. Maye revisa contigo el alcance y la inversión.</p>';const options=body.querySelector('.chat-options');routes.forEach(route=>{const b=document.createElement('button');b.textContent=route[0];b.type='button';b.onclick=()=>choose(route);options.append(b);});}
  function choose(route){body.innerHTML='<h3></h3><p class="chat-recommendation"></p><a class="text-link chat-service">Conocer esta ruta →</a><label for="chat-question">Déjale una pregunta puntual a Maye<textarea class="chat-question" id="chat-question" maxlength="1000" placeholder="Por ejemplo: tengo 8 personas y necesito ordenar su incorporación…"></textarea></label><div class="chat-actions"><a class="button button-primary chat-send" target="_blank" rel="noopener noreferrer">Llevar mi consulta a WhatsApp ↗</a><button class="filter-button chat-reset" type="button">Elegir otra necesidad</button></div><p class="chat-note">WhatsApp se abrirá con tu consulta preparada. Tú decides cuándo enviarla.</p>';body.querySelector('h3').textContent=route[1];body.querySelector('.chat-recommendation').textContent=route[3];body.querySelector('.chat-service').href=root+'servicios/'+route[2]+'.html';const q=body.querySelector('textarea');const update=()=>{body.querySelector('.chat-send').href=whatsapp('Hola Maye, me interesa '+route[1]+'. '+(q.value.trim()||'Quiero conversar sobre lo que necesita mi empresa.'));};q.addEventListener('input',update);update();body.querySelector('.chat-reset').onclick=start;q.focus();}
  start();
})();

// Decorative section transitions; the reading layout never moves.
(() => {
  const hosts = [...document.querySelectorAll('.hero-divider, .integration, .testimonials-section, .freebie-section, .newsletter-section')];
  if (!hosts.length || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const dividers = hosts.map(host => {
    const divider = document.createElement('div');
    divider.className = 'cut-divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.innerHTML = '<span class="cut-guide"></span><span class="cut-trace"></span><span class="cut-runner"><span class="cut-scissors"><svg viewBox="0 0 40 36"><g class="snip-upper"><circle cx="6" cy="9" r="4.3"/><path d="M9 12 16 18 34 27"/></g><g class="snip-lower"><circle cx="6" cy="27" r="4.3"/><path d="M9 24 16 18 34 9"/></g><circle cx="16" cy="18" r="1.9" fill="currentColor" stroke="none"/></svg></span></span>';
    host.prepend(divider);
    host.classList.add('has-cut-line');

    // Interactive paper cut on pointer hover
    host.addEventListener('pointerenter', () => {
      if (!active.has(divider)) start(divider);
    });

    return divider;
  });
  const visible = new Set();
  function stop(divider) {
    divider.classList.remove('is-cutting');
    const animations = active.get(divider) || [];
    active.delete(divider);
    animations.forEach(animation => animation.cancel());
  }
  function start(divider) {
    if (active.has(divider) || reduced.matches || document.hidden) return;
    divider.classList.add('is-cutting');
    // Each pass ends with a short rest before the dotted line returns.
    const timing = {duration:matchMedia('(max-width:700px)').matches ? 2450 : 3250, easing:'linear', iterations:Infinity};
    const guide = divider.querySelector('.cut-guide').animate([
      {clipPath:'inset(0 0 0 0)',offset:0},
      {clipPath:'inset(0 0 0 100%)',offset:.8},
      {clipPath:'inset(0 0 0 100%)',offset:1}
    ], timing);
    const trace = divider.querySelector('.cut-trace').animate([
      {clipPath:'inset(0 100% 0 0)',opacity:1,offset:0},
      {clipPath:'inset(0 0 0 0)',opacity:.55,offset:.8},
      {clipPath:'inset(0 0 0 0)',opacity:.55,offset:.92},
      {clipPath:'inset(0 0 0 0)',opacity:0,offset:1}
    ], timing);
    const scissors = divider.querySelector('.cut-runner').animate([
      {transform:'translateX(0%)',opacity:0,offset:0},
      {transform:'translateX(4%)',opacity:1,offset:.032},
      {transform:'translateX(94%)',opacity:1,offset:.752},
      {transform:'translateX(100%)',opacity:0,offset:.8},
      {transform:'translateX(100%)',opacity:0,offset:1}
    ], timing);
    active.set(divider,[guide,trace,scissors]);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target:divider, isIntersecting, intersectionRatio}) => {
      if (isIntersecting && intersectionRatio >= .6) {
        visible.add(divider);
        start(divider);
      } else {
        visible.delete(divider);
        stop(divider);
      }
    });
  }, {threshold:.6,rootMargin:'-90px 0px -35px 0px'});
  dividers.forEach(divider => observer.observe(divider));
  function syncMotion() {
    if (reduced.matches || document.hidden) [...active.keys()].forEach(stop);
    else visible.forEach(start);
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
})();
