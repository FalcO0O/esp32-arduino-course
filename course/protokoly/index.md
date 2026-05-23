# Protokoły komunikacyjne

W tym module dowiesz się, w jaki sposób urządzenia cyfrowe wymieniają ze sobą dane oraz jak podłączać zewnętrzne układy scalone.

---

## ⚡ Czego się nauczysz w tej sekcji?
Poznasz cztery kluczowe protokoły wymiany danych stosowane w systemach wbudowanych:

1. **UART** – dwukierunkowy interfejs szeregowy, idealny do bezpośredniej komunikacji punkt-punkt (np. mikrokontroler-komputer).
2. **I<sup>2</sup>C** – magistrala szeregowa o niskiej złożoności, wymagająca jedynie dwóch linii sygnałowych (SDA, SCL), pozwalająca na równoległe podłączenie wielu urządzeń do jednego kontrolera.
3. **SPI** – szybki, synchroniczny interfejs komunikacyjny, stosowany w aplikacjach wymagających wysokiej przepustowości (np. przy obsłudze wyświetlaczy graficznych lub pamięci zewnętrznych).
4. **Protokoły jednoprzewodowe (One-Wire / Single-Wire)** – techniki przesyłania informacji za pomocą tylko jednej linii sygnałowej.

## 🛠️ Wymagany sprzęt w tym module
Wszystkie opisane lekcje i eksperymenty możesz także zasymulować bezpośrednio w przeglądarce dzięki narzędziu **Wokwi**.

Dla praktyki na żywym sprzęcie potrzebujesz:

| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6 + 1 przewód połączeniowy** | Realizacja testu pętli zwrotnej (loopback) poprzez połączenie pinu nadawczego (TX) z odbiorczym (RX) |
| **Czujnik Akcelerometru (np. MPU6050)** | Komunikacja po magistrali I<sup>2</sup>C |
| **Wyświetlacz Graficzny TFT ILI9341 SPI** | Komunikacja po magistrali SPI |
| **Wbudowana dioda ARGB WS2812B** | Prezentacja działania protokołu jednoprzewodowego bez dodatkowego okablowania |

---

## Spis Lekcji

1. [UART: pętla zwrotna i komendy](uart.md)
2. [Magistrala I<sup>2</sup>C: komunikacja z akcelerometrem](i2c.md)
3. [Magistrala SPI: obsługa wyświetlacza TFT](spi.md)
4. [Transmisja jednoprzewodowa i wbudowana dioda ARGB (WS2812B)](onewire.md)
