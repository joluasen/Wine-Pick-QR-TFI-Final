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
    this.open('product-modal', content);
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
          <!-- Sección de imagen -->
          <div class="form-image-section">
            <label class="form-label">Imagen del producto</label>
            <div class="image-upload-container">
              <div class="image-preview-box" id="${isEdit ? 'edit' : 'create'}-image-display">
                ${imageUrl
                  ? `<img src="${escapeHtml(imageUrl)}" alt="Producto" class="image-preview-thumb" id="current-product-image">`
                  : `<div class="image-placeholder">
                       <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                         <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                         <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                         <line x1="12" y1="22.08" x2="12" y2="12"></line>
                       </svg>
                     </div>`
                }
              </div>
              <div class="image-upload-actions">
                <div>
                  <h5>${imageUrl ? 'Cambiar imagen' : 'Agregar imagen'}</h5>
                  <p>Seleccione una foto que represente el producto</p>
                </div>
                <input
                  type="file"
                  id="${isEdit ? 'edit' : 'create'}-product-image"
                  accept="image/jpeg,image/png,image/webp"
                  class="d-none"
                >
                <button type="button" class="btn-upload-image" id="${isEdit ? 'edit' : 'create'}-select-image-btn">
                  <i class="fas fa-upload"></i>${imageUrl ? 'Cambiar' : 'Seleccionar archivo'}
                </button>
                <p class="form-text mb-0">
                  <i class="fas fa-info-circle"></i>JPG, PNG o WebP · Máximo 5MB
                </p>
              </div>
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
              ${isEdit ? 'readonly title="El código no puede modificarse"' : 'required pattern="[A-Z0-9\\\\-]+" placeholder="Ej: MALBEC-2021-001"'}
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
            <select class="form-select" id="${isEdit ? 'edit' : 'create'}-drink-type" name="drink_type" required>
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
            <div class="input-group">
              <span class="input-group-text">$</span>
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
            </div>
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

    // Seleccionar imagen
    if (selectImageBtn && imageInput) {
      selectImageBtn.addEventListener('click', () => imageInput.click());

      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          this.showFormStatus(statusEl, 'Solo se permiten imágenes JPG, PNG o WebP', 'error');
          return;
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.showFormStatus(statusEl, 'La imagen no debe superar 5MB', 'error');
          return;
        }

        // Preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
          imageDisplay.innerHTML = `<img src="${e.target.result}" alt="Preview" class="image-preview-thumb">`;
        };
        reader.readAsDataURL(file);

        // Subir imagen al servidor
        this.showFormStatus(statusEl, 'Subiendo imagen...', 'info');
        selectImageBtn.disabled = true;
        selectImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Subiendo...';

        try {
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('./api/admin/upload/product-image', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error al subir la imagen');
          }

          uploadedImageUrl = data.data.url;
          hasChangedImage = true;

          // Actualizar preview con la URL del servidor
          imageDisplay.innerHTML = `<img src="${uploadedImageUrl}" alt="Producto" class="image-preview-thumb">`;

          this.showFormStatus(statusEl, 'Imagen subida correctamente', 'success');
          selectImageBtn.innerHTML = '<i class="fas fa-upload"></i>Cambiar';

        } catch (error) {
          this.showFormStatus(statusEl, `Error al subir imagen: ${error.message}`, 'error');
          imageDisplay.innerHTML = `
            <div class="image-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          `;
          uploadedImageUrl = null;
          selectImageBtn.innerHTML = '<i class="fas fa-upload"></i>Seleccionar archivo';
        } finally {
          selectImageBtn.disabled = false;
        }
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
          this.showFormStatus(statusEl, 'Por favor, complete todos los campos requeridos', 'error');
          return;
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

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${actionText}...`;
    this.showFormStatus(statusEl, `${actionText} producto...`, 'info');

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el producto`);
      }

      this.showFormStatus(statusEl, successText, 'success');

      // Esperar un momento y cerrar
      setTimeout(() => {
        this.close();
        if (onSuccess) onSuccess(data.data);
      }, 1000);

    } catch (error) {
      this.showFormStatus(statusEl, `Error: ${error.message}`, 'error');
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
}

// Singleton
export const modalManager = new ModalManager();
