# Ćwiczenie 12 – Deep Sleep: zarządzanie energią

**Potrzebujesz:** ESP32-C6 DevKit, opcjonalnie: przycisk na breadboardzie (do wybudzenia GPIO).

Urządzenia IoT często zasilane są z baterii i muszą działać miesiącami lub latami. ESP32-C6 w trybie aktywnym pobiera ok. 80–150 mA. W trybie **Deep Sleep** – zaledwie kilka µA (mikroamperów). To różnica rzędu 10 000×!

🎯 **[Otwórz Wokwi z symulacją Deep Sleep z Timerem]** *(link zostanie zaktualizowany)*

---

## Tryby uśpienia ESP32-C6

| Tryb | CPU | Wi-Fi/BT | RAM | Zużycie | Wybudzenie |
|:---|:---:|:---:|:---:|:---:|:---|
| Aktywny | ✅ | ✅ | ✅ | ~100 mA | — |
| Modem Sleep | ✅ | ❌ | ✅ | ~20 mA | automatyczne |
| Light Sleep | ❌ | ❌ | ✅ | ~2 mA | timer, GPIO, UART |
| **Deep Sleep** | ❌ | ❌ | ❌* | **~5–15 µA** | timer, GPIO, ULP |

\* *Wyjątek: pamięć RTC (kilka kB) pozostaje aktywna i zachowuje dane między uśpieniami.*

---

## Zmienne przeżywające Deep Sleep: `RTC_DATA_ATTR`

Normalnie po wybudzeniu z Deep Sleep ESP32 restartuje się – wszystkie zmienne są zerowane. Aby zachować dane, użyj atrybutu `RTC_DATA_ATTR`:

```cpp
// Ta zmienna NIE jest zerowana po wybudzeniu z Deep Sleep
RTC_DATA_ATTR int liczbaWybudzen = 0;
```

Zmienna jest przechowywana w pamięci RTC, która pozostaje zasilona nawet w Deep Sleep.

---

## Ćwiczenie: budzenie timerem

Płytka co 10 sekund budzi się, wykonuje pomiar, wyświetla wynik i ponownie zasypia.

```cpp
#include "esp_sleep.h"

// RTC_DATA_ATTR – zachowana między uśpieniami
RTC_DATA_ATTR int liczbaWybudzen = 0;

const uint64_t SLEEP_US = 10 * 1000000ULL; // 10 sekund w mikrosekundach
const int PIN_POT = 4; // ADC do symulacji "pomiaru czujnika"

void setup() {
  Serial.begin(115200);
  delay(100); // Krótka chwila na stabilizację Serial

  liczbaWybudzen++;

  // Sprawdź przyczynę wybudzenia
  esp_sleep_wakeup_cause_t przyczyna = esp_sleep_get_wakeup_cause();
  switch (przyczyna) {
    case ESP_SLEEP_WAKEUP_TIMER:
      Serial.println("Wybudzono: Timer");
      break;
    case ESP_SLEEP_WAKEUP_EXT0:
      Serial.println("Wybudzono: GPIO (EXT0)");
      break;
    default:
      Serial.println("Pierwsze uruchomienie lub reset");
      break;
  }

  Serial.print("Liczba wybudzeń: ");
  Serial.println(liczbaWybudzen);

  // Symulacja "pomiaru czujnika"
  int odczyt = analogRead(PIN_POT);
  Serial.print("Odczyt ADC: ");
  Serial.println(odczyt);

  Serial.println("Zasypiam na 10 sekund...\n");
  Serial.flush(); // Poczekaj aż Serial wyśle wszystko zanim zaśniemy

  // Konfiguracja wybudzenia przez timer
  esp_sleep_enable_timer_wakeup(SLEEP_US);

  // Wejście w Deep Sleep
  esp_deep_sleep_start();
  // Kod po tej linii NIGDY nie zostanie wykonany
}

void loop() {
  // Nigdy nie zostanie wywołane – po setup() ESP32 jest już uśpiony
}
```

---

## Wybudzanie przez GPIO

Aby wybudzić ESP32-C6 przez naciśnięcie przycisku (GPIO):

```cpp
// Wybudź gdy GPIO9 przejdzie w stan LOW (naciśnięty przycisk z INPUT_PULLUP)
esp_sleep_enable_ext0_wakeup(GPIO_NUM_9, 0); // 0 = LOW
```

Dodaj tę linię **przed** `esp_deep_sleep_start()` (zamiast lub razem z timerem).

> [!WARNING] Które piny działają z EXT0?
> Na ESP32-C6 wybudzenie przez GPIO (EXT0/EXT1) działa tylko na **pinach zasilanych przez RTC**. Sprawdź dokumentację lub użyj GPIO0–GPIO7 – te piny na ESP32-C6 są obsługiwane przez RTC i mogą budzić układ.

---

## Porównanie z normalnym restartem

```
Normal boot (reset/zasilanie):
setup() → loop() → ...
Zmienne: wyzerowane

Deep Sleep wakeup:
Tylko setup() jest wywoływane (loop() nie!)
Zmienne RTC_DATA_ATTR: zachowane
Zmienne normalne: wyzerowane
```

---

## Zadanie do samodzielnego wykonania

Rozbuduj program o:
1. Wyświetlanie odczytu ADC i liczby wybudzeń na wyświetlaczu OLED (z Ćw. 9).
2. Podłącz przycisk i skonfiguruj **równoległe** wybudzanie: zarówno przez timer (10 s) jak i przez przycisk GPIO. Wyświetlaj w Serial Monitor która przyczyna wybudziła płytkę.

<details>
<summary>Pokaż rozwiązanie konfiguracji obu źródeł</summary>

```cpp
  // Na końcu funkcji setup(), przed wywołaniem deep_sleep_start():
  
  // Konfiguracja wybudzenia przez timer (10 sekund)
  esp_sleep_enable_timer_wakeup(SLEEP_US);

  // Oraz jednoczesna konfiguracja wybudzenia przez GPIO9 (przycisk PULLUP spada na LOW)
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_9, 0); 

  // Wejście w Deep Sleep
  esp_deep_sleep_start();
```
</details>
