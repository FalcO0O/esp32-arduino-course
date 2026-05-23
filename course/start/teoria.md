# 1. Teoria – czym jest mikrokontroler?

Zanim zaczniesz pisać swój pierwszy kod i łączyć kabelki na płytce stykowej, warto zrozumieć, z jakim rodzajem komputera masz do czynienia. Choć mikrokontroler potrafi wykonywać programy podobnie jak Twój komputer czy smartfon, jego architektura, przeznaczenie oraz sposób działania są zupełnie inne.

---

## Komputer (PC) vs. Mikrokontroler (MCU)

Urządzenia, z których korzystamy na co dzień, takie jak komputery osobiste, serwery czy smartfony, opierają się na **procesorach aplikacyjnych (MPU)**. Ich zadaniem jest uruchamianie ogromnych, złożonych systemów operacyjnych (np. Windows, Linux, macOS, Android), które koordynują setki procesów w tym samym czasie.

**Mikrokontroler (MCU - Microcontroller Unit)** to z kolei kompletny miniaturowy komputer zintegrowany wewnątrz **jednego układu scalonego**. Zawiera on w sobie nie tylko rdzeń procesora, ale również pamięć RAM, pamięć nieulotną Flash (odpowiednik dysku twardego) oraz bloki peryferyjne (np. przetworniki cyfrowo-analogowe, kontrolery magistral komunikacyjnych) ułatwiające fizyczne innymi urządzeniami.

Poniższa tabela przedstawia kluczowe różnice między tymi dwoma światami:

| Cecha | Komputer (PC / Smartfon) | Mikrokontroler (MCU / ESP32) |
|:---|:---|:---|
| **Budowa fizyczna** | Wiele osobnych układów na płycie głównej (CPU, RAM, Dysk, GPU) | Wszystko w jednym chipie (System on Chip - SoC) |
| **Pamięć RAM** | Liczona w gigabajtach (GB) | Liczona w kilobajtach (KB) lub megabajtach (MB) |
| **Pamięć na program** | Dyski SSD/HDD (setki GB / TB) | Pamięć Flash (zazwyczaj od kilkuset KB do kilku MB) |
| **System operacyjny** | Złożony (Windows, Linux) zarządzający wieloma wątkami | Brak systemu (Bare Metal) lub bardzo lekki system czasu rzeczywistego (RTOS) |
| **Przewidywalność czasu** | Niska (system operacyjny może na chwilę zamrozić program na rzecz aktualizacji lub antywirusa) | Całkowita deterministyczność (kod wykonuje się w ściśle określonym czasie) |
| **Pobór energii** | Wysoki (od kilkunastu do setek watów) | Ekstremalnie niski (miliwaty w czasie pracy, mikrowaty w uśpieniu) |
| **Koszt układu** | Od kilkuset do kilku tysięcy złotych | Od kilku do kilkudziesięciu złotych |

> [!NOTE] Odłączenie zasilania a utrata danych
> Bardzo częste pytanie na początku brzmi: *"Czy muszę wgrywać kod z komputera za każdym razem, gdy odłączę kabel USB?"*.
> Odpowiedź brzmi: **Nie**. Twój program wgrywany jest na stałe do nieulotnej pamięci **Flash**. Po odpięciu przewodu od komputera i podłączeniu np. ładowarki lub powerbanka, mikrokontroler ułamek sekundy po starcie automatycznie uruchomi wgrany wcześniej kod. Należy jednak pamiętać, że po każdym takim restarcie zasilania (lub wciśnięciu przycisku RESET) zawartość pamięci **RAM** jest całkowicie kasowana. Oznacza to, że wszystkie zmienne w Twoim programie (np. aktualny wynik licznika) zostaną zresetowane do wartości początkowych.

---

## Po co w ogóle stosuje się mikrokontrolery?

Skoro tradycyjny komputer jest tak potężny, dlaczego nie stosuje się procesorów z rodziny Intel Core lub Apple Silicon w pralkach, lodówkach, pilotach telewizyjnych czy zabawkach? 

Powody są trzy: **koszt, zużycie energii oraz niezawodność**.

1. **Efektywność kosztowa**: Koszt produkcji prostego mikrokontrolera jest niezwykle niski. Wyposażenie każdego domowego urządzenia AGD w pełnoprawny procesor aplikacyjny i kości pamięci DDR podniosłoby cenę tych urządzeń wielokrotnie, nie przynosząc żadnej korzyści użytkownikowi.
2. **Zużycie energii**: Urządzenia Internetu Rzeczy (IoT), takie jak czujniki pogody, inteligentne liczniki wody czy bezprzewodowe przyciski smart home, muszą działać na jednej małej baterii przez miesiące lub lata. Mikrokontroler potrafi przejść w tryb głębokiego uśpienia (Deep Sleep), pobierając prąd rzędu kilku mikroamperów (µA), i wybudzać się tylko w momencie wykrycia zdarzenia. Tradycyjny komputer rozładowałby taką baterię w kilka minut.
3. **Niezawodność i determinizm**: Mikrokontroler nie posiada dysku twardego, który może ulec uszkodzeniu, ani systemu operacyjnego, który może się zawiesić z powodu braku pamięci lub błędu w tle. Sterownik poduszek powietrznych w samochodzie nie może czekać, aż system operacyjny skończy instalować aktualizację w tle – musi podjąć decyzję o wystrzale w ciągu ułamka milisekundy. Mikrokontrolery gwarantują czas reakcji w czasie rzeczywistym.

---

## Podejście Bare Metal

W tym kursie rozpoczniemy naukę programowania w podejściu nazywanym **Bare Metal**. Oznacza to, że nasz mikrokontroler nie będzie obciążony żadnym systemem zarządzającym zasobami. 

Twój napisany program kompiluje się bezpośrednio do instrukcji procesora. Układ po włączeniu zasilania uruchamia funkcję konfiguracji, po czym rozpoczyna wykonywanie nieskończonej pętli, realizując instrukcje krok po kroku:

```cpp
void setup() {
  // Wykonaj raz przy starcie systemu
}

void loop() {
  // Wykonuj cyklicznie w pętli nieskończonej
}
```

Jest to podejście niesamowicie wydajne, przewidywalne i proste do zrozumienia na start. W dalszej części kursu poznamy jednak inne podejście, które ułatwia zarządzanie bardziej skomplikowanymi projektami.

---

> [!NOTE] Ciekawostka: Czy mikrokontroler może mieć system operacyjny?
> Tak! Bardziej zaawansowane układy (takie jak nasz ESP32-C6) potrafią uruchamiać systemy operacyjne, jednak nie przypominają one systemów Windows czy macOS z interfejsem graficznym. 
> 
> Są to tzw. **systemy czasu rzeczywistego (RTOS - Real-Time Operating System)**. Są one ekstremalnie lekkie i służą głównie do zarządzania wątkami oraz planowania zadań tak, by procesor mógł płynnie przełączać się między wieloma operacjami w tle (np. jednoczesnym odczytem czujników i komunikacją Wi-Fi). 
> 
> W module **Systemy** dowiesz się, dlaczego RTOS jest tak pomocny i jak z niego w pełni korzystać. Na razie skupimy się w pełni na klasycznym podejściu Bare Metal.
