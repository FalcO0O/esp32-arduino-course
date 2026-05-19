# Ćwiczenie 3 – PWM: płynna regulacja jasności

**Potrzebujesz:** 🔌 Układ z Ćw. 2 (LED + rezystor na breadboardzie).

Wyjście cyfrowe daje tylko dwa stany: włącz/wyłącz. Co jeśli chcemy **płynnie** regulować jasność diody? Z pomocą przychodzi technika **PWM**.

---

## Czym jest PWM?

**PWM** (*Pulse Width Modulation* – Modulacja Szerokości Impulsu) to technika symulowania sygnału analogowego za pomocą szybkiego przełączania sygnału cyfrowego. Pin jest bardzo szybko włączany i wyłączany, a ludzkie oko uśrednia ilość światła – widzi płynną zmianę jasności.

Kluczowy parametr to **wypełnienie (duty cycle)** – stosunek czasu włączenia do całego okresu sygnału:

```
100% duty cycle: ████████████  → dioda pełna jasność
 50% duty cycle: ██████░░░░░░  → dioda świeci w połowie
 25% duty cycle: ███░░░░░░░░░  → dioda ledwo świeci
  0% duty cycle: ░░░░░░░░░░░░  → dioda zgaszona
```

W Arduino funkcja `analogWrite(pin, wartość)` ustawia wypełnienie PWM. Wartość to liczba od **0** (całkowicie wyłączone) do **255** (pełna moc).

> [!NOTE] PWM na ESP32-C6
> ESP32-C6 posiada sprzętowy moduł LEDC do generowania PWM. `analogWrite()` w pakiecie Arduino-ESP32 korzysta z niego automatycznie – działa na większości pinów GPIO.

---

## Kod do uzupełnienia: oddychająca dioda

```cpp
// Ten sam pin co w Ćw. 2
const int PIN_LED = 2;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Pętla stopniowo zwiększa jasność od 0 do 255
  for (int jasnosc = 0; jasnosc <= 255; jasnosc++) {
    // UZUPEŁNIJ: ustaw jasność LED za pomocą analogWrite
    delay(8); // Krótkie opóźnienie dla płynnej animacji
  }

  // Pętla stopniowo zmniejsza jasność od 255 do 0
  for (int jasnosc = 255; jasnosc >= 0; jasnosc--) {
    // UZUPEŁNIJ: ustaw jasność LED za pomocą analogWrite
    delay(8);
  }
}
```

<details>
<summary>Rozwiązanie</summary>

```cpp
const int PIN_LED = 2;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  for (int jasnosc = 0; jasnosc <= 255; jasnosc++) {
    analogWrite(PIN_LED, jasnosc);
    delay(8);
  }
  for (int jasnosc = 255; jasnosc >= 0; jasnosc--) {
    analogWrite(PIN_LED, jasnosc);
    delay(8);
  }
}
```
</details>

---

## Zadanie do samodzielnego wykonania: diody w przeciwfazie

Podłącz **drugą diodę LED** (jeśli jeszcze nie masz z Ćw. 2) i uzyskaj efekt, w którym gdy jedna dioda się **rozjaśnia**, druga w tym samym czasie **płynnie gaśnie**.

<details>
<summary>Podpowiedź</summary>
Wewnątrz istniejących pętli <code>for</code> dopisz sterowanie drugą diodą tak, aby jej jasność wynosiła zawsze <code>255 - jasnosc</code>.
</details>
