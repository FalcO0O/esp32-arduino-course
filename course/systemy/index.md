# Moduł: Systemy (Architektura)

W tym module wyjdziesz poza paradygmaty początkującego hobbysty i poznasz rozwiązania, które odróżniają profesjonalne oprogramowanie embedded od prostych skryptów.

---

## ⚡ Czego się nauczysz w tej sekcji?
Skupimy się na przeskoczeniu z wykonywania jednej linijki kodu po drugiej w nieskończonej pętli, na rzecz prawdziwego **Systemu Operacyjnego**. 
W klasycznym Arduino cały program mieści się w pętli `loop()`. Gdy chcesz robić kilka rzeczy „jednocześnie", napotykasz "ścianę" – jeśli zablokujesz czymś procesor, przestaje odczytywać przyciski i czujniki. Tutaj zaprzęgniemy do pracy **FreeRTOS** – darmowy system operacyjny czasu rzeczywistego wbudowany bezpośrednio w układy ESP.

Dowiesz się również, w jaki sposób urządzenia na jednym ładowaniu baterii potrafią raportować pogodę przez sieć Wi-Fi pracując przez bite 3 lata (technika Deep Sleep).

## 🛠️ Wymagany sprzęt w tym module
Tak jak do tej pory, zadania i struktury możesz odtwarzać na symulatorze **Wokwi** (linki z gotowcami na stronach zadań).

Do przetestowania na żywym stole potrzebujesz:
| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6** | Serce FreeRTOS i trybów usypiania |
| **Dwie diody LED i dwa przyciski** | Wykazanie jednoczesnego reagowania na niezależne akcje |
| **Bateria (np. Li-Ion lub Powerbank)** | (Opcjonalnie) Przetestowanie działania zasilania niezależnego w Deep Sleep |

---

## 🗺️ Spis Lekcji

| # | Temat | Czego dotyczy? |
|:---:|:---|:---|
| 11-12 | [FreeRTOS: Zadania i kolejki](freertos.md) | Wielozadaniowość (robienie 10 rzeczy naraz) i bezpieczna wymiana danych między nimi |
| 13 | [Deep Sleep: zarządzanie energią](deepsleep.md) | Usypianie układu z zachowaniem zegara |
