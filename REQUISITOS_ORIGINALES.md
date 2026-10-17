# REQUERIMIENTOS PARA DESARROLLAR LA PLATAFORMA WEB HEAVYMONITOR IoT

**Nombre del proyecto:** HeavyMonitor IoT  
**Objetivo:** Desarrollar una plataforma web para monitorear en tiempo real las condiciones de operación de maquinaria pesada mediante sensores conectados a un ESP32, con almacenamiento histórico, alertas y análisis de anomalías.

## 1. Diseño e interfaz de usuario

1. Crear un sitio web moderno, profesional y adaptable a computadoras, tablets y celulares.
2. Utilizar una interfaz de estilo industrial, relacionada con maquinaria pesada y minería.
3. Diseñar un panel principal o dashboard con indicadores, gráficas y estados de las máquinas.
4. Incluir el logotipo HeavyMonitor IoT.
5. Utilizar colores para distinguir los estados: verde para normal, amarillo para advertencia y rojo para alarma.
6. Permitir navegar fácilmente entre las secciones del sistema.

## 2. Monitoreo en tiempo real

La plataforma debe recibir y visualizar los siguientes parámetros enviados por el ESP32:

1. **Vibración:** aceleración en los ejes X, Y y Z, valor RMS y evolución de la vibración.
2. **Temperatura:** temperatura actual, máximos, mínimos y tendencia.
3. **Presión hidráulica:** presión instantánea expresada en bar.
4. **Velocidad de giro:** RPM del componente monitoreado.
5. **Estado de conexión:** conectado, desconectado o sin comunicación reciente.
6. **Estado de almacenamiento:** indicar si el ESP32 está registrando datos localmente.
7. **Fecha y hora:** registrar cuándo se tomó cada medición.

Los parámetros deben visualizarse en tarjetas numéricas y gráficas que se actualicen automáticamente sin tener que recargar la página.

La frecuencia de actualización debe ser configurable y adecuada para cada variable.

## 3. Dashboard principal

El panel principal debe incluir:

- Nombre, identificación y tipo de máquina.
- Estado general de la máquina o del sistema de monitoreo.
- Última fecha y hora de recepción de datos.
- Indicadores de vibración, temperatura, presión y RPM.
- Gráficas de tendencias en tiempo real.
- Número de alertas activas.
- Historial de las últimas alarmas.
- Estado de conexión del ESP32.
- Resumen de las condiciones que requieren inspección.

## 4. Registro de maquinaria

Permitir registrar varias máquinas y diferenciarlas mediante:

- Código o identificación de la máquina.
- Tipo de equipo: cargador frontal, excavadora, grupo electrógeno u otro.
- Marca y modelo.
- Número de serie, si corresponde.
- Área o ubicación de operación.
- Componentes monitoreados.
- Identificación del ESP32 asociado.
- Fecha de instalación del sistema.

Cada máquina debe tener su propio dashboard y sus propios registros históricos.

## 5. Sistema de alertas y alarmas

La plataforma debe generar alertas cuando se detecten condiciones anormales.

1. Alertas por vibración superior al límite configurado.
2. Alertas por temperatura excesiva.
3. Alertas por presión hidráulica fuera del rango permitido.
4. Alertas por RPM anormales, cuando se conozcan las condiciones de operación.
5. Alertas por pérdida de comunicación con el ESP32.
6. Alertas por fallas de sensores o datos inválidos.
7. Registro de fecha, hora, variable y valor que originó la alerta.
8. Clasificación por niveles: informativo, advertencia y crítico.
9. Posibilidad de reconocer una alerta y registrar las acciones tomadas.
10. Configuración de límites por máquina, componente y condición de operación.

Los umbrales deben poder modificarse desde la plataforma y validarse según el componente y las recomendaciones del fabricante. El sistema no debe afirmar que existe una falla específica solamente porque una variable supera un límite.

## 6. Historial y almacenamiento de datos

Guardar las mediciones en una base de datos para consultar el comportamiento de cada máquina a lo largo del tiempo.

La plataforma debe permitir:

- Consultar datos por fecha y rango horario.
- Seleccionar una máquina y un componente.
- Comparar variables y tendencias.
- Consultar máximos, mínimos, promedios y valores RMS.
- Revisar el historial de alarmas.
- Exportar registros a CSV o Excel.
- Descargar reportes en PDF.
- Conservar la fecha y hora de cada medición.
- Identificar datos faltantes y periodos sin conexión.

## 7. Comunicación con el ESP32

El programador debe implementar una comunicación estable entre el ESP32 y la plataforma.

Requisitos:

