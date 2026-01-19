// public/js/core/modalManager.js
/**
 * Gestor centralizado de modales
 * Unifica el manejo de todos los modales de la aplicación
 */

import { getBasePath, escapeHtml, calculatePromoPrice, formatDate } from './utils.js';
import { showToast } from '../admin/components/Toast.js';
import { showConfirmDialog } from '../admin/components/ConfirmDialog.js';
import { deleteProduct } from '../admin/services/productService.js';
import { deletePromotion } from '../admin/services/promotionService.js';

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
    const { onClose, onOpen, preventClose = false, disableClickOutside = false } = options;

    // Si hay un modal activo, lo apilamos
    if (this.activeModal) {
      this.modalStack.push(this.activeModal);
    }

    // Crear o actualizar el modal
    let modal = document.getElementById(id);

    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.getElementById('modal-container').appendChild(modal);
    }

    // Reset clases (limpia clases de tamaño anteriores)
    modal.className = 'modal';

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

      // Solo agregar click outside si no está deshabilitado
      if (!disableClickOutside) {
        modal.addEventListener('click', this.handleClickOutside);
      }
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

    const { modal, onClose, id } = this.activeModal;

    // Detener QR scanner si está activo
    this.stopQrScanner();

    // Si es un modal QR y estamos en una ruta de scan, volver a la vista anterior
    const currentHash = window.location.hash;
    if (id === 'qr-scanner-modal' && currentHash === '#scan') {
      window.location.hash = '#home';
    } else if (id === 'admin-qr-modal' && currentHash === '#admin-scan') {
      window.location.hash = '#admin-products';
    }

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
      onOpen: (modalEl) => {
        if (!this._isAdminContext()) return;
        const menuBtn = modalEl.querySelector('.btn-admin-actions');
        const menu = modalEl.querySelector('.admin-actions-menu');
        if (menuBtn && menu) {
          menuBtn.addEventListener('click', () => {
            const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            menu.style.display = expanded ? 'none' : 'block';
          });
          const editBtn = menu.querySelector('[data-action="edit-product"]');
          const deleteBtn = menu.querySelector('[data-action="delete-product"]');
          const editPromoBtn = menu.querySelector('[data-action="edit-promo"]');
          const deletePromoBtn = menu.querySelector('[data-action="delete-promo"]');

          editBtn?.addEventListener('click', () => {
            this.showEditProduct(product);
          });
          deleteBtn?.addEventListener('click', async () => {
            const confirmed = await showConfirmDialog({
              title: 'Eliminar producto',
              message: `¿Eliminar "${product.name}"?`,
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              confirmClass: 'btn-danger'
            });
            if (!confirmed) return;
            try {
              const loadingToast = showToast('Eliminando producto...', 'info', 0);
              await deleteProduct(product.id);
              loadingToast.classList.remove('show');
              setTimeout(() => loadingToast.remove(), 300);
              showToast('Producto eliminado correctamente', 'success');
              this.close();
              if (window.adminView && typeof window.adminView.loadProducts === 'function') {
                window.adminView.loadProducts();
              }
            } catch (err) {
              showToast(`Error al eliminar: ${err.message}`, 'error');
            }
          });
          editPromoBtn?.addEventListener('click', () => {
            const promo = product.promotion;
            if (!promo || !promo.id) {
              showToast('El producto no tiene promoción asociada', 'error');
              return;
            }
            this.showEditPromotion(promo, () => {
              showToast('Promoción actualizada', 'success');
            });
          });
          deletePromoBtn?.addEventListener('click', async () => {
            const promo = product.promotion;
            if (!promo || !promo.id) {
              showToast('El producto no tiene promoción asociada', 'error');
              return;
            }
            const confirmed = await showConfirmDialog({
              title: 'Eliminar promoción',
              message: '¿Eliminar la promoción asociada?',
              confirmText: 'Eliminar',
              cancelText: 'Cancelar',
              confirmClass: 'btn-danger'
            });
            if (!confirmed) return;
            try {
              const loadingToast = showToast('Eliminando promoción...', 'info', 0);
              await deletePromotion(promo.id);
              loadingToast.classList.remove('show');
              setTimeout(() => loadingToast.remove(), 300);
              showToast('Promoción eliminada', 'success');
            } catch (err) {
              showToast(`Error al eliminar: ${err.message}`, 'error');
            }
          });
        }
      }
    });
  }

  /**
   * Muestra el modal de producto para admin (mismo modal, mismo estilo)
   * @param {Object} product - Datos del producto
   */
  showProductAdmin(product) {
    // Usa exactamente el mismo método - misma ficha, mismo estilo
    this.showProduct(product);
  }

  /**
   * Renderiza la ficha de producto
   * @param {Object} product - Datos del producto
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

    const adminMenu = this._isAdminContext() ? `
      <div class="admin-actions-dropdown">
        <button type="button" class="btn-admin-actions" aria-haspopup="true" aria-expanded="false">
          Acciones <i class="fas fa-chevron-down"></i>
        </button>
        <ul class="admin-actions-menu" style="display:none">
          <li><button type="button" data-action="edit-product"><i class="fas fa-edit"></i> Editar producto</button></li>
          <li><button type="button" data-action="delete-product"><i class="fas fa-trash"></i> Eliminar producto</button></li>
          <li><button type="button" data-action="edit-promo"><i class="fas fa-tag"></i> Editar promoción</button></li>
          <li><button type="button" data-action="delete-promo"><i class="fas fa-times-circle"></i> Eliminar promoción</button></li>
        </ul>
      </div>
    ` : '';

    return `
      <div class="product-card-detail">
        <!-- SECCIÓN DE IMAGEN (MÓVIL Y DESKTOP) -->
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

          <!-- CARACTERÍSTICAS (MÓVIL: abajo de imagen, DESKTOP: en sidebar) -->
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
            </dl>
          </div>
        </div>

        <!-- SECCIÓN DE INFORMACIÓN -->
        <div class="product-info-section">
          <!-- CATEGORÍA (MÓVIL Y DESKTOP) -->
          <p class="product-category">${escapeHtml(product.drink_type) || ''}${product.varietal ? ' | ' + escapeHtml(product.varietal) : ''}</p>

          <!-- CÓDIGO DEL PRODUCTO (MÓVIL Y DESKTOP) -->
          <p class="product-code-label"><small>${escapeHtml(product.public_code)}</small></p>

          <!-- NOMBRE DEL PRODUCTO (MÓVIL Y DESKTOP) -->
          <h1 class="product-title">${escapeHtml(product.name) || 'Producto'}</h1>

          <!-- PRECIO Y PROMOCIÓN (MÓVIL Y DESKTOP) -->
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

          <!-- DESCRIPCIÓN (MÓVIL Y DESKTOP) -->
          ${product.short_description ? `
            <div class="product-description">
              <h2 class="description-title">Descripción</h2>
              <p>${escapeHtml(product.short_description)}</p>
            </div>
          ` : ''}

          <!-- ACCIONES ADMIN (MÓVIL Y DESKTOP) -->
          ${adminMenu ? `<div class="product-actions-section">${adminMenu}</div>` : ''}
        </div>
      </div>
    `;
  }

  _isAdminContext() {
    const h = window.location.hash.split('?')[0] || '';
    return ['#admin', '#admin-products', '#admin-metrics', '#admin-promotions', '#admin-scan', '#admin-search'].includes(h);
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

  // ============================================
  // HELPERS PARA MODALES DE PRODUCTO
  // ============================================

  /**
   * Genera la estructura HTML base para modales de producto (crear/editar)
   */
  _generateProductModalHTML(mode, product = null) {
    const isEdit = mode === 'edit';
    const currentYear = new Date().getFullYear();
    const imageUrl = isEdit && product?.image_url && product.image_url !== '0' ? product.image_url : '';

    return `
      <div class="product-modal-wrapper">
        <h2 class="product-modal-title">
          <i class="fas fa-${isEdit ? 'edit' : 'plus-circle'} me-2"></i>${isEdit ? 'Editar' : 'Nuevo'} Producto
        </h2>

        <form id="${isEdit ? 'admin-edit' : 'product-create'}-product-form" class="product-modal-form" novalidate>
          <!-- Sección de imagen ${isEdit ? '+ QR' : ''} -->
          <div class="form-image-section ${isEdit ? 'form-image-qr-section' : ''}">
            
            <div class="image-qr-container ${isEdit ? 'two-columns-layout' : ''}">
              <!-- Columna 1: Imagen del producto -->
              <div class="product-image-column">
                <div class="image-preview-box" id="${isEdit ? 'edit' : 'create'}-image-display">
                  ${imageUrl
                    ? `<img src="${escapeHtml(imageUrl)}" alt="Producto" class="image-preview-thumb" id="current-product-image">`
                    : `<div class="image-placeholder">
                         <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                           <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                           <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                           <line x1="12" y1="22.08" x2="12" y2="12"></line>
                         </svg>
                         <span class="placeholder-text">Sin imagen</span>
                       </div>`
                  }
                  <input
                    type="file"
                    id="${isEdit ? 'edit' : 'create'}-product-image"
                    accept="image/jpeg,image/png,image/webp"
                    class="d-none"
                  >
                  <button type="button" class="btn-overlay btn-overlay-image" id="${isEdit ? 'edit' : 'create'}-select-image-btn" title="${imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}">
                    <i class="fas fa-${imageUrl ? 'sync-alt' : 'upload'}"></i>
                    <span>${imageUrl ? 'Cambiar' : 'Agregar'}</span>
                  </button>
                  <span class="overlay-hint overlay-hint-image">
                    <i class="fas fa-info-circle"></i> JPG, PNG o WebP · Máx 5MB
                  </span>
                </div>
              </div>

              ${isEdit && product?.public_code ? `
              <!-- Columna 2: Código QR -->
              <div class="product-qr-column">
                <div class="qr-preview-box">
                  <div id="edit-qr-display" class="qr-canvas-container">
                    <div class="qr-loading">
                      <div class="spinner-border text-wine" role="status">
                        <span class="visually-hidden">Generando QR...</span>
                      </div>
                      <p class="mt-2 mb-0">Generando código QR...</p>
                    </div>
                  </div>
                  <button type="button" class="btn-overlay btn-overlay-qr" id="edit-download-qr-btn" title="Descargar código QR">
                    <i class="fas fa-download"></i>
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          ${this._generateProductFormFields(isEdit, product, currentYear)}

          <!-- Mensaje de estado -->
          <div id="${isEdit ? 'edit' : 'create'}-form-status" class="alert d-none mb-3" role="alert"></div>

          <!-- Botones -->
          <div class="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <button type="button" class="btn-modal" data-dismiss-modal>
              <i class="fas fa-times me-1"></i>Cancelar
            </button>
            <button type="submit" class="btn-modal btn-modal-primary" id="${isEdit ? 'save' : 'create'}-product-btn">
              <i class="fas fa-${isEdit ? 'save' : 'plus'} me-1"></i>${isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Genera los campos del formulario de producto
   */
  _generateProductFormFields(isEdit, product, currentYear) {
    const p = product || {};
    const descriptionLength = (p.short_description || '').length;

    return `
      <!-- Identificación -->
      <div class="form-section mb-4">
        <h4 class="form-section-title">Identificación</h4>
        <div class="row g-3">
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-public-code" class="form-label">
              Código público <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-public-code"
              name="public_code"
              value="${escapeHtml(p.public_code || '')}"
              ${isEdit ? 'readonly title="El código no puede modificarse"' : 'required placeholder="Ej: MALBEC-2021-001"'}
            >
            ${isEdit
              ? '<small class="form-text text-muted">Este código es único e inmutable</small>'
              : '<div class="invalid-feedback">Solo mayúsculas, números y guiones</div>'
            }
          </div>
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-name" class="form-label">
              Nombre <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-name"
              name="name"
              value="${escapeHtml(p.name || '')}"
              required
              minlength="3"
              maxlength="100"
              placeholder="Ej: Malbec Reserva 2020"
            >
            <div class="invalid-feedback">El nombre debe tener entre 3 y 100 caracteres</div>
          </div>
        </div>
      </div>

      <!-- Información del producto -->
      <div class="form-section mb-4">
        <h4 class="form-section-title">Información del Producto</h4>
        <div class="row g-3">
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-winery" class="form-label">
              Bodega/Destilería <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-winery"
              name="winery_distillery"
              value="${escapeHtml(p.winery_distillery || '')}"
              required
              minlength="2"
              maxlength="100"
              placeholder="Ej: Bodega Catena Zapata"
            >
            <div class="invalid-feedback">Ingrese el nombre de la bodega o destilería</div>
          </div>
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-drink-type" class="form-label">
              Tipo de bebida <span class="text-danger">*</span>
            </label>
            <select class="form-control" id="${isEdit ? 'edit' : 'create'}-drink-type" name="drink_type" required>
              <option value="">Seleccione un tipo</option>
              <option value="vino" ${p.drink_type === 'vino' ? 'selected' : ''}>Vino</option>
              <option value="espumante" ${p.drink_type === 'espumante' ? 'selected' : ''}>Espumante</option>
              <option value="whisky" ${p.drink_type === 'whisky' ? 'selected' : ''}>Whisky</option>
              <option value="gin" ${p.drink_type === 'gin' ? 'selected' : ''}>Gin</option>
              <option value="cerveza" ${p.drink_type === 'cerveza' ? 'selected' : ''}>Cerveza</option>
              <option value="licor" ${p.drink_type === 'licor' ? 'selected' : ''}>Licor</option>
            </select>
            <div class="invalid-feedback">Seleccione el tipo de bebida</div>
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-varietal" class="form-label">Varietal</label>
            <input
              type="text"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-varietal"
              name="varietal"
              value="${escapeHtml(p.varietal || '')}"
              maxlength="50"
              placeholder="Ej: Malbec, Cabernet Sauvignon"
            >
          </div>
          <div class="col-md-6">
            <label for="${isEdit ? 'edit' : 'create'}-origin" class="form-label">Origen</label>
            <input
              type="text"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-origin"
              name="origin"
              value="${escapeHtml(p.origin || '')}"
              maxlength="100"
              placeholder="Ej: Mendoza, Argentina"
            >
          </div>
        </div>
      </div>

      <!-- Precio y stock -->
      <div class="form-section mb-4">
        <h4 class="form-section-title">Precio y Stock</h4>
        <div class="row g-3">
          <div class="col-md-4">
            <label for="${isEdit ? 'edit' : 'create'}-vintage" class="form-label">Año de cosecha</label>
            <input
              type="number"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-vintage"
              name="vintage_year"
              value="${escapeHtml(p.vintage_year || '')}"
              min="1900"
              max="${currentYear + 1}"
              placeholder="Ej: ${currentYear - 3}"
            >
          </div>
          <div class="col-md-4">
            <label for="${isEdit ? 'edit' : 'create'}-price" class="form-label">
              Precio base <span class="text-danger">*</span>
            </label>
            <input
              type="number"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-price"
              name="base_price"
              step="0.01"
              value="${escapeHtml(p.base_price || '')}"
              required
              min="0.01"
              max="999999.99"
              placeholder="0.00"
            >
            <div class="invalid-feedback">Ingrese un precio válido mayor a 0</div>
          </div>
          <div class="col-md-4">
            <label for="${isEdit ? 'edit' : 'create'}-stock" class="form-label">Stock visible</label>
            <input
              type="number"
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-stock"
              name="visible_stock"
              value="${escapeHtml(p.visible_stock || '')}"
              min="0"
              max="99999"
              placeholder="0"
            >
          </div>
        </div>
      </div>

      <!-- Descripción -->
      <div class="form-section mb-4">
        <h4 class="form-section-title">Descripción</h4>
        <div class="row g-3">
          <div class="col-12">
            <label for="${isEdit ? 'edit' : 'create'}-description" class="form-label">Descripción corta</label>
            <textarea
              class="form-control"
              id="${isEdit ? 'edit' : 'create'}-description"
              name="short_description"
              rows="4"
              maxlength="200"
              placeholder="Breve descripción del producto (opcional)"
            >${escapeHtml(p.short_description || '')}</textarea>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <small class="form-text text-muted">Máximo 200 caracteres</small>
              <small class="form-text">
                <span id="char-count">${descriptionLength}</span>/200
              </small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // MODAL DE CREAR PRODUCTO
  // ============================================

  /**
   * Muestra el modal de creación de producto
   */
  async showCreateProduct(onSuccess = null) {
    const content = this._generateProductModalHTML('create');

    this.open('create-product-modal', content, {
      disableClickOutside: true,
      onOpen: (modalEl) => {
        modalEl.classList.add('modal-xl');
        this._setupProductFormLogic('create', null, modalEl, onSuccess);
      }
    });
  }

  // ============================================
  // MODAL DE EDITAR PRODUCTO
  // ============================================

  /**
   * Muestra el modal de edición de producto
   */
  async showEditProduct(product, onSuccess = null) {
    if (!product || !product.id) {
      console.error('Product data is required for edit modal');
      return;
    }

    const content = this._generateProductModalHTML('edit', product);

    this.open('edit-product-modal', content, {
      disableClickOutside: true,
      onOpen: (modalEl) => {
        modalEl.classList.add('modal-xl');
        this._setupProductFormLogic('edit', product, modalEl, onSuccess);
        
        // Generar QR si estamos en modo edición
        if (product?.public_code) {
          setTimeout(() => {
            const qrContainer = modalEl.querySelector('#edit-qr-display');
            if (qrContainer) {
              // Generar el QR
              this.generateQRCode(product.public_code, qrContainer);
              
            }
            
            // Setup botón descargar QR
            const downloadQRBtn = modalEl.querySelector('#edit-download-qr-btn');
            if (downloadQRBtn) {
              downloadQRBtn.addEventListener('click', () => {
                this._downloadQRAsImage(product.public_code);
              });
            }
          }, 100);
        }
      }
    });
  }

  // ============================================
  // LÓGICA COMÚN DE FORMULARIOS DE PRODUCTO
  // ============================================

  /**
   * Configura la lógica del formulario de producto (crear/editar)
   * @param {string} mode - 'create' o 'edit'
   * @param {Object|null} product - Datos del producto (null para create)
   * @param {HTMLElement} modal - Elemento del modal
   * @param {Function|null} onSuccess - Callback de éxito
   */
  _setupProductFormLogic(mode, product, modal, onSuccess) {
    const isEdit = mode === 'edit';
    const prefix = isEdit ? 'edit' : 'create';

    // Seleccionar elementos del DOM
    const form = modal.querySelector(`#${isEdit ? 'admin-edit' : 'product-create'}-product-form`);
    const imageInput = modal.querySelector(`#${prefix}-product-image`);
    const imageDisplay = modal.querySelector(`#${prefix}-image-display`);
    const selectImageBtn = modal.querySelector(`#${prefix}-select-image-btn`);
    const submitBtn = modal.querySelector(`#${isEdit ? 'save' : 'create'}-product-btn`);
    const statusEl = modal.querySelector(`#${prefix}-form-status`);
    const descriptionTextarea = modal.querySelector(`#${prefix}-description`);
    const charCount = modal.querySelector('#char-count');
    const publicCodeInput = modal.querySelector(`#${prefix}-public-code`);

    // Botones de cancelar
    const closeBtn = modal.querySelector('[data-close-modal]');
    const dismissBtn = modal.querySelector('[data-dismiss-modal]');

    let uploadedImageUrl = isEdit && product?.image_url ? product.image_url : null;
    let hasChangedImage = false;

    // Contador de caracteres de descripción
    if (descriptionTextarea && charCount) {
      descriptionTextarea.addEventListener('input', () => {
        charCount.textContent = descriptionTextarea.value.length;
      });
    }

    // Forzar mayúsculas en el código público (solo creación)
    if (!isEdit && publicCodeInput) {
      publicCodeInput.addEventListener('input', () => {
        const val = publicCodeInput.value || '';
        publicCodeInput.value = val.toUpperCase();
      });
    }

    // Seleccionar imagen
    if (selectImageBtn && imageInput) {
      selectImageBtn.addEventListener('click', () => imageInput.click());

      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          showToast('Solo se permiten imágenes JPG, PNG o WebP', 'error');
          return;
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast('La imagen no debe superar 5MB', 'error');
          return;
        }

        // Preview de la imagen en memoria (sin subir aún)
        const reader = new FileReader();
        reader.onload = (e) => {
          // Guardar referencias al botón e hint antes de limpiar
          const buttonRef = imageDisplay.querySelector('.btn-overlay');
          const hintRef = imageDisplay.querySelector('.overlay-hint');
          
          // Limpiar y crear imagen
          imageDisplay.innerHTML = '';
          const img = document.createElement('img');
          img.src = e.target.result; // Data URL en memoria
          img.alt = 'Preview';
          img.className = 'image-preview-thumb';
          imageDisplay.appendChild(img);
          
          // Re-agregar botón e hint
          if (buttonRef) imageDisplay.appendChild(buttonRef);
          if (hintRef) imageDisplay.appendChild(hintRef);
          
          // Guardar el archivo en memoria para subir después
          imageInput.tempFile = file;
          imageInput.tempDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Botones de cancelar
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.close());
    }

    // Enviar formulario
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validación HTML5
        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add('was-validated');
          showToast('Por favor, complete todos los campos requeridos', 'error');
          return;
        }

        // Validación personalizada del código público (solo creación)
        if (!isEdit && publicCodeInput) {
          const code = (publicCodeInput.value || '').trim();
          if (!code || !/^[A-Z0-9-]+$/.test(code)) {
            showToast('Código público inválido: use mayúsculas, números y guiones', 'error');
            publicCodeInput.focus();
            return;
          }
        }

        // Si es edición y cambió la imagen, preguntar qué hacer con la anterior
        if (isEdit && hasChangedImage && product?.image_url && product.image_url !== '0') {
          const shouldDelete = await this._showImageActionDialog(product.image_url);

          // Preparar datos
          const formData = new FormData(form);
          const payload = Object.fromEntries(formData.entries());

          // Agregar URL de imagen
          if (uploadedImageUrl) {
            payload.image_url = uploadedImageUrl;
          }

          // Agregar flag de eliminación de imagen anterior
          if (shouldDelete) {
            payload.delete_old_image = true;
            payload.old_image_url = product.image_url;
          }

          // Enviar actualización
          await this._submitProductForm(isEdit, product?.id, payload, submitBtn, statusEl, onSuccess);
        } else {
          // Preparar datos normales
          const formData = new FormData(form);
          const payload = Object.fromEntries(formData.entries());

          // Agregar URL de imagen si existe
          if (uploadedImageUrl) {
            payload.image_url = uploadedImageUrl;
          }

          // Enviar
          await this._submitProductForm(isEdit, product?.id, payload, submitBtn, statusEl, onSuccess);
        }
      });
    }
  }

  /**
   * Envía el formulario de producto al servidor
   */
  async _submitProductForm(isEdit, productId, payload, submitBtn, statusEl, onSuccess) {
    const endpoint = isEdit ? `./api/admin/productos/${productId}` : './api/admin/productos';
    const method = isEdit ? 'PUT' : 'POST';
    const actionText = isEdit ? 'Guardando' : 'Creando';
    const successText = isEdit ? 'Producto actualizado con éxito' : 'Producto creado con éxito';

    // Si es edición, agregar el ID al payload
    if (isEdit) {
      payload.id = productId;
    }

    // Ocultar cualquier mensaje de estado previo
    this.hideFormStatus(statusEl);

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${actionText}...`;

    try {
      // Si hay una imagen en memoria sin subir, subirla primero
      const imageInput = document.querySelector(`#${isEdit ? 'edit' : 'create'}-product-image`);
      if (imageInput && imageInput.tempFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageInput.tempFile);

          const response = await fetch('./api/admin/upload/product-image', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error al subir la imagen');
          }

          // Actualizar payload con URL de imagen del servidor
          payload.image_url = data.data.url;
          // Limpiar referencia temporal
          imageInput.tempFile = null;
          imageInput.tempDataUrl = null;
        } catch (error) {
          showToast(`Error al subir imagen: ${error.message}`, 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fas fa-${isEdit ? 'save' : 'plus'} me-1"></i>${isEdit ? 'Guardar cambios' : 'Crear producto'}`;
          return;
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Extraer mensaje de error del backend
        const errorMessage = data.error?.message || data.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el producto`;
        throw new Error(errorMessage);
      }

      showToast(successText, 'success');

      // Mostrar QR modal solo al CREAR producto nuevo (no en edición)
      const productData = data.data;
      if (!isEdit && productData && productData.public_code) {
        // Cerrar modal actual
        this.close();

        // Esperar a que se cierre y luego mostrar QR
        setTimeout(() => {
          this.showProductQRModal({
            id: productData.id,
            name: productData.name,
            public_code: productData.public_code
          });
        }, 300);
      } else {
        // Si es edición o no hay public_code, solo cerrar
        setTimeout(() => {
          this.close();
          if (onSuccess) onSuccess(data.data);
          // Recargar tabla de productos
          if (window.adminView && typeof window.adminView.loadProducts === 'function') {
            window.adminView.loadProducts();
          }
        }, 800);
      }

    } catch (error) {
      showToast(error.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fas fa-${isEdit ? 'save' : 'plus'} me-1"></i>${isEdit ? 'Guardar cambios' : 'Crear producto'}`;
    }
  }

  /**
   * Muestra un diálogo para elegir qué hacer con la imagen anterior
   * @returns {Promise<boolean>} true si se debe eliminar, false si se debe conservar
   */
  async _showImageActionDialog(oldImageUrl) {
    return new Promise((resolve) => {
      const dialogContent = `
        <div class="image-action-dialog">
          <div class="dialog-icon">
            <i class="fas fa-images fa-3x text-warning"></i>
          </div>
          <h3 class="dialog-title">Imagen anterior detectada</h3>
          <p class="dialog-message">
            Has subido una nueva imagen. ¿Qué deseas hacer con la imagen anterior?
          </p>
          <div class="old-image-preview">
            <img src="${escapeHtml(oldImageUrl)}" alt="Imagen anterior" style="max-width: 200px; border-radius: 8px;">
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn-modal" id="keep-old-image">
              <i class="fas fa-save me-1"></i>Conservar
            </button>
            <button type="button" class="btn-modal btn-modal-danger" id="delete-old-image">
              <i class="fas fa-trash-alt me-1"></i>Eliminar del servidor
            </button>
          </div>
        </div>
      `;

      const dialogModal = this.open('image-action-dialog-modal', dialogContent, {
        disableClickOutside: true,
        preventClose: true
      });

      const keepBtn = dialogModal.querySelector('#keep-old-image');
      const deleteBtn = dialogModal.querySelector('#delete-old-image');

      keepBtn?.addEventListener('click', () => {
        this.close();
        resolve(false);
      });

      deleteBtn?.addEventListener('click', () => {
        this.close();
        resolve(true);
      });
    });
  }

  /**
   * Muestra mensaje de estado en formulario
   */
  showFormStatus(statusEl, message, type) {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'alert mb-3';

    switch(type) {
      case 'success':
        statusEl.classList.add('alert-success');
        break;
      case 'error':
        statusEl.classList.add('alert-danger');
        break;
      case 'info':
        statusEl.classList.add('alert-info');
        break;
    }

    statusEl.classList.remove('d-none');
  }

  /**
   * Oculta mensaje de estado en formulario
   */
  hideFormStatus(statusEl) {
    if (!statusEl) return;
    statusEl.classList.add('d-none');
    statusEl.textContent = '';
  }

  // ============================================
  // MODAL DE CREAR PROMOCIÓN
  // ============================================

  /**
   * Genera el HTML del formulario de promoción
   * @param {Object|null} promotion - Datos de promoción para edición (null = crear nueva)
   */
  _generatePromotionModalHTML(promotion = null) {
    const today = new Date().toISOString().split('T')[0];
    const isEdit = promotion !== null;
    const productLabel = isEdit ? 'Producto' : 'Buscar producto';
    const productSearchClass = isEdit ? 'd-none' : '';
    const selectedBadgeClass = isEdit ? '' : 'd-none';
    const title = isEdit ? 'Editar Promoción' : 'Nueva Promoción';
    const btnText = isEdit ? 'Guardar cambios' : 'Crear promoción';
    const btnIcon = isEdit ? 'fa-save' : 'fa-plus';

    return `
      <div class="promotion-modal-wrapper">
        <h2 class="product-modal-title">
          <i class="fas fa-tag me-2"></i>${title}
        </h2>

        <form id="promotion-create-form" class="product-modal-form" novalidate>
          <!-- Producto -->
          <div class="form-section mb-4">
            <div class="row g-3">
              <div class="col-12">
                <label for="promo-product-search" class="form-label">
                  ${productLabel}${isEdit ? '' : ' <span class="text-danger">*</span>'}
                </label>
                <div class="product-search-container ${productSearchClass}">
                  <input
                    type="text"
                    class="form-control"
                    id="promo-product-search"
                    placeholder="Escriba para buscar por nombre o código..."
                    autocomplete="off"
                  >
                  <input type="hidden" id="promo-product-id" name="product_id" required>
                  <div id="promo-product-results" class="product-search-results"></div>
                </div>
                <div id="promo-selected-product" class="selected-product-badge ${selectedBadgeClass}">
                  <span class="product-name"></span>
                  <span class="product-price"></span>
                  <button type="button" class="btn-remove-product" title="Quitar producto">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="invalid-feedback">Seleccione un producto</div>
              </div>
            </div>
          </div>

          <!-- Tipo de promoción -->
          <div class="form-section mb-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="promo-type" class="form-label">
                  Tipo de promoción <span class="text-danger">*</span>
                </label>
                <select class="form-control" id="promo-type" name="promotion_type" required>
                  <option value="">Seleccione un tipo</option>
                  <option value="porcentaje">Descuento porcentual (%)</option>
                  <option value="precio_fijo">Precio fijo (ARS)</option>
                  <option value="2x1">2x1</option>
                  <option value="3x2">3x2</option>
                  <option value="nxm">NxM (Personalizado)</option>
                </select>
                <div class="invalid-feedback">Seleccione el tipo de promoción</div>
              </div>
              <!-- Campo valor estándar (para porcentaje, precio_fijo, 2x1, 3x2) -->
              <div class="col-md-6" id="promo-value-container">
                <label for="promo-value" class="form-label" id="promo-value-label">
                  Valor <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="promo-value"
                  name="parameter_value"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ingrese el valor"
                >
                <div class="invalid-feedback">Ingrese un valor válido</div>
                <small class="form-text text-muted" id="promo-value-hint"></small>
              </div>

              <!-- Campos N y M para tipo nxm -->
              <div class="col-md-3 d-none" id="promo-nxm-n-container">
                <label for="promo-nxm-n" class="form-label">
                  Llevás (N) <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="promo-nxm-n"
                  min="2"
                  step="1"
                  placeholder="Ej: 4"
                >
                <div class="invalid-feedback">Ingrese un valor válido</div>
                <small class="form-text text-muted promo-hint-reserved">Cantidad que lleva</small>
              </div>
              <div class="col-md-3 d-none" id="promo-nxm-m-container">
                <label for="promo-nxm-m" class="form-label">
                  Pagás (M) <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="promo-nxm-m"
                  min="1"
                  step="1"
                  placeholder="Ej: 3"
                >
                <div class="invalid-feedback">Ingrese un valor válido</div>
                <small class="form-text text-muted promo-hint-reserved">Cantidad que paga</small>
              </div>
            </div>
          </div>

          <!-- Texto visible -->
          <div class="form-section mb-4">
            <div class="row g-3">
              <div class="col-12">
                <label for="promo-text" class="form-label">
                  Texto de la promoción <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="promo-text"
                  name="visible_text"
                  maxlength="100"
                  required
                  placeholder="Ej: 20% OFF en vinos seleccionados"
                >
                <div class="invalid-feedback">Ingrese el texto de la promoción</div>
                <small class="form-text text-muted">Este texto se mostrará al cliente</small>
              </div>
            </div>
          </div>

          <!-- Vigencia -->
          <div class="form-section mb-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="promo-start" class="form-label">
                  Fecha de inicio <span class="text-danger">*</span>
                </label>
                <input
                  type="date"
                  class="form-control"
                  id="promo-start"
                  name="start_at"
                  value="${today}"
                  required
                >
                <div class="invalid-feedback">Seleccione la fecha de inicio</div>
              </div>
              <div class="col-md-6">
                <label for="promo-end" class="form-label">
                  Fecha de fin <span class="text-muted">(opcional)</span>
                </label>
                <input
                  type="date"
                  class="form-control"
                  id="promo-end"
                  name="end_at"
                >
                <small class="form-text text-muted">Dejar vacío para sin fecha límite</small>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <button type="button" class="btn-modal" data-dismiss-modal>
              <i class="fas fa-times me-1"></i>Cancelar
            </button>
            <button type="submit" class="btn-modal btn-modal-primary" id="create-promo-btn">
              <i class="fas ${btnIcon} me-1"></i>${btnText}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Muestra el modal de creación de promoción
   * @param {Function|null} onSuccess - Callback cuando se crea exitosamente
   */
  async showCreatePromotion(onSuccess = null) {
    const content = this._generatePromotionModalHTML();

    this.open('create-promotion-modal', content, {
      disableClickOutside: true,
      onOpen: (modalEl) => {
        modalEl.classList.add('modal-xl');
        this._setupPromotionFormLogic(modalEl, onSuccess);
      }
    });
  }

  /**
   * Muestra modal para editar una promoción existente
   * @param {Object} promotion - Datos de la promoción a editar
   * @param {Function|null} onSuccess - Callback de éxito
   */
  async showEditPromotion(promotion, onSuccess = null) {
    const content = this._generatePromotionModalHTML(promotion);

    this.open('edit-promotion-modal', content, {
      disableClickOutside: true,
      onOpen: (modalEl) => {
        modalEl.classList.add('modal-xl');
        this._setupPromotionFormLogic(modalEl, onSuccess, promotion);
      }
    });
  }

  /**
   * Configura la lógica del formulario de promoción
   * @param {HTMLElement} modal - Elemento del modal
   * @param {Function|null} onSuccess - Callback de éxito
   * @param {Object|null} promotion - Datos de promoción para edición
   */
  async _setupPromotionFormLogic(modal, onSuccess, promotion = null) {
    const form = modal.querySelector('#promotion-create-form');
    const productSearchInput = modal.querySelector('#promo-product-search');
    const productIdInput = modal.querySelector('#promo-product-id');
    const productResults = modal.querySelector('#promo-product-results');
    const selectedProductBadge = modal.querySelector('#promo-selected-product');
    const typeSelect = modal.querySelector('#promo-type');
    const valueInput = modal.querySelector('#promo-value');
    const valueContainer = modal.querySelector('#promo-value-container');
    const valueLabel = modal.querySelector('#promo-value-label');
    const valueHint = modal.querySelector('#promo-value-hint');
    const nxmNContainer = modal.querySelector('#promo-nxm-n-container');
    const nxmMContainer = modal.querySelector('#promo-nxm-m-container');
    const nxmNInput = modal.querySelector('#promo-nxm-n');
    const nxmMInput = modal.querySelector('#promo-nxm-m');
    const textInput = modal.querySelector('#promo-text');
    const startInput = modal.querySelector('#promo-start');
    const endInput = modal.querySelector('#promo-end');
    const submitBtn = modal.querySelector('#create-promo-btn');
    const dismissBtn = modal.querySelector('[data-dismiss-modal]');

    const isEdit = promotion !== null;

    // Helper para sugerir texto visible inicial (mismo criterio que en labels dinámicos)
    const suggestInitialText = () => {
      const type = typeSelect.value;
      const current = textInput.value.trim();
      const isAuto = current === '' ||
        current.match(/^\d+% OFF$/) ||
        current.match(/^Precio especial \$[\d.,]+$/) ||
        current.match(/^[23]x[12] - Llevá \d+ y pagá solo \d+$/) ||
        current.match(/^\d+x\d+ - Llevá \d+ y pagá solo \d+$/);

      if (!isAuto) return;

      if (type === 'porcentaje' && valueInput.value) {
        textInput.value = `${valueInput.value}% OFF`;
      } else if (type === 'precio_fijo' && valueInput.value) {
        textInput.value = `Precio especial $${parseFloat(valueInput.value).toLocaleString('es-AR')}`;
      } else if (type === '2x1') {
        textInput.value = '2x1 - Llevá 2 y pagá solo 1';
      } else if (type === '3x2') {
        textInput.value = '3x2 - Llevá 3 y pagá solo 2';
      } else if (type === 'nxm' && nxmNInput.value && nxmMInput.value) {
        const n = nxmNInput.value;
        const m = nxmMInput.value;
        textInput.value = `${n}x${m} - Llevá ${n} y pagá solo ${m}`;
      }
    };

    // Configurar listeners de tipo antes de precargar datos
    this._setupPromotionTypeLabels(
      typeSelect,
      valueInput,
      valueContainer,
      valueLabel,
      valueHint,
      nxmNContainer,
      nxmMContainer,
      nxmNInput,
      nxmMInput,
      textInput
    );

    // Si es edición, pre-llenar campos
    if (isEdit) {
      const productName = promotion.product_name || `Producto #${promotion.product_id}`;
      const productPrice = promotion.product_price !== undefined && promotion.product_price !== null
        ? `$${parseFloat(promotion.product_price).toFixed(2)}`
        : '';

      productIdInput.value = promotion.product_id;
      typeSelect.value = promotion.promotion_type;
      valueInput.value = promotion.parameter_value;
      textInput.value = promotion.visible_text;
      
      // Formatear fechas (quitar hora si existe)
      if (promotion.start_at) {
        startInput.value = promotion.start_at.split(' ')[0];
      }
      if (promotion.end_at) {
        endInput.value = promotion.end_at.split(' ')[0];
      }

      // Deshabilitar búsqueda de producto (no se puede cambiar en edición) y mostrar info
      if (productSearchInput) {
        productSearchInput.disabled = true;
        productSearchInput.value = productName;
      }
      selectedProductBadge.classList.remove('d-none');
      selectedProductBadge.querySelector('.product-name').textContent = productName;
      selectedProductBadge.querySelector('.product-price').textContent = productPrice;
      const removeBtn = selectedProductBadge.querySelector('.btn-remove-product');
      if (removeBtn) removeBtn.style.display = 'none';
      
      // Trigger change para actualizar labels según tipo (con manejadores ya configurados)
      typeSelect.dispatchEvent(new Event('change'));
      suggestInitialText();
    } else {
      // Configurar buscador de productos solo para creación
      this._setupProductSearch(productSearchInput, productIdInput, productResults, selectedProductBadge);
      // Sugerir texto inicial para creación
      typeSelect.dispatchEvent(new Event('change'));
      suggestInitialText();
    }

    // Botón cancelar
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.close());
    }

    // Enviar formulario
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado un producto
        if (!productIdInput.value) {
          showToast('Debe seleccionar un producto', 'error');
          productSearchInput.focus();
          return;
        }

        // Validación HTML5
        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add('was-validated');
          showToast('Por favor, complete todos los campos requeridos', 'error');
          return;
        }

        // Validar fecha fin > fecha inicio
        if (endInput.value && endInput.value < startInput.value) {
          showToast('La fecha de fin debe ser posterior a la de inicio', 'error');
          return;
        }

        // Validar campos NxM si el tipo es nxm
        const promoType = typeSelect.value;
        if (promoType === 'nxm') {
          const nVal = parseInt(nxmNInput.value);
          const mVal = parseInt(nxmMInput.value);
          if (!nVal || nVal < 2) {
            showToast('El valor N (llevás) debe ser al menos 2', 'error');
            nxmNInput.focus();
            return;
          }
          if (!mVal || mVal < 1) {
            showToast('El valor M (pagás) debe ser al menos 1', 'error');
            nxmMInput.focus();
            return;
          }
          if (mVal >= nVal) {
            showToast('El valor M (pagás) debe ser menor que N (llevás)', 'error');
            nxmMInput.focus();
            return;
          }
        }

        // Validar porcentaje (debe ser entero entre 1 y 99)
        if (promoType === 'porcentaje') {
          const percentValue = parseFloat(valueInput.value);
          if (percentValue !== Math.floor(percentValue)) {
            showToast('El porcentaje debe ser un número entero sin decimales', 'error');
            valueInput.focus();
            return;
          }
          if (percentValue < 1 || percentValue >= 100) {
            showToast('El porcentaje debe estar entre 1 y 99', 'error');
            valueInput.focus();
            return;
          }
        }

        // Preparar payload
        // Para nxm: parameter_value = M (cantidad que paga), y guardamos N en visible_text o usamos formato especial
        let parameterValue;
        if (promoType === 'nxm') {
          parameterValue = parseInt(nxmMInput.value);
        } else if (promoType === 'porcentaje') {
          // Asegurar que es entero
          parameterValue = Math.floor(parseFloat(valueInput.value));
        } else {
          parameterValue = parseFloat(valueInput.value);
        }

        const payload = {
          product_id: parseInt(productIdInput.value),
          promotion_type: promoType,
          parameter_value: parameterValue,
          visible_text: textInput.value.trim(),
          start_at: startInput.value ? `${startInput.value} 00:00:00` : null,
          end_at: endInput.value ? `${endInput.value} 23:59:59` : null
        };

        // Para nxm, agregar el valor N como campo adicional
        if (promoType === 'nxm') {
          payload.nxm_n = parseInt(nxmNInput.value);
        }

        // Enviar
        submitBtn.disabled = true;
        const loadingText = isEdit ? 'Guardando...' : 'Creando...';
        const iconClass = isEdit ? 'fa-save' : 'fa-plus';
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${loadingText}`;

        try {
          console.log('Payload promoción:', payload);

          const url = isEdit 
            ? `./api/admin/promociones/${promotion.id}` 
            : './api/admin/promociones';
          const method = isEdit ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          console.log('Respuesta:', response.status, data);

          if (!response.ok) {
            // Extraer mensaje de error del backend (estructura: { ok, data, error: { code, message } })
            const errorMessage = data.error?.message || data.message || `Error al ${isEdit ? 'actualizar' : 'crear'} la promoción`;
            throw new Error(errorMessage);
          }

          const successMsg = isEdit ? 'Promoción actualizada con éxito' : 'Promoción creada con éxito';
          showToast(successMsg, 'success');

          // Cerrar y callback
          setTimeout(() => {
            this.close();
            if (onSuccess) onSuccess(data.data);
          }, 800);

        } catch (error) {
          showToast(error.message, 'error');
          submitBtn.disabled = false;
          const btnText = isEdit ? 'Guardar cambios' : 'Crear promoción';
          const btnIcon = isEdit ? 'fa-save' : 'fa-plus';
          submitBtn.innerHTML = `<i class="fas ${btnIcon} me-1"></i>${btnText}`;
        }
      });
    }
  }

  /**
   * Configura el buscador de productos con autocompletado
   */
  _setupProductSearch(searchInput, hiddenInput, resultsContainer, selectedBadge) {
    if (!searchInput || !hiddenInput || !resultsContainer) return;

    let debounceTimer = null;
    let selectedProduct = null;

    // Buscar productos mientras escribe
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();

      clearTimeout(debounceTimer);

      if (query.length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ search: query, limit: 10 });
          const response = await fetch(`./api/public/productos?${params.toString()}`);
          const data = await response.json();
          const products = data?.data?.products || [];

          if (products.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No se encontraron productos</div>';
          } else {
            resultsContainer.innerHTML = products.map(p => `
              <div class="search-result-item" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-price="${p.base_price}">
                <span class="result-name">${escapeHtml(p.name)}</span>
                <span class="result-price">$${parseFloat(p.base_price).toFixed(2)}</span>
              </div>
            `).join('');
          }
          resultsContainer.classList.add('show');
        } catch (err) {
          console.error('Error buscando productos:', err);
          resultsContainer.innerHTML = '<div class="search-no-results">Error al buscar</div>';
          resultsContainer.classList.add('show');
        }
      }, 300);
    });

    // Seleccionar producto del resultado
    resultsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (!item) return;

      selectedProduct = {
        id: item.dataset.id,
        name: item.dataset.name,
        price: item.dataset.price
      };

      // Actualizar campos
      hiddenInput.value = selectedProduct.id;
      searchInput.value = '';
      searchInput.classList.add('d-none');
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('show');

      // Mostrar badge del producto seleccionado
      if (selectedBadge) {
        selectedBadge.querySelector('.product-name').textContent = selectedProduct.name;
        selectedBadge.querySelector('.product-price').textContent = `$${parseFloat(selectedProduct.price).toFixed(2)}`;
        selectedBadge.classList.remove('d-none');
      }
    });

    // Quitar producto seleccionado
    if (selectedBadge) {
      const removeBtn = selectedBadge.querySelector('.btn-remove-product');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          selectedProduct = null;
          hiddenInput.value = '';
          searchInput.classList.remove('d-none');
          searchInput.value = '';
          searchInput.focus();
          selectedBadge.classList.add('d-none');
        });
      }
    }

    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.remove('show');
      }
    });

    // Cerrar resultados con Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        resultsContainer.classList.remove('show');
      }
    });
  }

  /**
   * Configura los labels dinámicos según el tipo de promoción
   */
  _setupPromotionTypeLabels(typeSelect, valueInput, valueContainer, valueLabel, valueHint, nxmNContainer, nxmMContainer, nxmNInput, nxmMInput, textInput) {
    if (!typeSelect || !valueInput || !valueLabel) return;

    // El texto siempre es editable por el usuario
    textInput.readOnly = false;

    // Función para sugerir texto según el tipo y valor (no bloquea edición)
    const suggestVisibleText = () => {
      const type = typeSelect.value;
      const value = valueInput.value;

      // Solo sugerir si el campo está vacío o tiene un texto auto-generado previo
      const currentText = textInput.value.trim();
      const isAutoGenerated = currentText === '' ||
        currentText.match(/^\d+% OFF$/) ||
        currentText.match(/^Precio especial \$[\d.,]+$/) ||
        currentText.match(/^[23]x[12] - Llevá \d+ y pagá solo \d+$/) ||
        currentText.match(/^\d+x\d+ - Llevá \d+ y pagá solo \d+$/);

      if (!isAutoGenerated) return; // No sobrescribir texto personalizado

      if (type === 'porcentaje' && value) {
        textInput.value = `${value}% OFF`;
      } else if (type === 'precio_fijo' && value) {
        textInput.value = `Precio especial $${parseFloat(value).toLocaleString('es-AR')}`;
      } else if (type === '2x1') {
        textInput.value = '2x1 - Llevá 2 y pagá solo 1';
      } else if (type === '3x2') {
        textInput.value = '3x2 - Llevá 3 y pagá solo 2';
      }
    };

    // Función para sugerir texto NxM
    const suggestNxmText = () => {
      const n = nxmNInput.value;
      const m = nxmMInput.value;

      // Solo sugerir si está vacío o tiene formato auto-generado
      const currentText = textInput.value.trim();
      const isAutoGenerated = currentText === '' ||
        currentText.match(/^\d+x\d+ - Llevá \d+ y pagá solo \d+$/);

      if (!isAutoGenerated) return;

      if (n && m) {
        textInput.value = `${n}x${m} - Llevá ${n} y pagá solo ${m}`;
      }
    };

    const updateLabels = () => {
      const type = typeSelect.value;

      const labels = {
        'porcentaje': 'Porcentaje de descuento',
        'precio_fijo': 'Precio promocional (ARS)',
        '2x1': 'Valor',
        '3x2': 'Valor',
        'nxm': 'Cantidad a pagar (M)'
      };

      const hints = {
        'porcentaje': 'Ej: 15 para 15% de descuento',
        'precio_fijo': 'Ej: 2999.99 precio final',
        '2x1': '',
        '3x2': '',
        'nxm': ''
      };

      const placeholders = {
        'porcentaje': 'Ej: 15',
        'precio_fijo': 'Ej: 2999.99',
        '2x1': '1',
        '3x2': '2',
        'nxm': ''
      };

      // Mostrar/ocultar campos según tipo
      if (type === 'nxm') {
        // Ocultar campo valor estándar
        valueContainer.classList.add('d-none');
        valueInput.removeAttribute('required');
        valueInput.disabled = false;
        // Mostrar campos N y M
        nxmNContainer.classList.remove('d-none');
        nxmMContainer.classList.remove('d-none');
        nxmNInput.setAttribute('required', 'required');
        nxmMInput.setAttribute('required', 'required');
        // Limpiar texto para nueva sugerencia
        textInput.value = '';
      } else if (type === '2x1' || type === '3x2') {
        // Mostrar campo valor pero bloquearlo (no editable)
        valueContainer.classList.remove('d-none');
        valueInput.removeAttribute('required');
        valueInput.disabled = true;
        // Ocultar campos N y M
        nxmNContainer.classList.add('d-none');
        nxmMContainer.classList.add('d-none');
        nxmNInput.removeAttribute('required');
        nxmMInput.removeAttribute('required');
        // Setear valor interno y sugerir texto
        valueInput.value = type === '2x1' ? '1' : '2';
        suggestVisibleText();
      } else {
        // porcentaje o precio_fijo
        valueContainer.classList.remove('d-none');
        valueInput.setAttribute('required', 'required');
        valueInput.disabled = false;
        // Ocultar campos N y M
        nxmNContainer.classList.add('d-none');
        nxmMContainer.classList.add('d-none');
        nxmNInput.removeAttribute('required');
        nxmMInput.removeAttribute('required');
        // Limpiar texto para nueva sugerencia
        textInput.value = '';
        // Sugerir texto si el valor ya existe
        suggestVisibleText();
      }

      valueLabel.innerHTML = `${labels[type] || 'Valor'} <span class="text-danger">*</span>`;
      valueInput.placeholder = placeholders[type] || '';
      valueHint.textContent = hints[type] || '';
      // Porcentaje: paso 1 (entero), resto: 0.01 (decimal)
      if (type === 'porcentaje') {
        valueInput.step = '1';
        valueInput.min = '1';
        valueInput.max = '99';
      } else if (type === 'precio_fijo') {
        valueInput.step = '0.01';
        valueInput.min = '0.01';
        valueInput.removeAttribute('max');
      } else {
        valueInput.step = '1';
        valueInput.min = '0';
        valueInput.removeAttribute('max');
      }
    };

    // Limpiar decimales si es porcentaje
    const cleanPercentageValue = () => {
      if (typeSelect.value === 'porcentaje' && valueInput.value) {
        const intValue = Math.floor(parseFloat(valueInput.value));
        if (intValue >= 1 && intValue <= 99) {
          valueInput.value = intValue;
        }
      }
    };

    // Eventos
    typeSelect.addEventListener('change', updateLabels);
    valueInput.addEventListener('change', cleanPercentageValue);
    valueInput.addEventListener('input', suggestVisibleText);
    nxmNInput.addEventListener('input', suggestNxmText);
    nxmMInput.addEventListener('input', suggestNxmText);
  }

  /**
   * Genera y muestra un QR Code personalizado
   * @param {string} publicCode - Código público del producto
   * @param {HTMLElement|string} container - Donde renderizar el QR
   */
  generateQRCode(publicCode, container) {
    // Verificar que QRCode esté disponible
    if (typeof window.QRCode === 'undefined') {
      console.warn('QRCode library not loaded yet, trying to load from CDN');
      // Intentar cargar dinámicamente
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@latest/build/qrcode.min.js';
      script.onload = () => {
        this.generateQRCode(publicCode, container);
      };
      document.head.appendChild(script);
      return null;
    }

    if (!publicCode) {
      console.error('Invalid publicCode');
      return null;
    }

    // Obtener referencia al contenedor
    let targetContainer = container;
    if (typeof container === 'string') {
      targetContainer = document.getElementById(container);
    }

    if (!targetContainer) {
      console.error('Container not found');
      return null;
    }

    // Limpiar contenedor
    targetContainer.innerHTML = '';

    // Crear canvas para el QR
    const canvas = document.createElement('canvas');
    
    try {
      window.QRCode.toCanvas(canvas, publicCode, {
        width: 140,
        margin: 1,
        color: {
          dark: '#4A0E1A',    // Wine color
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Error generating QR:', error);
          targetContainer.innerHTML = '<p class="text-danger">Error al generar QR</p>';
        }
      });

      targetContainer.appendChild(canvas);
      return canvas;

    } catch (error) {
      console.error('Exception generating QR:', error);
      targetContainer.innerHTML = '<p class="text-danger">Error al generar QR</p>';
      return null;
    }
  }

  /**
   * Muestra un modal con QR Code personalizado y opciones de descarga
   * @param {Object} product - Datos del producto {id, name, public_code}
   */
  async showProductQRModal(product) {
    if (!product || !product.public_code) {
      alert('Código de producto no disponible');
      return;
    }

    const publicCode = product.public_code;

    const qrModalContent = `
      <div class="qr-modal-content">
        <h2 class="qr-modal-title">
          <i class="fas fa-qrcode me-2"></i>Código QR - ${escapeHtml(product.name)}
        </h2>

        <div class="qr-display-container">
          <div id="qr-code-canvas" class="qr-canvas-wrapper"></div>

          <div class="qr-info">
            <p class="qr-code-label"><strong>Código:</strong> ${escapeHtml(publicCode)}</p>
            <p class="qr-description">Escanea este código para ver los detalles del producto.</p>
            <p class="qr-description">¿Problemas el QR?</p>
            <p class="qr-description">Visite <a href="https://www.winepickqr.com" target="_blank" rel="noopener noreferrer">www.winepickqr.com</a> y busque el producto por código o nombre.</p>
          </div>
        </div>

        <div class="qr-modal-actions">
          <button type="button" class="btn-modal btn-modal-primary" id="qr-download-png">
            <i class="fas fa-download me-1"></i>Descargar PNG
          </button>
        </div>
      </div>
    `;

    const modal = this.open('qr-display-modal', qrModalContent, {
      disableClickOutside: false,
      onOpen: (modalElement) => {
        // Generar QR cuando se abre el modal
        this.generateQRCode(publicCode, 'qr-code-canvas');

        // Setup botón descargar
        const downloadBtn = modalElement.querySelector('#qr-download-png');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', () => {
            this._downloadQRAsImage(publicCode);
          });
        }
      },
      onClose: () => {
        // Recargar tabla de productos cuando se cierre el modal de QR
        if (window.adminView && typeof window.adminView.loadProducts === 'function') {
          window.adminView.loadProducts();
        }
      }
    });
  }

  /**
   * Descarga el QR Code como imagen PNG
   * @param {string} publicCode - Código público del producto
   */
  _downloadQRAsImage(publicCode) {
    if (typeof window.QRCode === 'undefined') {
      alert('Librería QR no disponible');
      return;
    }

    try {
      // Canvas base del QR
      const qrCanvas = document.createElement('canvas');
      const qrSize = 384; // +50% sobre 256
      const padding = 36; // +50% sobre 24
      const textColor = '#4A0E1A';
      const helperColor = '#333333';
      const bgColor = '#FFFFFF';

      // Generar el QR base
      window.QRCode.toCanvas(qrCanvas, publicCode, {
        width: qrSize,
        margin: 2,
        color: {
          dark: textColor,
          light: bgColor
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Error generating QR for download:', error);
          alert('Error al generar QR para descarga');
          return;
        }

        // Canvas final con texto
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');

        const finalWidth = qrSize + padding * 2; // 256 + 48 = 304
        const qrTop = padding; // 36
        const codeText = `Código: ${publicCode}`;
        const helperText1 = '¿Problemas con el QR?';
        const helperText2 = 'Visite www.winepickqr.com y busque el producto por código o nombre.';

        // Calcular alto necesario con wrap
        const lineHeight = 24;
        const maxTextWidth = finalWidth - padding * 2;

        const wrapText = (text, maxWidth, font) => {
          ctx.font = font;
          const words = text.split(' ');
          const lines = [];
          let line = '';
          words.forEach((word) => {
            const testLine = line ? `${line} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line) {
              lines.push(line);
              line = word;
            } else {
              line = testLine;
            }
          });
          if (line) lines.push(line);
          return lines;
        };

        const codeLines = wrapText(codeText, maxTextWidth, 'bold 35px "Segoe UI", Arial, sans-serif');
        const helperLines1 = wrapText(helperText1, maxTextWidth, '17px "Segoe UI", Arial, sans-serif');
        const helperLines2 = wrapText(helperText2, maxTextWidth, '17px "Segoe UI", Arial, sans-serif');

        const textBlockHeight = (codeLines.length * lineHeight) + (helperLines1.length * lineHeight) + (helperLines2.length * lineHeight) + padding; // extra padding bajo el QR
        const finalHeight = qrTop + qrSize + padding + textBlockHeight;

        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        // Fondo
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // QR centrado
        const qrX = (finalWidth - qrSize) / 2;
        ctx.drawImage(qrCanvas, qrX, qrTop, qrSize, qrSize);

        // Código público
        let currentY = qrTop + qrSize + padding;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.font = 'bold 35px "Segoe UI", Arial, sans-serif';
        codeLines.forEach((line) => {
          ctx.fillText(line, finalWidth / 2, currentY);
          currentY += lineHeight;
        });

        // Texto de ayuda - Parágrafo 1
        ctx.fillStyle = helperColor;
        ctx.font = '17px "Segoe UI", Arial, sans-serif';
        helperLines1.forEach((line) => {
          ctx.fillText(line, finalWidth / 2, currentY);
          currentY += lineHeight;
        });

        // Texto de ayuda - Parágrafo 2
        helperLines2.forEach((line) => {
          ctx.fillText(line, finalWidth / 2, currentY);
          currentY += lineHeight;
        });

        // Descargar PNG
        finalCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `QR-${publicCode}-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Exception downloading QR:', error);
      alert('Error al descargar QR');
    }
  }
}

// Singleton
export const modalManager = new ModalManager();
