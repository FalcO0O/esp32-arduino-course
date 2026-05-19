# Instalacja Arduino IDE

Zanim wgrasz swój pierwszy program, musisz zainstalować środowisko programistyczne i skonfigurować je pod układ ESP32-C6.

---

## Krok 1: Pobierz Arduino IDE 2

Pobierz i zainstaluj **Arduino IDE w wersji 2.x** (nie 1.x – stara wersja ma ograniczone wsparcie dla ESP32).

🔗 **[Pobierz Arduino IDE 2 – arduino.cc/en/software](https://www.arduino.cc/en/software)**

Wybierz wersję dla swojego systemu operacyjnego (Windows / macOS / Linux) i uruchom instalator.

---

## Krok 2: Dodaj obsługę płytek ESP32

Arduino IDE domyślnie obsługuje tylko oryginalne płytki Arduino. Aby dodać wsparcie dla ESP32, musimy dodać dodatkowe źródło płytek.

1. Otwórz Arduino IDE.
2. Przejdź do **Plik → Preferencje** (lub `Ctrl + ,`).
3. W polu **„Dodatkowe adresy URL menedżera płytek"** wpisz:

```
https://espressif.github.io/arduino-esp32/package_esp32_index.json
```

4. Kliknij **OK**.
5. Przejdź do **Narzędzia → Płytka → Menedżer płytek…**
6. Wyszukaj `esp32` i zainstaluj pakiet **„esp32" by Espressif Systems** (wersja 3.x lub nowsza).

> [!NOTE] Czas instalacji
> Instalacja pakietu esp32 może potrwać kilka minut – pobiera kompilator i biblioteki (ok. 300 MB).

---

## Krok 3: Wybierz płytkę ESP32-C6

1. Podłącz płytkę ESP32-C6 kablem USB-C do komputera.
2. W Arduino IDE przejdź do **Narzędzia → Płytka → esp32 → ESP32-C6 Dev Module**.
3. Przejdź do **Narzędzia → Port** i wybierz port COM, na którym wykryto płytkę.
   - Windows: `COM3`, `COM4` lub podobny
   - macOS/Linux: `/dev/ttyUSB0` lub `/dev/ttyACM0`

> [!IMPORTANT] Włącz USB CDC On Boot
> W menu **Narzędzia** odszukaj opcję **USB CDC On Boot** i ustaw ją na **Enabled**.
>
> ![Włączenie opcji USB CDC On Boot](../img/podstawy/cnc_enable.png)
>
> Bez tej opcji instrukcja `Serial.println()` nie wyświetli niczego w Monitorze Szeregowym!

---

## Krok 4: Pierwsze wgranie – test połączenia

Aby sprawdzić czy wszystko działa, wgraj przykładowy program:

1. Przejdź do **Plik → Przykłady → 01.Basics → Blink**.
2. Kliknij przycisk **Wgraj** (strzałka w prawo) lub użyj skrótu `Ctrl + U`.
3. Poczekaj na komunikat `"Wgrywanie zakończone"` w dolnym pasku.

Jeśli wbudowana dioda na płytce zaczęła migać – środowisko działa poprawnie!

> [!TIP] Nie widzisz portu COM?
> Jeśli port nie pojawia się na liście:
> - Spróbuj innego kabla USB (niektóre kable są tylko do ładowania, bez transmisji danych).
> - Zainstaluj sterowniki USB: dla chipów **CP2102** → [silabs.com/developers/usb-to-uart-bridge-vcp-drivers](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers), dla **CH340** → wyszukaj „CH340 driver".
> - Naciśnij i przytrzymaj przycisk **BOOT** na płytce, następnie kliknij **RESET** – to wejście w tryb ładowania.

---

## Krok 5: Zainstaluj biblioteki

W trakcie kursu będziesz potrzebować kilku dodatkowych bibliotek. Możesz je zainstalować z góry lub na bieżąco.

Przejdź do **Szkic → Dołącz bibliotekę → Zarządzaj bibliotekami…** i zainstaluj:

| Biblioteka | Autor | Moduł |
|:---|:---|:---|
| `MPU6050_light` | rfetick | Protokoły – Ćw. 7 |
| `Adafruit SSD1306` | Adafruit | Protokoły – Ćw. 9 |
| `Adafruit GFX Library` | Adafruit | Protokoły – Ćw. 9 |
| `ArduinoJson` | Benoit Blanchon | Bezprzewodowe – Ćw. 14 |

> [!NOTE] Biblioteki ESP-NOW i BLE
> Biblioteki `esp_now.h`, `WiFi.h`, `BLEDevice.h` i inne bezprzewodowe są wbudowane w pakiet esp32 – nie musisz ich osobno instalować.

---

## Jesteś gotowy!

Twoje środowisko jest skonfigurowane. Możesz przejść do pierwszego ćwiczenia:

👉 [Ćw. 1 – Serial: Hello World](../podstawy/serial.md)
