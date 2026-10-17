# Pruebas y aceptación

## Ejecutadas con software

| Prueba | Resultado |
|---|---|
| Verificación TypeScript y compilación web/API | Correcto |
| Inicio, cierre y vencimiento de sesión; autorización por rol | Correcto en pruebas automatizadas de acceso/cierre y revocación |
| Contraseñas con sal única y comprobación | Correcto |
| Máquinas, componentes y asociación de dispositivos | Correcto |
| Rechazo de asociaciones y rangos inválidos | Correcto |
| Ingestión, reenvío, ID con contenido diferente | Correcto |
| X/Y/Z, temperatura, presión y RPM | Correcto con datos sintéticos |
| Advertencia/crítico, línea base y tendencia sostenida | Correcto con datos sintéticos |
| Ausencia de comunicación | Correcto con timestamps de conexión controlados |
| Reconocimiento de alertas, mantenimiento y cierre | Correcto |
| Históricos y CSV | Correcto |
| Excel generado y leído nuevamente | Correcto |
| PDF generado con cabecera PDF válida | Correcto; revisión visual de páginas pendiente |
| WebSocket autenticado | Correcto |
| Token individual, revocación y usuarios deshabilitados | Correcto |
| Cola local tras reinicio, red caída y acuse incorrecto | Correcto en simulador de software |
| Backup y restauración en base temporal | Correcto; la base original quedó intacta |
| Paquete Docker de web/API/PostgreSQL y proxy interno | Correcto en contenedores aislados |
| Dependencias de producción, npm audit | Sin avisos conocidos al revisar; no equivale a auditoría de seguridad completa |

Comandos: `npm run check`, `npm run build`, `node test-integration.cjs`, `node tests-security.cjs`, `node test-queue.cjs`, `node test-deployment.cjs`.

## Revisión previa a entrega

- Confirmar diseño con el propietario y revisar las pantallas en móvil/laptop reales.
- Revisar visualmente reportes PDF/Excel con rangos vacíos y extensos.
- Ejecutar carga representativa según número final de equipos, frecuencia y retención. WebSocket tiene un límite actual de 50 conexiones por proceso y reconecta periódicamente para revalidar sesión.
- Validar DNS, HTTPS público, correo administrativo y propiedad de servicios.
- Probar recuperación sobre respaldo externo y espacio agotado en servidor.
- Elegir sensores, implementar el adaptador y calibrar. Ensayar en ESP32/microSD reales caída de Wi-Fi, reinicio y pérdida de alimentación.
- Verificar firmware compilado y versión, credenciales, intervalo, hora y TLS en el equipo del cliente.

La aceptación industrial y la instalación pública no se sustituyen por estas pruebas de software. El cliente puede revisar la plataforma local mientras prepara los recursos externos.
