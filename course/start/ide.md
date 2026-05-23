# 3. Konfiguracja środowiska i Wokwi

Gdy znasz już teorię oraz budowę mikrokontrolera ESP32-C6, należy przygotować narzędzia deweloperskie. Kod dla naszej płytki możemy pisać zarówno w środowisku fizycznym (używając darmowego **Arduino IDE**), jak i wirtualnym (za pomocą symulatora **Wokwi**).

---

## Narzędzie wirtualne: Symulator Wokwi

Przy większości zadań i ćwiczeń w tym kursie znajdziesz link do gotowego projektu w symulatorze **[Wokwi.com](https://wokwi.com)**. Pozwala to na natychmiastowe testowanie, pisanie i wklejanie kodu bezpośrednio w oknie przeglądarki. 

Mimo tego gorąco zachęcamy do budowania układów w rzeczywistości. Praca z fizycznym sprzętem daje najwięcej satysfakcji i najwięcej uczy.

---

## Narzędzie fizyczne: Arduino IDE 2.x

Do pracy z rzeczywistym mikrokontrolerem będziemy korzystać z najpopularniejszego środowiska dla hobbystów – **Arduino IDE** w wersji 2.x. Środowisko to automatycznie kompiluje Twój kod (napisany w języku C/C++) do postaci kodu maszynowego i przesyła go za pośrednictwem portu USB do pamięci Flash mikrokontrolera.

### Krok 1: Instalacja programu

1. Wejdź na oficjalną stronę: 🔗 [arduino.cc/en/software](https://www.arduino.cc/en/software)
2. Pobierz wersję instalacyjną dla swojego systemu operacyjnego (np. Windows Installer) i przejdź standardowy proces instalacji.


Domyślnie środowisko Arduino IDE obsługuje jedynie oficjalne płytki z rodziny Arduino (np. Uno, Nano). Aby umożliwić programowanie układów firmy Espressif (w tym ESP32-C6), należy zainstalować odpowiedni pakiet obsługi:

1. Otwórz Arduino IDE i wejdź w **Plik → Preferencje** (lub wciśnij skrót `Ctrl + ,`).
2. Znajdź pole **Dodatkowe adresy URL menedżera płytek**.
3. Wklej poniższy adres URL (odpowiadający za pobranie definicji płytek przez menedżer):
   ```text
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
   *Uwaga: Jeśli masz już tam wpisane inne linki, rozdziel je przecinkiem lub dodaj w nowej linii klikając ikonę okna obok pola tekstowego.*
4. Kliknij **OK**, aby zatwierdzić zmiany.
5. Z lewego paska bocznego wybierz ikonę **Menedżer płytek** (lub przejdź do menu: *Narzędzia → Płytka → Menedżer płytek...*).
6. Wyszukaj pakiet o nazwie **`esp32`** (autorstwa *Espressif Systems*) i kliknij przycisk **Instaluj**. Instalacja łańcucha narzędziowego i definicji może potrwać kilka minut.

### Krok 3: Wybór płytki i portu komunikacyjnego

1. Podłącz swoją płytkę ESP32-C6 do komputera za pomocą kabla USB-C. Kabel należy podłączyć do portu oznaczonego na płytce deweloperskiej jako **`USB`**.
2. Upewnij się, że używany przewód obsługuje transmisję danych (niektóre przewody przeznaczone wyłącznie do ładowania nie posiadają linii sygnałowych).
3. W Arduino IDE wejdź w menu **Narzędzia → Płytka → esp32** i wybierz **`ESP32-C6 Dev Module`**.
![Zdjęcie okna wyboru płytki w Arduino IDE](../img/start/arduinio_ide_wybor_plytki.png)
4. Wejdź w **Narzędzia → Port** i wybierz port, pod którym zgłosiła się Twoja płytka (na Windowsie będzie to np. `COM3` lub `COM4`, na Linuxie np. `/dev/ttyACM0` lub `/dev/ttyUSB0`, na macOS np. `/dev/cu.usbmodem...`).

> [!IMPORTANT] Ważne dla użytkowników systemu Linux: Brak dostępu do portu
> W systemach Linux domyślny użytkownik nie ma uprawnień do zapisu i odczytu z portów szeregowych (takich jak `/dev/ttyACM0` lub `/dev/ttyUSB0`). Uruchomienie Arduino IDE w takiej konfiguracji uniemożliwi wgranie programu i zakończy się błędem braku uprawnień (Permission Denied).
> 
> Aby nadać uprawnienia na stałe, dodaj swojego użytkownika do grupy systemowej `dialout` (w dystrybucjach typu Ubuntu/Debian) lub `uucp` (w dystrybucjach typu Arch). Otwórz terminal i wpisz:
> ```bash
> sudo usermod -a -G dialout $USER
> ```
> Po wykonaniu tej komendy **musisz wylogować się i zalogować ponownie** (lub zrestartować komputer), aby system zaczął respektować Twoje nowe uprawnienia.

---

## ⚠️ Kluczowe ustawienie: USB CDC On Boot

Układ ESP32-C6 posiada wbudowany kontroler USB-JTAG/Serial. Aby Monitor Szeregowy w Arduino IDE mógł odbierać komunikaty wysyłane za pomocą instrukcji `Serial.println()`, konieczne jest włączenie odpowiedniej opcji przekierowania portu szeregowego na port USB.

> [!IMPORTANT] Aktywacja CDC
> W menu Narzędzia odszukaj pozycję **`USB CDC On Boot`** i ustaw jej wartość na **`Enabled`**.
> Bez tego ustawienia program wgra się poprawnie, ale w Monitorze Szeregowym nie zobaczysz żadnych napisów!

```
[PLACEHOLDER: Tutaj wstaw zrzut ekranu przedstawiający opcję Narzędzia -> USB CDC On Boot -> Enabled w Arduino IDE]
```

---

## Pierwsze uruchomienie programu (Test)

Sprawdźmy, czy cały łańcuch narzędziowy działa poprawnie. Spróbujemy wgrać prosty szkic testowy i otworzyć komunikację szeregową. Na razie nie przejmuj się tym, jak ten kod działa ani co oznaczają poszczególne linijki – zrozumiesz to w dalszej części kursu. Na tym etapie chcemy jedynie upewnić się, że program wgrywa się poprawnie do pamięci mikrokontrolera, a połączenie szeregowe działa bez zarzutu.

1. Wklej poniższy kod testowy do okna edytora:
   ```cpp
   void setup() {
     // Uruchamiamy port szeregowy z prędkością 115200 bodów (standard dla ESP32)
     Serial.begin(115200);
     delay(1000); // Czas na ustabilizowanie połączenia
     Serial.println("Środowisko Arduino IDE działa poprawnie!");
   }

   void loop() {
     Serial.println("ESP32-C6 żyje i nadaje...");
     delay(2000); // Wyślij komunikat co 2 sekundy
   }
   ```
2. Kliknij ikonę **Strzałki w prawo (Wgraj)** w lewym górnym rogu (lub użyj skrótu `Ctrl + U`).
![Zdjęcie okna z kodem w Arduino IDE](../img/start/arduinio_ide_kod.png)
3. Poczekaj, aż w dolnej konsoli zobaczysz napisy informujące o kompilacji i procesie wgrywania (zakończonym komunikatem typu *Leaving... Hard resetting via RTS pin...*).
4. Otwórz **Monitor Szeregowy** (ikona lupy w prawym górnym rogu lub skrót `Ctrl + Shift + M`).
![Zdjęcie okna Monitora Szeregowego w Arduino IDE](../img/start/arduinio_ide_monitor.png)
5. Upewnij się, że w prawym dolnym rogu okna Monitora wybrana jest poprawna prędkość transmisji: **`115200 baud`**.
6. Jeśli widzisz pojawiające się napisy "ESP32-C6 żyje i nadaje..." – Twoje środowisko jest gotowe do pracy!
![Zdjęcie okna Monitora Szeregowego w Arduino IDE](../img/start/arduinio_ide_monitor.png)

Jeśli cokolwiek poszło nie tak, spróbuj rozwiązań opisanych poniżej.

---

## Rozwiązywanie problemów (Troubleshooting)

### 1. Brak portu COM / Serial w menu Narzędzia → Port

* **Przyczyna 1**: Twój kabel USB służy tylko do ładowania telefonu i nie przesyła danych. Wymień kabel na inny.
* **Przyczyna 2**: Brak sterowników do konwertera USB-Serial na płytce. W zależności od wersji płytki deweloperskiej, zainstaluj sterowniki do układów **CH340** lub **CP2102** (dostępne na stronach producentów tych układów).
* **Przyczyna 3 (Linux)**: Twój użytkownik nie ma uprawnień do odczytu urządzenia. Upewnij się, że wykonałeś krok z dodaniem użytkownika do grupy `dialout` i ponownie uruchomiłeś sesję systemową.

### 2. Kompilator zgłasza błąd podczas wgrywania (Timeout / Failed to connect)

* **Rozwiązanie**: Czasami automatyczny reset płytki w tryb programowania zawodzi. Możesz go wymusić ręcznie:
  1. Kliknij przycisk **Wgraj** w Arduino IDE.
  2. Gdy w konsoli pojawi się linijka zaczynająca się od `Connecting...`, **wciśnij i przytrzymaj** przycisk **`BOOT`** na fizycznej płytce ESP32.
  3. W czasie trzymania przycisku BOOT, kliknij raz krótko przycisk **`RST` (Reset)**.
  4. Puść przycisk BOOT. Płytka powinna natychmiast połączyć się i rozpocząć wgrywanie. Kolejne wgrania powinny odbywać się już automatycznie bez tej procedury.
