# Ćwiczenie 15 – Bluetooth Low Energy (BLE)

**Potrzebujesz:** 📱 Smartfon z aplikacją **nRF Connect for Mobile** (bezpłatna, Android i iOS).

**Bluetooth Low Energy (BLE)** to standard komunikacji bezprzewodowej zoptymalizowany pod kątem minimalnego poboru energii. Urządzenia BLE przesyłają krótkie pakiety i natychmiast wracają do uśpienia – mogą działać latami na małej baterii.

---

## Architektura GATT

Komunikacja BLE opiera się na profilu **GATT** (*Generic Attribute Profile*):

- **Serwer** – nasza płytka ESP32-C6 – udostępnia dane i usługi
- **Klient** – smartfon z nRF Connect – odczytuje dane lub wysyła komendy

Struktura serwera:
```
Serwer BLE
└── Usługa (Service) [UUID]
    ├── Charakterystyka (Characteristic) [UUID]
    │   ├── Właściwość: READ / WRITE / NOTIFY
    │   └── Deskryptor CCCD (0x2902) – do subskrypcji Notify
    └── Kolejna Charakterystyka...
```

**UUID** (*Universally Unique Identifier*) to unikalny 128-bitowy identyfikator usługi lub charakterystyki. Możesz wygenerować własne na [uuidgenerator.net](https://www.uuidgenerator.net/).

---

## Ćwiczenie 15a: Sterowanie LED ze smartfona (BLE Write)

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

const int PIN_LED = 2;

// ZMIEŃ kilka znaków UUID aby uniknąć konfliktów w sali
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "e322b14e-5100-4b2e-b611-6677945d8b6c"

class ObslugaZapisu : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pChar) {
    String wartosc = pChar->getValue();
    if (wartosc.length() > 0) {
      Serial.printf("Odebrano BLE (HEX): %02X\n", (uint8_t)wartosc[0]);
      // Bajt 0x01 → włącz, 0x00 → wyłącz
      if (wartosc[0] == 1)      digitalWrite(PIN_LED, HIGH);
      else if (wartosc[0] == 0) digitalWrite(PIN_LED, LOW);
    }
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // ZMIEŃ nazwę aby odróżnić swoją płytkę od innych w sali!
  BLEDevice::init("ESP32_BLE_Unikalna");

  BLEServer  *pServer  = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic *pChar = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pChar->setCallbacks(new ObslugaZapisu());

  pService->start();
  BLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  BLEDevice::startAdvertising();

  Serial.println("Serwer BLE gotowy! Otwórz nRF Connect.");
}

void loop() {
  delay(2000);
}
```

### Jak testować?
1. Otwórz **nRF Connect** → Scan → znajdź `ESP32_BLE_Unikalna` → **CONNECT**
2. Rozwiń usługę `4fafc201-...`
3. Przy charakterystyce kliknij ikonę **strzałki w górę** (Write)
4. Typ: **BYTE**, wartość `01` → dioda się zapala; `00` → gaśnie

![Aplikacja nRF Connect](../img/bezprzewodowe/nrfApp.png){ width="250px" .center }

> [!TIP] Filtrowanie urządzeń
> W polu Search wpisz nazwę swojej płytki (`ESP32_BLE_Unikalna`) aby odfiltrować listę spośród wszystkich urządzeń BLE w okolicy.

**Zadanie:** Zmień logikę `onWrite` tak, aby bajt `0x02` włączał drugą diodę (GPIO3), a `0x03` gasił obie.

---

## Ćwiczenie 15b: Przesyłanie danych do smartfona (BLE Notify)

W poprzednim ćwiczeniu smartfon wysyłał komendy do płytki. Teraz odwrócimy kierunek: płytka **samoczynnie** informuje smartfon o nowych pomiarach.

Właściwość **Notify** wymaga od klienta subskrypcji – technicznie realizowanej przez deskryptor **CCCD (BLE2902)**.

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>  // Deskryptor dla Notify

const int PIN_POT = 4;

#define SERVICE_UUID_N        "18a55060-705d-4ab0-9b4e-86e0c0903330"
#define CHARACTERISTIC_UUID_N "29f37c35-1521-419b-abf7-2d4dfa666e10"

BLEServer*         pServer  = NULL;
BLECharacteristic* pCharN   = NULL;
bool urzadzeniePolaczone     = false;

class ObslugaSerwera : public BLEServerCallbacks {
  void onConnect(BLEServer* s)    { urzadzeniePolaczone = true;  Serial.println("Smartfon połączony!"); }
  void onDisconnect(BLEServer* s) { urzadzeniePolaczone = false; BLEDevice::startAdvertising(); Serial.println("Rozłączono – wznawiam rozgłaszanie..."); }
};

void setup() {
  Serial.begin(115200);

  BLEDevice::init("ESP32_Potencjometr_BLE");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ObslugaSerwera());

  BLEService *pService = pServer->createService(SERVICE_UUID_N);

  pCharN = pService->createCharacteristic(
    CHARACTERISTIC_UUID_N,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharN->addDescriptor(new BLE2902()); // Wymagane dla Notify!

  pService->start();
  BLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID_N);
  BLEDevice::startAdvertising();

  Serial.println("Serwer Notify gotowy!");
}

void loop() {
  if (urzadzeniePolaczone) {
    int odczyt = analogRead(PIN_POT);
    String wartosc = String(odczyt);

    pCharN->setValue(wartosc.c_str());
    pCharN->notify(); // Wyślij powiadomienie do smartfona

    Serial.println("Notify: " + wartosc);
  }
  delay(500);
}
```

### Jak testować?
1. Połącz się z `ESP32_Potencjometr_BLE` w nRF Connect.
2. Przy charakterystyce `29f37c35-...` kliknij ikonę **strzałek w dół** (Subscribe/Notify).
3. Kręć potencjometrem – wartości aktualizują się na żywo!

![Powiadomienia BLE w nRF Connect](../img/bezprzewodowe/nrfNotify.png){ width="250px" .center }

**Zadanie:** Zoptymalizuj kod – wysyłaj powiadomienie tylko gdy odczyt zmienił się o więcej niż 50 jednostek względem poprzedniego. Zmniejszy to zbędny ruch radiowy.

> [!NOTE] BLE i standardy GATT
> Organizacja *Bluetooth SIG* definiuje standardowe UUID dla popularnych usług: poziom baterii (`0x180F`), tętno (`0x180D`) itd. Dzięki temu smartfon automatycznie rozumie dane ze słuchawek BLE bez specjalnej aplikacji. Pełna lista: [bluetooth.com – Assigned Numbers](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/Assigned_Numbers.pdf)
