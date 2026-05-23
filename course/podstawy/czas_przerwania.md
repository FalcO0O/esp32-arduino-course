# Czas i Przerwania (millis, ISR)

W poprzednich lekcjach do odmierzania czasu używaliśmy funkcji `delay()`. Na początku nauki jest ona bardzo wygodna, ale ma jedną poważną wadę – wstrzymuje działanie całego programu.

Gdy wywołujesz np. `delay(1000)`, mikrokontroler dosłownie „zamiera” na całą sekundę. W tym czasie nie może sprawdzić, czy wcisnąłeś przycisk, odebrać sygnału z czujników ani obsłużyć połączeń sieciowych. Twój program staje się na ten czas całkowicie „głuchy” na to, co dzieje się wokół niego.

W profesjonalnych urządzeniach, które muszą wykonywać wiele zadań jednocześnie i szybko reagować na zdarzenia w otoczeniu, klasyczne `delay()` jest rzadko używane.

W tym rozdziale rozwiążemy ten problem na dwa sposoby:

1. Używając systemowego zegara za pomocą funkcji `millis()`.
2. Korzystając z **przerwań zewnętrznych (Interrupts / ISR)** do natychmiastowej, sprzętowej reakcji na zdarzenia.

---

## Czas bez blokowania: Zegar `millis()`

Zamiast zatrzymywać procesor, pozwolimy pętli `loop()` wykonywać się bez żadnych przerw. W każdym jej obiegu będziemy sprawdzać aktualny czas systemowy. Funkcja `millis()` zwraca liczbę milisekund, które upłynęły od momentu uruchomienia (zasilenia) mikrokontrolera ESP32.

Zasada ta przypomina parzenie herbaty:

* **Podejście z `delay()`**: Włączasz czajnik i stoisz przy nim bezczynnie przez 5 minut, ignorując wszystko inne wokół.
* **Podejście z `millis()`**: Włączasz czajnik, zapisujesz na kartce aktualną godzinę i idziesz robić inne rzeczy (np. czytasz książkę w pętli `loop()`). Co jakiś czas spoglądasz na zegarek i porównujesz czas z zapisaną godziną. Gdy minie 5 minut, zalewasz herbatę.

🎯 **[Otwórz Wokwi z układem wykorzystującym millis()]** *(link zostanie zaktualizowany)*

### Kod: Blink bez delay()

Poniższy kod sprawia, że dioda mruga co pół sekundy, a procesor może jednocześnie wykonywać tysiące innych operacji w pętli `loop()` bez opóźnień:

```cpp
const int PIN_LED = 2;

// Ponieważ czas zwracany przez millis() stale rośnie, standardowa zmienna typu 'int' 
// przepełniłaby się już po około 32 sekundach. Dlatego używamy typu 'unsigned long' 
// (długa zmienna bez znaku), która pozwala na odmierzanie czasu do około 49 dni.
unsigned long zapisany_czas = 0; 
const unsigned long interval = 500; // Interwał czasowy: 500 ms (pół sekundy)
int stan_diody = LOW;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Pobieramy aktualny czas systemowy
  unsigned long obecny_czas = millis();

  // Sprawdzamy, czy upłynęło już odpowiednio dużo czasu od ostatniego zapisania
  if (obecny_czas - zapisany_czas >= interval) {
      
    // Zapisujemy nową godzinę startową w notatniku do odmierzania
    zapisany_czas = obecny_czas;

    // Zmiana stanu diody LED:
    if (stan_diody == LOW) {
      stan_diody = HIGH;
    } else {
      stan_diody = LOW;
    }
    digitalWrite(PIN_LED, stan_diody);
  }

  // Pętla loop wykonuje się bez przerwy (nie blokujemy jej).
  // Możemy tutaj wstawić obsługę innych elementów (np. przycisku) bez ryzyka opóźnienia reakcji.
}
```

---

## Przerwania zewnętrzne (Interrupts / ISR)

W dziale o wejściach cyfrowych sprawdzaliśmy stan przycisku w pętli `loop()`, ciągle pytając: *„Czy przycisk jest wciśnięty?”*. Takie podejście nazywa się **pollingiem** (odpytywaniem). Jest ono nieefektywne i sprawia, że procesor marnuje zasoby na ciągłe sprawdzanie tego samego pinu.

**Przerwania (Interrupts)** całkowicie zmieniają ten model. Pozwalają one skonfigurować mikrokontroler tak, aby automatycznie zareagował na zmianę napięcia na wybranym pinie (np. wciśnięcie przycisku podłączonego do GPIO9).

W momencie wystąpienia takiego zdarzenia (zbocza sygnału), procesor natychmiast wstrzymuje wykonywanie kodu głównego, uruchamia specjalną, krótką funkcję obsługi przerwania (tzw. **ISR – Interrupt Service Routine**), po czym automatycznie wraca do wykonywania głównego programu dokładnie w miejscu, w którym go przerwał.

### Jak zdefiniować przerwanie?

Rejestrujemy je na wybranym pinie, podając nazwę funkcji, która ma się wykonać, oraz typ zmiany napięcia, jaki ma wywołać przerwanie:

