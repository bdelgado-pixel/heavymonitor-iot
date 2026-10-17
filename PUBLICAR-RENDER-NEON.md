# Publicar HeavyMonitor en Render + Neon

## Preparación implementada

`Dockerfile.render` compila la interfaz Next.js como archivos estáticos y NestJS los sirve junto con la API. Solo requiere un servicio web de Render. Cookies, peticiones y WebSocket usan la misma dirección HTTPS. Los archivos de datos locales de Render no se usan para persistencia: los registros y sesiones quedan en PostgreSQL.

La base vacía se inicializa automáticamente al arrancar. Se crean tablas y migraciones aditivas, las máquinas de referencia sin lecturas y la cuenta administrativa configurada. El simulador automático está deshabilitado. No se transfieren las contraseñas ni las mediciones de la instalación local.

## 1. Cuentas y acceso

Se necesitan GitHub, Render y Neon a nombre del propietario. Usar las integraciones conectadas si están disponibles; si no, realizar los pasos desde cada panel. No pegar contraseñas, tokens ni URLs de base de datos en chats públicos. No activar un plan de pago sin acuerdo del propietario.

## 2. Neon

Crear un proyecto gratuito PostgreSQL en una región cercana a Render. Copiar la cadena de conexión desde el panel a la variable privada DATABASE_URL de Render. Mantener TLS; preferir `sslmode=verify-full` para verificar el certificado. No agregar `rejectUnauthorized:false` ni desactivar comprobaciones TLS. Para migraciones y bloqueo transaccional se puede usar la conexión directa de Neon; las transacciones deben ejecutarse en el mismo cliente PostgreSQL.

## 3. Repositorio

Crear un repositorio privado con el contenido de esta carpeta `platform` en la raíz. Incluir `render.yaml`, `Dockerfile.render`, `database`, `apps`, `package.json` y `package-lock.json`. Excluir node_modules, .next, out, .env, sdkconfig, ACCESO-LOCAL.txt, datos y respaldos. El ZIP para Render contiene esa estructura bajo una carpeta `HeavyMonitor-IoT`; subir su contenido como raíz del repositorio.

Si se usa un repositorio que contiene toda la carpeta superior, configurar la raíz de Render como `platform` o la ruta correspondiente, sin cambiar a otro repositorio por accidente.

## 4. Render

Crear Blueprint desde el repositorio y seleccionar `render.yaml`. El archivo fija explícitamente el plan free para evitar crear un servicio de pago por defecto. Render pedirá:

- DATABASE_URL: conexión privada de Neon.
- ADMIN_EMAIL: correo que será el usuario administrador inicial.
- ADMIN_PASSWORD: Render genera un valor aleatorio; guardarlo de forma privada desde su panel y cambiarlo después del primer acceso.

Render proporciona PORT y RENDER_EXTERNAL_URL. El backend escucha en 0.0.0.0 y toma ese origen HTTPS automáticamente si no se define APP_ORIGIN. No configurar el token compartido DEVICE_TOKEN ni MQTT local en el servicio remoto.

## 5. Comprobar antes de compartir

Esperar despliegue exitoso y comprobar:

- URL pública HTTPS y `/api/health` responde `{"status":"ok"}`.
- Estado y reportes sin sesión responden 401.
- Inicio/cierre de sesión, lectura y guardado con roles adecuados.
- Indicador de actualización "En vivo" y reconexión al reabrir la página.
- Registro de dispositivo, credencial individual y envío HTTPS con acuse persistido.
- Datos conservados después de reiniciar/republicar Render.
- Descarga PDF/Excel/CSV y consulta desde celular/laptop en otra red.

No compartir la URL con credenciales predeterminadas o datos privados de prueba. No copiar la cuenta administrativa de desarrollo.

## Límites de los planes gratuitos

Render gratuito puede suspenderse tras inactividad; el arranque posterior tarda y no garantiza monitoreo continuo. Neon gratuito limita almacenamiento y cómputo. Enviar cada dos segundos y mantener paneles abiertos consume recursos continuamente. Revisar los contadores y conservar respaldos externos. La configuración de backups diarios del servidor Docker propio no se ejecuta automáticamente en Render gratuito; exportar la base de Neon según su documentación y programar un respaldo externo si se requiere.

Referencias: [Render gratuito](https://render.com/docs/free), [WebSocket en Render](https://render.com/docs/websocket), [variables de Render](https://render.com/docs/environment-variables), [planes de Neon](https://neon.com/pricing).

## Estado

Este documento y las pruebas locales preparan la publicación. Solo un despliegue exitoso verificado en las cuentas conectadas permite afirmar que la plataforma está publicada. La conexión de sensores y aceptación de producción siguen requiriendo validación del cliente.
