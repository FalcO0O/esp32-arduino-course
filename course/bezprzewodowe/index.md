# Technologie bezprzewodowe

Wkraczamy w etap pracy z wbudowanymi modułami radiowymi układów ESP. Bezprzewodowa łączność to jedna z kluczowych cech mikrokontrolerów z rodziny ESP32.

ESP32-C6 integruje technologie bezprzewodowe na jednej płytce deweloperskiej, wspierając łączność Wi-Fi (w standardzie Wi-Fi 6) oraz energooszczędny standard Bluetooth Low Energy (BLE 5.3).

---

## ⚡ Czego się nauczysz w tej sekcji?

W tym module poznasz trzy najważniejsze metody komunikacji bezprzewodowej obsługiwane przez ESP32-C6:

- **Wi-Fi** – stworzysz kod łączący się jako klient STA z siecią lokalną w celu pobierania danych z zewnętrznych serwisów (API) oraz uruchomisz własny punkt dostępowy (Access Point) z serwerem WWW do sterowania urządzeniem z poziomu przeglądarki.
- **Bluetooth Low Energy (BLE)** – skonfigurujesz ESP32 jako serwer BLE (GATT) udostępniający usługi oraz wyślesz asynchroniczne powiadomienia (Notify) bezpośrednio do aplikacji na smartfonie.
- **ESP-NOW** – zaimplementujesz szybką łączność bezpośrednią peer-to-peer oraz rozgłoszeniową (Broadcast) między wieloma układami ESP z minimalnymi opóźnieniami i bez użycia routera.

---

## 🛠️ Wymagany sprzęt w tym module

> [!WARNING]
> Ćwiczenia w tym module **nie są możliwe do wykonania w symulatorze Wokwi**. Funkcje bezprzewodowe (Wi-Fi, Bluetooth oraz ESP-NOW) wymagają fizycznego mikrokontrolera oraz komunikacji z rzeczywistymi urządzeniami w Twoim otoczeniu.

Aby w pełni przetestować przykłady w tym module, będziesz potrzebować:

| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6 + kabel USB** | Główny mikrokontroler i zasilanie układu |
| **Druga płytka ESP32-C6 + kabel USB** | Konieczna do przetestowania bezpośredniej komunikacji ESP-NOW |
| **Płytka Stykowa (Breadboard) + kable (jumpery)** | Bezlutowe łączenie dodatkowych elementów |
| **2x dioda LED + 2x rezystor (150-220 Ohm)** | Wykonanie zadania samodzielnego z dodatkową diodą (sterowanie Wi-Fi/BLE) |
| **Potencjometr obrotowy (10 kOhm)** | Generowanie analogowych danych do wysłania w powiadomieniach BLE |
| **Czujnik Akcelerometru (np. MPU6050)** | Rejestracja orientacji przestrzennej przesyłanej bezprzewodowo przez ESP-NOW |
| **Smartfon lub laptop** | Niezbędny do połączenia z serwerem WWW przez Wi-Fi oraz do skanowania usług Bluetooth w aplikacji testowej |

---

## 🗺️ Spis Lekcji

1. [Wi-Fi: Serwer i Klient](wifi.md)
2. [Bluetooth Low Energy (BLE)](ble.md)
3. [ESP-NOW: Komunikacja bezpośrednia](espnow.md)
