PARTNERS CORP — ROUND GOLD + SUPABASE NUEVO
===========================================

Esta versión conserva el diseño ROUND_GOLD, el logo seleccionado, favicon y el panel administrativo dividido por módulos.

PROYECTO CONECTADO
------------------
Project URL: https://gqpuxfrvnhqapeqpwbgh.supabase.co
La publishable key está configurada en js/supabase.js.

ESTRUCTURA
----------
- Tabla: talentos
- Bucket de Storage: talentos
- Login administrativo: Supabase Auth
- Catálogos públicos: lectura desde Supabase
- Admin: crear, editar y eliminar talentos
- Fotografías: autoencuadre 4:5 (800 x 1000) y subida al bucket talentos

PRIMERA CONFIGURACIÓN
---------------------
1. Abre el proyecto nuevo de Supabase.
2. Ve a SQL Editor.
3. Ejecuta el archivo schema.sql incluido en esta carpeta.
4. Ve a Authentication > Users.
5. Crea el usuario que utilizarás para entrar a login.html.
6. Prueba el sitio con Live Server antes de publicarlo.

SEGURIDAD
---------
- La publishable key sí puede estar en el frontend.
- Nunca coloques la Secret Key ni service_role en estos archivos.
- RLS deja la lectura pública de talentos, pero crear/editar/eliminar requiere una sesión autenticada.

NO SE USA LOCALSTORAGE PARA TALENTOS
------------------------------------
Los datos y la sesión administrativa funcionan con Supabase.
