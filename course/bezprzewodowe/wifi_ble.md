# Łączność: Wi-Fi oraz Bluetooth Low Energy (BLE)

**Potrzebujesz:** 📱 Smartfon lub laptop z Wi-Fi (do połączenia z serwerem), hotspot (do podłączania ESP do internetu) oraz aplikację **nRF Connect for Mobile** (bezpłatna, Android/iOS) do testów Bluetooth.

Doszliśmy do momentu zderzenia się z globalną siecią. ESP32-C6 nie musi zamykać się w hermetycznym, małym środowisku dwóch płytek. Może otworzyć na zewnątrz stronę WWW ułatwiającą użytkownikowi sterowanie z poziomu wygodnego interfejsu przeglądarki, lub pobrać publiczne dane z serwisów informacyjnych.
Może też skomunikować się ze smartfonem lokalnie, tak samo jak komunikują się inteligentne zegarki i opaski sportowe.

---

## Ćwiczenie 14a: Wi-Fi Access Point (Własny Serwer WWW)

ESP32 potrafi działać nie tylko jako klient domowego routera (tryb Station: `WIFI_STA`), ale również potrafi "wykreować" własną, małą, wirtualną sieć Wi-Fi, zupełnie jak prawdziwy router (tryb Access Point: `WIFI_AP`)!
Pozwoli Ci to zaprogramować przenośny gadżet, do którego zawsze podepniesz się na wyjazdach.

Otworzymy stronę WWW, za pomocą której pokierujemy fizycznymi diodami podpiętymi do płytki. Użyjemy w tym celu również nowoczesnego formatowania **mDNS**, by nie wpisywać do paska adresu URL surowych i nudnych liczb (jak `192.168.4.1`), lecz ładny adres tekstowy z końcówką `.local`.

> [!WARNING] mDNS a smartfony!
> Android domyślnie bardzo słabo radzi sobie z formatowaniem adresów mDNS bez zewnętrznych programów. Najlepiej testuj adresy `.local` na laptopie podłączonym pod sieć ESP, lub po stronie Androida używaj po prostu wyświetlonego w Monitorze Szeregowym numeru IP!

### Kod własnej sieci sterującej

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

const int PIN_LED = 2;

// ZMIEŃ nazwę sieci – musi być unikalna w sali!
const char* nazwaSieci = "ESP32_Sterowanie_Bartek";
const char* hasloSieci = "12345678"; // Min. 8 znaków

// Uruchamiamy obiekt serwera na standardowym porcie WWW: 80
WebServer server(80);

// Budujemy stronę za pomocą HTML - używamy R"rawliteral by pisac w wielu linijkach jako tekst
const char STRONA_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background:#1e1e2f; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px; }
    button { background:#ff6b6b; padding:15px; font-size:18px; cursor:pointer; width:80%; margin:10px; }
  </style>
</head>
<body>
    <h2>Sterowanie ESP32</h2>
    <!-- Klikniecie guzika rzuca uzytkownika do ścieżki /on i /off na serwerze! -->
    <button onclick="location.href='/on'">Włącz LED</button>
    <button onclick="location.href='/off'">Wyłącz LED</button>
</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  // Budujemy siec:
  WiFi.softAP(nazwaSieci, hasloSieci);
  Serial.print("Sieć: "); Serial.println(nazwaSieci);
  Serial.print("IP: "); Serial.println(WiFi.softAPIP());

  // Proba postawienia domeny mDNS
  if (MDNS.begin("moje_esp")) {
    Serial.println("Wejdz na laptopie pod adres: http://moje_esp.local");
  }

  // REJESTROWANIE AKCJI NA ŚCIEŻKACH:
  
  // Jesli uzytkownik wejdzie na gołą domene (np 192.168.4.1/), wyrzuc mu jako tekst paczke HTML
  server.on("/", []() { 
      server.send(200, "text/html", STRONA_HTML); 
  });

  // Jesli guzik rzuci go na /on, zaswiec diode i przekieruj go z powrotem na gola strone!
  server.on("/on", []() {
    digitalWrite(PIN_LED, HIGH);
    server.sendHeader("Location", "/");
    server.send(303);
  });

  server.on("/off", []() {
    digitalWrite(PIN_LED, LOW);
    server.sendHeader("Location", "/");
    server.send(303);
  });

  server.begin();
}

