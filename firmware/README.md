# Integración ESP32-WROOM-32UE

Proyecto ESP-IDF 5.4 para validar transporte HTTPS, reconexión, timestamps UTC, cola microSD, reenvío con el mismo UUID y borrado solo después de un acuse `persisted:true` del servidor que coincida con el ID enviado. Incluye recuperación de archivos temporales completos después de un reinicio; los incompletos se conservan para inspección. No formatea tarjetas automáticamente.

## Límite de esta entrega

El modelo de los sensores no se ha definido. `hm_read_sensors` es una interfaz de adaptación: por defecto no produce lecturas. La opción `HM_SIMULATION` permite probar el transporte con datos claramente marcados como simulados. La versión con sensores reales requiere implementar ese adaptador, calibrar y verificar las unidades. No existe una conexión universal válida para cualquier sensor. No se ha probado en placa física.

## Preparar

1. Instalar ESP-IDF 5.4 desde Espressif y abrir su terminal.
2. `idf.py set-target esp32`.
3. `idf.py menuconfig` → HeavyMonitor IoT: SSID, clave Wi-Fi, URL HTTPS del servidor, ID de dispositivo y token generado en la pantalla Máquinas.
4. Confirmar GPIO de microSD contra el cableado. Los valores predeterminados CS=5, MOSI=23, MISO=19, CLK=18 son un ejemplo configurable, no un plano aprobado del montaje del cliente.
5. Para demostración: habilitar HM_SIMULATION. Para mediciones reales: deshabilitarla e implementar `hm_read_sensors` con los sensores elegidos.
6. `idf.py build`; `idf.py -p COMx flash monitor`. No compartir sdkconfig: contiene credenciales.

No conectar señales industriales de presión/RPM directamente al ESP32: la interfaz y acondicionamiento deben definirse según las especificaciones de cada sensor. Esta guía no sustituye el esquema eléctrico del instalador.

## Pruebas del cliente

Con Wi-Fi disponible: comprobar fuente "Simulador" durante demostración, acuses HTTPS y sincronización horaria. Cortar Wi-Fi sin apagar la placa: los archivos deben acumularse en microSD. Restaurar Wi-Fi: la cola debe reducirse, sin duplicados. Reiniciar mientras hay archivos pendientes y repetir. Verificar cola llena, tarjeta ausente, hora no sincronizada, token inválido y certificado no válido. No declarar validada recuperación ante pérdida de alimentación hasta ensayar con la tarjeta y alimentación reales.

Referencias de Espressif: [cliente HTTPS y certificados](https://docs.espressif.com/projects/esp-idf/en/v5.3/esp32/api-reference/protocols/esp_http_client.html), [almacenamiento FAT](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/storage/fatfs.html).
