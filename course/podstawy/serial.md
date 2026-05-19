# Ćwiczenie 1 – Serial: „Witaj świecie!"

**Potrzebujesz:** ESP32-C6 DevKit + kabel USB-C. Żadnych dodatkowych komponentów.

Mikrokontroler nie posiada własnego ekranu. Aby zobaczyć co dzieje się wewnątrz układu, używamy **portu szeregowego (Serial)** – przesyła on tekstowe wiadomości przez kabel USB do komputera. Jest to Twój podstawowy tool do debugowania przez cały kurs.

---

## Jak działa komunikacja szeregowa?

Komputer i mikrokontroler „rozmawiają" przez USB za pomocą protokołu **UART**. Dane płyną jako strumień bitów z ustaloną prędkością, zwaną **baud rate** (bodami).

> [!NOTE] Co to jest baud?
> **Baud** (bod) to liczba symboli przesyłanych na sekundę. Ustawienie `115200` baud to szybka komunikacja – ponad 100 000 bitów na sekundę. Ważne: prędkość w kodzie i w Monitorze Szeregowym musi być **identyczna** – inaczej zamiast tekstu zobaczysz „krzaki".

---

## Kod do wgrania

```cpp
void setup() {
  // Uruchomienie komunikacji z prędkością 115200 bitów na sekundę
  Serial.begin(115200);

  // Wysłanie pojedynczej wiadomości zaraz po uruchomieniu
  Serial.println("Układ ESP32-C6 uruchomiony pomyślnie!");
}

void loop() {
  // Wysyłanie wiadomości co sekundę
  Serial.println("Witaj świecie z mikrokontrolera!");

  // Opóźnienie programu o 1000 milisekund (1 sekunda)
  delay(1000);
}
```

### Jak zobaczyć wynik?

1. Wgraj program na płytkę (przycisk **Wgraj** lub `Ctrl + U`).
2. Kliknij ikonę lupy w prawym górnym rogu Arduino IDE (`Ctrl + Shift + M`), aby otworzyć **Monitor Portu Szeregowego**.
3. W dolnym rogu okna upewnij się, że wybrano prędkość **115200 baud**.
4. Co sekundę powinna pojawiać się nowa linia tekstu.

![Monitor Portu Szeregowego z komunikatem Witaj świecie](../img/podstawy/serial_monitor.png)

---

## Budowa programu Arduino

Każdy program w Arduino składa się z dwóch obowiązkowych funkcji:

```cpp
void setup() {
  // Wykonuje się TYLKO RAZ – zaraz po włączeniu zasilania lub naciśnięciu RESET.
  // Tutaj: inicjalizacja Serial, konfiguracja pinów, start bibliotek.
}

void loop() {
  // Wykonuje się w NIESKOŃCZONĄ PĘTLĘ – z góry na dół, od nowa, w kółko.
  // Tutaj: główna logika programu.
}
```

---

## Przydatne funkcje Serial

| Funkcja | Opis |
|:---|:---|
| `Serial.begin(115200)` | Inicjalizacja z prędkością 115200 baud |
| `Serial.println("tekst")` | Wysyła tekst i przechodzi do nowej linii |
| `Serial.print("tekst")` | Wysyła tekst bez nowej linii |
| `Serial.println(liczba)` | Wysyła liczbę całkowitą |
| `Serial.print(zmienna)` | Wysyła wartość dowolnej zmiennej |

### Przykład formatowania wielu wartości:

```cpp
int temperatura = 23;
float napiecie = 3.14;

Serial.print("Temp: ");
Serial.print(temperatura);
Serial.print(" C, Napięcie: ");
Serial.print(napiecie);
Serial.println(" V");
// Wynik: Temp: 23 C, Napięcie: 3.14 V
```

---

## Zadanie do samodzielnego wykonania

Zmodyfikuj program tak, aby w pętli `loop()` mikrokontroler co sekundę wypisywał **dwie linijki**: pierwsza z dowolnym Twoim tekstem (np. Twoim imieniem), druga ze wzrastającą liczbą (licznik sekund).

<details>
<summary>Podpowiedź</summary>
Zadeklaruj zmienną globalną <code>int licznik = 0;</code> przed funkcją <code>setup()</code>. W pętli <code>loop()</code> zwiększaj ją o 1 po każdym <code>delay(1000)</code> za pomocą <code>licznik++</code>, a następnie wypisz jej wartość przez <code>Serial.println(licznik)</code>.
</details>
