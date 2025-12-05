# Manual de Usuario (borrador)

## Consulta por QR (HU-C1)

1. Abrir la PWA y navegar a la opción "Consulta por QR".
2. Ingresar el código público del producto (el mismo que figura en el QR) y presionar "Consultar".
3. Estados posibles:
	- **Cargando**: se muestra mientras se consulta la API.
	- **Producto encontrado**: se despliega la ficha con nombre, bodega/marca, tipo/varietal, precio y descripción.
	- **Producto no disponible / código inválido**: aparece un mensaje claro si el código no existe o el producto está desactivado.
	- **Error de red/servidor**: se indica el problema y se puede reintentar.

Notas:
- El formulario acepta ingresar manualmente el código; el escaneo por cámara se podrá activar en futuras versiones.
- Los datos provienen del endpoint público `GET /api/public/productos/{codigo}`.
