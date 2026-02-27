# Manual de Usuario – WINE-PICK-QR

Manual práctico de uso para clientes y administradores. Explica paso a paso cómo consultar productos, gestionar el catálogo y revisar métricas, con ejemplos y recomendaciones concretas.

## Índice
1. Introducción
2. Acceso a la aplicación
3. Uso para clientes (módulo público)
   - Consultar producto por QR
   - Buscar productos por texto
   - Ver promociones
4. Uso para administradores (módulo admin)
   - Iniciar sesión
   - Crear, editar y eliminar productos
   - Gestionar promociones
   - Consultar métricas
   - Cerrar sesión
5. Preguntas frecuentes (FAQ)
6. Soporte y contacto

---

## 1. Introducción
WINE-PICK-QR es una aplicación web progresiva (PWA) diseñada para agilizar y mejorar la experiencia en vinotecas. Permite a los clientes consultar información de productos y promociones mediante códigos QR o búsqueda por texto, y a los administradores gestionar el catálogo, promociones y métricas de uso.

**¿Qué es una PWA?**
Una PWA (Progressive Web App) es una aplicación web que puedes abrir en el navegador y también instalar en tu celular. Carga rápido, es segura y se usa igual que una app nativa.

**¿A quién está dirigido este manual?**
- Clientes de la vinoteca que deseen consultar productos y promociones.
- Administradores encargados de gestionar el sistema.

## 2. Acceso a la aplicación

### 2.1. Requisitos mínimos
- Navegador actualizado (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para la mayoría de las funciones)
- Cámara en el dispositivo (para escanear QR)

### 2.2. Acceso desde celular
1. Escanee cualquier QR de producto con la cámara de su celular.
2. Toque la notificación o enlace que aparece para abrir el QR y será redirigido a la ficha del producto.
3. Alternativamente, ingrese la URL proporcionada por la vinoteca en su navegador y utilice el buscador superior; basta con ingresar el código del producto para visualizar la ficha.

### 2.3. Acceso desde PC
1. Ingrese la URL de la aplicación en su navegador preferido.
2. Puede navegar, buscar productos, ver promociones y acceder al panel de administración si tiene permisos.

### 2.4. Instalación como app (opcional)
**Compatibilidad:** La instalación como PWA funciona en navegadores con motor Chromium (Chrome, Edge, Brave, Opera). En Firefox, la opción de instalar PWA no está disponible.

1. Abra la aplicación en un navegador compatible.
2. Toque el botón "Instalar app" ubicado en el header, junto al buscador (solo aparece en navegadores compatibles).
3. Siga las instrucciones para instalar la PWA en su dispositivo. Al finalizar, WINE-PICK-QR quedará instalada y visible en la pantalla de inicio, lista para consultar productos, promociones o realizar tareas de administración al instante.

**Ventajas de instalar la app:** acceso más rápido, experiencia similar a una app nativa, icono en la pantalla de inicio.

## 3. Uso para clientes (módulo público)

El módulo público está pensado para que cualquier cliente pueda consultar productos y promociones de manera rápida y sencilla, sin necesidad de registrarse.

### 3.1. Consultar producto por QR
1. Abra la cámara de su celular y apunte al código QR pegado en la botella o estante.
2. Toque la notificación o enlace que aparece en pantalla.
3. Se abrirá automáticamente la ficha del producto, mostrando:
  - Imagen, nombre, tipo de bebida, bodega, origen, varietal
  - Descripción, precio de referencia
  - Promoción vigente (si existe)

**Ejemplo:** Si escanea el QR de un vino Malbec Clasico 750ml, verá su ficha con precio, descripción y si tiene descuento.

**Sugerencia:** Si su cámara no reconoce el QR, puede usar la función de escaneo dentro de la app (botón flotante QR) o utilizar el buscador.

#### Escanear QR desde la app
1. Ingrese a la web y toque el botón central flotante con ícono de QR.
2. Permita el acceso a la cámara si se lo solicita.
3. Escanee el código QR y acceda a la ficha del producto.

### 3.2. Buscar productos por texto
1. Ingrese al sitio web desde cualquier dispositivo.
2. Escriba el código o nombre del producto (mínimo 2 caracteres).
3. Opcionalmente, use los filtros para refinar la búsqueda: bodega, origen, varietal, tipo de bebida o año de cosecha. Marque los filtros que desee aplicar.
4. El sistema mostrará sugerencias en tiempo real.
5. Seleccione un producto de la lista para ver su ficha completa.

**Ejemplo:** Escriba "Malbec" y verá todos los vinos Malbec disponibles.

**¿No encuentra el producto?** Si no hay resultados, revise la ortografía o consulte con el personal.

