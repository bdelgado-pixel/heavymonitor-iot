# HeavyMonitor IoT — manual de uso e instalación

## Entrega de software

El propietario del proyecto recibirá código, configuración de ejemplo y control de dominio/servidor. El software permite integración por HTTPS o MQTT seguro; el despliegue preparado usa HTTPS. No requiere exponer PostgreSQL ni MQTT a internet. Los sensores y las conexiones eléctricas son responsabilidad de la instalación del cliente. No se ha contratado ni publicado un servidor desde este proyecto.

## Desarrollo en esta computadora

Abrir `platform` en Visual Studio Code. Con Docker Desktop activo, ejecutar `docker compose -p heavymonitor up -d`. En dos terminales: `npm.cmd run dev:api` y `npm.cmd run dev:web`. Abrir http://127.0.0.1:3000. Credenciales iniciales en el archivo privado `ACCESO-LOCAL.txt`. Evitar iniciar dos servidores en el mismo puerto. PostgreSQL y Mosquitto se conservan en volúmenes Docker; no ejecutar `down -v` si se desea conservar información.

## Uso de la plataforma

1. Entrar con correo y contraseña. Administrador administra usuarios/equipos; supervisor ajusta límites; técnico gestiona mantenimiento; consulta visualiza registros. Los permisos se validan en la API, aunque alguien manipule la pantalla.
2. En **Máquinas**, registrar equipo, componentes y ID de cada ESP32. El mismo identificador debe configurarse en el firmware. Generar una credencial individual y guardarla de forma privada; se muestra una vez. Regenerarla invalida la anterior.
3. En **Configuración**, definir advertencia/crítico para temperatura y vibración; rangos para presión/RPM, porcentaje y ventana para tendencias. RPM solo genera alarma si se informa `operating:true`. Los valores predeterminados son ejemplos; no representan recomendaciones de un fabricante.
4. Establecer una línea base únicamente después de confirmar que hay al menos 30 lecturas normales durante operación. Seleccionar origen real o simulado. La tendencia compara el promedio de las últimas muestras de la misma fuente con la línea base de esa fuente. Correlación no demuestra causalidad y no constituye diagnóstico.
5. En **Dashboard**, seleccionar máquina y componente. Cada variable tiene su escala. "Sin datos" significa que el sensor no fue reportado. El simulador se identifica explícitamente. "Conectado" se refiere a comunicaciones recientes y no garantiza calidad de sensor.
6. En **Alertas**, reconocer y registrar acciones. Una condición normalizada conserva su historial. Advertencia/crítico requieren inspección; no confirman una falla. Los periodos sin comunicación generan una alerta informativa después del tiempo de espera configurado, para dispositivos que hayan comunicado al menos una vez.
7. En **Mantenimiento**, crear orden y relacionarla con una alerta del mismo componente, si corresponde. Registrar síntomas, causas, repuestos, tiempo y acciones. Para cerrar debe haber acciones correctivas.
8. En **Historial/Reportes**, filtrar fecha/hora local, componente y origen. Las estadísticas corresponden al rango completo. Tabla hasta 1.000 filas; CSV/Excel hasta 10.000; PDF hasta 1.000. Un rango mayor debe dividirse. Los huecos reportados son intervalos superiores a 30 s en la muestra consultada; un envío lento configurado puede producir ese indicador sin implicar avería.
9. En **Usuarios**, crear/deshabilitar cuentas y cambiar roles. El cambio invalida sesiones. No se permite retirar el último administrador. En **Configuración → Mi contraseña**, cambiar la clave propia; se cierran las sesiones anteriores.

## Publicar para acceso desde celular y laptop

Requiere un servidor del propietario con Docker/Compose, un dominio apuntando a ese servidor y puertos 80/443 disponibles. El proveedor y la factura se registran a nombre del propietario. No hay costos de alojamiento incorporados al código. Seleccionar capacidad según dispositivos, frecuencia, retención y conexiones simultáneas; medir carga antes de comprometer cantidades.

