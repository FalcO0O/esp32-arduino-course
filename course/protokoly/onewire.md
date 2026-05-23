# Transmisja jednoprzewodowa i wbudowana dioda ARGB (WS2812B)

Poza klasycznymi interfejsami, takimi jak UART, I<sup>2</sup>C czy SPI, w systemach wbudowanych szeroko stosowane są protokoły przesyłu danych za pomocą **jednego przewodu sygnałowego** (oraz wspólnej linii odniesienia masy GND). Rozwiązania te pozwalają na oszczędność fizycznych pinów mikrokontrolera oraz uproszczenie trasowania płytek drukowanych (PCB).

W tym rozdziale zapoznasz się z charakterystyką protokołów jednoprzewodowych, dowiesz się, jak działają inteligentne diody ARGB, oraz uruchomisz wbudowaną w płytkę ESP32-C6 diodę WS2812B.

---

## ⚡ Rodzaje transmisji jednoprzewodowej

Pod pojęciem transmisji jednoprzewodowej kryją się dwa różne podejścia technologiczne, które różnią się zarówno architekturą, jak i przeznaczeniem:

### 1. Dallas 1-Wire
Jest to standaryzowany, dwukierunkowy protokół komunikacyjny stworzony przez firmę Dallas Semiconductor (obecnie Maxim Integrated). 

* **Zasada działania**: Linia sygnałowa pracuje w konfiguracji otwartego drenu (*open-drain*) i wymaga zewnętrznego rezystora podciągającego (Pull-Up) do zasilania VCC. Komunikacja jest dwukierunkowa i opiera się na architekturze typu Master-Slave.
* **Adresowanie**: Każde urządzenie (np. popularny cyfrowy czujnik temperatury **DS18B20**) posiada unikalny, zakodowany fabrycznie 64-bitowy numer identyfikacyjny (ROM ID). Pozwala to na podłączenie wielu urządzeń równolegle do tej samej linii sygnałowej.
* **Charakterystyka**: Transmisja jest wolna (standardowa prędkość to ok. 16.3 kb/s), ale stabilna na dłuższych dystansach (nawet do kilkudziesięciu metrów).

### 2. Custom Single-Wire / NZR (np. WS2812B)
Jest to szybki, jednokierunkowy protokół szeregowy bez linii zegarowej, stosowany przede wszystkim do sterowania adresowalnymi diodami LED RGB (ARGB / NeoPixel).

* **Zasada działania**: Transmisja odbywa się w trybie simplex (tylko w jedną stronę: od kontrolera do odbiorników). Diody łączone są kaskadowo (wyjście danych `DO` jednej diody łączone jest z wejściem danych `DI` kolejnej).
* **Brak adresowania**: Urządzenia nie posiadają unikalnych identyfikatorów. Adresowanie odbywa się geometrycznie (pozycyjnie) – każda kolejna dioda "odcina" pierwszy zestaw bitów koloru, a resztę danych przesyła dalej.
* **Charakterystyka**: Transmisja jest szybka (ok. 800 kb/s), ale wymaga bardzo precyzyjnych zależności czasowych w skali nanosekundowej.

---

## 🛠️ Jak działa inteligentna dioda ARGB (WS2812B)?

Dioda **WS2812B** (często określana jako NeoPixel) nie jest zwykłą diodą LED. Wewnątrz jej obudowy (najczęściej SMD 5050) zintegrowano:
1. Trzy struktury półprzewodnikowe LED: **Czerwoną (R)**, **Zieloną (G)** i **Niebieską (B)**.
2. Mikroskopijny układ scalony (kontroler) pełniący funkcję sterownika prądowego PWM z rejestrem przesuwnym.

Dzięki temu każdą diodą w łańcuchu możemy sterować niezależnie, ustawiając jej dowolną barwę z palety 16,7 miliona kolorów (24-bitowa głębia kolorów: po 8 bitów na składową R, G i B).

### Kodowanie bitów w protokole WS2812B
Transmisja danych odbywa się za pomocą standardu **NZR** (*Non-Return-to-Zero*), gdzie informacja o stanie logicznym bitu jest kodowana **czasem trwania** stanu wysokiego ($T_H$) i niskiego ($T_L$) w jednym cyklu:

* **Bit `0`**: krótki stan wysoki ($T_{0H} \approx 0.4\ \mu\text{s}$), po którym następuje długi stan niski ($T_{0L} \approx 0.85\ \mu\text{s}$).
* **Bit `1`**: długi stan wysoki ($T_{1H} \approx 0.8\ \mu\text{s}$), po którym następuje krótki stan niski ($T_{1L} \approx 0.45\ \mu\text{s}$).
* **Sygnał resetu (RESET)**: utrzymanie stanu niskiego przez czas dłuższy niż $50\ \mu\text{s}$ (powoduje zatrzaśnięcie przesłanych danych w rejestrach diod i wyświetlenie koloru).

