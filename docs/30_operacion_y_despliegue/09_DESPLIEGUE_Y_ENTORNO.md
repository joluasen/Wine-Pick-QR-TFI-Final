# Despliegue y entorno – WINE-PICK-QR

## 1. Objetivo

Describir cómo ejecutar y desplegar WINE-PICK-QR tanto en entorno local de desarrollo como en un entorno de demo/producción accesible para la cátedra del TFI.

## 2. Arquitectura de despliegue (vista general)

- **Frontend (PWA):**  
  Aplicación web estática (HTML, CSS, JavaScript) servida por el mismo servidor web que el backend.

- **Backend (API REST):**  
  Implementado en PHP siguiendo un patrón MVC simple o similar, respondiendo a rutas `/api/public/...` y `/api/admin/...`.

- **Base de datos:**  
  Base de datos relacional (MySQL/MariaDB) con tablas para productos, promociones, eventos de consulta y usuarios administradores.

- **Servidor web:**  
  Servidor web Apache (por ejemplo, entorno XAMPP en desarrollo y hosting compartido o similar en demo).

## 3. Entorno local de desarrollo

### 3.1. Requisitos

- Sistema operativo: Windows / Linux / macOS.
- Servidor web + PHP + MySQL (por ejemplo, XAMPP, WAMP o stack equivalente).
- Navegador moderno (Chrome, Firefox, Edge, etc.).
- Git instalado para clonar el repositorio.

### 3.2. Pasos de instalación local

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/usuario/WINE-PICK-QR.git
   ```

2. **Ubicar el código en el servidor web local:**

   - Copiar la carpeta del proyecto dentro del directorio `htdocs` (o equivalente) de XAMPP.
   - Por ejemplo: `C:\xampp\htdocs\wine-pick-qr` o `/opt/lampp/htdocs/wine-pick-qr`.

3. **Configurar la base de datos:**

   - Crear una base de datos (por ejemplo, `winepickqr`) en MySQL.
   - Ejecutar el script SQL de creación de tablas y datos iniciales (`database.sql` o similar).
   - Configurar usuario/contraseña de base de datos para el entorno local.

4. **Configurar parámetros de conexión:**

   - Editar el archivo de configuración del backend (por ejemplo, `config/db.php` o similar) con:
     - Nombre de host.
     - Nombre de base de datos.
     - Usuario y contraseña.

5. **Acceder a la aplicación:**

   - Abrir el navegador y acceder a la URL local, por ejemplo:
     - `http://localhost/wine-pick-qr/`.
   - Acceder al panel de administración mediante la ruta definida (por ejemplo, `http://localhost/wine-pick-qr/admin/`).

### 3.3. Datos de prueba

- Crear un usuario administrador de prueba (por script SQL o formulario de alta inicial).
- Insertar productos de ejemplo para:
  - Vinos de distintos tipos y bodegas.
  - Algunas bebidas espirituosas.
- Definir 1–2 promociones simples de prueba.

Estos datos podrán ser ajustados según las necesidades de demostración del TFI.

## 4. Entorno de demo / producción

### 4.1. Hosting sugerido

- Hosting compartido con soporte para:
  - PHP (versión configurada acorde al proyecto).
  - MySQL/MariaDB.
- Acceso vía FTP o panel de control para desplegar archivos.

### 4.2. Pasos de despliegue en hosting

1. **Subir el código fuente:**
   - Copiar el contenido del proyecto (excluyendo archivos de desarrollo que no sean necesarios) al directorio público del hosting.

2. **Configurar base de datos en el hosting:**
   - Crear base de datos y usuario desde el panel del proveedor.
   - Importar el script SQL de estructura y datos básicos.
   - Ajustar credenciales de conexión en el archivo de configuración del backend.

3. **Verificar rutas y URLs:**
   - Ajustar cualquier ruta base de la aplicación si es necesario (por ejemplo, `/wine-pick-qr/`).
   - Probar las rutas principales:
     - Página de inicio.
     - Fichas de producto de ejemplo.
     - Panel de administración.

4. **Pruebas de humo en producción:**
   - Confirmar que se puede:
     - Ver fichas de producto.
     - Iniciar sesión como administrador.
     - Crear/editar un producto.
     - Crear una promoción simple.
     - Ver algún reporte de métricas si ya hay consultas registradas.

### 4.3. Consideraciones de seguridad básicas

- Cambiar contraseñas por defecto de usuarios admin antes de exponer la demo.
- Evitar mostrar datos sensible o reales de negocios sin autorización.
- Revisar permisos de archivos y directorios (según el proveedor).

## 5. Gestión de versiones y releases

- Utilizar **tags** en Git para marcar hitos importantes:
  - `v0.1-mvp`: primera versión funcional con consulta por QR y búsqueda.
  - `v0.9-pre-tfi`: versión para pruebas y ajustes.
  - `v1.0-tfi`: versión que se muestra en el video y en la defensa.

- El video obligatorio del TFI debe:
  - Indicar claramente qué versión del sistema se está mostrando.
  - Tener asociado en la descripción o documentación el tag o hash de commit correspondiente.

## 6. Respaldo y restauración de datos

- Para el entorno de demo:
  - Realizar periódicamente un **backup de la base de datos** (dump SQL).
  - Conservar una copia del código fuente correspondiente al release mostrado en la defensa.

- Proceso de restauración:
  1. Restaurar la base de datos desde el backup.
  2. Asegurar que el código fuente corresponde a la misma versión del esquema.
  3. Verificar el acceso a la aplicación.

## 7. Relación con otros documentos

- `ARQUITECTURA_TECNICA.md` – profundiza en la estructura de componentes.
- `BASE_DE_DATOS_MER.md` – describe el esquema de base de datos.
- `07_PRUEBAS_Y_CALIDAD.md` – indica cómo se probará la aplicación en cada entorno.
- `10_INFORME_FINAL_TFI.md` – documentará el estado final del despliegue y los resultados de su uso.