En Windows, `deploy/Install.ps1 -Domain monitor.sudominio.com -AdminEmail correo@ejemplo.com` genera secretos aleatorios en `.env.production`. En Linux se puede crear ese archivo siguiendo `deploy/production.env.example`; usar contraseñas hexadecimales de 64 caracteres para la URL de PostgreSQL. No subir el archivo al repositorio ni enviarlo por canales públicos.

Ejecutar:

```text
docker compose --env-file .env.production -f compose.production.yaml up -d --build
docker compose --env-file .env.production -f compose.production.yaml ps
```

Caddy solicita certificados HTTPS para el dominio configurado. El DNS y la conectividad deben funcionar. La base queda aislada y la API usa cookies seguras. Producción desactiva simulación y el token compartido de desarrollo. Las credenciales por dispositivo se generan desde la plataforma. El dominio final no está decidido; el despliegue público y la validación de certificados reales quedan pendientes de ese recurso.

## Backups y restauración

Local: ejecutar `Backup.ps1`. Validar la copia con `Restaurar-prueba.ps1 -BackupFile ruta-al-archivo.dump`; restaura en una base temporal y deja intacta la original. Producción: el servicio `backup` genera una copia diaria, la comprueba con `pg_restore --list`, conserva 30 días y registra errores. Supervisar espacio disponible y copiar los respaldos a otro servidor/cuenta; una copia en el mismo disco no protege de pérdida del servidor.

Para recuperar realmente después de una avería, primero guardar la base actual si existe. Detener API y web; crear una base nueva, restaurar con `pg_restore --exit-on-error`, comparar recuentos/fechas y luego apuntar la API a ella. Evitar restauraciones destructivas sobre la única copia. Una restauración puede reactivar sesiones antiguas: ejecutar `DELETE FROM user_sessions` en la base recuperada antes de abrir servicio.

## Actualizar y volver atrás

1. Hacer backup y ensayar su restauración.
2. Guardar la versión actual del código/imágenes y `.env.production` por separado.
3. Revisar cambios de esquema; las migraciones actuales son aditivas e idempotentes, ejecutadas bajo bloqueo de PostgreSQL al arrancar API.
4. Construir e iniciar nueva versión. Revisar salud, login, medición y reporte.
5. Si falla, volver a la imagen anterior y revisar compatibilidad de esquema; no borrar volúmenes. Restaurar en base nueva solo si se requiere recuperar datos.

## Problemas frecuentes

- Puerto ocupado: detener la instancia anterior antes de arrancar otra.
- Sin datos: confirmar ID de ESP32, componente asociado, URL HTTPS, hora y credencial. Datos inválidos se rechazan.
- Datos viejos: hora de medición y recepción son diferentes. La recuperación de cola no representa operación actual.
- Credencial rechazada: generar otra desde administrador y actualizar el dispositivo.
- Certificado/hora incorrecta: sincronizar reloj y validar DNS/certificado. No desactivar TLS para solucionar el problema.
- Sin línea base: conseguir 30 muestras normales confirmadas. No usar valores de simulación para diagnosticar un equipo real.

## Aceptación final pendiente

El código no sustituye una prueba en el servidor final y con los sensores elegidos. Verificar conexión física, calibración, corte de red, reinicio, recuperación de cola, permisos, respaldo externo, restauración, seguridad y capacidad con carga representativa antes de entregar como producción validada.

## Horómetro, nivel hidráulico, gases y GPS

El dashboard incorpora las ocho categorías. Horómetro muestra las horas totales reportadas por el dispositivo; nivel hidráulico muestra el porcentaje del depósito. Emisiones lista cada gas con su unidad y permite seleccionar su gráfica. GPS muestra latitud, longitud, señal y detalles de velocidad, altitud, precisión y satélites, más la trayectoria relativa reciente.

En Configuración se pueden activar límites de nivel bajo, horas del próximo mantenimiento y advertencia/crítico para cada gas y unidad. Estos límites adicionales empiezan desactivados. En Historial y Reportes, pulsar Consultar para obtener las columnas y estadísticas del rango y descargar CSV, Excel o PDF. Si el equipo no envía una variable, aparece Sin datos. Sin señal GPS no se muestra una ubicación actual como válida.

Consultar AMPLIACION-MEDICIONES.md y PROTOCOLO-ESP32.md para la conexión y el significado de los nuevos campos.
