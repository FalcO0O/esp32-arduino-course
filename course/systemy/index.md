# Systemy operacyjne i pamięć

W tym module wyjdziesz poza paradygmaty początkującego hobbysty i poznasz rozwiązania, które stosuje się w profesjonalnym oprogramowaniu embedded.

---

## ⚡ Czego się nauczysz w tej sekcji?
Przejdziemy do zaawansowanych mechanizmów systemowych i architektury systemów wbudowanych:

1. **Zarządzanie energią (Deep Sleep)** – poznasz techniki ultra-niskiego poboru prądu, które pozwalają urządzeniom pracować na baterii przez miesiące lub lata.
2. **System operacyjny czasu rzeczywistego (FreeRTOS)** – zaprzęgniemy do pracy wbudowany system operacyjny, ucząc się współbieżnego wykonywania zadań (Tasks) i bezpiecznej komunikacji między nimi za pomocą Kolejek (Queues).
3. **Pamięć nieulotna (NVS)** – dowiesz się, jak trwale zapisywać ustawienia, zmienne oraz konfigurację w pamięci Flash mikrokontrolera tak, aby nie uległy skasowaniu po zaniku zasilania.

## 🛠️ Wymagany sprzęt w tym module
Zadania z sekcji FreeRTOS oraz NVS możesz odtworzyć w symulatorze **Wokwi**. Wyjątkiem jest **Deep Sleep** – Wokwi nie wspiera głębokiego uśpienia w sposób, który pozwoliłby na ładne i czytelne pokazanie jego działania, dlatego to ćwiczenie wymaga fizycznego mikrokontrolera.

Do przetestowania na żywym stole potrzebujesz:

| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6 + kabel USB** | Serce operacji systemowych i uśpienia |
| **Płytka Stykowa (Breadboard) + kable (jumpery)** | Bezlutowe łączenie elementów razem |
| **2x dioda LED + 2x rezystor (150-220 Ohm)** | Wykazanie współbieżności i reakcji na niezależne zadania systemowe |
| **Przycisk (Tact Switch)** | Sterowanie wejściami w zadaniach systemowych i wybudzanie z uśpienia |
| **Potencjometr obrotowy (10 kOhm)** | Generowanie analogowych wartości przekazywanych w kolejkach FreeRTOS |

---

## 🗺️ Spis Lekcji

1. [Deep Sleep: zarządzanie energią](deepsleep.md)
2. [FreeRTOS: Zadania i kolejki](freertos.md)
3. [Pamięć trwała (NVS)](nvs.md)
