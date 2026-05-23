# Bluetooth Low Energy (BLE)

Bluetooth Low Energy (BLE) został zaprojektowany z myślą o minimalnym zużyciu energii. W przeciwieństwie do klasycznego Bluetooth, BLE przesyła dane w krótkich, rzadkich pakietach, co pozwala urządzeniom IoT pracować na baterii guzikowej przez wiele miesięcy lub lat.

---

## 🏛️ Stos protokołów BLE

Architektura BLE dzieli się na trzy główne poziomy (warstwy), z których każdy pełni określoną rolę w komunikacji:

- **Controller (Kontroler):** Warstwa sprzętowa i niskopoziomowa, realizowana zazwyczaj bezpośrednio przez układ radiowy:
  - **PHY (Warstwa fizyczna):** Odpowiada za nadawanie fal radiowych GFKS w paśmie 2.4 GHz podzielonym na 40 kanałów.
  - **LL (Link Layer - Warstwa łącza):** Zarządza stanami radiowymi urządzenia (rozgłaszanie - *advertising*, skanowanie, inicjowanie i utrzymywanie połączenia) oraz określa role urządzeń (*Central / Peripheral*).
- **Host:** Warstwa logiczna pośrednicząca między sprzętem a aplikacją:
  - **L2CAP:** Odpowiada za multipleksację danych i ich podział na pakiety o odpowiednim rozmiarze (MTU).
  - **GAP (Generic Access Profile):** Definiuje widoczność urządzenia w eterze, zarządza procesem parowania i określa rolę urządzenia przed nawiązaniem połączenia.
  - **ATT (Attribute Protocol):** Protokół wymiany prostych atrybutów danych. Przypisuje każdemu punktowi danych unikalny uchwyt (Handle) oraz identyfikator UUID.
  - **GATT (Generic Attribute Profile):** Narzuca hierarchiczną strukturę danych na warstwę ATT, umożliwiając organizowanie danych w Usługi i Charakterystyki.
  - **SMP (Security Manager Protocol):** Odpowiada za bezpieczeństwo, generowanie kluczy szyfrujących oraz autoryzację.
- **Application (Aplikacja):** Kod użytkownika w środowisku Arduino, który definiuje logiczne zachowanie urządzenia, reaguje na połączenia, aktualizuje dane w charakterystykach i reaguje na zapisy ze strony klienta.

---

## 📊 Hierarchia danych GATT

Profil GATT organizuje dane w hierarchiczną strukturę, która ułatwia ich odczyt i interpretację przez urządzenia klienckie (np. smartfon):

- **Profil (Profile):** Zbiór usług definiujący całe przeznaczenie urządzenia (np. Profil Pulsometru).
- **Usługa (Service):** Logiczna grupa powiązanych danych (np. Usługa pomiaru tętna). Każda usługa posiada swój unikalny, 128-bitowy lub 16-bitowy identyfikator **UUID**.
- **Charakterystyka (Characteristic):** Konkretna wartość (np. aktualna wartość pulsu w uderzeniach na minutę). Charakterystyka zawiera:
  - **Value (Wartość):** Same dane (np. tablica bajtów).
  - **Properties (Właściwości):** Uprawnienia dostępu, takie jak *Read* (odczyt), *Write* (zapis), *Notify* (asynchroniczne powiadomienie bez potwierdzenia) lub *Indicate* (potwierdzane powiadomienie).
- **Deskryptor (Descriptor):** Opcjonalne dodatkowe informacje opisujące charakterystykę (np. jednostka miary). Kluczowym deskryptorem jest **CCCD** (*Client Characteristic Configuration Descriptor*), który w kodzie Arduino jest reprezentowany przez klasę `BLE2902`. Pozwala on smartfonowi na włączenie lub wyłączenie subskrypcji powiadomień *Notify*.

---

## Ćwiczenie 1: Sterowanie LED ze smartfona (BLE Write)

W tym ćwiczeniu smartfon (klient) będzie wysyłał komendy sterujące do naszej płytki (serwer). Zaimportujemy klasę callbacku obsługi zapisu, która będzie odbierać pakiety danych i reagować na nie w czasie rzeczywistym.

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

> [!TIP] Filtrowanie urządzeń
> W polu Search wpisz nazwę swojej płytki (`ESP32_BLE_Unikalna`) aby odfiltrować listę spośród wszystkich urządzeń BLE w okolicy.

**Zadanie:** Zmień logikę `onWrite` tak, aby bajt `0x02` włączał drugą diodę (GPIO3), a `0x03` gasił obie.

---

## Ćwiczenie 2: Przesyłanie danych do smartfona (BLE Notify)

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

**Zadanie:** Zoptymalizuj kod – wysyłaj powiadomienie tylko gdy odczyt zmienił się o więcej niż 50 jednostek względem poprzedniego pomiaru. Zmniejszy to zbędny ruch radiowy.

> [!NOTE] BLE i standardy GATT
> Organizacja *Bluetooth SIG* definiuje standardowe UUID dla popularnych usług: poziom baterii (`0x180F`), tętno (`0x180D`) itd. Dzięki temu smartfon automatycznie rozumie dane ze słuchawek BLE bez specjalnej aplikacji. Pełna lista: [bluetooth.com – Assigned Numbers](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Assigned_Numbers/out/en/Assigned_Numbers.pdf)

---

