# Protocolo HeavyMonitor v2

## Registro e identidad

Registrar máquina, componente y dispositivo desde la plataforma. El ID del dispositivo es único y se asocia a un solo componente. Generar su token individual; se almacena únicamente su hash en PostgreSQL. No reutilizar credenciales entre placas. Desactivar el dispositivo o regenerar su token para revocar acceso.

## Transporte recomendado para el cliente: HTTPS

`POST https://DOMINIO/api/measurements` con `Content-Type: application/json` y `Authorization: Bearer TOKEN_INDIVIDUAL`.

```json
{
  "id": "2a750065-d759-4f46-bfc2-cc39590dce5a",
  "device_id": "ESP32-CF-001",
  "measured_at": "2026-10-17T16:00:00Z",
  "temperature_c": 58.7,
  "vibration_rms_ms2": 2.3,
  "vibration_x": 1.2,
  "vibration_y": 1.8,
  "vibration_z": 1.5,
  "pressure_bar": 210,
  "rpm": 1450,
  "operating": true,
  "storage_ok": true,
  "sensors_ok": true,
  "simulated": false
}
```

Temperatura y RMS son obligatorios en este protocolo; variables opcionales ausentes se guardan como null, nunca cero ficticio. X/Y/Z y RMS están en m/s²; presión en bar. RMS debe calcularse sobre una ventana definida por el firmware/sensor, no confundirse con aceleración instantánea. La hora incluye zona UTC o desplazamiento explícito. No se aceptan fechas anteriores a 2020 o más de cinco minutos adelantadas al servidor. La sincronización SNTP y, si se necesita arranque sin internet, un RTC físico deben validarse en el montaje.

Respuesta después de COMMIT:

```json
{"id":"2a750065-d759-4f46-bfc2-cc39590dce5a","duplicate":false,"persisted":true}
```

El firmware elimina de la cola solo si `persisted` es true y el ID coincide. Al reenviar exactamente el mismo registro, obtiene `duplicate:true`; no se inserta otro. Un ID con contenido diferente se rechaza. Los valores históricos recuperados se conservan sin cambiar indebidamente el estado de alarmas de mediciones más recientes.

HTTP 401: revisar token/dispositivo. HTTP 400: dato inválido o ID en conflicto; conservar y separar el registro para inspección. HTTP 5xx o timeout: reintentar con espera creciente. No cambiar ID ni timestamp al reintentar.

`POST /api/device/heartbeat`, con el mismo encabezado de autorización:

```json
{"device_id":"ESP32-CF-001","storage_ok":true,"sensors_ok":true}
```

Devuelve hora del servidor, intervalo de envío y tiempo de espera configurados. El reporte de estado no reemplaza la validación de cada medición.

## MQTT

Servidor configurable mediante MQTT_URL en la API. En producción solo se acepta `mqtts://`, certificados válidos y autenticación del broker. Topic de envío: `heavymonitor/DEVICE_ID/measurements`, QoS 1. JSON de medición más campo `token` individual; TLS protege ese secreto durante el transporte. Acuse de escritura en `heavymonitor/DEVICE_ID/ack`. El acuse PUBACK del broker no confirma persistencia en PostgreSQL.

El broker local suministrado escucha solo en loopback de Windows y es para desarrollo. No se publica en el paquete de producción, que usa HTTPS. Si se elige MQTT público, provisionar certificados, usuarios y ACL por dispositivo: cada placa publica únicamente su topic y lee únicamente su acuse; la API lee mediciones y escribe acuses. Esa infraestructura debe configurarse y probarse en el servidor seleccionado.

## Simulación sin equipos

El simulador incorporado usa SIMULATION=true solo en desarrollo y genera las cuatro variables. Para probar una cola persistente independiente:

```powershell
$env:HM_SERVER_URL="http://127.0.0.1:4000"
$env:HM_DEVICE_ID="ESP32-CF-001"
$env:HM_DEVICE_TOKEN="TOKEN_GENERADO_EN_MAQUINAS"
node simulator.cjs --collect-only --once
node simulator.cjs --flush-only --once
```

Los datos de ese simulador se identifican mediante `simulated:true`. Los pendientes sobreviven al reinicio en `data/simulator-queue.sqlite`. Para ejecutar continuamente, omitir `--once`; finalizar con Ctrl+C. Es una prueba del contrato de comunicación, no de sensibilidad/calibración de sensores ni de robustez eléctrica.
