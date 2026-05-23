# Systemy operacyjne i pamięć

W tym module wyjdziesz poza paradygmaty początkującego hobbysty i poznasz rozwiązania, które stosuje się w profesjonalnym oprogramowaniu embedded.

---

## ⚡ Czego się nauczysz w tej sekcji?
Przejdziemy do zaawansowanych mechanizmów systemowych i architektury systemów wbudowanych:

1. **Zarządzanie energią (Deep Sleep)** – poznasz techniki ultra-niskiego poboru prądu, które pozwalają urządzeniom pracować na baterii przez miesiące lub lata.
2. **System operacyjny czasu rzeczywistego (FreeRTOS)** – zaprzęgniemy do pracy wbudowany system operacyjny, ucząc się współbieżnego wykonywania zadań (Tasks) i bezpiecznej komunikacji między nimi za pomocą Kolejek (Queues).
3. **Pamięć nieulotna (NVS)** – dowiesz się, jak trwale zapisywać ustawienia, zmienne oraz konfigurację w pamięci Flash mikrokontrolera tak, aby nie uległy skasowaniu po zaniku zasilania.

## 🛠️ Wymagany sprzęt w tym module
Tak jak do tej pory, zadania i struktury możesz odtwarzać na symulatorze **Wokwi** (linki z gotowcami na stronach zadań).

Do przetestowania na żywym stole potrzebujesz:
| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6** | Serce operacji systemowych i uśpienia |
| **Dwie diody LED i dwa przyciski** | Wykazanie współbieżności i reakcji na niezależne zadania systemowe |

---

## 🗺️ Spis Lekcji

| Lekcja | Temat | Czego dotyczy? |
|:---:|:---|:---|
| 1 | [Deep Sleep: zarządzanie energią](deepsleep.md) | Projektowanie urządzeń zasilanych bateryjnie i tryby ultra-oszczędzania prądu |
| 2 | [FreeRTOS: Zadania i kolejki](freertos.md) | Prawdziwa wielozadaniowość (Tasks) oraz bezpieczna wymiana informacji (Queues) |
| 3 | [Pamięć trwała (NVS)](nvs.md) | Zapisywanie konfiguracji i stanów w nieulotnej pamięci Flash (zachowywanie danych po wyłączeniu zasilania) |