void loop() {
  // Rozpatruj zadania klientow z wifi w pętli
  server.handleClient();
}
```

---

## Ćwiczenie 14b: Wi-Fi REST API (Klient Internetu)

Zamiast budować sieć, spróbujmy tym razem połączyć się z siecią np. wykreowaną przez HotSpot z Twojego telefonu, wejść w pełni do Internetu, zapytać po cichu serwery światowe o pewien zasób z wykorzystaniem API i przeanalizować odpowiedź, która w środowisku chmurowym zazwyczaj leci zakodowana pod tzw. językiem znaczników **JSON**.

### JSON i parsowanie
API przeważnie odpowiadają takim ustrukturyzowanym formatem tekstowym. Na przykład dla "faktu ze swiata" bedzie on wygladał tak:
```json
{
  "text": "Miód to jedyne jedzenie które się nie psuje.",
  "language": "en"
}
```
Mikrokontroler nie wie czym są te nawiasy. Musimy go nauczyć to czytać. Używamy w Arduino niezwykle znanej i szanowanej biblioteki: **ArduinoJson**.

### Kod pobierania faktów z darmowego światowego API

```cpp
#include <WiFi.h>
#include <HTTPClient.h> // biblioteka udająca przegladarke internetowa (wysylanie zadan GET)
#include <ArduinoJson.h>

const char* ssid     = "Nazwa_Hotspotu_Telefonu";
const char* password = "Haslo_Hotspotu";

// Uderzamy pod ten darmowy adres generujacy fakty ze swiata:
const char* urlAPI = "https://uselessfacts.jsph.pl/api/v2/facts/random";

