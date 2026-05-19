# Lista potrzebnego sprzętu

Poniżej znajdziesz kompletną listę komponentów używanych w tym kursie. Nie musisz kupować wszystkiego naraz – tabela wskazuje, w którym module dany element jest po raz pierwszy potrzebny.

---

## Tabela komponentów

| Komponent | Ilość | Pierwszy moduł | Uwagi |
|:---|:---:|:---|:---|
| **ESP32-C6 DevKit** | 1 szt. | Start | Do modułu ESP-NOW potrzebne 2 szt. |
| **Kabel USB-C** | 1 szt. | Start | Typ USB-C (nie micro-USB!) |
| **Breadboard** | 1 szt. | Podstawy (Ćw. 2) | Standardowy 830-otworowy |
| **Przewody jumper M-M** | 20 szt. | Podstawy (Ćw. 2) | Kolor nieważny, zestaw mieszany |
| **LED czerwona** | 1 szt. | Podstawy (Ćw. 2) | Dowolny kolor |
| **LED żółta lub zielona** | 1 szt. | Podstawy (Ćw. 2) | Dowolny kolor |
| **Rezystor 220 Ω** | 2 szt. | Podstawy (Ćw. 2) | Lub 330 Ω – oba działają |
| **Przycisk tact switch** | 1 szt. | Podstawy (Ćw. 5) | 4-nóżkowy, standardowy |
| **Potencjometr 10 kΩ** | 1 szt. | Podstawy (Ćw. 4) | Obrotowy, 3 wyprowadzenia |
| **Moduł MPU6050** | 1 szt. | Protokoły (Ćw. 7) | Akcelerometr + żyroskop, I2C |
| **Wyświetlacz OLED SSD1306** | 1 szt. | Protokoły (Ćw. 9) | Wersja **SPI** (6-pinowa), 128×64 |
| **ESP32-C6 DevKit (druga szt.)** | 1 szt. | Bezprzewodowe (Ćw. 13) | Tylko do modułu ESP-NOW |

---

## Szczegóły kluczowych komponentów

### ESP32-C6 DevKit
Upewnij się, że masz wersję z układem **ESP32-C6** (nie C3, S3 lub klasycznym ESP32). Popularne warianty:
- **ESP32-C6-DevKitC-1** – oficjalna płytka Espressif (rekomendowana)
- Płytki innych producentów z ESP32-C6 – działają tak samo, mogą mieć inny layout pinów

> [!IMPORTANT] Sprawdź oznaczenie!
> Na module powinien być wydrukowany napis `ESP32-C6`. Inne układy z rodziny ESP32 różnią się pinoutem i dostępnymi peryferiami – kody z tego kursu mogą nie działać bez modyfikacji.

### Wyświetlacz OLED SSD1306 – wersja SPI
Moduł SSD1306 występuje w dwóch wersjach:
- **I2C** – 4 piny (VCC, GND, SDA, SCL) – **nie ta!**
- **SPI** – 6–7 pinów (VCC, GND, SCK, SDA/MOSI, RES, DC, CS) – **ta wersja**

W Ćw. 9 używamy wersji SPI. Przy zakupie szukaj: *„SSD1306 OLED 128x64 SPI"*.

### Moduł MPU6050
Standardowy moduł z wyprowadzonymi pinami: VCC, GND, SDA, SCL (+ opcjonalne INT, AD0). Komunikuje się przez I2C. Niemal wszystkie dostępne na rynku moduły MPU6050 są kompatybilne.

---

## Gdzie kupić?

| Sklep | Uwagi |
|:---|:---|
| **Botland.com.pl** | Szybka dostawa, polska firma |
| **Kamami.pl** | Duży wybór modułów |
| **Aliexpress** | Najtaniej, dostawa 2–4 tygodnie |
| **Mouser / TME** | Komponenty z gwarancją (drożej) |

> [!TIP] Zestaw startowy
> Wiele sklepów sprzedaje „zestawy Arduino Starter Kit" zawierające breadboard, przewody, LEDy, rezystory, przyciski i potencjometry. Taki zestaw pokrywa wszystko czego potrzebujesz do modułów Podstawy i Protokoły.
