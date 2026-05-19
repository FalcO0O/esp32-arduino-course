# Ćwiczenie 2 – Wyjście cyfrowe: sterowanie diodą LED

**Potrzebujesz:** 🔌 Breadboard, LED × 1, rezystor 220–330 Ω × 1, przewody jumper.

W tym ćwiczeniu zbudujesz na breadboardzie układ z diodą LED i napiszesz program sterujący jej miganiem. To klasyczny „Blink" – odpowiednik „Hello World" dla elektroniki.

---

## Podłączenie układu

Zmontuj na breadboardzie poniższy układ:

```
ESP32-C6 Pin     Breadboard / Komponent
────────────────────────────────────────
GPIO2       ───► Rezystor 220 Ω ───► Anoda LED (+)
                                     Katoda LED (-) ───► GND
GND         ───► Magistrala GND breadboarda
```

> [!TIP] Którą nóżkę podłączyć do czego?
> Anoda LED (dłuższa nóżka) → idzie w stronę GPIO (wyższe napięcie).
> Katoda LED (krótsza nóżka) → idzie do GND.
> Jeśli nie masz pewności, sprawdź na stronie [Lekcja: Breadboard](breadboard.md).

> [!NOTE] Możesz użyć dowolnego GPIO
> W przykładzie używamy **GPIO2**, ale możesz wybrać dowolny inny pin cyfrowy ESP32-C6. Zmień tylko wartość stałej `PIN_LED` w kodzie.

---

## Jak działa wyjście cyfrowe?

Pin skonfigurowany jako wyjście może przyjąć dwa stany:

- `HIGH` → napięcie **3,3 V** pojawia się na pinie → dioda **świeci**
- `LOW` → napięcie **0 V** (masa) → dioda **gaśnie**

Funkcja `digitalWrite(pin, stan)` ustawia żądany stan na wybranym pinie.

---

## Kod do uzupełnienia

```cpp
// Zmień numer pinu na ten, do którego podłączyłeś LED (przez rezystor)
const int PIN_LED = 2;

void setup() {
  // Konfiguracja pinu jako WYJŚCIE (OUTPUT)
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // UZUPEŁNIJ: Włącz diodę (stan HIGH)
  delay(500);   // Odczekaj pół sekundy

  // UZUPEŁNIJ: Wyłącz diodę (stan LOW)
  delay(500);   // Odczekaj pół sekundy
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
  digitalWrite(PIN_LED, HIGH);
  delay(500);
  digitalWrite(PIN_LED, LOW);
  delay(500);
}
```
</details>

---

## Zadanie do samodzielnego wykonania

Podłącz do breadboarda **drugą diodę LED** na innym pinie GPIO (np. GPIO3, przez własny rezystor) i zmodyfikuj program, aby uzyskać efekt **naprzemiennego migania**: gdy jedna dioda się zapala, druga natychmiast gaśnie i odwrotnie.

<details>
<summary>Podpowiedź</summary>
Zadeklaruj drugą stałą <code>const int PIN_LED2 = 3;</code> i dodaj drugi <code>pinMode</code> w <code>setup()</code>. W <code>loop()</code> ustaw LED1 HIGH i LED2 LOW, odczekaj, potem odwróć stany.
</details>
