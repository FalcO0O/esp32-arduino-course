# Ćwiczenie 4 – ADC: odczyt potencjometru

**Potrzebujesz:** 🔌 Breadboard, potencjometr 10 kΩ, LED + rezystor (z Ćw. 2), przewody jumper.

Świat fizyczny jest analogowy – temperatura, oświetlenie czy położenie gałki zmieniają się **płynnie**. Aby mikrokontroler mógł odczytać takie wartości, używa wbudowanego modułu **ADC**.

---

## Czym jest ADC?

**ADC** (*Analog-to-Digital Converter* – Przetwornik Analogowo-Cyfrowy) zamienia płynne napięcie na liczbę.

ESP32-C6 ma 12-bitowy ADC, co oznacza rozdzielczość **4096 wartości** (2¹² = 4096):
- `0` → 0 V
- `4095` → 3,3 V
- `2047` → ok. 1,65 V

Odczyt napięcia realizuje funkcja `analogRead(pin)`.

> [!IMPORTANT] Które piny mają ADC?
> Na ESP32-C6 przetwornik ADC jest dostępny na pinach: **GPIO0, GPIO1, GPIO2, GPIO3, GPIO4, GPIO5, GPIO6**.
> Przed użyciem sprawdź pinout swojego DevKitu! Użyj jednego z wymienionych pinów do podłączenia potencjometru.

---

## Podłączenie potencjometru

Potencjometr to dzielnik napięcia z regulowanym punktem podziału. Ma trzy wyprowadzenia:

```
3,3V  ──────────── Pin 1 (skrajny)
                   Pin 2 (środkowy) ──────► GPIO_ADC (np. GPIO4)
GND   ──────────── Pin 3 (skrajny)
```

Obracając gałkę, zmieniasz napięcie na pinie środkowym od 0 V do 3,3 V.

---

## Czym jest funkcja `map()`?

Zanim uzupełnisz kod, poznaj funkcję `map()`. Proporcjonalnie przeskalowuje wartość z jednego zakresu na inny:

```cpp
map(wartość, minWe, maxWe, minWy, maxWy)
```

Przykład: przelicz odczyt ADC (0–4095) na jasność PWM (0–255):
```cpp
int jasnosc = map(odczyt, 0, 4095, 0, 255);
```

---

## Kod do uzupełnienia

```cpp
const int PIN_POT = 4;  // GPIO z ADC – zmień jeśli podłączyłeś do innego pinu
const int PIN_LED = 2;  // GPIO z LED z Ćw. 2

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  // Piny analogowe nie wymagają ustawiania pinMode jako INPUT
}

void loop() {
  // UZUPEŁNIJ: odczytaj wartość z potencjometru za pomocą analogRead()
  int odczyt = /* ??? */;

  // Wyślij odczyt do Serial Monitora
  Serial.println(odczyt);

  // UZUPEŁNIJ: przeskaluj odczyt (0–4095) na jasność (0–255) za pomocą map()
  int jasnosc = map(/* ??? */);

  analogWrite(PIN_LED, jasnosc);
  delay(50);
}
```

<details>
<summary>Rozwiązanie</summary>

```cpp
const int PIN_POT = 4;
const int PIN_LED = 2;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int odczyt = analogRead(PIN_POT);
  Serial.println(odczyt);
  int jasnosc = map(odczyt, 0, 4095, 0, 255);
  analogWrite(PIN_LED, jasnosc);
  delay(50);
}
```
</details>

---

## Serial Plotter – wykres na żywo

Zamiast czytać suche liczby, otwórz **Narzędzia → Kreślarka portu szeregowego (Serial Plotter)**. Kręć potencjometrem i obserwuj rysowany na żywo wykres napięcia!

![Wykres z potencjometru w Serial Plotterze](../img/podstawy/serial_plotter.png)

---

## Zadanie do samodzielnego wykonania: próg alarmowy

Zmień program tak, aby zamiast sterować jasnością (`analogWrite`), dioda zapalała się **na stałe** gdy odczyt przekroczy **3000**, a gasła poniżej tego progu. Usuń `map()` i `analogWrite`, użyj `if/else` z `digitalWrite`.

<details>
<summary>Podpowiedź</summary>
<code>if (odczyt > 3000) { digitalWrite(PIN_LED, HIGH); } else { digitalWrite(PIN_LED, LOW); }</code>
</details>
