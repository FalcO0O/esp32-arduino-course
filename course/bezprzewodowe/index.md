# Technologie bezprzewodowe

ESP32-C6 to jeden z niewielu mikrokontrolerów z **pełnym zestawem** nowoczesnych technologii bezprzewodowych w jednym układzie. Ten moduł pokazuje jak z nich korzystać.

---

## Wymagany sprzęt

| Komponent | Ćwiczenie |
|:---|:---|
| Smartfon lub laptop | Ćw. 14 (Wi-Fi) |
| Smartfon z nRF Connect | Ćw. 15 (BLE) |
| **Druga płytka ESP32-C6** 👥 | **Ćw. 13 (ESP-NOW)** |

---

## Ćwiczenia

| # | Strona | Technologia | Wymagania |
|:---:|:---|:---:|:---|
| 13 | [ESP-NOW: komunikacja P2P](espnow.md) | ESP-NOW | 👥 2 płytki |
| 14 | [Wi-Fi: serwer i REST API](wifi.md) | Wi-Fi | Smartfon / laptop |
| 15 | [Bluetooth Low Energy](ble.md) | BLE | 📱 Smartfon |

---

## Porównanie technologii

| | ESP-NOW | Wi-Fi AP | Wi-Fi STA | BLE |
|:---|:---:|:---:|:---:|:---:|
| Zasięg | ~200 m | ~30–50 m | Przez router | ~10–30 m |
| Router potrzebny | ❌ | ❌ | ✅ | ❌ |
| Max przepustowość | 1 Mb/s | 150 Mb/s | 150 Mb/s | ~1 Mb/s |
| Zużycie energii | Bardzo niskie | Wysokie | Wysokie | Niskie |
| Urządzenia klienckie | ESP32 | Każde Wi-Fi | — | BLE (smartfon) |
