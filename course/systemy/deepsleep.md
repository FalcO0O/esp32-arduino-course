# Sleep: zarządzanie energią

Mikrokontrolery w urządzeniach IoT nie zawsze muszą pracować przez cały czas. Bardzo często aplikacja polega na cyklicznym sprawdzaniu jakiejś wartości (np. temperatury, stanu czujnika) co kilka sekund, minut czy nawet godzin, a następnie przetworzeniu tej informacji. Utrzymywanie w pełni włączonego mikrokontrolera w czasie bezczynności jest ogromnym marnowaniem energii, co jest szczególnie krytyczne przy zasilaniu bateryjnym. 

Aby tego uniknąć, wprowadza się układ w tryb uśpienia. ESP32-C6 w trybie aktywnym pobiera ok. 80–150 mA. W trybie głębokiego snu (**Deep Sleep**) – zaledwie kilka µA (mikroamperów). To różnica rzędu 10 000×!

🎯 **[Otwórz Wokwi z symulacją Deep Sleep z Timerem]** *(link zostanie zaktualizowany)*

> [!TIP] Wgrywanie programu do śpiącego układu
> Podczas gdy mikrokontroler "śpi", zasilanie wewnętrznych układów (w tym tych odpowiedzialnych za automatyczną komunikację USB/UART) jest odcięte. Sprawia to, że **komputer może nie wykryć układu, uniemożliwiając wgranie nowego programu**. 
> Aby wgrać kod do uśpionego ESP32, musisz wprowadzić go w tryb Bootloadera ręcznie: wciśnij i trzymaj przycisk **BOOT**, następnie kliknij przycisk **RST/EN**, a na końcu puść przycisk **BOOT**. Dopiero wtedy rozpocznij wgrywanie w Arduino IDE.

---

## Różnica między Light Sleep a Deep Sleep

ESP32-C6 posiada kilka trybów uśpienia, z których dwa są najczęściej wykorzystywane:

* **Light Sleep (Lekki Sen)**: Mikrokontroler zatrzymuje główny procesor, ale pamięć RAM oraz peryferia wciąż pozostają pod napięciem. Wybudzenie następuje natychmiastowo, a program po prostu wznawia działanie od miejsca, w którym zasnął (zupełnie tak, jakby użyto funkcji `delay()`). Zużycie prądu spada do ok. 2 mA.
* **Deep Sleep (Głęboki Sen)**: Oszczędzanie absolutne. Odcięte zostaje zasilanie niemal całego układu, w tym głównego procesora i pamięci RAM. Po wybudzeniu mikrokontroler **restartuje się całkowicie** (od nowa wywoływana jest funkcja `setup()`). Zużycie prądu spada do zaledwie ~5–15 µA.

| Tryb | CPU | Wi-Fi/BT | RAM | Zużycie | Wybudzenie |
|:---|:---:|:---:|:---:|:---:|:---|
| Aktywny | ✅ | ✅ | ✅ | ~100 mA | — |
| Modem Sleep | ✅ | ❌ | ✅ | ~20 mA | automatyczne |
| Light Sleep | ❌ | ❌ | ✅ | ~2 mA | timer, GPIO, UART |
| **Deep Sleep** | ❌ | ❌ | ❌* | **~5–15 µA** | timer, GPIO, ULP |

\* *Wyjątek: pamięć RTC (kilka kB) pozostaje aktywna i zachowuje dane między uśpieniami.*

> [!CAUTION] Dlaczego rzeczywiste pomiary na płytce DevKit będą znacznie wyższe?
> Wartości rzędu $5\text{–}15\ \mu\text{A}$ podane w tabeli dotyczą samego mikrokontrolera ESP32-C6. Jeśli spróbujesz zmierzyć pobór prądu całej płytki deweloperskiej (DevKit) podłączonej pod zasilanie USB, miernik wskaże znacznie więcej (często nawet od 1 do kilku miliamperów!). Wynika to z obecności dodatkowych elementów na laminacie płytki:
> 1. **Stabilizator napięcia (LDO)**: Regulatory montowane na płytkach DevKit mają wysoki prąd spoczynkowy (*quiescent current*). Zużywają energię nawet wtedy, gdy sam mikrokontroler śpi.
> 2. **Układ konwertera USB-UART (np. CP2102 lub CH340)**: Obsługuje on programowanie i Monitor Szeregowi, pobierając prąd z szyny 3.3V przez cały czas, gdy płytka ma zasilanie.
> 3. **Dioda LED zasilania (Power LED)**: Dioda sygnalizująca włączenie płytki sama z siebie pobiera od $1\text{ do }3\text{ mA}$.
> 
> **Jak to rozwiązać w docelowym urządzeniu?**
> Aby osiągnąć zużycie rzędu pojedynczych mikroamperów, w urządzeniach zasilanych bateryjnie stosuje się moduły (np. ESP32-C6-WROOM) zamontowane be## 🧠 Czym jest RTC i domena Low Power?

