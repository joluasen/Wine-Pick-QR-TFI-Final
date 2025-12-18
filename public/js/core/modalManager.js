// public/js/core/modalManager.js
/**
 * Gestor centralizado de modales
 * Unifica el manejo de todos los modales de la aplicación
 */

import { getBasePath, escapeHtml, calculatePromoPrice, formatDate } from './utils.js';

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.modalStack = [];
    this.cache = new Map(); // Cache de HTML de modales
    this.qrScanner = null;
    
    // Bind de métodos
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Inicializa el modal manager
   */
  init() {
    // Escuchar tecla Escape
    document.addEventListener('keydown', this.handleKeydown);
    
    // Crear contenedor de modales si no existe
    if (!document.getElementById('modal-container')) {
      const container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }
  }

  /**
   * Maneja la tecla Escape para cerrar modales
   */
  handleKeydown(e) {
    if (e.key === 'Escape' && this.activeModal) {
      this.close();
    }
  }

  /**
   * Maneja clicks fuera del contenido del modal
   */
  handleClickOutside(e) {
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-overlay')) {
      this.close();
    }
  }

  /**
   * Abre un modal genérico
   * @param {string} id - ID del modal
   * @param {string} content - Contenido HTML del modal
   * @param {Object} options - Opciones adicionales
   */
  open(id, content, options = {}) {
    const { onClose, onOpen, preventClose = false } = options;
    
    // Si hay un modal activo, lo apilamos
    if (this.activeModal) {
      this.modalStack.push(this.activeModal);
    }
    
    // Crear o actualizar el modal
    let modal = document.getElementById(id);
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.getElementById('modal-container').appendChild(modal);
    }
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        ${!preventClose ? '<button class="modal-close" aria-label="Cerrar">&times;</button>' : ''}
        <div class="modal-body">${content}</div>
      </div>
    `;
    
    // Event listeners
    if (!preventClose) {
      modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());
      modal.addEventListener('click', this.handleClickOutside);
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Guardar referencia
    this.activeModal = { id, modal, onClose, onOpen };
    
    // Callback de apertura
    if (onOpen) onOpen(modal);
    
    // Focus trap
    const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
    
    return modal;
  }

  /**
   * Cierra el modal activo
   */
  close() {
    if (!this.activeModal) return;
    
    const { modal, onClose } = this.activeModal;
    
    // Detener QR scanner si está activo
    this.stopQrScanner();
    
    // Ocultar modal
    modal.style.display = 'none';
    
    // Callback de cierre
    if (onClose) onClose();
    
    // Restaurar modal anterior si existe
    if (this.modalStack.length > 0) {
      this.activeModal = this.modalStack.pop();
      this.activeModal.modal.style.display = 'flex';
    } else {
      this.activeModal = null;
      document.body.style.overflow = '';
    }
  }

  /**
   * Cierra todos los modales
   */
  closeAll() {
    this.stopQrScanner();
    
    while (this.activeModal) {
      this.close();
    }
    
    this.modalStack = [];
    document.body.style.overflow = '';
  }

  // ============================================
  // MODAL DE PRODUCTO
  // ============================================

  /**
   * Muestra el modal de producto
   * @param {Object} product - Datos del producto
   */
  showProduct(product) {
    const content = this.renderProductCard(product);
    
    this.open('product-modal', content, {
      onOpen: (modal) => {
        modal.classList.add('product-modal');
      }
    });
  }

  /**
   * Renderiza la ficha de producto
   */
  renderProductCard(product) {
    const priceData = calculatePromoPrice(product);
    const basePrice = parseFloat(product.base_price);
    const imageUrl = product.image_url || '';
    
    let badge = '';
    let savingsText = '';
    let originalPrice = '';
    
    if (priceData.hasPromo) {
      switch (priceData.type) {
        case 'porcentaje':
          badge = `<span class="discount-badge">${priceData.discount}% OFF</span>`;
          originalPrice = `<p class="price-original">$${basePrice.toFixed(2)}</p>`;
          savingsText = `<p class="price-savings">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
          break;
        case 'precio_fijo':
          badge = `<span class="discount-badge">OFERTA</span>`;
          originalPrice = `<p class="price-original">$${basePrice.toFixed(2)}</p>`;
          savingsText = `<p class="price-savings">Ahorrás $${priceData.savings.toFixed(2)}</p>`;
          break;
        case '2x1':
          badge = `<span class="discount-badge">2x1</span>`;
          savingsText = `<p class="price-savings">Precio efectivo: $${priceData.final.toFixed(2)} c/u</p>`;
          break;
        case '3x2':
          badge = `<span class="discount-badge">3x2</span>`;
          savingsText = `<p class="price-savings">Pagás solo 2 unidades</p>`;
          break;
        case 'nxm':
          badge = `<span class="discount-badge">COMBO</span>`;
          savingsText = `<p class="price-savings">${escapeHtml(priceData.customText) || 'Consultá condiciones'}</p>`;
          break;
      }
    }
    
    const validUntil = product.promotion?.end_at 
      ? `<p class="promo-validity">Válido hasta: ${formatDate(product.promotion.end_at)}</p>` 
      : '';

    return `
      <div class="product-card-detail">
        <div class="product-image-section">
          <div class="product-image-wrapper">
            ${imageUrl 
              ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
              : ''
            }
            <div class="product-image-placeholder" style="${imageUrl ? 'display: none;' : 'display: flex;'}">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span>Sin imagen</span>
            </div>
          </div>
          
          <div class="product-specs">
            <h3 class="specs-title">Características</h3>
            <dl class="specs-list">
              <div class="spec-item">
                <dt>Bodega</dt>
                <dd>${escapeHtml(product.winery_distillery) || '—'}</dd>
              </div>
              ${product.origin ? `
                <div class="spec-item">
                  <dt>Origen</dt>
                  <dd>${escapeHtml(product.origin)}</dd>
                </div>
              ` : ''}
              ${product.vintage_year ? `
                <div class="spec-item">
                  <dt>Cosecha</dt>
                  <dd>${product.vintage_year}</dd>
                </div>
              ` : ''}
              <div class="spec-item">
                <dt>Código</dt>
                <dd>${escapeHtml(product.public_code)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div class="product-info-section">
          <div class="product-header">
            <p class="product-category">${escapeHtml(product.drink_type) || ''}${product.varietal ? ' | ' + escapeHtml(product.varietal) : ''}</p>
            <h1 class="product-title">${escapeHtml(product.name) || 'Producto'}</h1>
          </div>
          
          <div class="product-price-section">
            ${badge}
            ${originalPrice}
            <div class="price-main">
              <span class="price-symbol">$</span>
              <span class="price-int">${Math.floor(priceData.final)}</span>
              <span class="price-dec">${(priceData.final % 1).toFixed(2).slice(1)}</span>
            </div>
            ${savingsText}
            ${validUntil}
          </div>
          
          ${product.short_description ? `
            <div class="product-description">
              <h2 class="description-title">Descripción</h2>
              <p>${escapeHtml(product.short_description)}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ============================================
  // MODAL DE QR SCANNER
  // ============================================

  /**
   * Muestra el modal del escáner QR
   */
  async showQrScanner() {
    const content = `
      <div class="qr-scanner-modal">
        <h2 class="qr-title">Escanear Código QR</h2>
        <p class="qr-subtitle">Apuntá la cámara al código QR del producto</p>
        
        <div id="qr-reader" class="qr-reader"></div>
        <div id="qr-status" class="qr-status" aria-live="polite"></div>
        
        <div class="qr-manual">
          <p class="qr-manual-label">¿No podés escanear? Ingresá el código manualmente:</p>
          <form id="qr-manual-form" class="qr-manual-form">
            <input 
              type="text" 
              id="qr-manual-input" 
              name="code" 
              placeholder="Ej: MALBEC-001" 
              required
              autocomplete="off"
            >
            <button type="submit" class="btn-primary">Buscar</button>
          </form>
        </div>
      </div>
    `;
    
    const modal = this.open('qr-scanner-modal', content, {
      onOpen: () => this.initQrScanner(),
      onClose: () => this.stopQrScanner()
    });
    
    // Setup del formulario manual
    const form = modal.querySelector('#qr-manual-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = form.querySelector('#qr-manual-input')?.value?.trim();
        if (code) {
          this.handleQrResult(code);
        }
      });
    }
  }

  /**
   * Inicializa el escáner QR
   */
  async initQrScanner() {
    const statusEl = document.getElementById('qr-status');
    const readerEl = document.getElementById('qr-reader');
    
    if (!readerEl) return;
    
    // Verificar que la librería esté disponible
    if (typeof Html5Qrcode === 'undefined') {
      if (statusEl) {
        statusEl.textContent = 'Error: Librería de QR no disponible';
        statusEl.dataset.type = 'error';
      }
      return;
    }
    
    try {
      if (statusEl) {
        statusEl.textContent = 'Iniciando cámara...';
        statusEl.dataset.type = 'info';
      }
      
      this.qrScanner = new Html5Qrcode('qr-reader');
      
      await this.qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => this.handleQrResult(decodedText),
        () => {} // Ignorar errores de escaneo
      );
      
      if (statusEl) {
        statusEl.textContent = 'Escaneando... Enfocá el código QR';
        statusEl.dataset.type = 'info';
      }
    } catch (err) {
      console.error('Error iniciando QR scanner:', err);
      if (statusEl) {
        statusEl.textContent = 'No se pudo acceder a la cámara. Usá el ingreso manual.';
        statusEl.dataset.type = 'error';
      }
    }
  }

  /**
   * Detiene el escáner QR
   */
  async stopQrScanner() {
    if (this.qrScanner) {
      try {
        if (this.qrScanner.isScanning) {
          await this.qrScanner.stop();
        }
        this.qrScanner.clear();
      } catch (err) {
        console.error('Error deteniendo QR scanner:', err);
      }
      this.qrScanner = null;
    }
  }

  /**
   * Maneja el resultado del escaneo QR
   */
  handleQrResult(result) {
    // Extraer código de la URL si es necesario
    let code = result;
    const match = result.match(/code=([^&]+)/);
    if (match) {
      code = decodeURIComponent(match[1]);
    }
    
    // Cerrar modal QR y navegar a búsqueda
    this.close();
    
    // Navegar al producto
    window.location.hash = `#search?query=${encodeURIComponent(code)}`;
  }
}

// Singleton
export const modalManager = new ModalManager();
