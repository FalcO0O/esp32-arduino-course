# Podstawy programowania ESP32

W tym module nauczysz się sterować elektroniką za pomocą kodu. Zaczniemy od najprostszych programów (bez żadnych komponentów), a następnie krok po kroku podłączymy diody, potencjometr i przyciski.

---

## Wymagany sprzęt w tym module

| Komponent | Od którego ćwiczenia |
|:---|:---|
| ESP32-C6 DevKit + kabel USB | Ćw. 1 |
| Breadboard + przewody jumper | Ćw. 2 (Lekcja: Breadboard) |
| LED × 2 + rezystor 220–330 Ω × 2 | Ćw. 2 |
| Potencjometr 10 kΩ | Ćw. 4 |
| Przycisk tact switch | Ćw. 5 |

---

## Ćwiczenia w tym module

| # | Strona | Czego się nauczysz |
|:---:|:---|:---|
| – | [Lekcja: Breadboard](breadboard.md) | Jak używać płytki stykowej |
| 1 | [Serial: Hello World](serial.md) | Wysyłanie wiadomości do komputera |
| 2 | [Wyjście cyfrowe: LED](cyfrowe.md) | Sterowanie diodą, `digitalWrite` |
| 3 | [PWM: płynna jasność](pwm.md) | Modulacja sygnału, `analogWrite` |
| 4 | [ADC: potencjometr](adc.md) | Odczyt napięcia analogowego |
| 5 | [Wejście cyfrowe: przycisk](wejscie.md) | Odczyt stanu przycisku, drgania styków |
| 6 | [Przerwania zewnętrzne](interrupty.md) | ISR, `attachInterrupt` |

> [!TIP] Kolejność jest ważna
> Lekcja o breadboardzie pojawia się przed Ćw. 2, bo od tego momentu będziesz montować układy na płytce stykowej. Zacznij od lekcji, zanim przejdziesz do ćwiczeń z komponentami.
