# Systemy wbudowane

W tym module wyjdziesz poza prostą pętlę `loop()` i poznasz dwa zaawansowane mechanizmy, które odróżniają profesjonalne systemy wbudowane od amatorskich projektów.

---

## Ćwiczenia

| # | Strona | Czego się nauczysz |
|:---:|:---|:---|
| 10–11 | [FreeRTOS: zadania i kolejki](freertos.md) | Wielozadaniowość, synchronizacja |
| 12 | [Deep Sleep: zarządzanie energią](deepsleep.md) | Tryby uśpienia, wybudzenie, RTC |

---

## Dlaczego to ważne?

**FreeRTOS** rozwiązuje problem wykonywania wielu operacji „jednocześnie" bez blokowania programu przez `delay()`. Przydatne gdy chcesz jednocześnie obsługiwać sieć Wi-Fi, czytać czujniki i sterować wyświetlaczem.

**Deep Sleep** to klucz do urządzeń zasilanych bateryjnie – ESP32-C6 w trybie aktywnym pobiera ok. 100 mA, a w Deep Sleep zaledwie kilka µA.