### 3.3. Ver promociones
1. Desde el menú principal, seleccione "Promociones".
2. Se mostrará un listado de productos con descuentos activos, tipo de promoción y vigencia.

**Tipos de promoción:** porcentaje de descuento, precio fijo, 2x1, 3x2, NxM.

**Detalle:** Al seleccionar un producto en promoción, verá el precio original tachado y el precio final con descuento.

## 4. Uso para administradores (módulo admin)

El módulo de administración está protegido y solo accesible para usuarios autorizados. Permite gestionar el catálogo, promociones y consultar métricas.

### 4.1. Iniciar sesión
1. Desde el menú principal, seleccione "Admin".
2. Ingrese su usuario y contraseña (proporcionados por el responsable del sistema).
3. Si los datos son correctos, accederá al panel de administración.

**Recomendación:** Cambie la contraseña la primera vez que acceda desde la sección de perfil.

### 4.2. Crear, editar y eliminar productos

#### Crear producto
1. Ingrese a "Productos" > "Nuevo producto".
2. Complete los campos obligatorios: código, nombre, tipo, bodega y precio. Los campos opcionales (varietal, año de cosecha, descripción, imagen) pueden dejarse en blanco.
3. Guarde el producto. El sistema generará automáticamente un código QR único para ese producto.
4. Puede descargar o imprimir el QR para pegarlo en la góndola o botella.

#### Editar producto
1. Busque el producto en el listado o usando el buscador.
2. Seleccione "Editar" y modifique los datos necesarios.
3. Guarde los cambios. La información editada se reflejará de inmediato en la ficha pública del producto, disponible para todos los usuarios. Puede volver a editar el producto en cualquier momento o verificar la actualización accediendo a la ficha desde el buscador o escaneando el QR correspondiente.

#### Eliminar producto
1. Busque el producto y seleccione "Eliminar".
2. Confirme la eliminación. El producto sera eliminado de la base de datos.

**Nota:** La eliminación es física, no se puede recuperar el producto una vez eliminado.

### 4.3. Gestionar promociones

#### Crear promoción
1. Ingrese a "Promociones" > "Nueva promoción".
2. Complete los datos: producto, tipo de promoción (porcentaje, precio fijo, 2x1, etc.), valor, texto de la promocion, fechas de inicio y fin.
3. Guarde la promoción. El sistema validará que no haya superposición de promociones para el mismo producto.

#### Editar o eliminar promoción
1. Busque la promoción en el listado.
2. Seleccione "Editar" para modificar datos o "Eliminar" para quitar la promoción.

**Importante:** No se permite más de una promoción activa por producto en el mismo período.

### 4.4. Consultar métricas
1. Ingrese a "Métricas" desde el panel admin.
2. Visualice gráficos y rankings de productos más consultados.
3. Puede filtrar los datos por período (últimos 7, 30 o 90 días).
4. Analice el canal de consulta (QR o búsqueda) y tome decisiones comerciales.

**Ejemplo de uso:** Si un producto es muy consultado pero no se vende, considere ajustar su promoción.

### 4.5. Cerrar sesión
1. Desde el menú admin, seleccione "Cerrar sesión" para salir de la administración de forma segura.

**Importante:** Por seguridad, la sesión se cerrará automáticamente después de 30 minutos. Si esto ocurre, deberá volver a iniciar sesión para continuar utilizando el panel de administración.

**Recomendación:** Cierre siempre la sesión al terminar para proteger la información.

## 5. Preguntas frecuentes (FAQ)

**¿Necesito instalar algo?**
No, la app funciona directamente desde el navegador. Si lo desea, puede instalarla como PWA para un acceso más rápido.

**¿Qué hago si un QR no funciona?**
Verifique que la cámara esté enfocando bien el código y que el QR no esté dañado. Si persiste el problema, use la búsqueda por texto o consulte con el personal de la vinoteca.

**¿Cómo recupero mi contraseña admin?**
Por seguridad, solo el responsable del sistema puede restablecer contraseñas. Contacte a soporte.

**¿Puedo usar la app sin internet?**
No. Se recomienda usarla siempre con acceso a internet.

**¿Qué navegadores son compatibles?**
Chrome, Firefox, Edge, Safari y navegadores móviles modernos.

**¿Puedo exportar métricas o productos?**
Actualmente no, pero está previsto para futuras versiones.

## 6. Soporte y contacto

Para soporte técnico, dudas o sugerencias:
- Email: winepickqr@info.com

**Recomendación:** Ante cualquier inconveniente, documente el error (captura de pantalla, mensaje recibido) y envíelo al soporte para una solución más rápida.

---

**Versión del manual:** 1.1 – Enero 2026
**Autores:** Rusch Esteban, Jorge Asensio
**Sugerencia:** Imprima este manual o guárdelo en PDF para consulta offline.
