a(function(){
  var API = "https://vetorlaser-gate.transformaebooks.workers.dev";
  var dl = document.getElementById('download');
  if(!dl) return;

  var box = document.createElement('div');
  box.id = 'vlGate';
  box.style.cssText = 'display:none;margin:14px auto 0;max-width:460px;padding:18px;border:1px solid #ffd9cf;border-radius:12px;background:#fff7f4;text-align:left';
  box.innerHTML =
    '<div id="vlStep1">'
    + '<p style="margin:0 0 8px;font-weight:700;color:#1a1a1a">📥 Falta 1 passo pra baixar grátis</p>'
    + '<p style="margin:0 0 10px;font-size:13px;color:#555">Deixa teu e-mail que a gente te manda um código de 6 dígitos pra liberar o download. São 2 downloads grátis por mês.</p>'
    + '<input id="vlEmail" type="email" autocomplete="email" placeholder="seu@email.com" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;font-size:15px">'
    + '<label style="display:flex;gap:8px;align-items:flex-start;margin:10px 0;font-size:12px;color:#444;cursor:pointer"><input id="vlConsent" type="checkbox" style="margin-top:3px;flex:0 0 auto"><span>Aceito receber e-mails do VetorLaser e li a <a href="privacidade.html" target="_blank" rel="noopener" style="color:#ff5b39">Política de Privacidade</a>.</span></label>'
    + '<button id="vlSendBtn" type="button" style="width:100%;padding:12px;border:0;border-radius:8px;background:#ff5b39;color:#fff;font-weight:700;font-size:15px;cursor:pointer">Enviar código</button>'
    + '</div>'
    + '<div id="vlStep2" style="display:none">'
    + '<p style="margin:0 0 8px;font-weight:700;color:#1a1a1a">Digite o código</p>'
    + '<p style="margin:0 0 10px;font-size:13px;color:#555">Enviamos um código de 6 dígitos pro seu e-mail. Confira a caixa de entrada (e o spam).</p>'
    + '<input id="vlCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #ddd;border-radius:8px;font-size:20px;letter-spacing:6px;text-align:center">'
    + '<button id="vlVerifyBtn" type="button" style="width:100%;margin-top:10px;padding:12px;border:0;border-radius:8px;background:#ff5b39;color:#fff;font-weight:700;font-size:15px;cursor:pointer">Confirmar e baixar</button>'
    + '</div>'
    + '<div id="vlStepPro" style="display:none;text-align:center">'
    + '<p style="margin:0 0 8px;font-weight:700;color:#1a1a1a">Você usou seus 2 downloads grátis do mês 🎉</p>'
    + '<p style="margin:0 0 12px;font-size:13px;color:#555">Pra baixar ilimitado e sem trava, vira Pro — pagamento único de R$27.</p>'
    + '<a href="https://pay.hotmart.com/R106600139E" target="_blank" rel="noopener" onclick="if(window.fbq)fbq(\'track\',\'InitiateCheckout\',{value:27,currency:\'BRL\'})" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#ff5b39;color:#fff;font-weight:700;font-size:15px;text-decoration:none">Quero o Pro por R$27</a>'
    + '</div>'
    + '<p id="vlMsg" style="display:none;margin:10px 0 0;font-size:13px"></p>';
  var anchor = document.getElementById('status') || dl;
  anchor.insertAdjacentElement('afterend', box);

  function $(id){ return document.getElementById(id); }
  function show(el){ if(el) el.style.display=''; }
  function hide(el){ if(el) el.style.display='none'; }
  function setMsg(t, color){ var m=$('vlMsg'); if(!m) return; m.textContent=t||''; m.style.color=color||'#c0392b'; m.style.display=t?'block':'none'; }
  function openGate(){ box.style.display='block'; show($('vlStep1')); hide($('vlStep2')); hide($('vlStepPro')); setMsg(''); try{box.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){} var e=$('vlEmail'); if(e) e.focus(); }
  function doDownload(){ window.__vlAllowNext=true; dl.click(); }
  function showPro(){ box.style.display='block'; hide($('vlStep1')); hide($('vlStep2')); show($('vlStepPro')); setMsg(''); }

  var busy=false;
  function post(action, payload){
    return fetch(API, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(Object.assign({action:action}, payload||{}))}).then(function(r){ return r.json().then(function(j){ return {status:r.status, body:j}; }); });
  }

  window.__vlGate = function(){
    var token=null; try{ token = localStorage.getItem('vl_token'); }catch(e){}
    if(token){
      if(busy) return; busy=true;
      box.style.display='block'; hide($('vlStep1')); hide($('vlStep2')); hide($('vlStepPro')); setMsg('Liberando seu download...', '#555');
      post('consume', {token: token}).then(function(res){
        busy=false;
        if(res.body && res.body.ok){ setMsg(''); box.style.display='none'; doDownload(); }
        else if(res.body && res.body.reason==='limit'){ showPro(); }
        else { try{ localStorage.removeItem('vl_token'); }catch(e){} openGate(); }
      }).catch(function(){ busy=false; openGate(); setMsg('Deu um erro de conexão. Tenta de novo.'); });
    } else { openGate(); }
  };

  box.addEventListener('click', function(ev){
    var id = ev.target && ev.target.id;
    if(id==='vlSendBtn'){
      if(busy) return;
      var em = (($('vlEmail')||{}).value||'').trim();
      var ok = ($('vlConsent')||{}).checked;
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ setMsg('Digite um e-mail válido.'); return; }
      if(!ok){ setMsg('Marque o aceite pra continuar.'); return; }
      setMsg('Enviando código...', '#555'); busy=true; $('vlSendBtn').disabled=true;
      window.__vlEmail = em;
      post('request_code', {email: em}).then(function(res){
        busy=false; $('vlSendBtn').disabled=false;
        if(res.body && res.body.ok){ hide($('vlStep1')); show($('vlStep2')); setMsg(''); var c=$('vlCode'); if(c) c.focus(); }
        else { setMsg('Não consegui enviar o código. Confere o e-mail e tenta de novo.'); }
      }).catch(function(){ busy=false; $('vlSendBtn').disabled=false; setMsg('Erro de conexão. Tenta de novo.'); });
    }
    if(id==='vlVerifyBtn'){
      if(busy) return;
      var code = (($('vlCode')||{}).value||'').trim();
      if(!/^\d{6}$/.test(code)){ setMsg('O código tem 6 dígitos.'); return; }
      setMsg('Conferindo...', '#555'); busy=true; $('vlVerifyBtn').disabled=true;
      post('verify', {email: window.__vlEmail, code: code}).then(function(res){
        busy=false; $('vlVerifyBtn').disabled=false;
        if(res.body && res.body.ok){
          if(res.body.token){ try{ localStorage.setItem('vl_token', res.body.token); }catch(e){} }
          setMsg(''); box.style.display='none';
          if(window.fbq) fbq('trackCustom','LeadVerificado');
          doDownload();
        } else if(res.body && res.body.reason==='limit'){
          if(res.body.token){ try{ localStorage.setItem('vl_token', res.body.token); }catch(e){} }
          showPro();
        } else { setMsg('Código errado ou expirado. Confere no e-mail.'); }
      }).catch(function(){ busy=false; $('vlVerifyBtn').disabled=false; setMsg('Erro de conexão. Tenta de novo.'); });
    }
  });
})();
