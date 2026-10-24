# HeavyMonitor IoT

Plataforma de monitoreo de maquinaria: Next.js/React/TypeScript, NestJS, PostgreSQL, ECharts, comunicación HTTPS/MQTT y actualización WebSocket. Código y documentación para desarrollo local y despliegue con Docker. La carpeta superior `dist` es un prototipo anterior; trabajar en esta carpeta `platform`.

## Funciones

- Dashboard industrial adaptable con temperatura, vibración RMS/X/Y/Z, presión, RPM, horómetro, nivel hidráulico, gases por especie/unidad y GPS con recorrido reciente, gráficas, estados e historial de alarmas.
- Máquinas, componentes, dispositivos, umbrales de advertencia/crítico y línea base de operación normal.
- Alarmas por variable, tendencias, almacenamiento/sensores reportados y pérdida de comunicación. No confunde anomalía con falla confirmada.
- Usuarios con cuatro roles, sesiones, cambio/restablecimiento de contraseña, desactivación y registro de operaciones de usuarios.
- Órdenes de mantenimiento vinculables a alertas, acciones, causas, repuestos, tiempo y observaciones de evidencia.
- Histórico filtrado y estadísticas; exportaciones CSV, Excel y PDF.
- Ingestión validada con UUID, fecha de medición/recepción, credencial por dispositivo y acuse de escritura. Recuperación de datos fuera de orden sin duplicarlos.
- Simulador independiente con cola SQLite y proyecto de firmware ESP-IDF con cola microSD y adaptador de sensores.
- Instalación en contenedores, HTTPS preparado, respaldos diarios y prueba de restauración.

## Ejecutar localmente

Node.js 24, Docker Desktop activo.

1. Configurar `.env` a partir de `.env.example` con POSTGRES_PASSWORD aleatoria.
2. `docker compose -p heavymonitor up -d`.
3. Configurar `apps/api/.env` a partir de su ejemplo: DATABASE_URL, ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 14 caracteres). Para una instalación nueva, generar secretos, no copiar los del desarrollador.
4. `npm ci`.
5. En dos terminales: `npm run dev:api` y `npm run dev:web`.
6. Abrir http://127.0.0.1:3000.

En esta computadora la configuración ya existe. Las credenciales privadas de desarrollo están en `ACCESO-LOCAL.txt`, excluidas del repositorio y del paquete. No iniciar una segunda instancia en los mismos puertos.

## Verificar

```text
npm run check
npm run build
node test-integration.cjs
node tests-security.cjs
node test-queue.cjs
```

La prueba de integración usa una base PostgreSQL temporal y borra únicamente esa base al terminar. `node test-deployment.cjs` construye y prueba contenedores aislados y elimina su entorno temporal. Requiere espacio libre para las imágenes. La compilación local funciona sin descargar ESP-IDF.

## Entrega e integración

- [Publicar en Render y Neon](PUBLICAR-RENDER-NEON.md): un servicio con HTTPS, web/API y base externa, sin depender de esta computadora.

- [Manual del cliente](MANUAL-CLIENTE.md): instalación, uso, backups, restauración y actualización.
- [Protocolo ESP32](PROTOCOLO-ESP32.md): JSON, credenciales, acuses, reintentos y simulador.
- [Firmware](firmware/README.md): configuración ESP-IDF y límites del adaptador.
- [Pruebas y aceptación](PRUEBAS-Y-ACEPTACION.md): evidencia y verificaciones externas.
- [Estado actual](ESTADO.md): funciones y pendientes concretos.
- [Requisitos originales](REQUISITOS_ORIGINALES.md): documento completo de alcance.

Producción se configura con `deploy/Install.ps1` o `deploy/production.env.example` y `compose.production.yaml`. Necesita dominio y servidor del propietario. El paquete no contiene credenciales reales. El firmware no se ha compilado ni probado físicamente: la descarga de ESP-IDF falló por espacio. No presentar este estado como instalación pública ni integración de sensores ya aceptadas.
