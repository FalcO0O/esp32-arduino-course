# Kod wzorcowy ESP32-C6 DevKit

Ta strona zawiera gotowe szablony i wzorcowe fragmenty kodu dla najczęstszych zadań. Skopiuj i dostosuj do swojego projektu.

---

## Szablon projektu – podstawowy

```cpp
// ============================================================
// KONFIGURACJA PINÓW – dostosuj do swojego podłączenia
// ============================================================
const int PIN_LED1    = 2;   // GPIO → LED → 220Ω → GND
const int PIN_LED2    = 3;   // GPIO → LED → 220Ω → GND
const int PIN_BUTTON  = 9;   // GPIO → Przycisk → GND (INPUT_PULLUP)
const int PIN_POT     = 4;   // Potencjometr (środkowy pin, ADC)
const int PIN_I2C_SDA = 6;   // I2C Data (SDA)
const int PIN_I2C_SCL = 7;   // I2C Clock (SCL)
const int PIN_UART_TX = 4;   // UART Nadajnik (Serial1)
const int PIN_UART_RX = 5;   // UART Odbiornik (Serial1)

// ============================================================
// SETUP – wykonuje się raz po uruchomieniu
// ============================================================
void setup() {
  Serial.begin(115200);

  // Konfiguracja pinów
  pinMode(PIN_LED1,   OUTPUT);
  pinMode(PIN_LED2,   OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  Serial.println("System uruchomiony!");
}

// ============================================================
// LOOP – wykonuje się w nieskończonej pętli
// ============================================================
void loop() {
  // Twój kod tutaj
}
```

---

## Szablon projektu – FreeRTOS

```cpp
// ============================================================
// Projekt FreeRTOS – szkielet wielozadaniowy
// ============================================================

// --- KONFIGURACJA PINÓW ---
const int PIN_LED = 2;
const int PIN_POT = 4;

// --- GLOBALNA KOLEJKA ---
QueueHandle_t kolejka;

// --- DEKLARACJE ZADAŃ ---
void TaskNadajnik(void *pvParameters);
void TaskOdbiornik(void *pvParameters);

// --- SETUP ---
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  kolejka = xQueueCreate(10, sizeof(int));

  xTaskCreate(TaskNadajnik, "Nadajnik", 2048, NULL, 1, NULL);
  xTaskCreate(TaskOdbiornik, "Odbiornik", 2048, NULL, 2, NULL);
}

void loop() {
  vTaskDelete(NULL); // Usuń domyślne zadanie loop
}

// --- IMPLEMENTACJA ZADAŃ ---
void TaskNadajnik(void *pvParameters) {
  for (;;) {
    int wartosc = analogRead(PIN_POT);
    xQueueSend(kolejka, &wartosc, portMAX_DELAY);
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void TaskOdbiornik(void *pvParameters) {
  int odebranaWartosc;
  for (;;) {
    if (xQueueReceive(kolejka, &odebranaWartosc, portMAX_DELAY) == pdPASS) {
      int jasnosc = map(odebranaWartosc, 0, 4095, 0, 255);
      analogWrite(PIN_LED, jasnosc);
    }
  }
}
```

---

## Typowe pułapki ESP32-C6

### ❌ Brak CDC On Boot → Serial nie działa
```
Objawy: Serial Monitor pusty, żadnych komunikatów
Rozwiązanie: Narzędzia → USB CDC On Boot → Enabled
```

### ❌ Zły pin ADC
```
Objawy: analogRead() zawsze zwraca 0 lub 4095
Rozwiązanie: Użyj tylko pinów z ADC: GPIO0–GPIO6
```

### ❌ Strapping Pins przy starcie
```
Objawy: Płytka nie startuje, wchodzi w tryb bootloader
Piny do unikania podczas startu: GPIO8, GPIO9 (muszą być w stanie HIGH)
Rozwiązanie: Nie podłączaj do GPIO8/9 elementów wymuszających LOW podczas włączania
```

### ❌ Zapomniane `display.display()` w SSD1306
```
Objawy: Ekran OLED się nie aktualizuje
Rozwiązanie: Zawsze kończ sekwencję rysowania wywołaniem display.display()
```

### ❌ Brak `vTaskDelay()` w pętli zadania FreeRTOS
```
Objawy: Płytka restartuje się z błędem "Task watchdog got triggered"
Rozwiązanie: Każde zadanie musi regularnie wywoływać vTaskDelay() lub yield()
```
