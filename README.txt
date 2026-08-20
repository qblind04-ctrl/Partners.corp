PARTNERS CORP — ROUND GOLD + SUPABASE
=====================================

VERSIÓN ACTUAL
---------------
- Diseño ROUND_GOLD conservado.
- Logo completo PARTNERS CORP + favicon.
- Panel administrativo separado en Resumen / Añadir talento / Talentos.
- Base de datos y autenticación conectadas nuevamente a Supabase.
- Ya no se usa localStorage para talentos ni para la sesión administrativa.

DATOS Y FOTOS
-------------
- Tabla: talentos
- Storage bucket: talentos
- Las fotos se autoencuadran a 4:5 (800 x 1000 px) antes de subirse.
- Los catálogos públicos leen la información directamente desde Supabase.
- Crear, editar y eliminar desde admin.html modifica los datos en Supabase.

LOGIN
-----
El acceso utiliza los usuarios existentes de Supabase Auth del proyecto antiguo.
No hay credenciales locales codificadas en la interfaz.

PUBLICACIÓN
-----------
Puedes probar con Live Server y luego subir el contenido de esta carpeta a GitHub/Netlify.
index.html debe quedar en la raíz del deploy.

SEGURIDAD
---------
La publishable key se usa en el frontend, igual que en el proyecto anterior.
Nunca coloques una service_role key en archivos públicos.


BRANDING
- Se restauró el logo original de Partners Corp (assets/logo-antiguo.png).
- Se mantiene la estética ROUND GOLD, favicon, administrador por secciones y conexión al Supabase nuevo.
