# Lekcja: Płytka stykowa (Breadboard)

**Potrzebujesz:** Breadboard, LED × 2, rezystor 220–330 Ω × 2, przycisk, przewody jumper.

Od tego momentu będziesz budować układy elektroniczne na **breadboardzie** (płytce stykowej). To podstawowe narzędzie prototypowania – pozwala łączyć elementy bez lutowania, po prostu wciskając je w otwory.

---

## Budowa breadboarda

Breadboard składa się z rzędów otworów połączonych wewnętrznie metalowymi zaczepami:

```
   A B C D E   F G H I J
1  o-o-o-o-o   o-o-o-o-o
2  o-o-o-o-o   o-o-o-o-o   ← w jednym rzędzie (np. 1A–1E) wszystkie otwory
3  o-o-o-o-o   o-o-o-o-o     są ze sobą połączone
4  o-o-o-o-o   o-o-o-o-o
...

+  + + + + + + + + + + +   ← magistrala "+" (zasilanie, 3.3V lub 5V)
-  - - - - - - - - - - -   ← magistrala "-" (masa, GND)
```

### Zasady połączeń:
- **Każdy rząd** (np. 1A, 1B, 1C, 1D, 1E) to jeden węzeł – wszystkie otwory w rzędzie są ze sobą połączone.
- Środkowa **przerwa** (rowek) fizycznie dzieli lewą i prawą stronę – element wbity nad i pod rowkiem **nie jest** automatycznie połączony.
- **Magistrale zasilania** (oznaczone `+` i `-`) biegną wzdłuż krawędzi – doskonałe do podłączenia zasilania i masy.

> [!IMPORTANT] Środkowa przerwa rozdziela!
> Układ scalony (IC) lub duże elementy wbija się tak, żeby „przeskakiwał" przez środkową przerwę. Wtedy każda nóżka ma swój rząd po jednej stronie.

---

## Jak podłączyć LED?

Dioda LED (Light Emitting Diode) przewodzi prąd **tylko w jednym kierunku**. Posiada dwa wyprowadzenia:
- **Anoda (+)** – dłuższa nóżka – podłączamy do wyższego napięcia (GPIO)
- **Katoda (–)** – krótsza nóżka – podłączamy do masy (GND)

> [!WARNING] Zawsze używaj rezystora!
> LED bez rezystora ograniczającego prąd **spali się natychmiast**. Stosuj rezystor **220–330 Ω** w serii z diodą.

### Schemat połączenia:

```
ESP32-C6                 Breadboard
GPIO_X  ────────────── Rząd A
                         Rząd A: Rezystor 220Ω ──── Rząd B
                         Rząd B: Anoda LED (+)
                         Rząd C: Katoda LED (–)
GND     ────────────── Rząd C  (lub magistrala –)
```

### Krok po kroku:
1. Wciśnij rezystor 220 Ω między rząd **1** (prawa strona) i rząd **3** (lewa strona rowka).
2. Wciśnij LED: anodę (dłuższa nóżka) do rzędu **3**, katodę (krótsza) do rzędu **5**.
3. Przewodem jumper połącz rząd **1** z pinem **GPIO2** na ESP32-C6.
4. Przewodem jumper połącz rząd **5** z pinem **GND** na ESP32-C6.

---

## Jak podłączyć przycisk?

Przycisk tact switch ma 4 nóżki ułożone w pary – nóżki po tej samej stronie są ze sobą połączone wewnętrznie, a zwarcie następuje po naciśnięciu.

```
  1 ──┐
      │ (wewnętrzne połączenie)
  2 ──┘

  3 ──┐
      │ (wewnętrzne połączenie)
  4 ──┘

Naciśnięcie zwiera parę 1-2 z parą 3-4.
```

### Konfiguracja pull-up (INPUT_PULLUP):

```
ESP32-C6                 Breadboard
GPIO_X  ────────────── Nóżka 1 przycisku
GND     ────────────── Nóżka 3 przycisku
```

W kodzie używamy `pinMode(PIN, INPUT_PULLUP)` – ESP32 ma wbudowany rezystor podciągający do 3,3 V. Gdy przycisk nie jest naciśnięty, GPIO widzi `HIGH`. Po naciśnięciu (zwarcie do GND) widzi `LOW`.

> [!NOTE] Pull-up czy pull-down?
> **Pull-up** (wbudowany): PIN → HIGH w stanie spoczynku, LOW po naciśnięciu.
> **Pull-down** (zewnętrzny rezystor do GND): PIN → LOW w stanie spoczynku, HIGH po naciśnięciu.
> W tym kursie używamy zawsze **INPUT_PULLUP** – eliminuje potrzebę dodatkowego rezystora.

---

## Kolory przewodów – konwencja

Nie ma obowiązku, ale dobra praktyka pomaga uniknąć błędów:

| Kolor | Przeznaczenie |
|:---:|:---|
| 🔴 Czerwony | Zasilanie (3,3 V lub 5 V) |
| ⚫ Czarny | Masa (GND) |
| Inne kolory | Sygnały (GPIO, SDA, SCL, TX, RX…) |

---

## Gotowy do pierwszego układu?

Teraz, gdy wiesz jak używać breadboarda, przejdź do Ćwiczenia 2, gdzie zbudujesz pierwszy układ z diodą LED i napiszesz kod sterujący jej miganiem.

👉 [Ćw. 2 – Wyjście cyfrowe: LED](cyfrowe.md)
