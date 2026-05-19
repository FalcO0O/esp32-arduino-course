# Ćwiczenie 9 – SPI: wyświetlacz OLED SSD1306

**Potrzebujesz:** 🔌 Wyświetlacz OLED SSD1306 (wersja SPI, 128×64), breadboard, przewody jumper.

**SPI** (*Serial Peripheral Interface*) to szybka, synchroniczna magistrala do komunikacji z urządzeniami peryferyjnymi. W odróżnieniu od I2C jest pełnodupleksowa – dane mogą płynąć w obu kierunkach jednocześnie, co zapewnia wyższą przepustowość.

---

## Magistrala SPI – sygnały

| Pin | Nazwa pełna | Kierunek | Opis |
|:---|:---|:---:|:---|
| **SCK** | Serial Clock | Master→Slave | Sygnał zegarowy |
| **MOSI** | Master Out Slave In | Master→Slave | Dane od ESP32 do urządzenia |
| **MISO** | Master In Slave Out | Slave→Master | Dane od urządzenia do ESP32 |
| **CS** | Chip Select | Master→Slave | Wybór urządzenia (LOW = aktywne) |

SSD1306 nie wysyła danych do hosta, więc **MISO nie jest używany**. Wyświetlacz wymaga dodatkowo:
- **DC** (*Data/Command*) – rozróżnia czy bajt to dane graficzne czy komenda sterująca
- **RES** (*Reset*) – sprzętowy reset wyświetlacza

---

## Podłączenie SSD1306 (SPI)

```
SSD1306 Pin    ESP32-C6 DevKit
──────────────────────────────
VCC   ────────  3V3
GND   ────────  GND
SCK   ────────  GPIO6   (zegar SPI)
SDA/MOSI ─────  GPIO7   (dane do wyświetlacza)
RES   ────────  GPIO4   (reset)
DC    ────────  GPIO3   (data/command)
CS    ────────  GPIO2   (chip select)
```

> [!NOTE] Piny SPI można zmienić
> ESP32-C6 obsługuje mapowanie SPI na dowolne GPIO. Piny powyżej to przykład – zmień stałe w kodzie jeśli masz inne podłączenie. Zachowaj tylko logikę: CS, DC i RES mogą być dowolnymi GPIO cyfrowymi.

---

## Instalacja bibliotek

1. **Szkic → Zarządzaj bibliotekami…**
2. Zainstaluj: **Adafruit SSD1306** (autor: Adafruit Industries)
3. Zainstaluj (jeśli wymagana): **Adafruit GFX Library** (autor: Adafruit Industries)

---

## Kod: tekst i grafika na OLED

```cpp
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Rozdzielczość wyświetlacza
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// Piny SPI – zmień jeśli masz inne podłączenie
#define OLED_SCK  6
#define OLED_MOSI 7
#define OLED_RES  4
#define OLED_DC   3
#define OLED_CS   2

// Inicjalizacja z programowym SPI (dowolne piny)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT,
                          OLED_MOSI, OLED_SCK, OLED_DC, OLED_RES, OLED_CS);

void setup() {
  Serial.begin(115200);

  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println("Błąd inicjalizacji SSD1306! Sprawdź połączenia.");
    while (1);
  }

  // Ekran powitalny
  display.clearDisplay();
  display.setTextSize(2);              // Rozmiar tekstu (1=mały, 2=duży)
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);            // Pozycja (x, y) w pikselach
  display.println("ESP32-C6");
  display.setTextSize(1);
  display.println("Kurs Arduino");
  display.println("Cwiczenie 9: SPI");
  display.display();                   // Wyślij bufor na ekran!
  delay(2000);
}

void loop() {
  static int licznik = 0;
  licznik++;

  display.clearDisplay();

  // Nagłówek
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("=== ESP32 Monitor ===");

  // Licznik sekund
  display.setCursor(0, 16);
  display.print("Czas: ");
  display.print(licznik);
  display.println(" s");

  // Pasek postępu (prosty, rysowany prostokątami)
  int szerokosc = map(licznik % 100, 0, 99, 0, 120);
  display.drawRect(0, 32, 128, 10, SSD1306_WHITE);    // Obramowanie
  display.fillRect(0, 32, szerokosc, 10, SSD1306_WHITE); // Wypełnienie

  // Linia pozioma jako separator
  display.drawLine(0, 48, 127, 48, SSD1306_WHITE);

  display.setCursor(0, 52);
  display.print("SPI OLED dziala!");

  display.display(); // Zawsze na końcu!
  delay(1000);
}
```

---

## Kluczowe funkcje biblioteki

| Funkcja | Opis |
|:---|:---|
| `display.clearDisplay()` | Czyści bufor (nie ekran!) |
| `display.display()` | Wysyła bufor na fizyczny ekran |
| `display.setTextSize(n)` | Rozmiar tekstu: 1=6×8px, 2=12×16px |
| `display.setCursor(x, y)` | Ustaw kursor w pikselach |
| `display.println("tekst")` | Wypisz tekst z nową linią |
| `display.drawRect(x,y,w,h,kolor)` | Prostokąt (kontur) |
| `display.fillRect(x,y,w,h,kolor)` | Prostokąt wypełniony |
| `display.drawLine(x1,y1,x2,y2,kolor)` | Linia |
| `display.drawCircle(x,y,r,kolor)` | Okrąg |

> [!TIP] Buforowanie
> Biblioteka SSD1306 używa bufora w RAM – wszystkie operacje rysowania modyfikują bufor w pamięci ESP32. Dopiero wywołanie `display.display()` przesyła cały bufor przez SPI na fizyczny ekran. Dlatego wywołuj `display()` zawsze na końcu sekwencji rysowania!

---

## Zadanie do samodzielnego wykonania

Zmodyfikuj program tak, aby wyświetlacz pokazywał w czasie rzeczywistym:
1. Wartość odczytaną z potencjometru (ADC z Ćw. 4) jako liczbę i graficzny pasek postępu.
2. Informację czy przycisk (z Ćw. 5) jest aktualnie naciśnięty czy nie.

Połącz w jednym projekcie wiedzę z poprzednich ćwiczeń!