Podczas głębokiego uśpienia (Deep Sleep) główne zasilanie mikrokontrolera ESP32-C6 (w tym rdzenia procesora RISC-V, pamięci RAM oraz peryferii takich jak Wi-Fi, SPI czy I2C) zostaje całkowicie wyłączone. Jedynym modułem, który pozostaje stale pod napięciem, jest **RTC** (*Real-Time Clock / Real-Time Controller*) – niezależna, ultra-energooszczędna domena sprzętowa.

W skład domeny RTC wchodzą:

1. **Zegar czasu rzeczywistego (RTC Timer)**: Liczy czas i pozwala wybudzić układ po określonym czasie.
2. **Pamięć RTC (LP SRAM)**: Mały obszar pamięci RAM (16 KB na ESP32-C6), w którym możemy zapisać krytyczne dane, które nie zostaną utracone podczas uśpienia głównego procesora.
3. **Peryferia RTC (LP Peripherals / LP GPIO)**: Wybrane piny mikrokontrolera, które mogą monitorować stany napięć i generować sygnały wybudzenia.

Dzięki temu domena RTC działa jak mały, niezależny strażnik, który czuwa przy minimalnym poborze prądu i w odpowiednim momencie (np. po upłynięciu czasu lub naciśnięciu przycisku) podaje zasilanie na główny rdzeń ESP32-C6.

---

## 💾 Zmienne przeżywające uśpienie: `RTC_DATA_ATTR`

> [!WARNING] Utrata standardowych zmiennych
> Ponieważ główna pamięć RAM zostaje odcięta od zasilania w trybie Deep Sleep, **wszystkie standardowe zmienne globalne i lokalne ulegają skasowaniu**. Po wybudzeniu program startuje od nowa (wywoływany jest `setup()`), a zmienne otrzymują swoje wartości początkowe.

Aby zapobiec utracie zmiennej i zapisać ją w pamięci RTC, należy poprzedzić jej deklarację modyfikatorem `RTC_DATA_ATTR`:

```cpp
// Ta zmienna zostanie zapisana w pamięci RTC i nie wyzeruje się przy wybudzeniu
RTC_DATA_ATTR int liczbaWybudzen = 0;
```

---

## 🔌 Źródła wybudzenia (Wakeup Sources)

Konfigurację tego, co ma wybudzić mikrokontroler z głębokiego snu, przeprowadza się w funkcji `setup()` przed wywołaniem uśpienia. ESP32-C6 obsługuje kilka niezależnych źródeł wybudzeń, które mogą działać równolegle:

### 1. Wybudzenie czasowe (Timer Wakeup)
Pozwala na cykliczne budzenie procesora po określonym czasie (podawanym w mikrosekundach - $\mu\text{s}$):
```cpp
// Wybudź po 10 sekundach (10 000 000 us)
esp_sleep_enable_timer_wakeup(10000000ULL);
```

### 2. Wybudzenie zewnętrzne (GPIO / EXT0 Wakeup)
Pozwala wybudzić układ poprzez zmianę stanu logicznego na fizycznym pinie:
```cpp
// Wybudź gdy na pinie GPIO7 pojawi się stan niski (LOW / 0)
esp_sleep_enable_ext0_wakeup(GPIO_NUM_7, 0); 
```