* `RISING` – zbocze narastające (napięcie rośnie, z `LOW` do `HIGH`).
* `FALLING` – zbocze opadające (napięcie spada, z `HIGH` do `LOW` – przydatne przy konfiguracji `INPUT_PULLUP`).
* `CHANGE` – dowolna zmiana stanu (z `LOW` do `HIGH` lub z `HIGH` do `LOW`).

```cpp
attachInterrupt(digitalPinToInterrupt(PIN), funkcja_ISR, FALLING);
```

> [!WARNING] Ważne zasady dotyczące funkcji obsługi przerwań (ISR)
> * **IRAM_ATTR**: Funkcja uruchamiana przez przerwanie na układach ESP32 musi posiadać przedrostek `IRAM_ATTR`. Dzięki temu kompilator umieści jej kod w szybkiej pamięci RAM (a nie w pamięci Flash), co gwarantuje natychmiastowe wykonanie.
> * **Szybkość i czas wykonania**: Przerwanie to wyjątkowy, priorytetowy stan procesora. W momencie jego wyzwolenia wykonywanie głównego programu zostaje natychmiast zawieszone na rzecz procedury ISR. Zbyt długie przebywanie w przerwaniu blokuje pracę całego systemu (w tym obsługę komunikacji sieciowej czy timerów systemowych), co może doprowadzić do destabilizacji mikrokontrolera lub wyzwolenia sprzętowego zabezpieczenia przed zawieszeniem systemu (**Watchdog Timer - WDT**). Dlatego wewnątrz ISR **nigdy nie wolno** stosować funkcji blokujących (np. `delay()`) oraz czasochłonnych metod komunikacji (np. `Serial.println()`). Zadaniem ISR jest jedynie wykonanie minimalnych i najpilniejszych zadań (np. zmiana flagi w zmiennej lub inkrementacja licznika) oraz natychmiastowe oddanie sterowania.
> * **Volatile**: Każda zmienna modyfikowana wewnątrz funkcji przerwania, a odczytywana w pętli `loop()`, musi posiadać w swojej deklaracji słowo kluczowe `volatile`. Informuje ono kompilator, że jej wartość może ulec zmianie w dowolnym momencie, co zapobiega błędnej optymalizacji rejestrów.

🎯 **[Otwórz Wokwi dla Przerwań Sprzętowych]** *(link zostanie zaktualizowany)*

### Kod: Zliczanie zdarzeń za pomocą przerwania

Poniższy program zlicza wciśnięcia przycisku bez ciągłego sprawdzania stanu pinu w pętli `loop()`:

```cpp
const int PIN_BTN = 9;

// Zmienne modyfikowane w przerwaniu muszą być oznaczone jako volatile
volatile int licznikKlikniec = 0;
volatile bool flaga_zmiany = false;

// Funkcja obsługi przerwania (ISR)
void IRAM_ATTR moje_przerwanie_przycisku() {
  licznikKlikniec++;
  flaga_zmiany = true; // Ustawiamy flagę informującą pętlę główną o zdarzeniu
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BTN, INPUT_PULLUP);

  // Rejestracja przerwania na pinie 9 przy zboczu opadającym
  attachInterrupt(digitalPinToInterrupt(PIN_BTN), moje_przerwanie_przycisku, FALLING);
  
  Serial.println("System gotowy. Wcisnij przycisk!");
}

void loop() {
  // Pętla może zajmować się innymi operacjami (np. delay reprezentującym obliczenia):
  delay(500);

  // Sprawdzamy, czy flaga przerwania została ustawiona:
  if (flaga_zmiany == true) {
      flaga_zmiany = false; // Resetujemy flagę
      Serial.print("Niezalezny sprzetowy licznik odnotowal klikniecie. Wartosc: ");
      Serial.println(licznikKlikniec);
  }
}
```

### Zadanie: Eliminacja drgań styków (Debouncing) w przerwaniu

Podczas testowania powyższego kodu mogłeś zauważyć, że pojedyncze wciśnięcie przycisku czasami zwiększa licznik o kilka jednostek w Monitorze Szeregowym. Wynika to ze znanego już zjawiska drgania styków (bouncing) – funkcja przerwania ISR jest wywoływana błyskawicznie przy każdym mikro-połączeniu blaszek przycisku.

**Zadanie**: Zmodyfikuj powyższy kod, wprowadzając programowy debouncing bezpośrednio w funkcji przerwania. Wykorzystaj czas systemowy `millis()`. 

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
const int PIN_BTN = 9;

volatile int licznikKlikniec = 0;
volatile bool flaga_zmiany = false;
volatile unsigned long ostatnie_odbicie = 0; // Czas ostatniego wciśnięcia (musi być volatile)

void IRAM_ATTR moje_przerwanie_przycisku() {
  // Pobieramy aktualny czas systemowy
  unsigned long teraz = millis();
  
  // Akceptujemy zdarzenie tylko, jeśli upłynęło więcej niż 50 ms od ostatniego poprawnie odczytanego wciśnięcia
  if (teraz - ostatnie_odbicie > 50) {
      licznikKlikniec++;
      flaga_zmiany = true;
  }
  ostatnie_odbicie = teraz;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BTN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_BTN), moje_przerwanie_przycisku, FALLING);
}

void loop() {
  if (flaga_zmiany == true) {
      flaga_zmiany = false;
      Serial.println(licznikKlikniec);
  }
}
```

</details>
