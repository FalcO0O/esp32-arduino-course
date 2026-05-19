# Ćwiczenia 10–11 – FreeRTOS: zadania i kolejki

**Potrzebujesz:** LED × 2 + rezystory na breadboardzie, potencjometr (z poprzednich ćwiczeń).

W klasycznym Arduino cały program mieści się w jednej pętli `loop()`. Gdy chcesz robić kilka rzeczy „jednocześnie" (np. migać diodą co 200 ms i jednocześnie co 555 ms migać drugą), musisz samemu zarządzać czasem przez `millis()`. Przy kilku zadaniach kod staje się nieczytelny.

ESP32-C6 natywnie działa pod kontrolą **FreeRTOS** – systemu operacyjnego czasu rzeczywistego, który rozwiązuje ten problem elegancko.

---

## Czym jest FreeRTOS?

FreeRTOS to system operacyjny czasu rzeczywistego (*Real-Time Operating System*). Jego kluczowy element to **scheduler (planista)** – algorytm, który przydziela czas procesora kolejnym zadaniom.

Każde **zadanie (Task)** to niezależny wątek kodu z:
- własną funkcją (nieskończona pętla)
- własnym stosem pamięci
- przypisanym priorytetem

> [!NOTE] Ciekawostka: Arduino też używa FreeRTOS
> Standardowa funkcja `loop()` w środowisku Arduino-ESP32 działa wewnątrz zadania FreeRTOS o nazwie `loopTask` i priorytecie 1. Pisząc normalny kod Arduino, przez cały czas programowałeś wewnątrz FreeRTOS – nawet nie wiedząc o tym!

---

## Tworzenie zadania

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
> Zadanie które nigdy nie wywołuje `vTaskDelay()` i ma wysoki priorytet **zablokuje inne zadania** i wywoła reset (Task Watchdog Timer).

---

## Ćwiczenie 10: Dwa niezależne zadania migania

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
<summary>Rozwiązanie</summary>

```cpp
xTaskCreate(TaskDioda2, "LED2", 1024, NULL, 1, NULL);

// W TaskDioda2:
vTaskDelay(pdMS_TO_TICKS(555));
```
</details>

**Zaobserwuj:** Obie diody migają z różnymi częstotliwościami, niezależnie od siebie. Scheduler FreeRTOS przełącza między nimi tysiące razy na sekundę.

---

## Wyzwania programowania współbieżnego

Gdy wiele zadań działa jednocześnie, pojawiają się nowe klasy błędów:

> [!WARNING] Race Condition (Wyścig)
> Dwa zadania próbują jednocześnie modyfikować tę samą zmienną globalną. Wynik zależy od kolejności przełączeń i jest **nieprzewidywalny**.

> [!CAUTION] Deadlock (Zakleszczenie)
> Zadanie A czeka na zasób blokowany przez Zadanie B, a Zadanie B czeka na zasób blokowany przez Zadanie A. Oba stoją w miejscu na zawsze.

**Rozwiązanie:** Kolejki (Queues) – bezpieczny mechanizm przekazywania danych między zadaniami.

---

## Ćwiczenie 11: Bezpieczna wymiana danych – Kolejki

**Kolejka (Queue)** to bufor FIFO (*First-In, First-Out*) zarządzany przez FreeRTOS. Zapewnia automatyczną synchronizację – żadne dwa zadania nie mogą jednocześnie uszkodzić danych w kolejce.

```cpp
const int PIN_LED = 2;
const int PIN_POT = 4;

QueueHandle_t kolejkaDanych; // Globalny uchwyt kolejki

void TaskNadajnik(void *pvParameters) {
  for (;;) {
    int odczyt = analogRead(PIN_POT);

    // UZUPEŁNIJ: wyślij &odczyt do kolejkaDanych z czasem oczekiwania portMAX_DELAY
    xQueueSend(
      /* 1. uchwyt kolejki */,
      /* 2. wskaźnik na dane: &odczyt */,
      /* 3. czas oczekiwania */
    );

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void TaskOdbiornik(void *pvParameters) {
  int odebranaWartosc;
  for (;;) {
    // UZUPEŁNIJ: odbierz dane z kolejkaDanych do &odebranaWartosc
    if (xQueueReceive(
      /* 1. uchwyt kolejki */,
      /* 2. bufor: &odebranaWartosc */,
      /* 3. czas oczekiwania: portMAX_DELAY */
    ) == pdPASS) {
      Serial.print("Odebrano: ");
      Serial.println(odebranaWartosc);
      int jasnosc = map(odebranaWartosc, 0, 4095, 0, 255);
      analogWrite(PIN_LED, jasnosc);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Kolejka na 5 elementów typu int
  kolejkaDanych = xQueueCreate(5, sizeof(int));

  if (kolejkaDanych == NULL) {
    Serial.println("Błąd tworzenia kolejki!");
    return;
  }

  xTaskCreate(TaskNadajnik, "Nadajnik", 2048, NULL, 1, NULL);
  xTaskCreate(TaskOdbiornik, "Odbiornik", 2048, NULL, 2, NULL); // Wyższy priorytet
}

void loop() {
  vTaskDelete(NULL);
}
```

<details>
<summary>Rozwiązanie uzupełnień</summary>

```cpp
// xQueueSend:
xQueueSend(kolejkaDanych, &odczyt, portMAX_DELAY);

// xQueueReceive:
xQueueReceive(kolejkaDanych, &odebranaWartosc, portMAX_DELAY);
```
</details>

---

## Zadanie do samodzielnego wykonania

1. Zmień rozmiar kolejki na `1` i zaobserwuj czy dane nadal płyną poprawnie.
2. Zmodyfikuj `TaskNadajnik` tak, aby wysyłał dane **tylko gdy odczyt zmienił się o więcej niż 50** jednostek w stosunku do poprzedniego pomiaru.
