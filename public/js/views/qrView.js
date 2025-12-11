// public/js/views/qrView.js
/**
 * Controlador de la vista 'qr'
 *
 * Responsabilidad:
 * - Permitir escaneo de QR con cámara usando html5-qrcode
 * - Permitir al usuario ingresar un código manualmente y consultar la API
 * - Mostrar estados de carga, error y resultado (ficha del producto)
 */

let html5QrCode = null;

function setStatus(el, message, type = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function getCodeFromHash() {
  const hash = window.location.hash || '';
  const match = hash.match(/code=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function calculatePrice(product) {
  const basePrice = parseFloat(product.base_price);
  
  if (!product.promotion) {
    return { finalPrice: basePrice, hasPromo: false };
  }

  const promoType = product.promotion.type;
  const promoValue = parseFloat(product.promotion.value);
  
  switch (promoType) {
    case 'porcentaje':
      return {
        finalPrice: basePrice * (1 - promoValue / 100),
        hasPromo: true,
        discount: promoValue,
        type: 'porcentaje'
      };
    case 'precio_fijo':
      return {
        finalPrice: promoValue,
        hasPromo: true,
        savings: basePrice - promoValue,
        type: 'precio_fijo'
      };
    case '2x1':
      return {
        finalPrice: basePrice / 2,
        hasPromo: true,
        unitPrice: basePrice,
        type: '2x1'
      };
    case '3x2':
      return {
        finalPrice: (basePrice * 2) / 3,
        hasPromo: true,
        totalFor3: basePrice * 2,
        type: '3x2'
      };
    case 'nxm':
      return {
        finalPrice: basePrice,
        hasPromo: true,
        customText: product.promotion.text,
        type: 'nxm'
      };
    default:
      return { finalPrice: basePrice, hasPromo: false };
  }
}

function renderPromotion(product, priceData) {
  if (!priceData.hasPromo) return '';
  
  const basePrice = parseFloat(product.base_price);
  const validUntil = product.promotion.end_at 
    ? new Date(product.promotion.end_at).toLocaleDateString('es-AR') 
    : 'Sin vencimiento';
  
  let promoText = '';
  
  switch (priceData.type) {
    case '2x1':
      promoText = `🎁 <strong>Combo 2x1:</strong> Llevás 2 unidades y pagás solo 1. Precio efectivo por unidad: $${priceData.finalPrice.toFixed(2)}`;
      break;
    case '3x2':
      promoText = `🎁 <strong>Combo 3x2:</strong> Llevás 3 unidades y pagás solo 2. Total por 3: $${priceData.totalFor3.toFixed(2)}`;
      break;
    case 'nxm':
      promoText = `🎁 <strong>Combo especial:</strong> ${priceData.customText || 'Consultá condiciones en caja'}`;
      break;
    default:
      return '';
  }
  
  return `
    <div class="meli-promo-box">
      <svg class="meli-promo-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
      <div class="meli-promo-content">
        <p class="meli-promo-text">${promoText}</p>
        <p class="meli-promo-validity">Válido hasta: ${validUntil}</p>
      </div>
    </div>
  `;
}

function renderProduct(resultEl, product) {
  if (!resultEl) return;
  
  const modal = document.getElementById('product-modal');
  const modalCard = document.getElementById('modal-product-card');
  
  if (!modal || !modalCard) return;

  const priceData = calculatePrice(product);
  const imageUrl = product.image_url || '';
  
  const detailsHTML = `
    ${product.origin ? `<p class="detail-item">📍 ${product.origin}</p>` : ''}
    ${product.vintage_year ? `<p class="detail-item">🍷 Cosecha ${product.vintage_year}</p>` : ''}
  `;
  
  modalCard.innerHTML = `
    <div class="meli-container">
      <div class="meli-image-section">
        <div class="meli-image-wrapper">
          ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="meli-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
          <div class="meli-image-placeholder" style="${imageUrl ? 'display: none;' : 'display: flex;'}">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Producto</span>
          </div>
        </div>
        
        <div class="meli-specs-box">
          <h3 class="meli-specs-title">Características</h3>
          <div class="meli-specs-list">
            <div class="meli-spec-item">
              <span class="meli-spec-label">Marca</span>
              <span class="meli-spec-value">${product.winery_distillery}</span>
            </div>
            ${product.origin ? `
              <div class="meli-spec-item">
                <span class="meli-spec-label">Origen</span>
                <span class="meli-spec-value">${product.origin}</span>
              </div>
            ` : ''}
            ${product.vintage_year ? `
              <div class="meli-spec-item">
                <span class="meli-spec-label">Cosecha</span>
                <span class="meli-spec-value">${product.vintage_year}</span>
              </div>
            ` : ''}
            <div class="meli-spec-item">
              <span class="meli-spec-label">Código</span>
              <span class="meli-spec-value">${product.public_code}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="meli-details-section">
        <div class="meli-header">
          <p class="meli-condition">${product.drink_type}${product.varietal ? ' | ' + product.varietal : ''}</p>
          <h1 class="meli-title">${product.name}</h1>
        </div>
        
        ${(() => {
          const basePrice = parseFloat(product.base_price);
          
          if (priceData.hasPromo) {
            let discountBadge = '';
            let savingsText = '';
            
            if (priceData.type === 'porcentaje') {
              discountBadge = `<span class="meli-discount-badge">${priceData.discount}% OFF</span>`;
              savingsText = `<p class="meli-savings">Ahorrás $${(basePrice - priceData.finalPrice).toFixed(2)}</p>`;
            } else if (priceData.type === 'precio_fijo') {
              discountBadge = `<span class="meli-discount-badge">OFERTA</span>`;
              savingsText = `<p class="meli-savings">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
            } else if (priceData.type === '2x1') {
              discountBadge = `<span class="meli-discount-badge">2x1</span>`;
              savingsText = `<p class="meli-savings">Precio efectivo: $${priceData.finalPrice.toFixed(2)} c/u</p>`;
            } else if (priceData.type === '3x2') {
              discountBadge = `<span class="meli-discount-badge">3x2</span>`;
              savingsText = `<p class="meli-savings">Pagás solo 2 unidades</p>`;
            }
            
            return `
              <div class="meli-price-section">
                ${(priceData.type === 'porcentaje' || priceData.type === 'precio_fijo') ? `
                  <p class="meli-price-original">$${basePrice.toFixed(2)}</p>
                ` : ''}
                <div class="meli-price-row">
                  <div class="meli-price-main">
                    <span class="meli-price-symbol">$</span>
                    <span class="meli-price-int">${Math.floor(priceData.finalPrice)}</span>
                    <span class="meli-price-dec">${(priceData.finalPrice % 1).toFixed(2).slice(1)}</span>
                  </div>
                  ${discountBadge}
                </div>
                ${savingsText}
              </div>
              ${renderPromotion(product, priceData)}
            `;
          } else {
            return `
              <div class="meli-price-section">
                <div class="meli-price-main">
                  <span class="meli-price-symbol">$</span>
                  <span class="meli-price-int">${Math.floor(priceData.finalPrice)}</span>
                  <span class="meli-price-dec">${(priceData.finalPrice % 1).toFixed(2).slice(1)}</span>
                </div>
              </div>
            `;
          }
        })()}
        
        ${product.short_description ? `
          <div class="meli-description">
            <h2 class="meli-section-title">Descripción</h2>
            <p class="meli-desc-text">${product.short_description}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  resultEl.innerHTML = '';
}

export function initQrView(container) {
  const form = container.querySelector('#qr-form');
  const codeInput = container.querySelector('#qr-code');
  const statusEl = container.querySelector('#qr-status');
  const resultEl = container.querySelector('#qr-result');
  const startScanBtn = container.querySelector('#start-scan-btn');
  const stopScanBtn = container.querySelector('#stop-scan-btn');
  const qrReaderEl = container.querySelector('#qr-reader');

  const submitLookup = async (code) => {
    if (!code) {
      setStatus(statusEl, 'Ingresá un código para consultar.', 'error');
      return;
    }

    setStatus(statusEl, 'Cargando producto...', 'info');
    if (resultEl) resultEl.innerHTML = '';

    try {
      const res = await fetch(`./api/public/productos/${encodeURIComponent(code)}`, {
        headers: { Accept: 'application/json' },
      });

      const json = await res.json().catch(() => null);

      if (res.status === 404) {
        setStatus(statusEl, 'Producto no disponible o código inválido.', 'error');
        return;
      }

      if (!res.ok || !json?.ok) {
        const msg = json?.error?.message || `Error HTTP ${res.status}`;
        setStatus(statusEl, `No se pudo obtener el producto: ${msg}`, 'error');
        return;
      }

      setStatus(statusEl, 'Producto encontrado.', 'success');
      renderProduct(resultEl, json.data);
    } catch (err) {
      setStatus(statusEl, `Error de red al consultar: ${err.message}`, 'error');
    }
  };

  // Manejar envío de formulario manual
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const code = codeInput?.value?.trim();
      submitLookup(code);
    });
  }

  // Inicializar escáner QR
  if (startScanBtn && stopScanBtn && qrReaderEl) {
    startScanBtn.addEventListener('click', async () => {
      try {
        if (!html5QrCode) {
          html5QrCode = new Html5Qrcode("qr-reader");
        }

        qrReaderEl.style.display = 'block';
        startScanBtn.style.display = 'none';
        stopScanBtn.style.display = 'inline-block';

        await html5QrCode.start(
          { facingMode: "environment" }, // Cámara trasera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QR detectado exitosamente
            console.log('QR detectado:', decodedText);
            
            // Extraer el código del QR (puede ser una URL completa o solo el código)
            let code = decodedText;
            const match = decodedText.match(/code=([^&]+)/);
            if (match) {
              code = decodeURIComponent(match[1]);
            }

            // Detener el escáner
            html5QrCode.stop().then(() => {
              qrReaderEl.style.display = 'none';
              startScanBtn.style.display = 'inline-block';
              stopScanBtn.style.display = 'none';
              
              // Llenar el input y hacer la búsqueda
              if (codeInput) {
                codeInput.value = code;
              }
              submitLookup(code);
            });
          },
          (errorMessage) => {
            // Error de escaneo (normal mientras busca QR)
            // No mostrar estos errores al usuario
          }
        );

        setStatus(statusEl, 'Escáner activado. Enfoca un código QR.', 'info');
      } catch (err) {
        setStatus(statusEl, `Error al iniciar cámara: ${err}`, 'error');
        qrReaderEl.style.display = 'none';
        startScanBtn.style.display = 'inline-block';
        stopScanBtn.style.display = 'none';
      }
    });

    stopScanBtn.addEventListener('click', () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          qrReaderEl.style.display = 'none';
          startScanBtn.style.display = 'inline-block';
          stopScanBtn.style.display = 'none';
          setStatus(statusEl, 'Escáner detenido.', 'info');
        }).catch(err => {
          console.error('Error al detener escáner:', err);
        });
      }
    });
  }

  // Funcionalidad del modal
  const modal = container.querySelector('#product-modal');
  const modalClose = container.querySelector('.modal-close');
  const modalOverlay = container.querySelector('.modal-overlay');

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modalOverlay && modal) {
    modalOverlay.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Auto-buscar si viene código en hash
  const codeFromHash = getCodeFromHash();
  if (codeFromHash && codeInput) {
    codeInput.value = codeFromHash;
    submitLookup(codeFromHash);
  }
}
