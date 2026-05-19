# Kurs Programowania Mikrokontrolerów ESP32-C6

Witaj! Ten kurs przeprowadzi Cię krok po kroku przez programowanie mikrokontrolera **ESP32-C6** w środowisku Arduino IDE – od najprostszego „Witaj świecie" aż po zaawansowane systemy bezprzewodowe i wielozadaniowe.

---

## Jak korzystać z kursu?

Kurs jest zbudowany **liniowo** – każdy moduł zakłada znajomość poprzedniego. Postępuj zgodnie z kolejnością zakładek:

```
🏠 Start → ⚡ Podstawy → 🔌 Protokoły → ⚙️ Systemy → 📡 Bezprzewodowe
```

Możesz wracać do wcześniejszych modułów jako dokumentacji referencyjnej. Zakładka 📚 **Materiały** jest zawsze dostępna i zawiera kod wzorcowy oraz pinout.

---

## Oznaczenia używane w kursie

| Ikona | Znaczenie |
|:---:|:---|
| 👥 | Ćwiczenie wymaga **dwóch płytek ESP32** |
| 📱 | Ćwiczenie wymaga **smartfona** (Android lub iOS) |
| 🔌 | Ćwiczenie wymaga **breadboard i komponentów** |

---

## Mapa modułów

### 🏠 Start – *jesteś tutaj*
Poznaj teorię działania mikrokontrolerów, skompletuj sprzęt i zainstaluj środowisko Arduino IDE.

**Strony:**
- [Teoria – czym jest mikrokontroler](teoria.md)
- [Lista potrzebnego sprzętu](sprzet.md)
- [Instalacja Arduino IDE](ide.md)

---

### ⚡ Podstawy
Napisz swój pierwszy program, poznaj płytkę stykową, naucz się sterować diodami, odczytywać sygnały analogowe i reagować na przyciski.

**Czego się nauczysz:** Serial Monitor · GPIO · PWM · ADC · digitalRead · Przerwania

---

### 🔌 Protokoły
Podłącz zewnętrzne czujniki i moduły przez magistrale komunikacyjne I2C, UART i SPI.

**Czego się nauczysz:** I2C z MPU6050 · UART loopback · SPI z wyświetlaczem OLED

---

### ⚙️ Systemy
Poznaj wielozadaniowość dzięki systemowi FreeRTOS i naucz się zarządzać energią układu.

**Czego się nauczysz:** Zadania FreeRTOS · Kolejki · Deep Sleep · RTC Memory

---

### 📡 Bezprzewodowe
Skomunikuj mikrokontrolery bezprzewodowo i zbuduj interfejsy sieciowe.

**Czego się nauczysz:** ESP-NOW 👥 · Wi-Fi · Serwer WWW · REST API · BLE

---

### 📚 Materiały
Referencje, kod wzorcowy i linki do dokumentacji.

---

## Wymagany sprzęt – skrót

Pełna lista z opisem i linkami jest na stronie [Lista potrzebnego sprzętu](sprzet.md).

| Komponent | Ilość |
|:---|:---:|
| ESP32-C6 DevKit | 1 (do ESP-NOW: 2) |
| Breadboard | 1 |
| Kabel USB-C | 1 |
| Przewody jumper M-M | 10–20 szt. |
| LED (dowolny kolor) | 2 szt. |
| Rezystor 220–330 Ω | 2 szt. |
| Przycisk tact switch | 1 szt. |
| Potencjometr 10 kΩ | 1 szt. |
| Moduł MPU6050 (I2C) | 1 szt. |
| Wyświetlacz OLED SSD1306 (SPI) | 1 szt. |

> [!TIP] Nie musisz mieć wszystkiego od razu
> Pierwsze ćwiczenia wymagają **wyłącznie** ESP32-C6, kabla USB i komputera. Kolejne komponenty dokupujesz stopniowo, kiedy dochodzisz do odpowiednich ćwiczeń.
