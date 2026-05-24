# Trwały zapis danych: Pamięć nieulotna (NVS)

Gdy deklarujesz zmienną w programie (np. `int stan = 0;`), zostaje ona umieszczona w pamięci operacyjnej **RAM** mikrokontrolera. Pamięć RAM jest pamięcią ulotną – po odłączeniu zasilania, wciśnięciu przycisku EN/RST (Reset) lub wybudzeniu z trybu Deep Sleep, jej zawartość zostaje całkowicie skasowana, a zmienne inicjalizowane są na nowo.

Często jednak potrzebujemy zapisać dane, które muszą przetrwać restart urządzenia:

* Dane logowania do sieci Wi-Fi.
* Liczbę uruchomień lub czas pracy urządzenia.
* Ostatni stan pracy (np. czy dioda była włączona, jaka była ustawiona temperatura docelowa).
* Kalibrację czujników.

W układach ESP32 służy do tego **NVS** (*Non-Volatile Storage* – pamięć nieulotna).

---

## 💾 Czym jest NVS i jak działa?

NVS to dedykowana przestrzeń w pamięci **Flash** (czyli tej samej, w której przechowywany jest Twój program), zorganizowana w formacie bazy danych **klucz-wartość** (*key-value*). 

Zamiast adresować pamięć bezpośrednio (jak w tradycyjnym EEPROM-ie), w NVS zapisujesz dane pod przyjaznymi nazwami tekstowymi (kluczami), np. klucz `"jasnosc"` przechowuje wartość `255`.

### Dlaczego nie używamy biblioteki EEPROM?
W tradycyjnym środowisku Arduino (np. na Arduino Uno) do zapisu danych używa się biblioteki `<EEPROM.h>`. W przypadku ESP32 ta biblioteka jest przestarzała i niezalecana. Pod spodem i tak emuluje ona pamięć Flash, ale nie dba o optymalne zużycie komórek pamięci. 
Zamiast tego w ESP32 używamy biblioteki **Preferences**, która:

* Zapewnia **zużycie równomierne** (*wear leveling*) – automatycznie przenosi zapisywane dane w inne miejsca pamięci Flash, wydłużając jej żywotność.
* Grupuje dane w **przestrzenie nazw** (*namespaces*), co zapobiega konfliktom nazw kluczy w różnych częściach programu.
* Obsługuje automatyczne wykrywanie typów zmiennych.

> [!WARNING] Ograniczenie liczby cykli zapisu pamięci Flash
> Pamięć Flash posiada fizyczne ograniczenie liczby cykli zapisu – dla układów ESP32 wynosi ono zazwyczaj około **100 000 zapisów**. Po przekroczeniu tej liczby komórki pamięci ulegną uszkodzeniu. 
> * **Nigdy** nie zapisuj danych do pamięci NVS w pętli `loop()` bez żadnych warunków ani opóźnień.
> * Dane zapisuj **tylko wtedy, gdy uległy zmianie** (np. po wciśnięciu przycisku przez użytkownika lub w regularnych, długich odstępach czasu).

---

## 🔧 Korzystanie z biblioteki Preferences

Biblioteka `Preferences` jest częścią rdzenia ESP32 Arduino Core, więc nie musisz instalować żadnych dodatkowych bibliotek. Wystarczy dołączyć plik nagłówkowy:

```cpp
#include <Preferences.h>
```

### Podstawowe metody:

1. **Inicjalizacja**:
   ```cpp
   Preferences pref;
   pref.begin("nazwa_sekcji", false); // false = odczyt i zapis, true = tylko odczyt
   ```
   *Uwaga: nazwa sekcji (przestrzeni) może mieć maksymalnie 15 znaków.*

2. **Zapisywanie**:
   W zależności od typu zmiennej wybierasz odpowiednią metodę, np.:
   ```cpp
   pref.putInt("klucz", 123);
   pref.putFloat("klucz", 3.14);
   pref.putString("klucz", "tekst");
   ```
   *Uwaga: długość klucza (nazwy zmiennej) może mieć maksymalnie 15 znaków.*

3. **Odczytywanie**:
   ```cpp
   int liczba = pref.getInt("klucz", 0); // Drugi parametr to wartość domyślna, jeśli klucz nie istnieje
   ```

4. **Zamknięcie**:
   Zawsze zamykaj dostęp do preferencji po skończonych operacjach, aby zwolnić zasoby:
   ```cpp
   pref.end();
   ```

---

## 💻 Przykład: Licznik uruchomień (Boot Counter)

Poniższy program przy każdym uruchomieniu (lub resecie) odczytuje z pamięci NVS liczbę dotychczasowych uruchomień, zwiększa ją o jeden, wypisuje w Monitorze Szeregowym i zapisuje z powrotem.

