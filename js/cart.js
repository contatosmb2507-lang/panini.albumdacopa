// ============================================================
// CARRINHO LOCAL - sem backend
// ============================================================
(function () {
  'use strict';

  // ---------- Storage ----------
  function getCart() {
    try { return JSON.parse(localStorage.getItem('local_cart') || '[]'); } catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem('local_cart', JSON.stringify(cart));
  }

  // ---------- Helpers ----------
  function fmt(val) {
    return 'R$ ' + parseFloat(val).toFixed(2).replace('.', ',');
  }

  function getProductData(btn) {
    var item = btn.closest('.product-item-info');
    if (!item) return null;

    var nameEl = item.querySelector('.product-item-link');
    var priceEl = item.querySelector('[data-price-amount]');
    var imgEl   = item.querySelector('img.product-image-photo');

    var name  = nameEl  ? nameEl.textContent.trim()          : 'Produto';
    var price = priceEl ? parseFloat(priceEl.dataset.priceAmount) : 0;
    var img   = imgEl   ? (imgEl.srcset || imgEl.src).split(' ')[0] : '';
    var id    = priceEl ? (priceEl.id || name)               : name;

    return { id: id, name: name, price: price, img: img, qty: 1 };
  }

  // ---------- Cart logic ----------
  function addItem(product) {
    var cart = getCart();
    var existing = cart.find(function(i){ return i.id === product.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push(product);
    }
    saveCart(cart);
    renderCart();
    openCart();
  }

  function removeItem(id) {
    var cart = getCart().filter(function(i){ return i.id !== id; });
    saveCart(cart);
    renderCart();
  }

  function changeQty(id, delta) {
    var cart = getCart();
    var item = cart.find(function(i){ return i.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(function(i){ return i.id !== id; });
    saveCart(cart);
    renderCart();
  }

  function getTotal() {
    return getCart().reduce(function(s, i){ return s + i.price * i.qty; }, 0);
  }

  function getCount() {
    return getCart().reduce(function(s, i){ return s + i.qty; }, 0);
  }

  // ---------- Render ----------
  function renderCart() {
    var cart  = getCart();
    var list  = document.getElementById('lc-items');
    var total = document.getElementById('lc-total');
    var badge = document.getElementById('lc-badge');
    if (!list) return;

    badge.textContent = getCount();
    badge.style.display = getCount() > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
      list.innerHTML = '<p class="lc-empty">Seu carrinho está vazio.</p>';
      total.textContent = '';
      return;
    }

    list.innerHTML = cart.map(function(item) {
      var sub = (item.price * item.qty).toFixed(2).replace('.', ',');
      return '<div class="lc-item" data-id="' + item.id + '">' +
        '<img src="' + item.img + '" alt="">' +
        '<div class="lc-info">' +
          '<span class="lc-name">' + item.name + '</span>' +
          '<span class="lc-price">' + fmt(item.price) + '</span>' +
          '<div class="lc-qty">' +
            '<button class="lc-qty-btn" data-action="dec" data-id="' + item.id + '">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="lc-qty-btn" data-action="inc" data-id="' + item.id + '">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="lc-right">' +
          '<span class="lc-sub">R$ ' + sub + '</span>' +
          '<button class="lc-remove" data-id="' + item.id + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
      '</div>';
    }).join('');

    total.innerHTML = '<strong>Total: R$ ' + getTotal().toFixed(2).replace('.', ',') + '</strong>';
  }

  // ---------- Open / Close ----------
  function openCart() {
    document.getElementById('lc-drawer').classList.add('open');
    document.getElementById('lc-overlay').classList.add('open');
  }
  function closeCart() {
    document.getElementById('lc-drawer').classList.remove('open');
    document.getElementById('lc-overlay').classList.remove('open');
  }

  // ---------- Inject HTML ----------
  function injectDrawer() {
    var html = '' +
      '<div id="lc-overlay"></div>' +
      '<div id="lc-drawer">' +
        '<div class="lc-header">' +
          '<span>Meu Carrinho</span>' +
          '<button id="lc-close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
        '<div id="lc-items"></div>' +
        '<div id="lc-total"></div>' +
        '<div class="lc-footer">' +
          '<a id="lc-checkout-btn" href="checkout.html">Finalizar Compra</a>' +
        '</div>' +
      '</div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  function injectCartIcon() {
    // Tenta colocar o ícone do carrinho no header existente
    var target = document.querySelector('.minicart-wrapper') ||
                 document.querySelector('.panel.header') ||
                 document.querySelector('.page-header');
    if (!target) return;

    var btn = document.createElement('button');
    btn.id = 'lc-cart-icon';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> <span id="lc-badge" style="display:none">0</span>';
    btn.title = 'Ver carrinho';
    target.appendChild(btn);
    btn.addEventListener('click', openCart);
  }

  // ---------- Intercept buttons ----------
  function interceptButtons() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.action.tocart');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      var product = getProductData(btn);
      if (!product) return;

      // Feedback visual
      btn.classList.add('lc-added');
      setTimeout(function(){ btn.classList.remove('lc-added'); }, 800);

      addItem(product);
    }, true);

    // Intercept form submit (produtos com form)
    document.addEventListener('submit', function(e) {
      var form = e.target.closest('[data-role="tocart-form"]');
      if (!form) return;
      e.preventDefault();
      e.stopPropagation();

      var btn = form.querySelector('.action.tocart');
      var product = getProductData(btn || form);
      if (!product) return;

      if (btn) { btn.classList.add('lc-added'); setTimeout(function(){ btn.classList.remove('lc-added'); }, 800); }
      addItem(product);
    }, true);
  }

  // ---------- Events ----------
  function bindEvents() {
    document.getElementById('lc-close').addEventListener('click', closeCart);
    document.getElementById('lc-overlay').addEventListener('click', closeCart);

    document.getElementById('lc-items').addEventListener('click', function(e) {
      var id = e.target.dataset.id;
      if (!id) return;
      if (e.target.classList.contains('lc-remove')) removeItem(id);
      if (e.target.classList.contains('lc-qty-btn')) {
        changeQty(id, e.target.dataset.action === 'inc' ? 1 : -1);
      }
    });

    // Remove disabled dos botões de form
    document.querySelectorAll('.action.tocart[disabled]').forEach(function(b){
      b.removeAttribute('disabled');
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function() {
    injectDrawer();
    injectCartIcon();
    bindEvents();
    interceptButtons();
    renderCart();
  });

})();
