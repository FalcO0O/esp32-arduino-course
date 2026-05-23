# Moduł: Bezprzewodowe (IoT)

Wchodzimy w ostatni, najbardziej zaawansowany i najbardziej ekscytujący etap pracy z mikrokontrolerami ESP. To tutaj dowiadujesz się dlaczego te konkretnie kostki zrewolucjonizowały świat hobbystów na całym globie!

ESP32-C6 to jeden z niewielu układów scalonych z **pełnym zestawem** nowoczesnych technologii bezprzewodowych wlutowanych prosto w jedną małą płytkę, zawierającą zarówno silne Wi-Fi jak i nowoczesny, energooszczędny Bluetooth.

---

## ⚡ Czego się nauczysz w tej sekcji?
Wykorzystasz potęgę wbudowanego radia. Najpierw zbudujemy najszybszą, bezpośrednią sieć układów gadających między sobą (w czasie poniżej kilku milisekund z odległości kilkuset metrów!) za pomocą technologii ESP-NOW.
Następnie otworzymy nasz mikrokontroler na klasyczny internet routerów Wi-Fi i sprawimy, by pobierał wiedzę z globalnej bazy danych. Na sam koniec zmienimy ESP32 w serwer BLE udostępniający usługi dla Twojego telefonu.

## 🛠️ Wymagany sprzęt w tym module
Funkcje bezprzewodowe silnie polegają na łączności z wieloma urządzeniami. O ile symulowanie Wi-Fi w Wokwi jest do pewnego stopnia możliwe, praca w tym module da Ci największą satysfakcję w otaczającym Cię, namacalnym świecie.

Potrzebujesz:
| Komponent | Do czego posłuży? |
|:---|:---|
| **Druga Płytka ESP32-C6** | Konieczna do przetestowania wysyłania komend ESP-NOW (od biedy przetestujesz to łącząc się z płytką sąsiada z ławki!) |
| **Twój Telefon / Laptop** | Konieczny by połączyć się z siecią WebServera oraz skanować usługi Bluetooth z aplikacji (nRF Connect) |

---

## 🗺️ Spis Lekcji

| # | Temat | Technologie |
|:---:|:---|:---|
| 13 | [ESP-NOW: komunikacja P2P](espnow.md) | Komunikacja radiowa omijająca domowy router |
| 14-15 | [Wi-Fi i BLE: Serwery i Klient](wifi_ble.md) | Wystawianie strony WWW oraz Serwera Bluetooth |
