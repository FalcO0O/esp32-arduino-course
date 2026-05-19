# Ćwiczenie 6 – Przerwania zewnętrzne

**Potrzebujesz:** 🔌 Układ z Ćw. 5 (przycisk na breadboardzie).

W poprzednim ćwiczeniu sprawdzałeś stan przycisku **aktywnie** w pętli `loop()` (tzw. *polling*). To proste, ale nieefektywne – procesor co chwilę sprawdza „czy już?", zamiast zająć się czymś innym.

**Przerwanie** (interrupt) odwraca tę logikę: mikrokontroler zajmuje się swoją pracą, a gdy pin zmieni stan, sprzęt **automatycznie przerywa** wykonywanie kodu i wywołuje specjalną funkcję obsługi.

---

## Polling vs. przerwania

| | Polling (pętla) | Przerwanie (ISR) |
|:---|:---|:---|
| Sprawdzanie | Co każdą iterację pętli | Natychmiast po zdarzeniu |
| CPU | Zajęty sprawdzaniem | Wolny na inną pracę |
| Opóźnienie reakcji | Zależy od długości pętli | Minimalne (µs) |
| Zastosowanie | Proste projekty | Precyzyjne reagowanie |

---

## Jak działają przerwania?

Każdy GPIO ESP32-C6 może generować przerwanie na:
- `RISING` – zbocze narastające (LOW → HIGH)
- `FALLING` – zbocze opadające (HIGH → LOW)  
- `CHANGE` – dowolna zmiana stanu
- `LOW` / `HIGH` – gdy pin ma dany stan

### Rejestracja przerwania:
```cpp
attachInterrupt(digitalPinToInterrupt(PIN), funkcjaISR, tryb);
```

### Funkcja ISR (Interrupt Service Routine):
```cpp
void IRAM_ATTR nazwaISR() {
  // Kod wykonywany po wystąpieniu przerwania
  // ZASADA: jak najkrócej! Tylko zmiana zmiennej, bez delay(), Serial.println() itp.
}
```

> [!IMPORTANT] Dwa kluczowe słowa kluczowe
> - `IRAM_ATTR` – umieszcza funkcję w szybkiej pamięci IRAM (wymagane dla ESP32)
> - `volatile` – informuje kompilator, że zmienna może być zmieniana poza normalnym przepływem kodu (przez ISR). Bez tego kompilator może ją zoptymalizować i pominąć!

---

## Kod: licznik naciśnięć przez przerwanie

```cpp
const int PIN_BTN = 9;
const int PIN_LED = 2;

// volatile – zmienna współdzielona między pętlą główną a ISR
volatile int licznikKlikniec = 0;
volatile bool noveKlikniecie = false;

// ISR – wywoływana automatycznie przy zboczu opadającym (naciśnięcie)
void IRAM_ATTR obslugaPrzycisku() {
  licznikKlikniec++;
  noveKlikniecie = true;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BTN, INPUT_PULLUP);

  // Rejestracja przerwania: wywołaj obslugaPrzycisku() przy FALLING (HIGH→LOW)
  attachInterrupt(digitalPinToInterrupt(PIN_BTN), obslugaPrzycisku, FALLING);

  Serial.println("Naciśnij przycisk...");
}

void loop() {
  // Pętla może robić coś innego – tutaj symulujemy pracę przez delay
  delay(100);

  // Sprawdzamy flagę ustawioną przez ISR
  if (noveKlikniecie) {
    noveKlikniecie = false; // Resetuj flagę

    Serial.print("Kliknięcia: ");
    Serial.println(licznikKlikniec);

    // Co parzyste kliknięcie przełącza LED
    digitalWrite(PIN_LED, licznikKlikniec % 2 == 0 ? LOW : HIGH);
  }
}
```

> [!WARNING] Drgania styków i ISR
> Przerwania reagują na każde zbocze, w tym na drgania styków. Przy mechanicznym przycisku jedna fizyczna akcja może wywołać kilka przerwań z rzędu. Rozwiązania:
> - Debouncing sprzętowy (kondensator 100nF równolegle do przycisku)
> - Debouncing w ISR przez sprawdzenie `millis()` – sprawdź czas od ostatniego przerwania i ignoruj zbyt szybkie kolejne zdarzenia

---

## Zadanie do samodzielnego wykonania

Zmodyfikuj program tak, aby ISR mierzyła **czas między kolejnymi naciśnięciami** za pomocą `millis()`. Wyniki wyświetlaj w pętli `loop()` w Monitorze Szeregowym.

<details>
<summary>Podpowiedź</summary>
Zadeklaruj <code>volatile unsigned long ostatnieKlikniecie = 0;</code>. W ISR zapisz <code>unsigned long teraz = millis();</code>, oblicz różnicę i zapisz do zmiennej, a potem zaktualizuj <code>ostatnieKlikniecie = teraz;</code>.
</details>
