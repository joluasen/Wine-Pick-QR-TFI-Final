# Paquete de Entrega (deploy)

**URL Producción:** `http://localhost/proyectos/Wine-Pick-QR-TFI` (entorno local XAMPP) | Producción: `https://imperialsoft.site/projects/winepickqr/`
**Usuario demo:** Admin / Admin2026!

> **Importante:** Cambiar la contraseña del administrador antes de usar en producción.

---

## Manual de usuario

### Módulo público (clientes)

**Consultar producto por QR:**

1. Abrir la cámara del celular y apuntar al código QR del producto
2. Tocar la notificación para abrir el enlace
3. Ver la ficha con precio final y promoción (si aplica)

**Alternativa desde la app:**

1. Abrir la web → tocar botón flotante QR → permitir cámara → escanear → ficha del producto

**Consultar por búsqueda:**

1. Escribir en el buscador (nombre o codigo del producto)
2. Seleccionar producto de las sugerencias
3. Ver ficha con precio y promoción

**Ver promociones:** Menú → Promociones → listado de productos con descuento activo

### Módulo administrador

**Login:** Menú → Admin → ingresar usuario y contraseña

**Gestionar productos:**

- Crear: Productos → Nuevo producto → completar formulario → Guardar (se genera QR automático)
- Editar: Buscar producto → Editar → modificar → Guardar
- Eliminar: Buscar producto → Eliminar → confirmar (eliminación física)

**Gestionar promociones:**

- Crear: Promociones → Nueva → seleccionar producto → tipo (%, fijo, 2x1, 3x2, NxM) → fechas → Guardar
- Nota: No se permite superposición de promociones en el mismo período
- Eliminar: Buscar promo → Eliminar → confirmar (eliminación física)

**Ver métricas:** Métricas → ranking de productos más consultados → gráfico por día → filtro 7/30/90 días

---

## Manual técnico corto

### Infra/ENV

| Componente | Versión                       |
| ---------- | ----------------------------- |
| PHP        | 8.0+                          |
| MySQL      | 5.7+ / 8.0                    |
| Apache     | 2.4+ (mod_rewrite habilitado) |

**Módulos PHP:** pdo_mysql, json, mbstring

**Variables de entorno (.env):**

```env
WPQ_ENV=prod
DB_HOST=localhost
DB_NAME=wine_pick_qr
DB_USER=usuario_db
DB_PASS=contraseña_segura
DB_CHARSET=utf8mb4
BASE_URL=https://tudominio.com
JWT_SECRET=clave_secreta_minimo_32_caracteres
```

### Jobs/Crons

No se requieren jobs programados. Las promociones se activan/desactivan automáticamente por fecha mediante consulta en tiempo real.

### Backup/Restore

**Backup:**

```bash
mysqldump -u usuario -p wine_pick_qr > backup_$(date +%Y%m%d).sql
```

**Restore:**

```bash
mysql -u usuario -p wine_pick_qr < backup_20260201.sql
```

**Archivos a respaldar:** BD (dump SQL), `public/uploads/` (imágenes), `.env`
**Frecuencia:** BD diario, archivos semanal

### Monitoreo

**Verificación de salud:**

```bash
curl -s https://tudominio.com/api/public/productos?search=test | jq .ok
# Debe retornar: true
```

**Logs:** Desarrollo: `logs/debug.log` | Producción: logs de Apache

**Problemas comunes:**
| Problema | Solución |
|----------|----------|
| Error 500 | Verificar permisos y versión PHP |
| Login no funciona | Configurar JWT_SECRET en .env |
| QR no escanea | Verificar BASE_URL en .env |

---

**Plan de soporte (SLA, canales):** Corrección de errores críticos. Contacto vía repositorio (issues) o email del desarrollador.

**Licencia / Propiedad / Confidencialidad:** Proyecto académico desarrollado para el Trabajo Final Integrador de la Tecnicatura Universitaria en Programación (UTN). Autores: Rusch Esteban Alberto (Legajo: 17873), Jorge Asensio.