[**Link do symulacji w Wokwi**](https://wokwi.com/projects/464857466831004673){: style="display: block; text-align: center;"}

```cpp
#include <Preferences.h>

Preferences preferences;

void setup() {
  Serial.begin(115200);
  delay(1000); // Czas na otwarcie Monitora Szeregowego

  // Otwieramy przestrzeń nazw "statystyki" w trybie odczytu i zapisu (false)
  preferences.begin("statystyki", false);

  // Odczytujemy wartość pod kluczem "licznik". Jeśli nie istnieje, zwracamy 0.
  unsigned int bootCount = preferences.getUInt("licznik", 0);

  // Zwiększamy licznik
  bootCount++;

  // Wypisujemy wynik na konsolę
  Serial.print("Liczba uruchomien urzadzenia: ");
  Serial.println(bootCount);

  // Zapisujemy nową wartość z powrotem pod tym samym kluczem
  preferences.putUInt("licznik", bootCount);

  // Zamykamy dostęp do preferencji
  preferences.end();
}

void loop() {
  // Pętla pozostaje pusta – cała logika wykonuje się tylko raz przy starcie systemu
}
```

Spróbuj wgrać ten program, otworzyć Monitor Szeregowi i kilkukrotnie wcisnąć przycisk **RST/EN** na płytce ESP32-C6. Zobaczysz, że wartość licznika rośnie i nie zeruje się po resecie. W przypadku Wokwi nie musisz nic klikać - mikrokontroler samemu się restartuje.

---

## 🛠️ Zadanie: Pamięć stanu diody LED (Power-on State)

Napisz program, w którym wciśnięcie przycisku podłączonego do `GPIO9` zmienia stan diody LED (włącza lub wyłącza ją) na pinie `GPIO2`. 

Twój program powinien zapisać aktualny stan diody (czy świeci, czy jest zgaszona) do pamięci NVS. Po resecie urządzenia (lub odłączeniu i ponownym podłączeniu zasilania) dioda powinna automatycznie uruchomić się w takim stanie, w jakim znajdowała się przed restartem.

> [!WARNING] Testowanie NVS w symulatorze Wokwi
> W Wokwi ponowne uruchomienie symulacji (rekompilacja) kasuje zawartość wirtualnej pamięci Flash, przez co dane NVS zostaną utracone. Aby przetestować zachowanie programu w symulacji, możesz wywołać restart programowo w kodzie za pomocą funkcji `ESP.restart()`, co zasymuluje restart bez czyszczenia pamięci NVS.

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
#include <Preferences.h>

Preferences preferences;

const int PIN_BTN = 9;
const int PIN_LED = 2;

bool stan_led = false;
bool stan_przycisku_poprzedni = HIGH;
unsigned long ostatni_czas_debouce = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BTN, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);

  // Odczytujemy stan początkowy z NVS
  preferences.begin("system_state", true); // Tryb tylko do odczytu (true)
  stan_led = preferences.getBool("led_on", false); // Domyślnie false (wyłączona)
  preferences.end();

  // Ustawiamy odczytany stan na diodzie
  digitalWrite(PIN_LED, stan_led ? HIGH : LOW);
  Serial.print("Uruchomiono diode w stanie: ");
  Serial.println(stan_led ? "WLACZONA" : "WYLACZONA");
}

void loop() {
  int odczyt_przycisku = digitalRead(PIN_BTN);

  if (odczyt_przycisku != stan_przycisku_poprzedni) {
    ostatni_czas_debouce = millis();
  }

  // Jeśli stan przycisku ustabilizował się na co najmniej 50 ms
  if ((millis() - ostatni_czas_debouce) > 50) {
    // Jeśli nastąpiło zbocze opadające (przycisk wciśnięty)
    if (odczyt_przycisku == LOW && stan_led == false) {
      // Włączamy diodę i zapisujemy stan
      stan_led = true;
      digitalWrite(PIN_LED, HIGH);
      zapisz_stan_do_nvs(stan_led);
    } 
    else if (odczyt_przycisku == LOW && stan_led == true) {
      // Wyłączamy diodę i zapisujemy stan
      stan_led = false;
      digitalWrite(PIN_LED, LOW);
      zapisz_stan_do_nvs(stan_led);
    }
  }

  stan_przycisku_poprzedni = odczyt_przycisku;
}

// Funkcja pomocnicza do zapisu
void zapisz_stan_do_nvs(bool stan) {
  preferences.begin("system_state", false); // Tryb zapisu
  preferences.putBool("led_on", stan);
  preferences.end();
  Serial.print("Zapisano stan do NVS: ");
  Serial.println(stan ? "WLACZONA" : "WYLACZONA");
}
```

</details>
