# Ćwiczenie 8 – UART: loopback i parsowanie komend

**Potrzebujesz:** 🔌 Breadboard, 1 przewód jumper (TX→RX loopback).

**UART** (*Universal Asynchronous Receiver-Transmitter*) to najprostszy i najstarszy protokół komunikacji szeregowej. Jest asynchroniczny – brak sygnału zegarowego, obie strony muszą ustalić prędkość z góry.

W tym ćwiczeniu przeprowadzisz eksperyment **na jednej płytce**: ESP32 wysyła dane przez jeden port UART i sam je odbiera przez drugi, dzięki fizycznemu połączeniu TX→RX kablem na breadboardzie.

---

## Loopback – komunikacja z samym sobą

Zamiast drugiej płytki, połącz jumperem dwa piny na breadboardzie:

```
ESP32-C6 DevKit      Breadboard
────────────────────────────────
GPIO4 (TX)  ───────► GPIO5 (RX)   ← jeden przewód jumper!
GND         ───────► GND (masa wspólna)
```

> [!NOTE] Możesz użyć innych pinów
> GPIO4 i GPIO5 to przykład. Możesz wybrać dowolną parę wolnych GPIO – zmień stałe `UART_TX` i `UART_RX` w kodzie. Upewnij się tylko, że wybrane piny nie są Strapping Pins (sprawdź w sekcji [Materiały → Pinout](../materialy/pinout.md)).

### Co się dzieje w loopback?
1. ESP32 wysyła bajty przez `Serial1` na GPIO4 (TX)
2. Kabel jumper fizycznie łączy GPIO4 z GPIO5
3. ESP32 odbiera te same bajty przez `Serial1` na GPIO5 (RX)
4. `Serial` (USB do komputera) służy jako terminal – wpisujesz komendy w Serial Monitor

---

## Kod: terminal komend

```cpp
const int UART_TX = 4;  // Pin nadawczy
const int UART_RX = 5;  // Pin odbiorczy (połącz jumperem z TX!)
const int PIN_LED = 2;

String buforKomendy = "";

void setup() {
  Serial.begin(115200);   // Port USB – komunikacja z komputerem

  // Drugi port UART na naszych pinach
  Serial1.begin(9600, SERIAL_8N1, UART_RX, UART_TX);

  pinMode(PIN_LED, OUTPUT);
  Serial.println("Terminal gotowy. Wpisz: LED_ON, LED_OFF lub STATUS");
}

void loop() {
  // --- Odczyt komend z klawiatury (przez Serial USB) ---
  while (Serial.available() > 0) {
    char znak = (char)Serial.read();

    if (znak == '\n' || znak == '\r') {
      // Koniec linii – wyślij komendę przez UART
      if (buforKomendy.length() > 0) {
        Serial.print("Wysyłam przez UART: ");
        Serial.println(buforKomendy);
        Serial1.println(buforKomendy); // Wyślij przez Serial1 (TX)
        buforKomendy = "";
      }
    } else {
      buforKomendy += znak; // Zbieraj znaki w buforze
    }
  }

  // --- Odbiór danych z UART (loopback z RX) ---
  while (Serial1.available() > 0) {
    String odebrana = Serial1.readStringUntil('\n');
    odebrana.trim();

    Serial.print("Odebrano przez UART: ");
    Serial.println(odebrana);

    // Parsowanie komend
    if (odebrana == "LED_ON") {
      digitalWrite(PIN_LED, HIGH);
      Serial.println("→ Dioda WŁĄCZONA");
    } else if (odebrana == "LED_OFF") {
      digitalWrite(PIN_LED, LOW);
      Serial.println("→ Dioda WYŁĄCZONA");
    } else if (odebrana == "STATUS") {
      bool stanLED = digitalRead(PIN_LED);
      Serial.print("→ Stan diody: ");
      Serial.println(stanLED ? "ON" : "OFF");
    } else {
      Serial.println("→ Nieznana komenda!");
    }
  }
}
```

### Jak testować?
1. Wgraj kod, otwórz Serial Monitor (115200 baud).
2. W polu tekstowym wpisz `LED_ON` i naciśnij Enter.
3. Obserwuj odpowiedź – komenda „podróżuje" TX→RX i wraca z obsługą.

---

## Parametry UART

```cpp
Serial1.begin(baud, config, rxPin, txPin);
```

| Parametr | Typowe wartości | Opis |
|:---|:---|:---|
| `baud` | 9600, 115200, 921600 | Prędkość transmisji |
| `config` | `SERIAL_8N1` | 8 bitów danych, brak parzystości, 1 bit stopu |
| `rxPin` | dowolny GPIO | Pin odbiorczy |
| `txPin` | dowolny GPIO | Pin nadawczy |

> [!NOTE] Dwa urządzenia zamiast loopback
> Jeśli masz dostęp do drugiej płytki ESP32, możesz połączyć:
> TX Płytki A → RX Płytki B i TX Płytki B → RX Płytki A + wspólne GND.
> Kod na każdej płytce pozostaje identyczny – zmień tylko która wysyła, a która odbiera komendy.

---

## Zadanie do samodzielnego wykonania

Rozbuduj system komend o:
- `PWM:128` – ustaw jasność diody na wartość 0–255 podaną po dwukropku
- `RESET` – wyłącz LED i wypisz `"System zresetowany"`

Użyj metody `indexOf(':')` do znalezienia separatora i `substring()` do wyciągnięcia wartości liczbowej z komendy.
