# FreeRTOS: zadania, kolejki i notyfikacje

W klasycznym Arduino cały program mieści się w jednej pętli `loop()`. Gdy chcesz robić kilka rzeczy „jednocześnie" (np. migać diodą co 200 ms i jednocześnie co 555 ms migać drugą), musisz samemu zarządzać czasem przez `millis()`. Przy kilku zadaniach kod staje się nieczytelny.

ESP32-C6 natywnie działa pod kontrolą **FreeRTOS** – systemu operacyjnego czasu rzeczywistego, który rozwiązuje ten problem.

---

## 🧠 Czym jest FreeRTOS?

FreeRTOS to system operacyjny czasu rzeczywistego (*Real-Time Operating System*). Odpowiada za dystrybucję zasobów (w tym czasu procesora) pomiędzy poszczególne zadania. Jego kluczowym elementem jest **scheduler (planista)** – algorytm zarządzający czasem CPU w taki sposób, aby wiele zadań mogło wykonywać się pozornie równolegle, zachowując przy tym pełen determinizm.

Każde **zadanie (Task)** to niezależny wątek kodu z:

- własną funkcją (nieskończona pętla)
- własnym stosem pamięci
- przypisanym priorytetem

> [!NOTE] Ciekawostka:
> Standardowa funkcja `loop()` w środowisku Arduino-ESP32 działa wewnątrz zadania FreeRTOS o nazwie `loopTask` i priorytecie 1. Pisząc normalny kod Arduino, przez cały czas programowałeś wewnątrz FreeRTOS – nawet nie wiedząc o tym!

---

## ⚙️ Tworzenie zadań (Tasks)

```cpp
xTaskCreate(
  nazwaFunkcji,   // Wskaźnik na funkcję zadania
  "NazwaZadania", // Opis (do debugowania)
  2048,           // Rozmiar stosu w bajtach (potęga 2)
  NULL,           // Parametry przekazywane do funkcji
  1,              // Priorytet (wyższy = ważniejszy)
  NULL            // Uchwyt zadania (NULL = nie potrzebujemy)
);
```

> [!IMPORTANT] Zasady funkcji zadania
> Funkcja zadania **musi**:
> 1. Działać w **nieskończonej pętli** (`for(;;)` lub `while(1)`) – nigdy nie kończy się samoczynnie.
> 2. Regularnie wywoływać `vTaskDelay()` – oddaje czas procesora innym zadaniom.
>
> Zadanie które nigdy nie wywołuje `vTaskDelay()` i ma wysoki priorytet **zablokuje inne zadania** i spowoduje reset systemu poprzez Task Watchdog Timer (WDT).

> [!NOTE] Czym jest uchwyt (Handle) w FreeRTOS?
> W systemach operacyjnych **uchwyt (Handle)** to specjalna zmienna (identyfikator), która reprezentuje obiekt stworzony i zarządzany przez system. Zamiast operować bezpośrednio na skomplikowanych strukturach w pamięci RAM, FreeRTOS zwraca nam prosty uchwyt do tego zasobu, którego używamy w funkcjach API.
> 
> W tym rozdziale spotkasz kilka typów uchwytów:
> - **`TaskHandle_t`** (uchwyt zadania) – pozwala kontrolować zadanie (np. zawiesić je, usunąć lub wysłać do niego powiadomienie).
> - **`QueueHandle_t`** (uchwyt kolejki) – służy do wysyłania i odbierania danych z konkretnego bufora.
> - **`TimerHandle_t`** (uchwyt timera) – pozwala na startowanie, zatrzymywanie i konfigurowanie timera programowego.

---

### 🎯 Ćwiczenie 1: Dwa niezależne zadania migania

