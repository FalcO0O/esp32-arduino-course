# Podstawy 

W tym module poznasz najbardziej elementarne i absolutnie kluczowe koncepcje elektroniki cyfrowej oraz zamiany sygnałów otaczającego nas świata fizycznego na liczby w programie.

---

## ⚡ Czego się nauczysz w tej sekcji?

Poznasz fundamenty pracy z mikrokontrolerami:

1. **Sygnały Cyfrowe** – nauczysz się konfigurować piny wejścia/wyjścia (GPIO), sterować diodami LED oraz reagować na wciśnięcia przycisku.
2. **Sygnały Analogowe** – opanujesz generowanie płynnych zmian za pomocą modulacji szerokości impulsów (PWM) oraz cyfrowy odczyt napięć z otoczenia za pomocą przetwornika analogowo-cyfrowego (ADC).
3. **Serwomechanizmy** – zastosujesz w praktyce sygnał PWM do precyzyjnego pozycjonowania wału silnika (serwa modelarskiego).
4. **Wielozadaniowość i Przerwania** – nauczysz się pisać nieblokujący kod za pomocą funkcji `millis()` oraz natychmiastowo reagować na sygnały zewnętrzne za pomocą przerwanych sprzętowych (ISR).

## 🛠️ Wymagany sprzęt w tym module

Wszystkie opisane lekcje możesz zasymulować bezpośrednio w oknie swojej przeglądarki dzięki narzędziu **[Wokwi](https://wokwi.com/)** – do każdego zadania dołączony jest odpowiedni schemat i kod!

Jeśli chcesz pracować z fizycznym sprzętem, potrzebujesz:

| Komponent | Do czego posłuży? |
|:---|:---|
| **Płytka ESP32-C6 + kabel USB** | Serce operacji i zasilanie układu |
| **Płytka Stykowa (Breadboard) + kable (jumpery)** | Bezlutowe łączenie elementów razem |
| **2x dioda LED + 2x rezystor (150-220 Ohm)** | Prezentacja stanów cyfrowych (GPIO) i analogowych (PWM) |
| **Przycisk (Tact Switch)** | Sterowanie wejściem cyfrowym i wyzwalanie przerwań (ISR) |
| **Potencjometr obrotowy (10 kOhm)** | Płynna regulacja napięcia wejściowego dla przetwornika ADC |
| **Mikro serwomechanizm (np. SG90)** | Praktyczny test sterowania ruchem za pomocą dedykowanego sygnału PWM |

---

## 🗺️ Spis Lekcji

1. [Wstęp do IO: Cyfrowe wyjścia i wejścia](cyfrowe.md)
2. [Sygnały: PWM i ADC](analogowe.md)
3. [Serwomechanizmy: sterowanie ruchem i PWM w praktyce](serwa.md)
4. [Czas i Przerwania (millis(), ISR)](czas_przerwania.md)
