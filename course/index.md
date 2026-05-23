# Mapa Kursu Podstaw Programowania Mikrokontrolerów

Witaj! Ten kurs przeprowadzi Cię krok po kroku przez świat programowania mikrokontrolerów w środowisku **Arduino IDE**. Od najprostszego mrugania diodą, aż po zaawansowane systemy wykorzystujące wbudowany system operacyjny i sieć.

> [!IMPORTANT] Wymagana wiedza wstępna
> Kurs zakłada podstawową znajomość programowania w języku **C lub C++** (musisz rozumieć czym są zmienne, instrukcje warunkowe `if-else`, pętla `for`/`while` oraz funkcje). Skupiamy się tutaj na elektronice i specyfice mikrokontrolerów, a nie na tłumaczeniu podstaw składni języka od zera.

## Struktura i nawigacja

Kurs jest zoptymalizowany pod kątem **liniowego** realizowania materiału i został przygotowany z myślą o łagodnej krzywej uczenia.

Do poruszania się po stronach możesz używać menu na górze i po lewej stronie ekranu. Na samym dole każdej podstrony znajdziesz również wygodne strzałki *wstecz* / *dalej*, które pozwalają przechodzić przez cały program krok po kroku.

Zalecamy realizację programu w następującej kolejności:

```
🏠 Start → ⚡ Podstawy → ⚙️ Sterowanie → 🔌 Protokoły → 🧠 Systemy → 📡 Bezprzewodowe
```

Jeśli w trakcie wykonywania zadań będziesz potrzebować powtórzenia teorii, możesz w każdej chwili wrócić do wcześniejszych działów.

Każde z ćwiczeń posiada **rozwijane rozwiązanie wzorcowe**. Znajdziesz je na dole podstron pod przyciskiem "Pokaż rozwiązanie". Zachęcamy jednak do samodzielnych prób przed sprawdzeniem odpowiedzi.

---

## Moduły

### 🏠 Start – *jesteś tutaj*
Poznasz teorię działania układów wbudowanych, różnicę między komputerami PC a mikrokontrolerami, budowę ESP32-C6, a także zainstalujesz i skonfigurujesz środowisko **Arduino IDE** oraz zapoznasz się z symulatorem **Wokwi**.

- [1. Teoria – czym jest mikrokontroler](start/teoria.md)
- [2. Płytka ESP32-C6](start/sprzet.md)
- [3. Konfiguracja środowiska i czym jest Wokwi](start/ide.md)

---

### ⚡ Podstawy
Postawisz pierwsze kroki, łącząc na płytce stykowej podstawowe elementy elektroniczne, aby zrozumieć pojęcia stanów cyfrowych. Następnie przejdziesz do płynnego sterowania jasnością (PWM) oraz odczytywania wielkości analogowych z otoczenia (ADC).

**Zadania w module:**
* Serial Monitor
* GPIO
* PWM
* ADC (Odczyt z pinów analogowych)

---

### ⚙️ Sterowanie
W tej sekcji dowiesz się, jak realizować wielozadaniowość oraz reagować na zdarzenia zewnętrzne. Zobaczysz, jakie ograniczenia niesie za sobą stosowanie blokującej funkcji opóźniającej i poznasz mechanizmy pomiaru czasu oraz obsługi przerwań sprzętowych.

**Zadania w module:**
* Stoper na funkcji millis()
* Przerwania zewnętrzne (ISR)

---

### 🔌 Protokoły
Większość cyfrowych czujników oraz wyświetlaczy komunikuje się z mikrokontrolerem za pomocą dedykowanych protokołów transmisji danych. W tym module poznasz standardy komunikacji przewodowej i nauczysz się integrować zewnętrzne komponenty.

**Zadania w module:**
* Komunikacja UART
* Magistrala I2C
* Magistrala SPI

---

### 🧠 System Operacyjny
W tym module poznasz system operacyjny czasu rzeczywistego FreeRTOS, który umożliwia współbieżne wykonywanie wielu zadań bez blokowania procesora. Dowiesz się również, jak oszczędzać energię poprzez usypianie układu oraz jak trwale zapisywać dane w pamięci nieulotnej (NVS).

**Zadania w module:**
* System operacyjny czasu rzeczywistego (FreeRTOS)
* Zadania (Tasks)
* Kolejki (Queues)
* Tryby Deep Sleep & NVS

---

### 📡 Bezprzewodowe
W tym dziale wykorzystasz wbudowany moduł radiowy układu ESP32. Nauczysz się realizować bezpośrednią łączność bezprzewodową między mikrokontrolerami (ESP-NOW), konfigurować serwer HTTP (Wi-Fi) oraz pracować ze standardem Bluetooth Low Energy (BLE).

**Zadania w module:**
* Radio ESP-NOW
* Technologia WiFi
* Łączność Bluetooth (BLE)
