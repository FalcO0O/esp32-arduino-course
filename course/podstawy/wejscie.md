# Ćwiczenie 5 – Wejście cyfrowe: przycisk

**Potrzebujesz:** 🔌 Breadboard, przycisk tact switch, przewody jumper.

Do tej pory mikrokontroler tylko „mówił" (wysyłał sygnały). Teraz nauczy się „słuchać" – odczytywać stan wejścia cyfrowego, na przykład przycisku.

---

## Podłączenie przycisku

Używamy konfiguracji z wewnętrznym rezystorem pull-up ESP32-C6 – eliminuje potrzebę dodatkowego rezystora:

```
ESP32-C6         Breadboard / Przycisk
────────────────────────────────────
GPIO9   ────────── Nóżka 1 przycisku
                   Nóżka 3 przycisku ── GND
GND     ────────── Magistrala GND
```

> [!NOTE] Dlaczego GPIO9?
> GPIO9 jest dostępny na większości ESP32-C6 DevKit i dobrze nadaje się jako wejście. Możesz użyć dowolnego innego pinu GPIO – zmień stałą `PIN_BTN` w kodzie.

### Logika działania:
- Przycisk **nie naciśnięty** → GPIO widzi `HIGH` (3,3 V przez wewnętrzny pull-up)
- Przycisk **naciśnięty** → GPIO podłączony do GND → widzi `LOW`

---

## Odczyt stanu przycisku

```cpp
const int PIN_BTN = 9;   // Pin przycisku
const int PIN_LED = 2;   // Pin LED z poprzednich ćwiczeń

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  // INPUT_PULLUP: włącza wewnętrzny rezystor podciągający do 3.3V
  pinMode(PIN_BTN, INPUT_PULLUP);
}

void loop() {
  // digitalRead zwraca HIGH (1) lub LOW (0)
  int stanPrzycisku = digitalRead(PIN_BTN);

  if (stanPrzycisku == LOW) {  // LOW = naciśnięty (pull-up logika)
    Serial.println("Przycisk naciśnięty!");
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }

  delay(50); // Krótkie opóźnienie – patrz: drgania styków poniżej
}
```

---

## Problem: drgania styków (bouncing)

Mechaniczny przycisk nie zwiera styków idealnie. Podczas naciskania i zwalniania styki drgają przez kilka–kilkadziesiąt milisekund, generując wielokrotne przejścia HIGH/LOW zamiast jednego.

```
Ideał:   ──────╗                ╔────
               ╚════════════════╝

Rzeczywistość: ──────╗╔╗╔╔╗            ╔╗╗╔╔────
                     ╚╝╚╝╚╝════════════╚╝╚╝╚╝
                        ^drgania^        ^drgania^
```

### Debouncing programowy

Najprostsze rozwiązanie: po wykryciu zmiany stanu odczekaj kilka milisekund i sprawdź ponownie:

```cpp
const int PIN_BTN = 9;
const int PIN_LED = 2;
const int DEBOUNCE_MS = 20; // czas eliminacji drgań

int ostatniStan = HIGH;
int licznikKlikniec = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BTN, INPUT_PULLUP);
}

void loop() {
  int aktualny = digitalRead(PIN_BTN);

  // Wykrycie zbocza opadającego (HIGH → LOW = naciśnięcie)
  if (aktualny == LOW && ostatniStan == HIGH) {
    delay(DEBOUNCE_MS); // Poczekaj na ustabilizowanie się styków
    if (digitalRead(PIN_BTN) == LOW) { // Potwierdź że nadal naciśnięty
      licznikKlikniec++;
      Serial.print("Kliknięcia: ");
      Serial.println(licznikKlikniec);
      digitalWrite(PIN_LED, !digitalRead(PIN_LED)); // Przełącz LED
    }
  }

  ostatniStan = aktualny;
  delay(10);
}
```

---

## Zadanie do samodzielnego wykonania

Zmodyfikuj program tak, aby:
1. Jedno kliknięcie **zapala** LED (na stałe).
2. Drugie kliknięcie **gasi** LED.
3. Trzecie znów zapala – i tak w kółko (toggle).

W Monitorze Szeregowym wyświetlaj aktualny stan: `"LED: ON"` lub `"LED: OFF"`.