void setup() {
  Serial.begin(115200);
  
  // Tym razem jestesmy STACJĄ!
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Łączenie z HotSpotem");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); 
    Serial.print(".");
  }
  Serial.println(" Połączono!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
      
    // Konfiguracja przegladarki w ESP
    HTTPClient http;
    http.begin(urlAPI);
    
    // Żądanie wejscia (GET) i odebranie numeru kodu bledu (np. slynnne Error 404, albo 200 - Wszystko OK)
    int kod_wyniku = http.GET();

    if (kod_wyniku == HTTP_CODE_OK) { // HTTP_CODE_OK w bibliotece to prostu ładniej nazwana liczba 200
        
      String czysty_tekst_odpowiedzi = http.getString();
      
      // Tworzymy pamiec na jsona i pakujemy do niego rozkodowany tekst w strukturze JSON (deserialize)
      JsonDocument doc;
      if (deserializeJson(doc, czysty_tekst_odpowiedzi) == DeserializationError::Ok) {
          
        Serial.println("========================================");
        
        // wyciagamy po identyfikatorze pola "text" to na czym nam zalezalo:
        Serial.print("Dzisiejszy bezuzyteczny fakt: ");
        Serial.println(doc["text"].as<String>());
        
        Serial.println("========================================");
      }
    } else {
      Serial.print("O nie, API odpowiedzialo bledem! Kod bledu: ");
      Serial.println(kod_wyniku);
    }
    http.end();
  }
  
  delay(10000); // Odczekajmy dluzej zanim znów "zaspamujemy" komus serwer!
}
```

---

## Ćwiczenie 15: Bluetooth Low Energy (BLE)

Jeżeli Twój sprzęt nie wymaga globalnego dostępu ani gigantycznego transferu do wysyłania filmów, odpalanie prądożernego modemu Wi-Fi jest pomyłką!
Do odczytywania danych z opasek, hulajnóg i szczoteczek sonicznych stworzono energooszczędny **BLE**.

Urządzenia BLE opierają się na profilu zwanym **GATT**:

- Posiadają **Usługi (Service)** o danym numerze identyfikacyjnym UUID.
- Wewnątrz Usług posiadają **Charakterystyki (Characteristic)**. Jedna służy pod komendę "Write" i nasłuchuje czy smartfon nie każe jej ustawić silnika hulajnogi na dany bieg, inna zaś posiada komende "Notify" – rzucając na żywo do Twojego smartfona na jakich obrotach pracuje silnik hulajnogi!

Aplikacja **nRF Connect** świetnie obrazuje tę hierarchiczną budowę Usługa -> Charakterystyka.

### Kod BLE ze zjawiskiem NOTIFY
Odwróćmy role z zadania z WWW! Zamiast kazać użytkownikowi uderzać palcem w przyciski i "odpytywać" serwer o status, zrobimy system, gdzie to serwer ESP przy użyciu cechy **Notify** krzyczy sam z siebie prosto w głośnik smartfona, informując o gwałtownych zmianach pomiarów.

Użyjemy wewnątrz kodu biblioteki do deskryptora `BLE2902`, koniecznego do aktywacji asynchronicznego Notify!

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>  // Deskryptor dla Notify

const int PIN_POT = 4;

// UUID to autorskie dlugie identyfikatory. Mozna je wygenerowac na stronie uuidgenerator.net
#define SERVICE_UUID        "18a55060-705d-4ab0-9b4e-86e0c0903330"
#define CHAR_NOTIFY_UUID    "29f37c35-1521-419b-abf7-2d4dfa666e10"

BLEServer*         pServer  = NULL;
BLECharacteristic* pChar    = NULL;
bool urzadzeniePolaczone    = false;

// Obiekty typu Callback reagujące na rozłączanie/łączność
class MojeWyzwalacze : public BLEServerCallbacks {
  void onConnect(BLEServer* s)    { 
      urzadzeniePolaczone = true;  
      Serial.println("Smartfon połączony!"); 
  }
  void onDisconnect(BLEServer* s) { 
      urzadzeniePolaczone = false; 
      BLEDevice::startAdvertising(); // Wznow rozglaszanie by dalo sie znalezc znowu!
      Serial.println("Rozłączono – wznawiam rozgłaszanie..."); 
  }
};

void setup() {
  Serial.begin(115200);

  // Nazwa wyswietlajaca sie na smartfonie:
  BLEDevice::init("Moje Pierwsze BLE");
  
  // Stawiamy Serwer i doklejamy mu reakcje na wpadniecie/wypadniecie uzytkownika:
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MojeWyzwalacze());

  // Robimy Usługę o nadanym UUID:
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Robimy Charakterystyke z dopiskiem READ i NOTIFY:
  pChar = pService->createCharacteristic(
    CHAR_NOTIFY_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  
  pChar->addDescriptor(new BLE2902()); // Dodatek konf. dla Notify!

  pService->start();
  BLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  BLEDevice::startAdvertising();

  Serial.println("Zeskanuj eter! Serwer BLE na orbicie.");
}

void loop() {
  // Wysylamy paczke danych tylko gdy jakis glupi smartfon z nRF sie z nami polaczyl:
  if (urzadzeniePolaczone == true) {
      
    int odczyt = analogRead(PIN_POT);
    String tekst_do_wyslania = "Aktualnie obrót " + String(odczyt);

    // pakujemy tekst w cechę charakt.:
    pChar->setValue(tekst_do_wyslania.c_str());
    
    // WYSTRZELENIE NOTIFY DO SMARTFONA!:
    pChar->notify(); 

    Serial.println("Wyslalem notyfikacje: " + tekst_do_wyslania);
  }
  
  delay(500);
}
```

### Odbiór w nRF Connect:

- Znajdź swoje urządzenie na liście skanowania i się z nim połącz.
- Otwórz drzewko jego Usługi "18a55060..."
- Naciśnij ikonę potrójnych Strzałeczek (ikona powiadomienia subskrypcyjnego). Aplikacja powinna zacząć co sekundę ładować od strony serwera świeże wiadomości odczytane w systemie UTF!

### Zadanie trudne na koniec modułu (Test Inżynierski!)
Połącz zdobytą tu wiedzę z wiedzą modułu FreeRTOS z Modułu Systemów! Przekształć pętle obsługującą zjawisko `notify()` na pełnoprawny dedykowany `Task` w RTOS'ie i wymieniaj dane pobierane na dedykowanym Tasku Analizującym do Taska Wysyłającego z wykorzystaniem Kolejek. Niesamowite osiągnięcie, jeśli dasz radę stworzyć tak wysoce niezależny obwód! Powodzenia!
