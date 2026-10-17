# Estado de entrega — 17 de octubre de 2026

## Implementado en el software

1. Diseño industrial con cabecera, navegación lateral, cuatro indicadores y minigráficas, tendencias, cuatro gráficas individuales, estado, alertas, últimas mediciones y resumen. Adaptación móvil inicial y selector de componente.
2. X/Y/Z y RMS, temperatura, presión y RPM en ingestión, almacenamiento, gráficos e informes. Campos opcionales sin sensor se muestran sin datos.
3. Advertencias/críticos por límites; RPM condicionado a operación; ausencia de comunicación; estados reportados de sensores/SD; rechazo de valores inválidos; reconocimiento y acciones. Los datos simulados se identifican y no se mezclan con alertas reales.
4. Línea base confirmada por usuario, incrementos sostenidos configurables y consulta de correlación/variabilidad. No diagnostica fallas ni incorpora modelos entrenados sin datos.
5. Históricos por fechas/componente/origen y estadísticas del rango. CSV/Excel hasta 10.000 filas por exportación; PDF hasta 1.000. Rangos mayores se dividen. Detección básica de huecos en muestra consultada.
6. Usuarios/roles, cambio y restablecimiento de contraseña, desactivación/revocación de sesiones, auditoría de modificaciones autenticadas y credenciales individuales de dispositivo.
7. Máquinas editables con tipo/serie/fecha de instalación, componentes, asociación de dispositivos y tiempos de comunicación configurables.
8. Mantenimiento con causas, acciones, repuestos, tiempos, responsables iniciales y observaciones de evidencia. Las evidencias son texto; no incluye subida de archivos adjuntos.
9. WebSocket autenticado con reconexión y consulta de respaldo; API con reconexión a PostgreSQL tras interrupción.
10. Configuración de instalación Docker, HTTPS y red interna, backups diarios con retención y scripts de respaldo/restauración de prueba.
11. Firmware fuente ESP-IDF para HTTPS, reloj, cola microSD, UUID, acuse persistente y reconexión; interfaz de adaptación a sensores. Simulador de software con cola persistente probado.

## Verificado

- TypeScript y compilación web/API.
- Pruebas integrales en base aislada: permisos, usuarios, registros, ingestión, duplicados, límites, alarmas críticas, tendencia, desconexión, mantenimiento, consultas y exportaciones.
- Excel generado y leído; PDF de dos páginas renderizado e inspeccionado.
- WebSocket autenticado y credenciales individuales.
- Revocación de sesiones por cambios de contraseña/usuario.
- Recuperación de conexiones PostgreSQL sin reiniciar API.
- Cola simulada conserva registros al reiniciar, perder red o recibir acuse incorrecto.
- Backup de base local restaurado en base temporal y recuento verificado.
- Instalación de contenedores en entorno aislado, login, cookie segura y proxy interno.
- Carga local: 100 consultas, 10 simultáneas, dos equipos simulados, cero errores y p95 de 100 ms en esa ejecución. No certifica capacidad futura.
- npm audit de dependencias de producción: cero avisos conocidos al ejecutar; no equivale a auditoría completa.

## Pendientes externos y límites de aceptación

- Dominio y servidor del propietario para publicar por internet, certificados reales y prueba desde redes externas. Nada fue publicado ni contratado.
- Modelos de sensores, acondicionamiento eléctrico, calibración y adaptador `hm_read_sensors`. El cliente realizará las conexiones.
- Compilación ESP-IDF: no completada. La descarga de la imagen oficial agotó temporalmente el espacio y se canceló. Se recuperó Docker y se verificó la continuidad de sus datos. No hay binario de firmware validado para entregar.
- Pruebas en ESP32/microSD reales de reinicio, pérdida de alimentación y recuperación. El simulador no sustituye esas pruebas.
- Validación final del diseño, dispositivos móviles reales, carga/retención del servidor elegido y respaldo externo.
- No se incluyen análisis espectral ni modelos avanzados: el documento original permite incorporarlos posteriormente.

La aplicación está funcional para revisión local. No afirmar que está aceptada en producción antes de resolver y verificar estos puntos.
