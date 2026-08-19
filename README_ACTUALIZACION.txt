PARTNERS CORP — ACTUALIZACIÓN 2026
==================================

Esta versión mantiene la conexión actual con Supabase y NO requiere ejecutar un SQL nuevo.

CAMBIOS PRINCIPALES
-------------------
1. Rediseño completo en negro + dorado con una estética más elegante y moderna.
2. Se mantienen las imágenes originales de Home:
   - hero.jpg
   - hombres.jpg
   - mujeres.jpg
   - promotores.webp
   - logo.png
3. Home renovada:
   - Hero nuevo.
   - Categorías rediseñadas.
   - Sección de beneficios.
   - Proceso de contratación.
   - Botones independientes para cotizar talento y postularse.
4. Páginas de talentos:
   - Tarjetas verticales 4:5.
   - Distintivo Premium.
   - Buscador por nombre, ciudad o especialidad.
   - Orden por destacados, precio o nombre.
   - Modal de perfil mejorado.
   - Mensaje de WhatsApp más claro.
5. Panel administrador:
   - Dashboard con estadísticas.
   - Buscador y filtro de talentos.
   - Tarjetas de gestión rediseñadas.
   - Editor de perfiles más ordenado.
   - Autoencuadre de fotografías en 4:5 (800 x 1000 px).
   - Reencuadre manual opcional arrastrando la imagen.
   - Control de zoom.
   - Al reemplazar o eliminar una foto, se intenta limpiar el archivo anterior de Supabase Storage.
6. Login administrativo totalmente rediseñado.
7. Responsive renovado para PC, tablet y teléfono.

ARCHIVOS IMPORTANTES
--------------------
- index.html: Home.
- hombres.html / mujeres.html / promotores.html: catálogos.
- admin.html: panel administrativo.
- login.html: acceso del administrador.
- js/talentos.js: lógica compartida de catálogos.
- js/admin.js: gestión administrativa y fotografías.
- css/style.css / css/responsive.css: nuevo diseño.

PUBLICAR EN NETLIFY
-------------------
Si el sitio actual está conectado a GitHub:
1. Sustituye los archivos del repositorio por los de esta carpeta.
2. Haz commit y push.
3. Netlify debería desplegar automáticamente la nueva versión.

Si subes manualmente:
1. Comprime o selecciona el CONTENIDO de esta carpeta.
2. Súbelo al deploy correspondiente en Netlify.
3. index.html debe quedar en la raíz del sitio publicado.

NOTA
----
No se modificó la URL ni la publishable key de Supabase que ya estaban en js/supabase.js.
