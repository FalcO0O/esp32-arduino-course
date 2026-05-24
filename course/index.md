# Mapa Kursu Podstaw Programowania Mikrokontrolerów

Witaj! Ten kurs przeprowadzi Cię krok po kroku przez świat programowania mikrokontrolerów w środowisku **Arduino IDE**. Od najprostszego mrugania diodą, aż po zaawansowane systemy wykorzystujące wbudowany system operacyjny i sieć.

> [!CAUTION] Wymagana wiedza wstępna
> Kurs zakłada znajomość języka **C++** (musisz rozumieć czym są zmienne, instrukcje warunkowe `if-else`, pętle `for`/`while`, funkcje, klasy, a w dalszych modułach także wskaźniki i referencje). Skupiamy się tutaj na elektronice i specyfice mikrokontrolerów, a nie na tłumaczeniu podstaw składni języka od zera.

## 🗺️ Struktura i nawigacja

Kurs jest zoptymalizowany pod kątem **liniowego** realizowania materiału i został przygotowany z myślą o łagodnej krzywej uczenia.

Do poruszania się po stronach możesz używać menu na górze i po lewej stronie ekranu. Na samym dole każdej podstrony znajdziesz również wygodne strzałki *wstecz* / *dalej*, które pozwalają przechodzić przez cały program krok po kroku.

Zalecamy realizację programu w następującej kolejności:

```
🏠 Start → ⚡ Podstawy → 🔌 Protokoły komunikacyjne → 🧠 Systemy operacyjne i pamięć → 📡 Technologie bezprzewodowe
```

Jeśli w trakcie wykonywania zadań będziesz potrzebować powtórzenia teorii, możesz w każdej chwili wrócić do wcześniejszych działów.

Każde z ćwiczeń posiada **rozwijane rozwiązanie wzorcowe**. Znajdziesz je na dole podstron pod przyciskiem "Pokaż rozwiązanie". Zachęcamy jednak do samodzielnych prób przed sprawdzeniem odpowiedzi.

---

## 📦 Moduły

### 🏠 Start – *jesteś tutaj*
Poznasz teorię działania układów wbudowanych, różnicę między komputerami PC a mikrokontrolerami, budowę ESP32-C6, a także zainstalujesz i skonfigurujesz środowisko **Arduino IDE** oraz zapoznasz się z symulatorem **Wokwi**.

- [Teoria – czym jest mikrokontroler](start/teoria.md)
- [Płytka ESP32-C6](start/sprzet.md)
- [Konfiguracja środowiska i czym jest Wokwi](start/ide.md)

---

### ⚡ Podstawy
Postawisz pierwsze kroki, łącząc na płytce stykowej podstawowe elementy elektroniczne, aby zrozumieć pojęcia stanów cyfrowych. Przejdziesz do płynnego sterowania jasnością (PWM), sterowania serwomechanizmami oraz odczytywania wielkości analogowych z otoczenia (ADC). Na koniec poznasz nieblokujący pomiar czasu i przerwane sprzętowe, które pozwalają reagować mikrokontrolerowi na zdarzenia w czasie rzeczywistym.

**Zadania w module:**

* [Serial Monitor i Wejścia/Wyjścia cyfrowe (GPIO)](podstawy/cyfrowe.md)
* [Sygnały analogowe (PWM i ADC)](podstawy/analogowe.md)
* [Sterowanie serwomechanizmami (PWM w praktyce)](podstawy/serwa.md)
* [Wielozadaniowość bez blokowania (funkcja `millis()`)](podstawy/czas_przerwania.md)
* [Reakcja na zdarzenia poprzez przerwania zewnętrzne (ISR)](podstawy/czas_przerwania.md)

---

### 🔌 Protokoły komunikacyjne

Większość cyfrowych czujników oraz wyświetlaczy komunikuje się z mikrokontrolerem za pomocą dedykowanych protokołów transmisji danych. W tym module poznasz standardy komunikacji przewodowej i nauczysz się integrować zewnętrzne komponenty.

**Zadania w module:**

* [Komunikacja UART](protokoly/uart.md)
* [Magistrala I<sup>2</sup>C (akcelerometr MPU6050)](protokoly/i2c.md)
* [Magistrala SPI (wyświetlacz graficzny TFT ILI9341)](protokoly/spi.md)
* [Transmisja jednoprzewodowa i diody ARGB (WS2812B)](protokoly/onewire.md)

---

### 🧠 Systemy operacyjne i pamięć

W tym module poznasz system operacyjny czasu rzeczywistego FreeRTOS, który umożliwia współbieżne wykonywanie wielu zadań bez blokowania procesora. Dowiesz się również, jak trwale zapisywać dane w pamięci nieulotnej (NVS) oraz jak oszczędzać energię poprzez zaawansowane usypianie układu.

**Zadania w module:**

* [Trwały zapis ustawień w pamięci Flash (NVS)](systemy/nvs.md)
* [Tryby uśpienia mikrokontrolera (Deep Sleep)](systemy/deepsleep.md)
* [System operacyjny czasu rzeczywistego (FreeRTOS - zadania i kolejki)](systemy/freertos.md)

---

### 📡 Technologie bezprzewodowe

W tym dziale wykorzystasz wbudowany moduł radiowy układu ESP32. Nauczysz się realizować bezpośrednią łączność bezprzewodową między mikrokontrolerami (ESP-NOW), konfigurować serwer HTTP (Wi-Fi) oraz pracować ze standardem Bluetooth Low Energy (BLE).

**Zadania w module:**

* [Radio ESP-NOW](bezprzewodowe/espnow.md)
* [Technologia WiFi](bezprzewodowe/wifi.md)
* [Łączność Bluetooth (BLE)](bezprzewodowe/ble.md)
