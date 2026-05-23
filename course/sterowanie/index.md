# Moduł: Sterowanie (Czas i Zdarzenia)

W poprzednim dziale poznałeś podstawy – potrafisz już mrugać diodą i odczytywać stan przycisku. Robiłeś to jednak w sposób najprostszy z możliwych, używając instrukcji blokującej `delay()`.

W tym module dowiesz się, dlaczego używanie `delay()` w zaawansowanych projektach nie jest dobrym pomysłem. Poznasz również techniki pisania kodu, który "robi kilka rzeczy naraz", korzystając z wewnętrznego zegara mikrokontrolera oraz tzw. przerwań sprzętowych.

---

## ⚡ Czego się nauczysz w tej sekcji?
* **Wielozadaniowości bez blokowania**: Dowiesz się, jak mierzyć upływ czasu w tle, pozwalając procesorowi na jednoczesne wykonywanie innych operacji, zamiast wstrzymywać cały program za pomocą funkcji `delay()`.
* **Przerwań zewnętrznych (Interrupts)**: Zastąpisz ciągłe sprawdzanie stanu pinu w pętli (tzw. polling) wydajnym mechanizmem przerwań sprzętowych, które natychmiast reagują na zdarzenia zewnętrzne (np. wciśnięcie przycisku).

## 🛠️ Wymagany sprzęt
Wszystkie opisane lekcje możesz zasymulować bezpośrednio w oknie swojej przeglądarki dzięki narzędziu **Wokwi**.

Sprzęt fizyczny potrzebny w tym module nie różni się niczym od podzespołów z działu Podstaw:
| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6 + kabel USB** | Logika obliczeniowa oraz piny z obsługą Przerwań (ISR) |
| **Dioda LED + Opornik** | Zobrazowanie wykonywania kodu niezależnie |
| **Przycisk (Tact Switch)** | Generowanie fizycznego zwarcia wyzwalającego zdarzenie Interrupt |

---


[Czas i Przerwania (millis(), ISR)](czas_przerwania.md)