![](../img/protokoly/nrz.png){ align=center }

### Problem taktowania i rola sprzętu w ESP32
Ponieważ czasy trwania impulsów muszą być dotrzymane z dokładnością do kilkudziesięciu nanosekund, generowanie takiego sygnału programowo (*bit-banging* poprzez szybkie włączanie/wyłączanie pinu w kodzie) jest bardzo trudne. Każde przerwanie systemowe zakłóciłoby strukturę czasową ramki, powodując migotanie diod lub błędne kolory.

Aby temu zapobiec, układy ESP32 wykorzystują swoje wbudowane bloki sprzętowe:
* **RMT (Remote Control)**: Nadajnik podczerwieni, który potrafi sprzętowo generować precyzyjne przebiegi czasowe na podstawie zdefiniowanych czasów trwania stanów wysokich i niskich.
* **SPI**: Wykorzystuje wysyłanie odpowiednio uformowanych bajtów danych z dużą częstotliwością tak, aby sekwencje bitów na linii MOSI udawały impulsy o szerokościach wymaganych przez WS2812B.

---

## 🎯 Przykład praktyczny: Uruchomienie wbudowanej diody ARGB

Standardowa płytka deweloperska **ESP32-C6 DevKit** posiada wbudowaną adresowalną diodę RGB podłączoną wewnętrznie do pinu **GPIO8**. 

Do jej obsłużenia wykorzystamy najpopularniejszą bibliotekę **Adafruit NeoPixel**.

> [!NOTE] Instalacja biblioteki
> W Arduino IDE wybierz z menu górnego **Szkic -> Dołącz bibliotekę -> Zarządzaj bibliotekami**. Wpisz w polu wyszukiwania **Adafruit NeoPixel** i zainstaluj najnowszą wersję.

### Kod programu: Cykliczna zmiana kolorów
Wgraj poniższy program na swoją płytkę. Program kolejno zapala diodę w kolorach podstawowych (Czerwony, Zielony, Niebieski).

```cpp
#include <Adafruit_NeoPixel.h>

#define PIN_LED      8  // Pin, do którego podłączona jest wbudowana dioda RGB
#define NUM_PIXELS   1  // Liczba diod w łańcuchu (wbudowana jest tylko jedna)

// Konfiguracja obiektu diody:
// - NUM_PIXELS: liczba diod
// - PIN_LED: pin sygnałowy
// - NEO_GRB + NEO_KHZ800: kolejność kolorów w ramce (GRB) i częstotliwość (800 kHz)
Adafruit_NeoPixel led(NUM_PIXELS, PIN_LED, NEO_GRB + NEO_KHZ800);

void setup() {
  led.begin();            // Inicjalizacja linii danych
  led.setBrightness(30);  // Ograniczenie jasności (zakres 0-255). Wbudowane diody świecą bardzo mocno!
}

void loop() {
  // Ustawienie koloru czerwonego (R=255, G=0, B=0)
  led.setPixelColor(0, led.Color(255, 0, 0));
  led.show();             // Wysłanie danych i aktualizacja fizycznego stanu diody
  delay(1000);

  // Ustawienie koloru zielonego (R=0, G=255, B=0)
  led.setPixelColor(0, led.Color(0, 255, 0));
  led.show();
  delay(1000);

  // Ustawienie koloru niebieskiego (R=0, G=0, B=255)
  led.setPixelColor(0, led.Color(0, 0, 255));
  led.show();
  delay(1000);
}
```

---

### 🛠️ Zadanie: Płynne "oddychanie" diody (Breathing Effect)
Napisz program, w którym wbudowana dioda płynnie rozjaśnia się i ściemnia (np. w kolorze fioletowym – kombinacja czerwonego i niebieskiego). Wykorzystaj pętle `for` oraz metodę `led.setBrightness(wartość)` do regulowania jasności świecenia diody. 

Pamiętaj, by po każdej zmianie jasności wywołać metodę `led.show()`, a maksymalna jasność nie przekraczała `100` ze względów bezpieczeństwa dla oczu.

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
#include <Adafruit_NeoPixel.h>

#define PIN_LED      8
#define NUM_PIXELS   1

Adafruit_NeoPixel led(NUM_PIXELS, PIN_LED, NEO_GRB + NEO_KHZ800);

void setup() {
  led.begin();
  // Ustawiamy stałą barwę (fioletowy: R=128, G=0, B=128)
  led.setPixelColor(0, led.Color(128, 0, 128));
}

void loop() {
  // Płynne rozjaśnianie:
  for (int jasnosc = 0; jasnosc <= 100; jasnosc++) {
    led.setBrightness(jasnosc);
    led.show();
    delay(10);
  }

  // Płynne ściemnianie:
  for (int jasnosc = 100; jasnosc >= 0; jasnosc--) {
    led.setBrightness(jasnosc);
    led.show();
    delay(10);
  }
}
```

</details>
