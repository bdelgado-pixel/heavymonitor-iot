#pragma once
#include "esp_err.h"
struct hm_sample { double temperature_c, vibration_rms_ms2; double vibration_x, vibration_y, vibration_z, pressure_bar, rpm; bool has_axes, has_pressure, has_rpm, operating, sensors_ok; };
// Implementar en un archivo separado cuando se conozcan sensores, interfaces y calibración.
// ESP_ERR_NOT_SUPPORTED impide enviar lecturas inventadas como mediciones reales.
extern "C" esp_err_t hm_read_sensors(hm_sample *out);
