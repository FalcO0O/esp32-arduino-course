# Protokoły komunikacyjne

W tym module podłączysz zewnętrzne czujniki i moduły przez standaryzowane magistrale komunikacyjne. Każdy protokół ma inne zastosowanie i charakterystykę.

---

## Wymagany sprzęt w tym module

| Komponent | Ćwiczenie |
|:---|:---|
| Moduł MPU6050 + przewody jumper | Ćw. 7 (I2C) |
| Dwa przewody jumper (loopback) | Ćw. 8 (UART) |
| Wyświetlacz OLED SSD1306 SPI + przewody | Ćw. 9 (SPI) |

---

## Ćwiczenia

| # | Strona | Magistrala | Czego się nauczysz |
|:---:|:---|:---:|:---|
| 7 | [I2C: czujnik MPU6050](i2c.md) | I2C | Akcelerometr, żyroskop, biblioteki |
| 8 | [UART: loopback i komendy](uart.md) | UART | Komunikacja szeregowa, parsowanie |
| 9 | [SPI: wyświetlacz OLED](spi.md) | SPI | Grafika, tekst na wyświetlaczu |

---

## Porównanie protokołów

| | I2C | UART | SPI |
|:---|:---:|:---:|:---:|
| Liczba przewodów | 2 (SDA+SCL) | 2 (TX+RX) | 4+ (MOSI+MISO+SCK+CS) |
| Urządzeń na bus | Wiele (adresy) | 2 (point-to-point) | Wiele (CS per device) |
| Szybkość | Średnia (400 kHz) | Średnia | Wysoka (MHz) |
| Złożoność | Niska | Najniższa | Średnia |
