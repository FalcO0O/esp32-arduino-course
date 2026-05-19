# Teoria – czym jest mikrokontroler?

Zanim uruchomisz swój pierwszy program, warto zrozumieć z czym masz do czynienia. Ta strona wyjaśnia podstawowe pojęcia, które będą pojawiać się w całym kursie.

---

## 1. Komputer vs. mikrokontroler

Twój komputer to potężna maszyna: wielordzeniowy procesor, gigabajty RAM-u, system operacyjny zarządzający dziesiątkami procesów jednocześnie. Jest wszechstronny, ale też nieprzewidywalny – może się zawiesić, wymaga aktualizacji i pochłania wiele energii.

**Mikrokontroler (MCU)** to zupełnie inne podejście:

| Cecha | Komputer (PC) | Mikrokontroler (MCU) |
|:---|:---|:---|
| Procesor | Wielordzeniowy, GHz | Jednoprocessor, MHz–GHz |
| Pamięć RAM | Gigabajty | Kilobajty–Megabajty |
| System operacyjny | Windows / Linux / macOS | Brak (lub RTOS) |
| Zadania | Wiele jednocześnie | Jedno wgrane zadanie |
| Czas reakcji | Nieprzewidywalny (ms–s) | Deterministyczny (µs–ms) |
| Pobór energii | Dziesiątki–setki watów | Miliwarty–miliwarty |
| Cena | Setki złotych | 5–50 zł |

Mikrokontroler to **komputer na jednym układzie scalonym** – zawiera procesor, pamięć Flash (program), pamięć RAM (dane) i piny wejścia/wyjścia w jednej małej kostce.

> [!NOTE] Po co w ogóle mikrokontrolery?
> Są **małe, tanie i energooszczędne**. Termostat w piekarniku, sterownik ABS w samochodzie, inteligentna żarówka, rozrusznik serca – wszędzie tam, gdzie komputer byłby przerostem formy nad treścią, siedzi mikrokontroler.

---

## 2. ESP32-C6 – nasz układ

W tym kursie korzystamy z mikrokontrolera **ESP32-C6** firmy Espressif Systems. To nowoczesny układ oparty na otwartej architekturze **RISC-V**, który wyróżnia się bogatym zestawem peryferiów bezprzewodowych:

- **Wi-Fi 6** (802.11ax)
- **Bluetooth Low Energy 5.3**
- **Zigbee / Thread** (protokoły Smart Home)

Oprócz łączności bezprzewodowej układ oferuje:
- Przetwornik **ADC** (12-bit, odczyt napięcia analogowego)
- Magistrale **SPI, I2C, UART, I2S**
- Sprzętowy **PWM** na większości pinów GPIO
- Wbudowany system operacyjny czasu rzeczywistego **FreeRTOS**

---

## 3. GPIO – piny wejścia/wyjścia

**GPIO** (*General-Purpose Input/Output*) to piny na obrzeżach płytki, przez które mikrokontroler komunikuje się ze światem zewnętrznym. Każdy pin można skonfigurować jako:

- **Wyjście (OUTPUT):** pin wysyła napięcie – steruje diodą, silnikiem, przekaźnikiem.
- **Wejście (INPUT):** pin odczytuje napięcie – reaguje na przycisk, czujnik.

### Sygnały cyfrowe i analogowe

**Sygnał cyfrowy** zna tylko dwa stany:

- `HIGH` – napięcie 3,3 V (logiczna jedynka)
- `LOW` – napięcie 0 V, masa (logiczne zero)

**Sygnał analogowy** może przyjmować dowolną wartość w zakresie 0–3,3 V. Przetwornik ADC zamienia to napięcie na liczbę 0–4095 (rozdzielczość 12-bitowa).

> [!IMPORTANT] Napięcie logiczne: 3,3 V!
> ESP32-C6 pracuje na napięciu **3,3 V**, nie 5 V jak klasyczne Arduino UNO. Podanie 5 V na pin GPIO **uszkodzi układ**. Zawsze sprawdzaj napięcie modułów przed podłączeniem.

---

## 4. Protokoły komunikacyjne

Gdy chcemy podłączyć zewnętrzny czujnik lub moduł, używamy standaryzowanych protokołów komunikacyjnych. W tym kursie poznasz trzy najważniejsze:

### UART (*Universal Asynchronous Receiver-Transmitter*)
- **Przewody:** TX (nadajnik) + RX (odbiornik) + GND
- **Zasada:** Asynchroniczna – brak sygnału zegarowego, obie strony muszą umówić się na prędkość (*baud rate*).
- **Zastosowanie:** Komunikacja z komputerem (Serial Monitor), moduły GPS, Bluetooth Classic.

### I2C (*Inter-Integrated Circuit*)
- **Przewody:** SDA (dane) + SCL (zegar) + GND + VCC
- **Zasada:** Synchroniczna – jeden master steruje zegarem. Wiele urządzeń (każde z unikalnym adresem) na jednej parze przewodów.
- **Zastosowanie:** Czujniki (temperatury, ruchu, ciśnienia), małe wyświetlacze.

### SPI (*Serial Peripheral Interface*)
- **Przewody:** MOSI + MISO + SCK + CS + GND + VCC
- **Zasada:** Synchroniczna, pełnodupleksowa – dane płyną w obu kierunkach jednocześnie. Szybsza niż I2C.
- **Zastosowanie:** Wyświetlacze graficzne, karty pamięci SD, szybkie przetworniki.

---

## 5. Framework Arduino

**Arduino** to nie tylko płytka – to trzy różne rzeczy:

| Składnik | Co to jest |
|:---|:---|
| **Płytka** | Fizyczny sprzęt (Arduino UNO, ESP32 DevKit…) |
| **IDE** | Program na komputerze do pisania i wgrywania kodu |
| **Framework** | Biblioteka funkcji w C++ upraszczająca programowanie MCU |

W tym kursie korzystamy z **Arduino IDE** jako narzędzia i z **Arduino Framework** jako zestawu gotowych funkcji (`pinMode`, `digitalWrite`, `Serial.println`...), ale na sprzęcie **ESP32-C6** – nie na płytce Arduino.

> [!NOTE] Debugowanie
> Mikrokontroler nie ma monitora. Jedynym wbudowanym narzędziem debugowania jest wysyłanie tekstu przez port szeregowy (`Serial.println()`). To tzw. *printf debugging* i jest w tym kursie twoim najlepszym przyjacielem.
