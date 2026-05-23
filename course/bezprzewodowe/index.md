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

Funkcje bezprzewodowe opierają się na łączności z innymi urządzeniami. Aby w pełni przetestować przykłady w tym module, będziesz potrzebować:

| Komponent | Do czego posłuży? |
|:---|:---|
| **Smartfon lub laptop** | Niezbędny do połączenia z serwerem WWW przez Wi-Fi oraz do skanowania usług Bluetooth w aplikacji testowej. |
| **Druga Płytka ESP32-C6** | Konieczna do przetestowania bezpośredniej komunikacji ESP-NOW. |

---

## 🗺️ Spis Lekcji

| # | Temat | Technologie |
|:---:|:---|:---|
| 1 | [Wi-Fi: Serwer i Klient](wifi.md) | Uruchomienie punktu dostępowego WWW oraz klienta HTTP pobierającego dane JSON |
| 2 | [Bluetooth Low Energy (BLE)](ble.md) | Konfiguracja serwera GATT i asynchroniczne powiadomienia (Notify) |
| 3 | [ESP-NOW: Komunikacja bezpośrednia](espnow.md) | Szybka wymiana danych peer-to-peer oraz transmisja rozgłoszeniowa |