1. Utilizar MQTT sobre una conexión segura TLS o HTTPS mediante una API.
2. Definir un formato de datos JSON documentado.
3. Identificar cada equipo mediante un ID único.
4. Validar los datos recibidos y rechazar valores inválidos.
5. Mostrar el estado de conexión del dispositivo.
6. Permitir que el ESP32 envíe mediciones periódicamente.
7. Implementar reconexión automática.
8. Incorporar almacenamiento local cuando no exista Wi-Fi.
9. Permitir la recuperación y sincronización de datos pendientes al restablecerse la conexión.
10. Evitar registros duplicados mediante identificadores únicos de medición.
11. Incorporar marcas de tiempo fiables y distinguir la hora de medición de la hora de recepción.
12. Proteger las credenciales y los dispositivos frente a accesos no autorizados.

La plataforma debe proporcionar documentación de conexión, direcciones de servidor, puertos, credenciales o certificados y ejemplos de código para integrar el ESP32.

## 8. Análisis de condición y detección de anomalías

Esta es una de las funciones más importantes del proyecto.

La plataforma debe:

1. Establecer una línea base del comportamiento normal de cada componente.
2. Comparar las mediciones actuales con datos históricos.
3. Identificar incrementos sostenidos de vibración o temperatura.
4. Detectar variaciones anormales de presión.
5. Correlacionar variables, por ejemplo, vibración y temperatura.
6. Identificar tendencias que requieran inspección.
7. Mostrar el nivel de riesgo de cada anomalía.
8. Generar recomendaciones de inspección basadas en reglas configurables.
9. Diferenciar una anomalía detectada de una falla confirmada.
10. Permitir incorporar posteriormente análisis espectral de vibraciones y modelos de detección de anomalías.

La primera versión puede utilizar reglas, tendencias y límites validados. Los algoritmos avanzados se incorporarán cuando existan suficientes datos de operación normal y anormal.

## 9. Mantenimiento y análisis de fallas

Incluir un módulo para registrar:

- Fallas identificadas por los técnicos.
- Síntomas observados.
- Componente afectado.
- Fecha y hora de detección.
- Posibles causas.
- Causa raíz confirmada, cuando se haya investigado.
- Acciones correctivas realizadas.
- Repuestos utilizados.
- Tiempo de parada.
- Responsable del mantenimiento.
- Evidencias y observaciones técnicas.

También debe permitir relacionar las alarmas registradas con las órdenes de trabajo y el historial de mantenimiento.

## 10. Usuarios y seguridad

Implementar acceso mediante usuario y contraseña, con roles diferenciados:

- Administrador.
- Técnico de mantenimiento.
- Supervisor.
- Usuario de consulta.

Cada rol debe tener permisos específicos. Las contraseñas deben almacenarse de forma segura y la comunicación debe estar cifrada.

## 11. Arquitectura tecnológica

Solicito que el programador proponga una arquitectura mantenible y escalable que incluya:

- Frontend para el dashboard web.
- Backend para recibir y procesar los datos.
- Base de datos para mediciones, máquinas, usuarios y alarmas.
- Servicio de comunicación MQTT o API.
- Sistema de autenticación.
- Servicio de almacenamiento histórico.
- Despliegue en un servidor o servicio de nube.
- Copias de seguridad y recuperación de datos.

Debe explicar las tecnologías elegidas, sus costos recurrentes, sus limitaciones y cómo se ampliaría el sistema si se conectaran más máquinas.

## 12. Entregables que debe proporcionar el programador

1. Plataforma web funcional y accesible desde computadora y celular.
2. Código fuente completo del frontend y backend.
3. Base de datos configurada y documentada.
4. API o servidor MQTT listo para la integración.
5. Documentación del protocolo de comunicación con el ESP32.
6. Ejemplo de JSON para enviar cada medición.
7. Código de prueba para simular datos sin tener conectados los sensores.
8. Configuración de límites y alarmas.
9. Manual de instalación y configuración.
10. Manual de usuario.
11. Archivo de variables de entorno de ejemplo, sin contraseñas reales.
12. Instrucciones de despliegue, actualización y copias de seguridad.
13. Pruebas de funcionamiento y de recuperación después de perder la conexión.
14. Repositorio con el código y las instrucciones para ejecutarlo.
15. Entrega de las cuentas administrativas y control de los servicios contratados a nombre del propietario del proyecto.

## 13. Criterios de aceptación

El proyecto se considerará entregado cuando se compruebe que:

- El ESP32 puede enviar datos reales a la plataforma.
- Los indicadores y gráficas se actualizan correctamente.
- Los registros se almacenan y pueden consultarse por fecha.
- Las alertas se generan según los límites configurados.
- Los datos locales pueden recuperarse después de una pérdida de Wi-Fi.
- No se duplican mediciones al sincronizar los datos pendientes.
- Los usuarios tienen los permisos correspondientes.
- La plataforma funciona desde computadora y celular.
- El código, la documentación y las credenciales administrativas se entregan al propietario.

**Importante:** el desarrollo debe comenzar con un prototipo funcional de vibración y temperatura, comunicación con el ESP32, dashboard e historial. Una vez validada esa etapa, se incorporarán presión, RPM, análisis avanzado y mantenimiento.