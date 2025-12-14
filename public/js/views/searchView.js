// Vista de búsqueda: búsqueda avanzada con paginación
let currentPage = 0;
let lastQuery = '';
const PAGE_SIZE = 20;

function renderResults(container, products, total, page) {
	container.innerHTML = '';
	const resultsDiv = document.createElement('div');
	resultsDiv.className = 'search-results-grid';
	if (products.length === 0) {
		resultsDiv.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">No se encontraron productos para tu búsqueda.</p>';
	} else {
		products.forEach(product => {
			const card = document.createElement('div');
			card.className = 'search-result-card';
			card.style.cursor = 'pointer';
			card.innerHTML = `
				<h4>${product.name || 'Producto'}</h4>
				<p><strong>Bodega:</strong> ${product.winery_distillery || '—'}</p>
				<p><strong>Precio:</strong> <span style="color: #d4af37; font-weight: bold;">$${product.final_price.toFixed(2)}</span></p>
				<p><small>Código: ${product.public_code}</small></p>
			`;
			card.addEventListener('click', () => {
				window.location.hash = `#qr?code=${encodeURIComponent(product.public_code)}`;
			});
			resultsDiv.appendChild(card);
		});
	}
	container.appendChild(resultsDiv);

	// Paginación
	const pagDiv = document.createElement('div');
	pagDiv.style.display = 'flex';
	pagDiv.style.justifyContent = 'center';
	pagDiv.style.gap = '1rem';
	pagDiv.style.marginTop = '2rem';
	if (page > 0) {
		const prevBtn = document.createElement('button');
		prevBtn.textContent = '← Anterior';
		prevBtn.onclick = () => loadResults(container, lastQuery, page - 1);
		pagDiv.appendChild(prevBtn);
	}
	if ((page + 1) * PAGE_SIZE < total) {
		const nextBtn = document.createElement('button');
		nextBtn.textContent = 'Siguiente →';
		nextBtn.onclick = () => loadResults(container, lastQuery, page + 1);
		pagDiv.appendChild(nextBtn);
	}
	if (total > PAGE_SIZE) {
		const info = document.createElement('span');
		info.textContent = `Página ${page + 1} de ${Math.ceil(total / PAGE_SIZE)}`;
		pagDiv.appendChild(info);
	}
	container.appendChild(pagDiv);
}

function loadResults(container, query, page = 0) {
	lastQuery = query;
	currentPage = page;
	container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Buscando...</p>';
	fetch('./api/public/productos/buscar', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
		body: JSON.stringify({ search: query, limit: PAGE_SIZE, offset: page * PAGE_SIZE })
	})
		.then(res => res.json())
		.then(json => {
			if (!json.ok) throw new Error(json.error?.message || 'Error en la búsqueda');
			renderResults(container, json.data.products, json.data.total, page);
		})
		.catch(err => {
			container.innerHTML = `<p style="color:red;text-align:center;padding:2rem;">${err.message}</p>`;
		});
}

export function initSearchView(container) {
	// Leer el término de búsqueda desde la URL (#search?query=valor)
	let query = '';
	const hash = window.location.hash || '';
	// Extraer parámetros del hash como si fuera una query string
	const params = {};
	if (hash.includes('?')) {
		const paramString = hash.split('?')[1];
		paramString.split('&').forEach(pair => {
			const [key, value] = pair.split('=');
			if (key) params[key] = decodeURIComponent(value || '');
		});
	}
	query = params.query || '';
	console.log('[initSearchView] hash:', hash, '| query extraído:', query);
	if (!query) {
		container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem;">Escribe algo en el buscador para comenzar.</p>';
		return;
	}
	loadResults(container, query, 0);
}