> [!IMPORTANT] Ograniczenie pinów dla EXT0
> Wybudzenie przez pin w trybie Deep Sleep działa wyłącznie na pinach obsługiwanych przez domenę RTC (są to piny od **GPIO0** do **GPIO7**, oznaczone jako `LP_GPIO` na [schemacie pinoutu](../start/sprzet.md#schemat-wyprowadzen-pinout)). Podłączenie przycisku budzącego do pinu z domeny High Power (np. GPIO9) nie przyniesie żadnego efektu, ponieważ ten pin w trybie Deep Sleep nie jest zasilany i nie czuwa.

---

## 🎯 Ćwiczenie praktyczne: Równoległe budzenie przyciskiem i timerem

Napiszemy program, który w pełny sposób zaprezentuje możliwości Deep Sleep. Mikrokontroler będzie przechodził w głębokie uśpienie, z którego wybudzi go:

* Upływ 10 sekund (Timer)
* Wciśnięcie przycisku podłączonego do **GPIO7** (zewnętrzne przerwanie EXT0).

Program będzie zliczał oddzielnie wybudzenia z każdego z tych źródeł (dzięki zmiennym w RTC) oraz mrugał wbudowaną diodą LED (GPIO2) w różny sposób, zależnie od przyczyny wybudzenia.

### Kod programu:

```cpp
#include "esp_sleep.h"

// Zmienne w pamięci RTC – przeżywają Deep Sleep
RTC_DATA_ATTR int liczba_timer = 0;
RTC_DATA_ATTR int liczba_gpio = 0;

const uint64_t SLEEP_US = 10 * 1000000ULL; // 10 sekund w mikrosekundach
const int PIN_LED = 2; // Wbudowana dioda LED w ESP32-C6

void setup() {
  Serial.begin(115200);
  delay(100); // Czas na stabilizację Serial
  
  pinMode(PIN_LED, OUTPUT);

  // Odczytujemy przyczynę wybudzenia
  esp_sleep_wakeup_cause_t przyczyna = esp_sleep_get_wakeup_cause();
  
  switch (przyczyna) {
    case ESP_SLEEP_WAKEUP_TIMER:
      liczba_timer++;
      Serial.println("Wybudzono przez: TIMER");
      // Sygnalizacja: 1 krótkie mignięcie
      digitalWrite(PIN_LED, HIGH);
      delay(100);
      digitalWrite(PIN_LED, LOW);
      break;
      
    case ESP_SLEEP_WAKEUP_EXT0:
      liczba_gpio++;
      Serial.println("Wybudzono przez: GPIO (Przycisk)");
      // Sygnalizacja: 2 szybkie mignięcia
      digitalWrite(PIN_LED, HIGH);
      delay(150);
      digitalWrite(PIN_LED, LOW);
      delay(150);
      digitalWrite(PIN_LED, HIGH);
      delay(150);
      digitalWrite(PIN_LED, LOW);
      break;
      
    default:
      Serial.println("Uruchomienie po włączeniu zasilania lub twardym resecie");
      break;
  }

  // Wypisz statystyki wybudzeń
  Serial.print("Statystyki - Wybudzenia timerem: ");
  Serial.print(liczba_timer);
  Serial.print(" | Wybudzenia przyciskiem: ");
  Serial.println(liczba_gpio);

  Serial.println("Zasypiam...\n");
  Serial.flush(); // Poczekaj aż Serial wyśle wszystkie dane przed uśpieniem

  // 1. Konfiguracja wybudzenia timerem
  esp_sleep_enable_timer_wakeup(SLEEP_US);

  // 2. Konfiguracja wybudzenia przyciskiem (GPIO7, stan LOW - przycisk zwiera do masy)
  // Konieczne jest użycie zewnętrznego przycisku na płytce stykowej
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_7, 0); 

  // Wejście w Deep Sleep
  esp_deep_sleep_start();
}

void loop() {
  // Puste – po setup() ESP32 natychmiast zasypia
}
```

---

## Porównanie procesu startu systemu

| Etap | Twardy reset / Zasilanie | Wybudzenie z Deep Sleep | Wybudzenie z Light Sleep |
|:---|:---|:---|:---|
| **Przebieg kodu** | Uruchomienie `setup()` od zera, potem `loop()` | Uruchomienie `setup()` od zera, potem `loop()` | Kontynuacja linii kodu tuż pod komendą uśpienia |
| **Zwykłe zmienne** | Inicjalizowane wartościami domyślnymi | Inicjalizowane wartościami domyślnymi (utracone) | Zachowane w pamięci RAM bez zmian |
| **Zmienne RTC** | Inicjalizowane wartościami domyślnymi | **Zachowane** (nie resetują się) | Zachowane |

---

## 🛠️ Zadanie: Agregator zdarzeń IoT (Dzwonek z raportem okresowym)

W prawdziwych urządzeniach IoT bardzo częstym schematem projektowym jest **agregowanie zdarzeń lokalnie w pamięci RTC** i wysyłanie ich zbiorczo dopiero w określonych odstępach czasu (tzw. wysyłka paczkowana / heartbeat), co drastycznie oszczędza energię (nie uruchamia radia przy każdym kliknięciu).

Zmodyfikuj program tak, aby zasymulować ten scenariusz:

1. **Wybudzenie przyciskiem (GPIO7)** oznacza kliknięcie dzwonka. Program powinien zwiększyć licznik kliknięć (`licznikKlikniec++`), wypisać informację o zarejestrowaniu kliknięcia oraz krótko mrugnąć diodą LED (np. na 100 ms).
2. **Wybudzenie timerem (co 30 sekund)** oznacza wysłanie raportu do bazy. Program powinien wypisać raport ze statystyką kliknięć dzwonka z tego okresu, zwiększyć ogólny licznik wysłanych raportów (`liczbaRaportow++`), **zresetować licznik kliknięć do zera** na kolejny okres i dłużej mrugnąć diodą LED (np. na 600 ms).

*Przetestuj układ, klikając przycisk kilkukrotnie w ciągu 30 sekund i obserwuj w Monitorze Portu Szeregowego, jak zmieniają się wartości po wybudzeniu przez Timer.*

<details>
<summary>Pokaż rozwiązanie zadania</summary>

```cpp
#include "esp_sleep.h"

// Zmienne w pamięci RTC – przeżywają Deep Sleep
RTC_DATA_ATTR int licznikKlikniec = 0;
RTC_DATA_ATTR int liczbaRaportow = 0;

const uint64_t SLEEP_US = 30 * 1000000ULL; // Raport co 30 sekund
const int PIN_LED = 2;

void setup() {
  Serial.begin(115200);
  delay(100); // Czas na stabilizację Serial
  
  pinMode(PIN_LED, OUTPUT);

  esp_sleep_wakeup_cause_t przyczyna = esp_sleep_get_wakeup_cause();
  
  switch (przyczyna) {
    case ESP_SLEEP_WAKEUP_EXT0:
      // Zwiększamy licznik dzwonka
      licznikKlikniec++;
      Serial.print("🔔 Dzwonek wciśnięty! (W tym okresie: ");
      Serial.print(licznikKlikniec);
      Serial.println(")");
      
      // Krótkie mignięcie
      digitalWrite(PIN_LED, HIGH);
      delay(100);
      digitalWrite(PIN_LED, LOW);
      break;
      
    case ESP_SLEEP_WAKEUP_TIMER:
      liczbaRaportow++;
      Serial.println("\n----------------------------------------");
      Serial.print("📊 RAPORT OKRESOWY #");
      Serial.println(liczbaRaportow);
      Serial.print("Liczba dzwonków w tym okresie: ");
      Serial.println(licznikKlikniec);
      Serial.println("Resetuję licznik na kolejny okres.");
      Serial.println("----------------------------------------\n");
      
      // Resetowanie licznika kliknięć
      licznikKlikniec = 0;
      
      // Długie mignięcie
      digitalWrite(PIN_LED, HIGH);
      delay(600);
      digitalWrite(PIN_LED, LOW);
      break;
      
    default:
      Serial.println("🚀 Pierwsze uruchomienie. Rozpoczynam monitorowanie dzwonka.");
      break;
  }

  Serial.println("Zasypiam...\n");
  Serial.flush();

  // Konfiguracja obu źródeł
  esp_sleep_enable_timer_wakeup(SLEEP_US);
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_7, 0); 
  
  esp_deep_sleep_start();
}

void loop() {
}
```
</details>
