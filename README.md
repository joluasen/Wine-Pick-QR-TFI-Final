# Wine-Pick-QR

Aplicación web progresiva (PWA) para vinotecas, que permite a los clientes consultar precios y promociones de productos mediante códigos QR o búsqueda por texto, sin necesidad de instalar una app. Incluye un panel de administración para gestionar el catálogo y visualizar métricas de consultas.

## Resumen del proyecto

- Permite digitalizar la consulta de precios y promociones en vinotecas.
- Elimina la dependencia de cartelería física y reduce errores en caja.
- Captura métricas de interés sobre productos más consultados.

## Características principales

- Lectura de códigos QR (compatible con cámara de celular)
- Búsqueda por nombre, bodega, varietal u origen
- Ficha de producto con precio actualizado en tiempo real
- Panel de administración (CRUD de productos y promociones)
- Validación de superposición de promociones
- Tipos de promoción: porcentaje, precio fijo, 2x1, 3x2, NxM
- Métricas de productos más consultados (últimos 7/30/90 días)
- Diferenciación de consultas por canal (QR vs búsqueda)
- Instalación como PWA desde el navegador

## Tecnologías utilizadas

- Frontend: HTML5, CSS3, Bootstrap 5, JavaScript (ES Modules)
- Backend: PHP 8.x (MVC), API REST (JSON)
- Base de datos: MySQL 8.x
- Seguridad: JWT, password_hash, prepared statements
- Librerías: html5-qrcode, Chart.js

## Instalación y ejecución

1. Clona el repositorio:
   ```bash
   git clone https://github.com/EstebanRsh/Wine-Pick-QR-TFI.git
   ```
2. Configura el entorno en `config/config.php` y las variables necesarias.
3. Importa la base de datos desde `database/database.sql`.
4. Asegúrate de tener PHP 8.x y MySQL 8.x instalados.
5. Inicia el servidor local (por ejemplo, usando XAMPP o similar):
   - Carpeta pública: `public/`
6. Accede a la app desde tu navegador en `http://localhost/[ruta]/public/`

## Estructura de carpetas

- `app/` — Controladores, modelos y utilidades PHP
- `public/` — Archivos públicos, assets, JS, CSS y punto de entrada
- `database/` — Scripts SQL para la base de datos
- `config/` — Configuración de la app
- `templates/` — Documentación y plantillas del proyecto

## Variables de entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables mínimas:

```env
DB_HOST=localhost
DB_NAME=winepick
DB_USER=usuario
DB_PASS=contraseña
JWT_SECRET=tu_clave_secreta
```

Reemplaza los valores según tu configuración local. No subas el archivo .env al repositorio.

## Créditos

- Esteban Rusch — Desarrollador
- Jorge Asencio — Desarrollador

Proyecto académico para TFI — UTN (2025-2026)

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más información.
