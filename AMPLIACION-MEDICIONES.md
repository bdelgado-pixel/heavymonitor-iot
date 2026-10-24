# Ampliación de mediciones · 24/10/2026

La plataforma admite vibración (RMS y X/Y/Z), temperatura, presión hidráulica, RPM, horómetro, nivel hidráulico, gases y GPS. Los nuevos datos se reciben mediante la misma API HTTPS o MQTT autenticada y se conservan en el historial. No se han asignado sensores ni pines universales.

## Significado y unidades

- `operating_hours`: lectura acumulada del horómetro, en horas. No se calcula usando el tiempo de conexión al servidor. El dispositivo o su adaptador debe conservar el contador entre reinicios.
- `hydraulic_level_pct`: nivel del depósito hidráulico, de 0 a 100 %. Se interpreta “Nivel-H” como nivel hidráulico. Si se refiere a otro depósito, debe ajustarse el nombre y la calibración antes de la entrega.
- `gas_readings`: hasta 16 pares gas/unidad por medición, por ejemplo CO en ppm, CO2 en %vol y NOX en mg/m3. El nombre utiliza letras mayúsculas, números o guion bajo (máximo 24 caracteres, empieza con una letra). Se admiten gases adicionales con ese formato. No se mezclan unidades ni se convierten concentraciones en tasas de emisión.
- `gps_fix`: indica si hay posición GPS válida. Con `true` se requieren `gps_latitude` y `gps_longitude`; con `false` deben omitirse las coordenadas, altitud, precisión y velocidad. 0°/0° es una coordenada válida, no un marcador de ausencia.
- GPS opcional: altitud en metros, velocidad en km/h, precisión reportada en metros y cantidad entera de satélites.

## Pantallas y reportes

El dashboard conserva el estilo industrial e incorpora tarjetas de las ocho categorías, gráficas de horómetro y nivel, selección de gas con su tendencia y detalle GPS con recorrido relativo de posiciones recientes. El recorrido no utiliza mapas de terceros ni representa distancias a escala.

El historial muestra las nuevas columnas y estadísticas. CSV, Excel y PDF incluyen horas, nivel, gases con unidad, coordenadas, estado GPS, altitud, velocidad, precisión y satélites, manteniendo los filtros de máquina, componente, fechas y origen.

## Alertas configurables

En Configuración, por componente:

- Nivel bajo: advertencia y crítico (el crítico es menor que la advertencia).
- Horómetro total al que corresponde el próximo mantenimiento.
- Gases: advertencia y crítico para cada combinación de gas y unidad.

Estos límites están desactivados inicialmente: el responsable debe validarlos para el equipo. Superarlos indica una necesidad de inspección. Las lecturas no certifican cumplimiento de normas de emisiones ni confirman una falla. Se informa pérdida de señal GPS cuando el dispositivo la reporta explícitamente.

## Compatibilidad, despliegue y pruebas

Las migraciones agregan columnas sin borrar los datos existentes. Los equipos que envían el formato anterior siguen siendo compatibles. En el protocolo ampliado temperatura y RMS son opcionales; un registro puede contener únicamente GPS, gases u otra variable válida. Los campos ausentes se conservan como nulos, no como ceros inventados. Las alertas de una variable ausente no se normalizan por falta de lectura.

La deduplicación comprueba también todos los nuevos campos. El orden de los gases en el JSON no cambia la identidad de una medición. Los datos antiguos reenviados se almacenan sin reemplazar las alarmas de lecturas posteriores.

Ejecutar `npm run check`, `npm run build` y `node test-integration.cjs` con una base local de pruebas. Esta última prueba crea y elimina exclusivamente una base temporal propia; no utilizar una cuenta de producción para ejecutarla.

Para publicar, subir los archivos modificados al repositorio GitHub conectado a Render. La primera puesta en marcha aplica la migración automáticamente. Revisar el despliegue y `/api/health` antes de usar la versión ampliada. Conservar un respaldo de la base antes de actualizar una instalación con datos importantes.

El firmware incluye las estructuras y la serialización del protocolo ampliado. El adaptador `hm_read_sensors` debe implementar los sensores reales. No se ha validado este firmware en una placa física y no se entrega un binario calibrado para equipos desconocidos.

## Lecturas a frecuencias distintas

El dashboard conserva el último valor reportado de cada variable y la fecha de su medición. Una lectura GPS o de gases no elimina temperatura, vibración, horas ni nivel recibidos antes. Los gases mantienen su última lectura de forma independiente por especie y unidad. Si el GPS reporta explícitamente pérdida de señal, ese estado sustituye a la posición válida anterior; el recorrido queda identificado como histórico.

Las alertas comparan la antigüedad por variable y fuente. Una lectura térmica reciente puede generar una alerta aunque ya haya llegado un GPS medido unos milisegundos después. El backfill más antiguo de esa misma variable no reemplaza su condición actual. Las tendencias seleccionan muestras no nulas de cada variable antes de aplicar la ventana configurada.

Prueba adicional: `node test-telemetry-view.cjs` (Node.js 24).
