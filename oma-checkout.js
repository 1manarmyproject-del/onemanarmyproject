/**
 * OMA Checkout — Componente nativo reutilizável
 * Uso: omaCheckout.open({ product, value, description, email, onSuccess })
 * Não depende de nenhum framework. Injeta CSS+HTML automaticamente.
 */
(function(global) {
  'use strict';

  var API = 'https://api.onemanarmyproject.com.br';
  var _injected = false;
  var _pollInterval = null;
  var _cfg = {};

  // ── CSS ──────────────────────────────────────────────────────────
  var CSS = `
.oma-co-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9500;display:none;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px);}
.oma-co-overlay.open{display:flex;}
.oma-co-box{background:#0f0f0f;border:1px solid #2a2a2a;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;position:relative;animation:oma-co-in .2s ease;}
@keyframes oma-co-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.oma-co-hdr{background:#1c1c1e;border-bottom:1px solid #2a2a2a;padding:18px 22px;display:flex;align-items:flex-start;justify-content:space-between;}
.oma-co-hdr-info{flex:1;}
.oma-co-badge{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:#e8703a;margin-bottom:4px;}
.oma-co-title{font-family:'Black Ops One',cursive;font-size:20px;color:#e0d9cf;letter-spacing:1px;}
.oma-co-price{font-family:'Space Mono',monospace;font-size:11px;color:#888;margin-top:3px;}
.oma-co-x{background:none;border:none;color:#555;font-size:22px;cursor:pointer;padding:2px 6px;line-height:1;margin-left:12px;}
.oma-co-x:hover{color:#e0d9cf;}
.oma-co-body{padding:22px;}
/* Steps */
.oma-co-step{display:none;}
.oma-co-step.active{display:block;}
/* Labels e inputs */
.oma-co-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:#666;display:block;margin-bottom:5px;}
.oma-co-input{width:100%;background:#1a1a1a;border:1px solid #2a2a2a;color:#e0d9cf;padding:11px 13px;font-size:14px;font-family:'Barlow',sans-serif;outline:none;margin-bottom:14px;transition:border-color .15s;}
.oma-co-input:focus{border-color:#e8703a;}
.oma-co-input::placeholder{color:#3a3a3a;}
.oma-co-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
/* Tabs PIX / Cartão */
.oma-co-tabs{display:flex;margin-bottom:20px;border:1px solid #2a2a2a;}
.oma-co-tab{flex:1;padding:11px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;cursor:pointer;border:none;background:#1a1a1a;color:#555;transition:all .15s;}
.oma-co-tab.active{background:#e8703a;color:#000;font-weight:700;}
.oma-co-tab:not(.active):hover{background:#242424;color:#888;}
/* Botão principal */
.oma-co-btn{width:100%;background:#e8703a;border:none;color:#000;padding:15px;font-family:'Black Ops One',cursive;font-size:13px;letter-spacing:2px;cursor:pointer;margin-top:6px;transition:background .15s;}
.oma-co-btn:hover:not(:disabled){background:#c05020;}
.oma-co-btn:disabled{opacity:.45;cursor:not-allowed;}
/* Erro */
.oma-co-err{font-family:'Space Mono',monospace;font-size:10px;color:#e24b4a;margin-top:10px;padding:10px 12px;background:rgba(226,75,74,.08);border:1px solid rgba(226,75,74,.2);display:none;line-height:1.5;}
/* PIX */
.oma-co-qr-wrap{background:#1a1a1a;border:1px solid #2a2a2a;padding:20px;text-align:center;margin:14px 0;}
.oma-co-qr-wrap img{width:180px;height:180px;image-rendering:pixelated;}
.oma-co-pix-copy{background:#161616;border:1px solid #2a2a2a;padding:9px 12px;font-family:'Space Mono',monospace;font-size:9px;color:#666;word-break:break-all;margin-bottom:10px;cursor:pointer;line-height:1.5;transition:border-color .15s;}
.oma-co-pix-copy:hover{border-color:#e8703a;color:#aaa;}
.oma-co-copy-btn{width:100%;background:#1c1c1e;border:1px solid #2a2a2a;color:#888;padding:10px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;cursor:pointer;transition:all .15s;}
.oma-co-copy-btn:hover{border-color:#e8703a;color:#e8703a;}
.oma-co-waiting{font-family:'Space Mono',monospace;font-size:10px;color:#555;text-align:center;margin-top:12px;letter-spacing:1px;}
.oma-co-waiting b{color:#e8703a;animation:oma-blink 1.2s infinite;}
@keyframes oma-blink{0%,100%{opacity:.2}50%{opacity:1}}
/* Sucesso */
.oma-co-success-icon{font-size:44px;text-align:center;margin-bottom:14px;}
.oma-co-success-title{font-family:'Black Ops One',cursive;font-size:22px;color:#e0d9cf;text-align:center;letter-spacing:1px;margin-bottom:8px;}
.oma-co-success-sub{font-size:13px;color:#888;text-align:center;line-height:1.7;margin-bottom:22px;}
/* Segurança */
.oma-co-sec{border-top:1px solid #1a1a1a;padding-top:12px;margin-top:14px;font-family:'Space Mono',monospace;font-size:9px;color:#3a3a3a;letter-spacing:1px;text-align:center;}
@media(max-width:480px){.oma-co-box{max-height:100vh;}.oma-co-row{grid-template-columns:1fr;}}
`;

  // ── HTML ─────────────────────────────────────────────────────────
  var HTML = `
<div class="oma-co-overlay" id="oma-co-overlay">
  <div class="oma-co-box">
    <div class="oma-co-hdr">
      <div class="oma-co-hdr-info">
        <div class="oma-co-badge" id="oma-co-badge">CHECKOUT</div>
        <div class="oma-co-title" id="oma-co-title">OMA</div>
        <div class="oma-co-price" id="oma-co-price"></div>
      </div>
      <button class="oma-co-x" onclick="omaCheckout.close()">&#x2715;</button>
    </div>
    <div class="oma-co-body">

      <!-- Step 1: Dados -->
      <div class="oma-co-step active" id="oma-co-s1">
        <label class="oma-co-label">NOME COMPLETO</label>
        <input class="oma-co-input" id="oma-co-name" type="text" placeholder="Seu nome completo" />
        <label class="oma-co-label">EMAIL</label>
        <input class="oma-co-input" id="oma-co-email" type="email" placeholder="seu@email.com" />
        <label class="oma-co-label">WHATSAPP (com DDD)</label>
        <input class="oma-co-input" id="oma-co-phone" type="tel" placeholder="(11) 99999-9999" />
        <label class="oma-co-label">CPF</label>
        <input class="oma-co-input" id="oma-co-cpf" type="text" placeholder="000.000.000-00" maxlength="14" oninput="omaCheckout._fmtCpf(this)" />
        <button class="oma-co-btn" onclick="omaCheckout._step2()">CONTINUAR &#x2192;</button>
        <div class="oma-co-err" id="oma-co-err1"></div>
      </div>

      <!-- Step 2: Pagamento -->
      <div class="oma-co-step" id="oma-co-s2">
        <div class="oma-co-tabs">
          <button class="oma-co-tab active" id="oma-co-tab-pix" onclick="omaCheckout._tab('pix')">&#128386; PIX</button>
          <button class="oma-co-tab" id="oma-co-tab-card" onclick="omaCheckout._tab('card')">&#128179; CARTÃO</button>
        </div>

        <!-- PIX form -->
        <div id="oma-co-pix-form">
          <p style="font-family:'Space Mono',monospace;font-size:10px;color:#666;line-height:1.6;margin-bottom:18px;letter-spacing:.5px;">Gere o QR Code e pague pelo app do seu banco. Confirmação em segundos.</p>
          <button class="oma-co-btn" id="oma-co-btn-pix" onclick="omaCheckout._gerarPix()">GERAR QR CODE PIX &#x2192;</button>
        </div>

        <!-- PIX QR -->
        <div id="oma-co-pix-qr" style="display:none;">
          <div class="oma-co-qr-wrap"><img id="oma-co-qr-img" src="" alt="QR PIX" /></div>
          <p class="oma-co-label" style="text-align:center;margin-bottom:6px;">OU COPIE O CÓDIGO</p>
          <div class="oma-co-pix-copy" id="oma-co-pix-payload" onclick="omaCheckout._copiar()"></div>
          <button class="oma-co-copy-btn" onclick="omaCheckout._copiar()">&#128203; COPIAR CÓDIGO PIX</button>
          <div class="oma-co-waiting">AGUARDANDO PAGAMENTO <b>...</b></div>
        </div>

        <!-- Cartão -->
        <div id="oma-co-card-form" style="display:none;">
          <label class="oma-co-label">NÚMERO DO CARTÃO</label>
          <input class="oma-co-input" id="oma-co-cardnum" type="text" placeholder="0000 0000 0000 0000" maxlength="19" oninput="omaCheckout._fmtCard(this)" />
          <label class="oma-co-label">NOME NO CARTÃO</label>
          <input class="oma-co-input" id="oma-co-cardname" type="text" placeholder="NOME COMO IMPRESSO" style="text-transform:uppercase;" />
          <div class="oma-co-row">
            <div>
              <label class="oma-co-label">VALIDADE</label>
              <input class="oma-co-input" id="oma-co-cardexp" type="text" placeholder="MM/AA" maxlength="5" oninput="omaCheckout._fmtExp(this)" />
            </div>
            <div>
              <label class="oma-co-label">CVV</label>
              <input class="oma-co-input" id="oma-co-cardcvv" type="text" placeholder="123" maxlength="4" />
            </div>
          </div>
          <label class="oma-co-label">CEP</label>
          <input class="oma-co-input" id="oma-co-cep" type="text" placeholder="00000-000" maxlength="9" oninput="omaCheckout._fmtCep(this)" />
          <button class="oma-co-btn" id="oma-co-btn-card" onclick="omaCheckout._pagarCard()">PAGAR COM CARTÃO &#x2192;</button>
        </div>

        <div class="oma-co-err" id="oma-co-err2"></div>
        <div class="oma-co-sec" style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;padding:12px 16px;border-top:1px solid #1e1e1e;">
          <span style="display:flex;align-items:center;gap:5px;font-size:9px;letter-spacing:.1em;color:#555;text-transform:uppercase;">&#128274; SSL Seguro</span>
          <span style="font-size:9px;font-weight:700;letter-spacing:.08em;color:rgba(200,88,32,.6);border:1px solid rgba(200,88,32,.3);padding:2px 5px;">PCI DSS</span>
          <span style="font-size:9px;letter-spacing:.08em;color:#444;text-transform:uppercase;">Cobrança por <a href="https://www.asaas.com" target="_blank" rel="noopener" style="color:rgba(200,88,32,.6);text-decoration:none;font-weight:700;">ASAAS</a></span>
          <span style="font-size:9px;letter-spacing:.08em;color:#444;text-transform:uppercase;">Dados não armazenados pelo OMA</span>
        </div>
      </div>

      <!-- Step 3: Sucesso -->
      <div class="oma-co-step" id="oma-co-s3">
        <div class="oma-co-success-icon">&#9989;</div>
        <div class="oma-co-success-title">PAGAMENTO CONFIRMADO!</div>
        <div class="oma-co-success-sub" id="oma-co-success-msg">Seu pedido foi processado com sucesso.</div>
        <button class="oma-co-btn" id="oma-co-success-btn" onclick="omaCheckout._onSuccessBtn()">CONTINUAR &#x2192;</button>
      </div>

    </div>
  </div>
</div>`;

  // ── API pública ───────────────────────────────────────────────────
  global.omaCheckout = {

    open: function(cfg) {
      _cfg = cfg || {};
      _inject();
      // Preenche header
      document.getElementById('oma-co-badge').textContent = (_cfg.badge || 'CHECKOUT').toUpperCase();
      document.getElementById('oma-co-title').textContent = _cfg.title || _cfg.product || 'OMA';
      document.getElementById('oma-co-price').textContent = _cfg.priceLabel || '';
      // Preenche email se já vier
      if (_cfg.email) document.getElementById('oma-co-email').value = _cfg.email;
      if (_cfg.name)  document.getElementById('oma-co-name').value  = _cfg.name;
      // Reset
      _showStep('s1');
      _clearErr();
      document.getElementById('oma-co-pix-form').style.display = 'block';
      document.getElementById('oma-co-pix-qr').style.display = 'none';
      document.getElementById('oma-co-card-form').style.display = 'none';
      document.getElementById('oma-co-tab-pix').classList.add('active');
      document.getElementById('oma-co-tab-card').classList.remove('active');
      document.getElementById('oma-co-btn-pix').disabled = false;
      document.getElementById('oma-co-btn-pix').textContent = 'GERAR QR CODE PIX →';
      if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null; }
      document.getElementById('oma-co-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    close: function() {
      var el = document.getElementById('oma-co-overlay');
      if (el) el.classList.remove('open');
      document.body.style.overflow = '';
      if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null; }
    },

    // Privados
    _step2: function() {
      var name  = document.getElementById('oma-co-name').value.trim();
      var email = document.getElementById('oma-co-email').value.trim();
      var phone = document.getElementById('oma-co-phone').value.trim();
      var cpf   = document.getElementById('oma-co-cpf').value.trim();
      var err   = document.getElementById('oma-co-err1');
      if (!name)  { _showErr('oma-co-err1','Informe seu nome.'); return; }
      if (!email || email.indexOf('@') < 0) { _showErr('oma-co-err1','Email inválido.'); return; }
      if (cpf.replace(/\D/g,'').length < 11) { _showErr('oma-co-err1','CPF inválido.'); return; }
      // Preenche nome no cartão
      document.getElementById('oma-co-cardname').value = name.toUpperCase();
      _showStep('s2');
    },

    _tab: function(tab) {
      document.getElementById('oma-co-tab-pix').classList.toggle('active', tab==='pix');
      document.getElementById('oma-co-tab-card').classList.toggle('active', tab==='card');
      document.getElementById('oma-co-pix-form').style.display = tab==='pix' ? 'block' : 'none';
      document.getElementById('oma-co-pix-qr').style.display = 'none';
      document.getElementById('oma-co-card-form').style.display = tab==='card' ? 'block' : 'none';
      _clearErr();
    },

    _gerarPix: async function() {
      var btn = document.getElementById('oma-co-btn-pix');
      btn.disabled = true; btn.textContent = 'GERANDO...';
      _clearErr();
      try {
        var r = await fetch(API+'/checkout/onetime/pix', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            email: document.getElementById('oma-co-email').value.trim(),
            name:  document.getElementById('oma-co-name').value.trim(),
            phone: document.getElementById('oma-co-phone').value.replace(/\D/g,''),
            cpf:   document.getElementById('oma-co-cpf').value.trim(),
            product: _cfg.product, value: _cfg.value,
            description: _cfg.description || _cfg.title
          })
        });
        var d = await r.json();
        if (d.error) { _showErr('oma-co-err2', d.error); btn.disabled=false; btn.textContent='TENTAR NOVAMENTE →'; return; }
        document.getElementById('oma-co-qr-img').src = 'data:image/png;base64,'+d.qr_code_image;
        document.getElementById('oma-co-pix-payload').textContent = d.qr_code_text;
        document.getElementById('oma-co-pix-form').style.display = 'none';
        document.getElementById('oma-co-pix-qr').style.display = 'block';
        // Polling
        var payId = d.payment_id;
        _pollInterval = setInterval(async function() {
          try {
            var rs = await fetch(API+'/checkout/onetime/status/'+payId);
            var ds = await rs.json();
            if (ds.confirmed) {
              clearInterval(_pollInterval); _pollInterval = null;
              omaCheckout._sucesso();
            }
          } catch(e) {}
        }, 3000);
      } catch(e) { _showErr('oma-co-err2','Erro de conexão.'); btn.disabled=false; btn.textContent='GERAR QR CODE PIX →'; }
    },

    _pagarCard: async function() {
      var btn = document.getElementById('oma-co-btn-card');
      btn.disabled = true; btn.textContent = 'PROCESSANDO...';
      _clearErr();
      try {
        var r = await fetch(API+'/checkout/onetime/card', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            email:      document.getElementById('oma-co-email').value.trim(),
            name:       document.getElementById('oma-co-name').value.trim(),
            phone:      document.getElementById('oma-co-phone').value.replace(/\D/g,''),
            cpf:        document.getElementById('oma-co-cpf').value.trim(),
            postalCode: document.getElementById('oma-co-cep').value.replace(/\D/g,''),
            product: _cfg.product, value: _cfg.value,
            description: _cfg.description || _cfg.title,
            cardNumber: document.getElementById('oma-co-cardnum').value.replace(/\s/g,''),
            cardName:   document.getElementById('oma-co-cardname').value.trim(),
            cardExpiry: document.getElementById('oma-co-cardexp').value.trim(),
            cardCvv:    document.getElementById('oma-co-cardcvv').value.trim()
          })
        });
        var d = await r.json();
        if (d.error) { _showErr('oma-co-err2', d.error); btn.disabled=false; btn.textContent='PAGAR COM CARTÃO →'; return; }
        omaCheckout._sucesso();
      } catch(e) { _showErr('oma-co-err2','Erro de conexão.'); btn.disabled=false; btn.textContent='PAGAR COM CARTÃO →'; }
    },

    _sucesso: function() {
      document.getElementById('oma-co-success-msg').innerHTML = _cfg.successMsg || 'Pagamento confirmado! Em instantes você receberá a confirmação no email.';
      document.getElementById('oma-co-success-btn').textContent = _cfg.successBtnLabel || 'FECHAR';
      _showStep('s3');
      if (typeof _cfg.onSuccess === 'function') _cfg.onSuccess();
    },

    _onSuccessBtn: function() {
      if (typeof _cfg.onSuccessBtn === 'function') _cfg.onSuccessBtn();
      else omaCheckout.close();
    },

    _copiar: function() {
      var txt = document.getElementById('oma-co-pix-payload').textContent;
      navigator.clipboard.writeText(txt).then(function() {
        var b = document.querySelector('.oma-co-copy-btn');
        if (b) { b.textContent = '✓ COPIADO!'; b.style.color='#2d8a50'; setTimeout(function(){b.textContent='⊕ COPIAR CÓDIGO PIX';b.style.color='';},2000); }
      });
    },

    _fmtCard: function(el) { var v=el.value.replace(/\D/g,'').slice(0,16); el.value=v.replace(/(\d{4})/g,'$1 ').trim(); },
    _fmtExp:  function(el) { var v=el.value.replace(/\D/g,'').slice(0,4); if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2); el.value=v; },
    _fmtCep:  function(el) { var v=el.value.replace(/\D/g,'').slice(0,8); if(v.length>5)v=v.slice(0,5)+'-'+v.slice(5); el.value=v; },
    _fmtCpf:  function(el) { var v=el.value.replace(/\D/g,'').slice(0,11); if(v.length>9)v=v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9); else if(v.length>6)v=v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6); else if(v.length>3)v=v.slice(0,3)+'.'+v.slice(3); el.value=v; }
  };

  // ── helpers ───────────────────────────────────────────────────────
  function _inject() {
    if (_injected) return;
    _injected = true;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var div = document.createElement('div');
    div.innerHTML = HTML;
    document.body.appendChild(div.firstElementChild);
    // Fecha ao clicar fora
    document.getElementById('oma-co-overlay').addEventListener('click', function(e) {
      if (e.target.id === 'oma-co-overlay') omaCheckout.close();
    });
  }

  function _showStep(id) {
    ['s1','s2','s3'].forEach(function(s) {
      var el = document.getElementById('oma-co-'+s);
      if (el) el.classList.toggle('active', s===id);
    });
  }

  function _showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function _clearErr() {
    ['oma-co-err1','oma-co-err2'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

})(window);
