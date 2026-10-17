# Preparación de entrega al cliente

Estado: desarrollo activo, no autorizado como versión final de producción.

## Uso previsto

La instalación del cliente debe ofrecer arranque sencillo, cuenta administrativa propia, dispositivos provisionados, instrucciones de conexión y diagnóstico visible. No debe requerir editar código. Modelo de placa, sensores, alimentación, conectividad y ubicación del servidor pendientes de confirmar con el propietario.

## Acceso

Configurar ADMIN_EMAIL y ADMIN_PASSWORD en `apps/api/.env` antes de iniciar la API. Contraseña mínima: 14 caracteres. El arranque crea la cuenta si el correo no existe; no reemplaza contraseñas de cuentas existentes. Los secretos nunca deben ir al repositorio. Las sesiones duran 8 horas y se guardan en PostgreSQL mediante hash de token. En producción NODE_ENV=production exige cookies seguras y acceso HTTPS. APP_ORIGIN debe coincidir con el dominio real.

Implementado en esta etapa: inicio/cierre de sesión, consulta autenticada, creación de usuarios restringida a administrador, reconocimiento de alertas por administrador/técnico/supervisor. Pendiente: gestión completa de usuarios desde pantalla, recuperación y cambio de contraseña, auditoría, invalidación de sesiones por cambio de contraseña, revisión de autorización de cada nuevo módulo y pruebas de seguridad completas.

## Copias de seguridad

Ejecutar `Backup.ps1` con Docker activo. Produce un archivo PostgreSQL en formato personalizado, sin pasar bytes binarios por PowerShell. Los respaldos contienen datos sensibles: guardar en ubicación restringida y copiar a almacenamiento externo. La programación automática, retención y restauración ensayada forman parte de los pendientes de entrega. No considerar un archivo de backup suficiente sin una prueba de restauración.

## Pruebas obligatorias de aceptación

- Instalación limpia y arranque después de reiniciar el equipo.
- Roles y acceso no autorizado a cada operación.
- Envío real desde cada modelo de dispositivo y sensor.
- Calibración, unidades, timestamps y calidad de medición.
- Pérdida de Wi-Fi, almacenamiento microSD, reinicio del ESP32 y sincronización sin duplicados.
- Confirmación de persistencia antes de retirar datos de la cola del dispositivo.
- Alertas, normalización y reconocimiento con acciones.
- Históricos, reportes y relación de mantenimiento con alertas.
- HTTPS/MQTT TLS, secretos por dispositivo y revocación de acceso.
- Backup, restauración y actualización sin pérdida de datos.
- Comparación visual con la referencia y uso en computadora/celular.

Ninguna prueba con simulador sustituye la aceptación con hardware. La versión actual usa MQTT sin autenticación, ligado a loopback para desarrollo; no se debe exponer a internet ni distribuir como instalación final.