[**Link do symulacji w Wokwi**](https://wokwi.com/projects/464896891167685633){: style="display: block; text-align: center;"}

```cpp
const int PIN_LED1 = 2;
const int PIN_LED2 = 3;

void TaskDioda1(void *pvParameters) {
  for (;;) {
    digitalWrite(PIN_LED1, HIGH);
    vTaskDelay(pdMS_TO_TICKS(200)); // pdMS_TO_TICKS: ms → ticki planisty
    digitalWrite(PIN_LED1, LOW);
    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

void TaskDioda2(void *pvParameters) {
  for (;;) {
    digitalWrite(PIN_LED2, HIGH);
    // UZUPEŁNIJ: inne opóźnienie np. 555 ms
    vTaskDelay(pdMS_TO_TICKS(/* ??? */));
    digitalWrite(PIN_LED2, LOW);
    vTaskDelay(pdMS_TO_TICKS(/* ??? */));
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED1, OUTPUT);
  pinMode(PIN_LED2, OUTPUT);

  xTaskCreate(TaskDioda1, "LED1", 1024, NULL, 1, NULL);

  // UZUPEŁNIJ: Utwórz zadanie TaskDioda2 o nazwie "LED2", priorytecie 1
  xTaskCreate(/* ??? */);

  Serial.println("Zadania uruchomione!");
  // loop() może zostać puste – zadania działają w tle
}

void loop() {
  // Opcjonalnie: usuń loopTask zwalniając pamięć
  vTaskDelete(NULL);
}
```

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
xTaskCreate(TaskDioda2, "LED2", 1024, NULL, 1, NULL);

// W TaskDioda2:
vTaskDelay(pdMS_TO_TICKS(555));
```
</details>

---

## ⚠️ Wyzwania programowania współbieżnego

Gdy wiele zadań działa jednocześnie, pojawiają się nowe klasy błędów:

> [!WARNING] Race Condition (Wyścig)
> Dwa zadania próbują jednocześnie modyfikować tę samą zmienną globalną. Wynik zależy od dokładnej, nieprzewidywalnej kolejności przełączeń procesora.

> [!CAUTION] Deadlock (Zakleszczenie)
> Zadanie A czeka na zasób blokowany przez Zadanie B, a Zadanie B czeka na zasób blokowany przez Zadanie A. Oba zadania stoją w miejscu na zawsze.

Aby tego uniknąć, FreeRTOS oferuje wbudowane mechanizmy synchronizacji. Poznamy trzy najważniejsze z nich: **Kolejki**, **Powiadomienia** oraz **Timery**.

---

## 📥 Bezpieczna wymiana danych – Kolejki (Queues)

**Kolejka (Queue)** to bufor FIFO (*First-In, First-Out*). Zapewnia ona automatyczną synchronizację – żadne dwa zadania nie uszkodzą danych, jeśli bezpiecznie korzystają z kolejki.

Kolejki we FreeRTOS są **blokujące**. Oznacza to, że jeśli Odbiornik spróbuje pobrać dane z pustej kolejki, nie zawiesi całego mikrokontrolera. Zamiast tego zadanie Odbiornika po prostu "zaśnie" i nie zużyje ani jednego cyklu procesora, dopóki Nadajnik nie wrzuci tam nowych danych!

### Jak działają funkcje kolejek?

**1. Tworzenie kolejki:**
```cpp
QueueHandle_t xQueueCreate(
  UBaseType_t uxQueueLength, // Maksymalna liczba elementów w kolejce
  UBaseType_t uxItemSize     // Rozmiar pojedynczego elementu w bajtach (użyj sizeof(typ))
);
```

**2. Wysyłanie danych do kolejki (zazwyczaj z nadajnika):**
```cpp
BaseType_t xQueueSend(
  QueueHandle_t xQueue,      // Uchwyt kolejki
  const void * pvItemToQueue,// Wskaźnik na dane, które chcemy wysłać (dane są kopiowane do bufora)
  TickType_t xTicksToWait    // Czas oczekiwania w tickach, jeśli kolejka jest pełna
);
```

**3. Odbieranie danych z kolejki (zazwyczaj w odbiorniku):**
```cpp
BaseType_t xQueueReceive(
  QueueHandle_t xQueue,      // Uchwyt kolejki
  void * pvBuffer,           // Wskaźnik na zmienną, do której skopiować odebrane dane
  TickType_t xTicksToWait    // Czas oczekiwania w tickach, jeśli kolejka jest pusta
);
```

Właśnie za to odpowiada trzeci parametr w funkcjach `xQueueSend` i `xQueueReceive` – tzw. **Timeout (czas oczekiwania)** (podawany w *tickach* procesora). Najczęściej używa się wartości `portMAX_DELAY`, co oznacza *"czekaj w uśpieniu w nieskończoność, dopóki pojawią się dane lub zwolni się miejsce"*.

Warto również sprawdzać, co zwracają te funkcje. Jeśli uda się z sukcesem wysłać/odebrać dane, zwracają one specjalną wartość `pdPASS` (lub `pdTRUE`).

### 🎯 Ćwiczenie 2: Uzupełnij kod kolejki

[**Link do symulacji w Wokwi**](https://wokwi.com/projects/464897005091283969){: style="display: block; text-align: center;"}

Uzupełnij brakujące argumenty w funkcjach nadawania i odbierania.

```cpp
const int PIN_LED = 2;
const int PIN_POT = 4;

QueueHandle_t kolejkaDanych; // Globalny uchwyt kolejki

void TaskNadajnik(void *pvParameters) {
  for (;;) {
    int odczyt = analogRead(PIN_POT);

    // UZUPEŁNIJ: wyślij &odczyt do kolejkaDanych z nieskończonym czasem oczekiwania
    xQueueSend(
      /* 1. uchwyt kolejki: */,
      /* 2. wskaźnik na dane: */,
      /* 3. czas oczekiwania (nieskończoność): */
    );

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void TaskOdbiornik(void *pvParameters) {
  int odebranaWartosc;
  for (;;) {
    // UZUPEŁNIJ: odbierz dane z kolejkaDanych do &odebranaWartosc
    if (xQueueReceive(
      /* 1. uchwyt kolejki: */,
      /* 2. bufor docelowy: */,
      /* 3. czas oczekiwania: */
    ) == pdPASS) { 
      // Zrób coś z danymi dopiero, gdy pdPASS potwierdzi poprawny odbiór!
      Serial.print("Odebrano: ");
      Serial.println(odebranaWartosc);
      analogWrite(PIN_LED, map(odebranaWartosc, 0, 4095, 0, 255));
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Tworzymy kolejkę na 5 elementów typu int
  kolejkaDanych = xQueueCreate(5, sizeof(int));

  xTaskCreate(TaskNadajnik, "Nadajnik", 2048, NULL, 1, NULL);
  xTaskCreate(TaskOdbiornik, "Odbiornik", 2048, NULL, 2, NULL); 
}

void loop() { vTaskDelete(NULL); }
```

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
// W nadajniku czas oczekiwania:
portMAX_DELAY

// W odbiorniku wskaźnik na bufor docelowy:
&odebranaWartosc
```
</details>

---

## 🔔 Szybka synchronizacja – Powiadomienia (Task Notifications)

Kolejki świetnie nadają się do przesyłania konkretnych, dużych wartości (np. struktur danych, pomiarów). Czasami jednak chcemy po prostu wysłać szybki sygnał *"Hej, obudź się i zrób coś!"* z jednego zadania do drugiego, bez przesyłania żadnych skomplikowanych danych. 

Do tego służą **Powiadomienia Zadań (Task Notifications)**. Są one bezpośrednie (omijają bufor), szybsze od kolejek i zużywają znacznie mniej pamięci RAM. Każde zadanie ma swój wbudowany, prywatny licznik powiadomień.

Aby wysłać sygnał do konkretnego zadania, używamy funkcji `xTaskNotifyGive(uchwytDocelowy)`. 
Aby poczekać na sygnał (i znów - uśpić blokująco zadanie do czasu jego nadejścia), zadanie odbiorcze wywołuje funkcję `ulTaskNotifyTake(pdTRUE, czasOczekiwania)`.

> [!NOTE] Warto wiedzieć
> **Powiadomienia z wartością (32-bit):**
> Oprócz prostych powiadomień binarnych, FreeRTOS pozwala na przesyłanie wraz z powiadomieniem 32-bitowej liczby. Odpowiadają za to funkcje `xTaskNotify()` oraz `xTaskNotifyWait()`. Dzięki nim możesz przesłać np. kod zdarzenia lub prosty odczyt z czujnika całkowicie pomijając tworzenie kolejki!

### 🎯 Ćwiczenie 3: Uzupełnij kod powiadomień

[**Link do symulacji w Wokwi**](https://wokwi.com/projects/464897355945902081){: style="display: block; text-align: center;"}

W tym przykładzie zadanie kontrolne co 2 sekundy "budzi" zadanie wykonawcze za pomocą lekkiego powiadomienia.

```cpp
const int PIN_LED = 2;

// Potrzebujemy globalnego uchwytu, aby wiedzieć, KOGO konkretnie chcemy obudzić
TaskHandle_t uchwytWykonawcy = NULL;

void TaskKontrolny(void *pvParameters) {
  for (;;) {
    vTaskDelay(pdMS_TO_TICKS(2000)); // Czekaj 2 sekundy
    Serial.println("Kontroler: Daję sygnał do pracy!");
    
    // UZUPEŁNIJ: Wyślij powiadomienie bezpośrenio do zadania wykonawczego
    xTaskNotifyGive(/* uchwyt docelowy: */); 
  }
}

void TaskWykonawczy(void *pvParameters) {
  for (;;) {
    // UZUPEŁNIJ: Czekaj w nieskończoność (portMAX_DELAY) na powiadomienie. 
    // Parametr pdTRUE oznacza, że po udanym odebraniu sygnału zerujemy licznik powiadomień.
    ulTaskNotifyTake(pdTRUE, /* czas oczekiwania: */);
    
    Serial.println("Wykonawca: Odebrałem sygnał! Mrugam diodą.");
    digitalWrite(PIN_LED, HIGH);
    vTaskDelay(pdMS_TO_TICKS(100));
    digitalWrite(PIN_LED, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Tworzymy zadanie wykonawcze i zapisujemy jego uchwyt w zmiennej (ostatni parametr!)
  xTaskCreate(TaskWykonawczy, "Wykonawca", 2048, NULL, 2, &uchwytWykonawcy);
  
  // Tworzymy zadanie kontrolne
  xTaskCreate(TaskKontrolny, "Kontroler", 2048, NULL, 1, NULL);
}

void loop() { vTaskDelete(NULL); }
```

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
// W zadaniu kontrolnym podajemy uchwyt docelowy:
xTaskNotifyGive(uchwytWykonawcy);

// W zadaniu wykonawczym czas oczekiwania:
ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
```
</details>

---

## ⏰ Cykliczne akcje – Timery Programowe (Software Timers)

Często w projektach potrzebujemy wykonać prostą akcję co równy odstęp czasu (np. miganie diodą awaryjną co 500 ms). Tworzenie dla niej całego, osobnego Zadania (Tasku) z dużą pętlą `for(;;)` i instrukcją opóźnienia to **ogromne marnowanie pamięci** (każde zadanie rezerwuje sobie własny, duży stos RAM).

Eleganckim rozwiązaniem są **Timery Programowe (Software Timers)**. Pozwalają one zarejestrować prostą funkcję (tzw. Callback), która zostanie automatycznie wywołana w tle po upływie określonego czasu. FreeRTOS obsługuje wszystkie timery za pomocą jednego, współdzielonego systemowego zadania w tle (Timer Daemon Task).

Timery mogą być:

- **Jednorazowe (One-shot):** typ `pdFALSE` – odliczają czas, wykonują akcję raz i zatrzymują się.
- **Cykliczne (Auto-reload):** typ `pdTRUE` – po wykonaniu akcji automatycznie startują od nowa, działając w pętli.

> [!WARNING]
> **Nigdy nie blokuj callbacku Timera!**
> Wszystkie timery programowe w systemie są obsługiwane przez **jedno i to samo, wspólne zadanie systemowe w tle** (`Timer Daemon Task`). Oznacza to, że jeśli wewnątrz callbacku jakiegokolwiek timera użyjesz funkcji blokującej (np. `delay()`, `vTaskDelay()` lub oczekiwania na kolejkę z timeoutem), **zablokujesz wykonywanie wszystkich pozostałych timerów w programie!** Callbacki timerów powinny być jak najkrótsze i nieblokujące.

### 🎯 Ćwiczenie 4: Uzupełnij kod Timera

[**Link do symulacji w Wokwi**](https://wokwi.com/projects/464897495986393089){: style="display: block; text-align: center;"}

Uzupełnij poniższy kod, aby stworzyć i uruchomić cykliczny timer działający co 500 ms.

```cpp
const int PIN_LED = 2;
TimerHandle_t mojTimer; // Uchwyt dla naszego timera

// To NIE jest zadanie (nie ma pętli for). To prosta funkcja zwrotna (Callback) wywoływana przez timer!
void CallbackTimera(TimerHandle_t xTimer) {
  digitalWrite(PIN_LED, !digitalRead(PIN_LED)); // Zmień stan diody na przeciwny
  Serial.println("Timer: Zmiana stanu diody!");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Tworzymy timer
  mojTimer = xTimerCreate(
    "Mrugacz",                   // Nazwa tekstowa do debugowania
    pdMS_TO_TICKS(500),          // Okres timera (500 ms)
    /* UZUPEŁNIJ: Auto-reload? (pdTRUE = cykliczny, pdFALSE = jednorazowy) */, 
    (void *)0,                   // Opcjonalne wbudowane ID (tutaj nieużywane)
    CallbackTimera               // Funkcja, która ma się wywołać po upływie czasu
  );

  // UZUPEŁNIJ: Uruchom stworzony timer z zerowym czasem oczekiwania (0) na włączenie
  if (mojTimer != NULL) {
    xTimerStart(/* uchwyt timera: */, 0); 
  }
}

void loop() { vTaskDelete(NULL); }
```

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
// Jako trzeci argument w xTimerCreate podajemy:
pdTRUE

// Uruchamiając timer w xTimerStart podajemy jego uchwyt:
xTimerStart(mojTimer, 0);
```
</details>

---

## 🛠️ Zadanie: Wielozadaniowy system sterowania diodą

Podłącz potencjometr do pinu **GPIO4**, a diodę LED do pinu **GPIO2**.

**Wymagania funkcjonalne:**

1. **Oddychanie diodą (Fading):** Zbuduj dwa komunikujące się ze sobą zadania – jedno odpowiadające za odczyt pętli potencjometru, a drugie za płynne rozjaśnianie i ściemnianie diody LED (za pomocą `analogWrite()`) z prędkością regulowaną przez odebraną wartość.
2. **Precyzyjny raport (Status):** Stwórz osobny mechanizm, który **równo co 2000 milisekund** wypisuje na port szeregowy aktualny czas systemu w milisekundach (użyj funkcji `millis()`) oraz ostatni odczyt z potencjometru.

<details>
<summary>Pokaż przykładowe rozwiązanie</summary>

```cpp
#include <Arduino.h>

const int PIN_POT = 4;
const int PIN_LED = 2;

QueueHandle_t kolejkaCzasuDelay;
TimerHandle_t statusTimer;

// Zmienna modyfikowana w jednym zadaniu, a odczytywana w timerze
volatile int ostatniOdczyt = 0;

void TaskPotencjometr(void *pvParameters) {
  for (;;) {
    int odczyt = analogRead(PIN_POT);
    ostatniOdczyt = odczyt;

    // Skalujemy odczyt ADC (0-4095) na czas opóźnienia kroku świecenia diody (np. od 2 do 30 ms)
    int czasKroku = map(odczyt, 0, 4095, 2, 30);

    // Wysyłamy nową wartość opóźnienia do kolejki (bufor o długości 1, nie blokujemy wysyłania)
    xQueueSend(kolejkaCzasuDelay, &czasKroku, 0);

    vTaskDelay(pdMS_TO_TICKS(100)); // Odczyt co 100 ms
  }
}

void TaskFadingLED(void *pvParameters) {
  int opoznienieKroku = 10; // Domyślna wartość początkowa
  int jasnosc = 0;
  int kierunek = 1;

  for (;;) {
    // Sprawdzamy nieblokująco (timeout = 0), czy w kolejce pojawiła się nowa wartość
    if (xQueueReceive(kolejkaCzasuDelay, &opoznienieKroku, 0) == pdPASS) {
      // Pomyślnie zaktualizowano opóźnienie kroku
    }

    analogWrite(PIN_LED, jasnosc);

    jasnosc += kierunek;
    if (jasnosc >= 255) {
      jasnosc = 255;
      kierunek = -1;
    } else if (jasnosc <= 0) {
      jasnosc = 0;
      kierunek = 1;
    }

    // Wykorzystujemy odebrane z kolejki opóźnienie kroku
    vTaskDelay(pdMS_TO_TICKS(opoznienieKroku));
  }
}

// Callback timera programowego realizujący precyzyjny raport co 2 sekundy
void CallbackStatusTimer(TimerHandle_t xTimer) {
  Serial.print("[");
  Serial.print(millis());
  Serial.print(" ms] Status: ostatni odczyt ADC = ");
  Serial.println(ostatniOdczyt);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Tworzymy kolejkę o długości 1 przechowującą pojedynczą liczbę typu int
  kolejkaCzasuDelay = xQueueCreate(1, sizeof(int));

  // Tworzymy zadania FreeRTOS
  xTaskCreate(TaskPotencjometr, "PotReader", 2048, NULL, 1, NULL);
  xTaskCreate(TaskFadingLED, "LEDFader", 2048, NULL, 1, NULL);

  // Tworzymy cykliczny (pdTRUE) timer programowy o okresie 2000 ms
  statusTimer = xTimerCreate("StatusTimer", pdMS_TO_TICKS(2000), pdTRUE, (void *)0, CallbackStatusTimer);
  
  if (statusTimer != NULL) {
    xTimerStart(statusTimer, 0);
  }
}

void loop() {
  // Kasujemy domyślne zadanie loopTask, ponieważ cała logika działa w osobnych wątkach
  vTaskDelete(NULL);
}
```

</details>


