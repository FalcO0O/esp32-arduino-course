# Pinout ESP32-C6 DevKit

Poniżej znajdziesz mapę pinów ESP32-C6 DevKit z opisem możliwości każdego GPIO.

---

## Tabela pinów GPIO

| GPIO | ADC | PWM | I2C | SPI | UART | Uwagi |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| GPIO0 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | Strapping Pin – unikaj wymuszania LOW przy starcie |
| GPIO1 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | |
| GPIO2 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | Często używany jako LED w kursie |
| GPIO3 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | |
| GPIO4 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | Potencjometr i TX UART w kursie |
| GPIO5 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | RX UART w kursie |
| GPIO6 | ✅ ADC1 | ✅ | ✅ | ✅ | ✅ | SDA I2C w kursie |
| GPIO7 | ❌ | ✅ | ✅ | ✅ | ✅ | SCL I2C w kursie |
| GPIO8 | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ Strapping Pin |
| GPIO9 | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ Strapping Pin – przycisk w kursie (INPUT_PULLUP) |
| GPIO10 | ❌ | ✅ | ✅ | ✅ | ✅ | |
| GPIO11 | ❌ | ✅ | ✅ | ✅ | ✅ | |
| GPIO12 | ❌ | ✅ | ✅ | ✅ | ✅ | |
| GPIO13 | ❌ | ✅ | ✅ | ✅ | ✅ | |
| GPIO14 | ❌ | ✅ | ✅ | ✅ | ✅ | |
| GPIO15 | ❌ | ✅ | ✅ | ✅ | ✅ | |

> [!NOTE] Legenda
> - **ADC** – pin obsługuje odczyt analogowy (`analogRead`)
> - **PWM** – pin obsługuje wyjście PWM (`analogWrite`)
> - Wszystkie GPIO obsługują `digitalRead` i `digitalWrite`

---

## Piny zasilania

| Pin | Napięcie | Opis |
|:---|:---:|:---|
| `3V3` | 3,3 V | Zasilanie czujników i modułów |
| `5V` / `VIN` | 5 V | Wejście zasilania (z USB lub zewnętrznego) |
| `GND` | 0 V | Masa – połącz z GND wszystkich modułów |

> [!CAUTION] Napięcie 3,3 V!
> ESP32-C6 pracuje na **3,3 V**. Podanie 5 V na pin GPIO lub SDA/SCL **uszkodzi układ**. Sprawdzaj napięcie modułów przed podłączeniem.

---

## Piny używane w kursie

| Komponent | GPIO | Konfiguracja | Moduł |
|:---|:---:|:---|:---|
| LED 1 | GPIO2 | OUTPUT | Podstawy Ćw. 2–3 |
| LED 2 | GPIO3 | OUTPUT | Podstawy Ćw. 2–3 |
| Przycisk | GPIO9 | INPUT_PULLUP | Podstawy Ćw. 5–6 |
| Potencjometr | GPIO4 | ADC (analogRead) | Podstawy Ćw. 4 |
| I2C SDA | GPIO6 | Wire.begin | Protokoły Ćw. 7 |
| I2C SCL | GPIO7 | Wire.begin | Protokoły Ćw. 7 |
| UART TX | GPIO4 | Serial1.begin | Protokoły Ćw. 8 |
| UART RX | GPIO5 | Serial1.begin | Protokoły Ćw. 8 |
| SPI SCK | GPIO6 | SPI | Protokoły Ćw. 9 |
| SPI MOSI | GPIO7 | SPI | Protokoły Ćw. 9 |
| SPI CS | GPIO2 | OUTPUT | Protokoły Ćw. 9 |
| SPI DC | GPIO3 | OUTPUT | Protokoły Ćw. 9 |
| SPI RES | GPIO4 | OUTPUT | Protokoły Ćw. 9 |

> [!WARNING] Konflikty pinów
> Piny UART i SPI w tabeli powyżej używają tych samych GPIO (4,5,6,7) co I2C. To nie problem – **każde ćwiczenie to osobny projekt**, nie uruchamiasz ich wszystkich naraz. Jeśli budujesz własny projekt łączący wiele protokołów, wybierz niekolizyjne piny.

---

## Strapping Pins – co to znaczy?

Strapping Pins to piny, które ESP32-C6 sprawdza **w momencie uruchamiania** (reset/zasilanie) i na podstawie ich stanu decyduje o trybie pracy:

| Pin | Stan przy starcie | Efekt |
|:---|:---:|:---|
| GPIO8 | HIGH (domyślnie) | Normalny start |
| GPIO8 | LOW | Wejście w tryb bootloader (SPI download) |
| GPIO9 | HIGH (domyślnie) | Normalny start |
| GPIO9 | LOW | Wejście w tryb JTAG |

Dlatego przycisk na GPIO9 działa z `INPUT_PULLUP` – rezystor pull-up utrzymuje pin w stanie HIGH podczas startu i nie zakłóca bootowania.
