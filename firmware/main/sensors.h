#pragma once
#include "esp_err.h"
struct hm_gas { char gas[25]; char unit[8]; double value; };
struct hm_sample {
 double temperature_c, vibration_rms_ms2, vibration_x, vibration_y, vibration_z, pressure_bar, rpm;
 bool has_temperature, has_vibration, has_axes, has_pressure, has_rpm, operating, sensors_ok;
 double operating_hours, hydraulic_level_pct;
 bool has_operating_hours, has_hydraulic_level;
 hm_gas gas_readings[16]; unsigned gas_count;
 bool has_gps, gps_fix;
 double gps_latitude, gps_longitude, gps_altitude_m, gps_speed_kmh, gps_accuracy_m;
 unsigned gps_satellites;
 bool has_gps_altitude, has_gps_speed, has_gps_accuracy, has_gps_satellites;
};
// Implementar en un archivo separado cuando se conozcan sensores, interfaces y calibración.
// ESP_ERR_NOT_SUPPORTED impide enviar lecturas inventadas como mediciones reales.
extern "C" esp_err_t hm_read_sensors(hm_sample *out);
