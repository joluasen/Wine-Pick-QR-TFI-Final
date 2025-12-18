<?php
/**
 * Vista de Promociones para Admin
 */
header('Content-Type: text/html; charset=utf-8');
?>
<section data-view="admin-promotions">
	<h2>Gestión de Promociones</h2>
	<div class="d-none d-md-block mb-4">
		<button id="btn-new-promo" class="btn btn-primary">Crear nueva promoción</button>
	</div>
	<div id="admin-promos-status" aria-live="polite"></div>
	<div class="table-responsive d-none d-md-block">
		<table class="table align-middle shadow rounded-4 overflow-hidden" id="admin-promos-table" style="background: #fff; border-radius: 1.2rem; font-size: 0.97rem;">
			<thead style="background: #7a003c; color: #fff;">
				<tr>
					<th style="border-top-left-radius: 1.2rem;">ID</th>
					<th>Producto</th>
					<th>Tipo</th>
					<th>Valor</th>
					<th>Texto</th>
					<th>Inicio</th>
					<th>Fin</th>
					<th>Estado</th>
					<th style="border-top-right-radius: 1.2rem;">Acciones</th>
				</tr>
			</thead>
			<tbody style="background: #fff;">
				<tr><td colspan="9">Cargando...</td></tr>
			</tbody>
		</table>
	</div>
	<style>
	#admin-promos-table th, #admin-promos-table td {
		vertical-align: middle;
		text-align: center;
		padding: 0.45rem 0.4rem;
		border-right: 1px solid #e5e5e5;
	}
	#admin-promos-table th:last-child, #admin-promos-table td:last-child {
		border-right: none;
	}
	#admin-promos-table tbody tr {
		transition: background 0.15s;
	}
	#admin-promos-table tbody tr:hover {
		background: #f8e6ef;
	}
	#admin-promos-table td {
		border-bottom: 1px solid #f3d6e6;
	}
	#admin-promos-table th {
		font-weight: 600;
		letter-spacing: 0.03em;
		font-size: 1rem;
	}
	#admin-promos-table .btn {
		font-size: 0.92rem;
		padding: 0.25rem 0.7rem;
		border-radius: 0.5rem;
		margin: 0 0.1rem 0.1rem 0;
		min-width: 70px;
		box-shadow: none;
	}
	#admin-promos-table .btn-primary, #admin-promos-table .btn-danger, #admin-promos-table .btn-secondary {
		font-weight: 500;
	}
	#admin-promos-table td:last-child {
		white-space: nowrap;
	}
	</style>
	<div id="admin-promos-pagination" class="d-none d-md-block"></div>
</section>