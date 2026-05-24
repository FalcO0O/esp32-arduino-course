# Wi-Fi: Serwer i Klient

Układ ESP32-C6 umożliwia komunikację z siecią lokalną oraz globalną siecią Internet. Może działać jako serwer prezentujący dane w przeglądarce użytkownika lub jako klient pobierający informacje z chmury.

---

## 🌐 Stos sieciowy Wi-Fi w ESP32

Komunikacja Wi-Fi opiera się na warstwowej strukturze (stosie sieciowym):

- **Warstwa fizyczna (PHY/RF):** Odpowiada za modulację sygnału radiowego w pasmie 2.4 GHz, moc nadawania, odbiór fal antenowych oraz wybór fizycznego kanału radiowego (częstotliwości).
- **Warstwa łącza danych (MAC / 802.11):** Odpowiada za strukturę ramek 802.11, kontrolę dostępu do medium radiowego, uwierzytelnianie oraz szyfrowanie (np. WPA2/WPA3). Wykorzystuje unikalny adres fizyczny MAC urządzenia.
- **Warstwa sieciowa i transportowa (TCP/IP - lwIP):** ESP32 wykorzystuje lekki i zoptymalizowany stos **lwIP** (*Lightweight IP*). Odpowiada on za przydzielanie adresów IP (DHCP), routing, rozwiązywanie nazw domen (DNS) oraz przesyłanie pakietów przez protokoły TCP i UDP.
- **Warstwa aplikacji:** Kod użytkownika oraz biblioteki Arduino (np. `<WebServer.h>`, `<HTTPClient.h>`), które przetwarzają żądania HTTP, serwują pliki HTML lub wysyłają zapytania do zewnętrznych serwerów.

---

## 📶 Tryby pracy Wi-Fi

Układ ESP32-C6 może obsługiwać połączenie bezprzewodowe na trzy sposoby:

- **Station (Tryb stacji - `WIFI_STA`):** Mikrokontroler działa jako klient podłączający się do istniejącej sieci Wi-Fi (np. domowego routera lub hotspotu w telefonie). Pozwala to na pobieranie danych z Internetu lub komunikację w sieci lokalnej.
- **Access Point (Punkt dostępowy - `WIFI_AP`):** ESP32 tworzy własną, lokalną sieć Wi-Fi o nazwie (SSID) i haśle, które zdefiniujesz. Inne urządzenia (np. telefon lub laptop) mogą połączyć się z płytką bezpośrednio, bez udziału zewnętrznego routera. Domyślny adres IP to wtedy `192.168.4.1`.
- **Tryb dualny (AP + STA - `WIFI_AP_STA`):** Płytka łączy się z routerem zewnętrznym i jednocześnie rozgłasza własną sieć AP. Fizyczny układ radiowy (transceiver) dzieli czas pracy (*time-slicing*) na jednym kanale częstotliwości.

> [!TIP] Praktyczne zastosowanie trybu dualnego: Wi-Fi Manager
> Tryb `WIFI_AP_STA` jest powszechnie stosowany w urządzeniach komercyjnych (np. inteligentnych gniazdkach). Nowe urządzenie po włączeniu nie zna danych domowej sieci Wi-Fi, więc uruchamia swój Access Point. Użytkownik łączy się z nim telefonem i przez stronę WWW podaje hasło do domowej sieci. ESP32 łączy się z routerem (STA), po czym może wyłączyć AP i przejść w czysty tryb `WIFI_STA`.

---

## 🌐 Czym jest DNS i mDNS?

Aby połączyć się z serwerem, urządzenia sieciowe muszą znać jego adres IP (np. `192.168.4.1`). Ponieważ zapamiętywanie adresów liczbowych jest uciążliwe, powstały systemy tłumaczenia nazw na adresy IP:

- **DNS (Domain Name System):** Globalna baza danych. Kiedy wpisujesz w przeglądarce `google.com`, serwer DNS w Internecie tłumaczy tę nazwę na odpowiadający jej adres IP serwera Google. Wymaga to jednak zewnętrznego serwera DNS i połączenia z Internetem.
- **mDNS (Multicast DNS):** Rozwiązanie stworzone z myślą o sieciach lokalnych, które **nie wymaga** żadnego centralnego serwera. Urządzenia w sieci lokalnej wysyłają zapytania grupowe (multicast). Kiedy wpisujesz adres `http://esp32.local`, Twój komputer pyta w eterze: *"Kto nazywa się esp32.local?"*, a płytka ESP32 bezpośrednio odpowiada: *"To mój adres IP!"*. Pozwala to łatwo wejść na naszą płytkę w sieci lokalnej wpisując przyjazną nazwę.

---

## 🎯 Ćwiczenie 1: Serwer WWW z Access Point i mDNS

W tym ćwiczeniu ESP32-C6 wykreuje własną sieć bezprzewodową (tryb Access Point) i uruchomi serwer HTTP. Po połączeniu ze smartfona lub laptopa będziesz mógł sterować wbudowaną diodą LED za pomocą prostej strony internetowej.

> [!WARNING] Obsługa mDNS na smartfonach
> System Android domyślnie nie wspiera mDNS bez dodatkowego oprogramowania. Jeśli testujesz układ na telefonie z Androidem, połącz się z siecią ESP i w przeglądarce wpisz surowy adres IP: `http://192.168.4.1`. Na systemach iOS, macOS oraz Windows adres `http://moje_esp.local` powinien zadziałać automatycznie.

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

const int PIN_LED = 2;

// ZMIEŃ nazwę sieci – musi być unikalna w sali (np. dodaj swoje imię)
const char* nazwaSieci = "ESP32_Siec_Unikalna";
const char* hasloSieci = "12345678"; // Min. 8 znaków

WebServer server(80);

const char STRONA_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serwer ESP32</title>
  <style>
    body { background:#1e1e2f; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px; }
    .karta { background:#2a2a3d; margin:0 auto; max-width:350px; padding:30px; border-radius:16px; box-shadow:0 8px 20px rgba(0,0,0,0.5); }
    button { background:#ff6b6b; color:white; border:none; padding:15px 30px; font-size:18px; border-radius:8px; cursor:pointer; margin:10px; width:80%; }
    button:hover { background:#ff5252; }
    .btn-off { background:#4d4d63; }
    .btn-off:hover { background:#3b3b4f; }
  </style>
</head>
<body>
  <div class="karta">
    <h2>Sterowanie ESP32</h2>
    <button onclick="location.href='/on'">Włącz LED</button>
    <button class="btn-off" onclick="location.href='/off'">Wyłącz LED</button>
  </div>
</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);

  WiFi.softAP(nazwaSieci, hasloSieci);
  Serial.print("Sieć: "); Serial.println(nazwaSieci);
  Serial.print("IP: "); Serial.println(WiFi.softAPIP());

  if (MDNS.begin("esp32")) {
    Serial.println("mDNS aktywne: http://esp32.local");
  }

  server.on("/", []() { server.send(200, "text/html", STRONA_HTML); });

  server.on("/on", []() {
    digitalWrite(PIN_LED, HIGH);
    server.sendHeader("Location", "/");
    server.send(303);
  });

  // UZUPEŁNIJ: obsłuż ścieżkę "/off" – gaś diodę i przekieruj na "/"
  server.on("/off", []() {
    /* ??? */
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
```

> [!WARNING] mDNS i Android
> Adres `http://esp32.local` często nie działa w przeglądarkach **Android**. Użyj bezpośredniego IP: `http://192.168.4.1` (wyświetlane w Serial Monitor po starcie).

## 🛠️ Zadanie do samodzielnego wykonania: Sterowanie dodatkową diodą LED

Dodaj obsługę drugiej diody (podłączonej do innego GPIO, np. GPIO3) z dodatkowymi przyciskami „Włącz LED2” oraz „Wyłącz LED2” na podstronie HTML, które będą kierować odpowiednio na ścieżki `/on2` i `/off2`.

<details>
<summary>Pokaż rozwiązanie</summary>

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

const int PIN_LED = 2;
const int PIN_LED2 = 3;

WebServer server(80);

const char* nazwaSieci = "ESP32_Serwer";
const char* hasloSieci = "12345678";

const char STRONA_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Serwer ESP32-C6</title>
  <style>
    body { font-family: sans-serif; text-align: center; background-color: #121212; color: white; padding-top: 50px; }
    .karta { background: #1e1e1e; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
    button { padding: 15px 25px; font-size: 18px; margin: 10px; border: none; border-radius: 5px; cursor: pointer; color: white; background-color: #2ecc71; transition: background-color 0.2s; }
    button:hover { background-color: #27ae60; }
    .btn-off { background-color: #e74c3c; }
    .btn-off:hover { background-color: #c0392b; }
  </style>
</head>
<body>
  <div class="karta">
    <h2>Sterowanie ESP32</h2>
    <h3>Dioda LED 1</h3>
    <button onclick="location.href='/on'">Włącz LED 1</button>
    <button class="btn-off" onclick="location.href='/off'">Wyłącz LED 1</button>
    <h3>Dioda LED 2</h3>
    <button onclick="location.href='/on2'">Włącz LED 2</button>
    <button class="btn-off" onclick="location.href='/off2'">Wyłącz LED 2</button>
  </div>
</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_LED2, OUTPUT);

  WiFi.softAP(nazwaSieci, hasloSieci);
  Serial.print("Sieć: "); Serial.println(nazwaSieci);
  Serial.print("IP: "); Serial.println(WiFi.softAPIP());

  if (MDNS.begin("esp32")) {
    Serial.println("mDNS aktywne: http://esp32.local");
  }

  server.on("/", []() { server.send(200, "text/html", STRONA_HTML); });

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

  server.on("/on2", []() {
    digitalWrite(PIN_LED2, HIGH);
    server.sendHeader("Location", "/");
    server.send(303);
  });

  server.on("/off2", []() {
    digitalWrite(PIN_LED2, LOW);
    server.sendHeader("Location", "/");
    server.send(303);
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
```
</details>

---

## ☁️ Integracja z chmurą: REST API i format JSON

Większość urządzeń IoT (Internet of Things) nie działa w izolacji. Aby przesłać odczyty sensorów do chmury, pobrać prognozę pogody czy zsynchronizować czas systemowy, mikrokontroler musi komunikować się z usługami sieciowymi. Najpopularniejszym standardem takiej komunikacji jest **REST API** (*Representational State Transfer*):

- **REST API** opiera się na protokole HTTP (tym samym, którego używa przeglądarka internetowa).
- Urządzenie (klient) wysyła żądanie sieciowe pod określony adres URL, najczęściej przy użyciu metody **GET** (służącej do pobierania danych) lub **POST** (służącej do wysyłania danych do chmury).
- Serwer po odebraniu żądania odsyła dane w ustrukturyzowanym, czytelnym dla maszyn formacie **JSON** (*JavaScript Object Notation*).

Format JSON reprezentuje dane w postaci czytelnych par klucz-wartość oraz tablic:

```json
{
  "text": "Honey is the only food that never expires.",
  "language": "en",
  "id": 124
}
```

Dla człowieka jest to zwykły tekst, ale dla mikrokontrolera to jedynie ciąg surowych bajtów (znaków char). Aby wydobyć z niego konkretną wartość (np. sam fakt ukryty pod kluczem `"text"`), musimy ten tekst **sparsować** (zdeserializować) do struktury drzewiastej w pamięci RAM. Do tego celu służy niezwykle popularna i zoptymalizowana biblioteka **ArduinoJson**.

---

## 🎯 Ćwiczenie 2: Klient HTTP – pobieranie ciekawostek z API i parsowanie JSON

W tym ćwiczeniu ESP32-C6 połączy się z Twoją siecią Wi-Fi lub hotspotem w telefonie (tryb Station), wyśle zapytanie HTTP GET do publicznego serwera API, pobierze losowy fakt w formacie JSON i wyciągnie z niego tekst ciekawostki za pomocą biblioteki `ArduinoJson`.

> [!IMPORTANT] Wymagania przed uruchomieniem
> 1. Włącz w telefonie **Przenośny punkt dostępowy (Hotspot Wi-Fi)**.
> 2. Upewnij się, że znasz dokładną nazwę sieci (SSID) oraz hasło.
> 3. W programie Arduino IDE zainstaluj bibliotekę **ArduinoJson** (autorstwa Benoit Blanchon) za pomocą Menedżera Bibliotek (*Tools -> Manage Libraries*).

```cpp
#include <WiFi.h>
#include <HTTPClient.h> // Biblioteka obsługująca protokół HTTP (klient)
#include <ArduinoJson.h> // Biblioteka do parsowania formatu JSON

// UZUPEŁNIJ: wpisz dane swojego punktu dostępowego
const char* ssid     = "Nazwa_Hotspotu";
const char* password = "Haslo_Hotspotu";

// Adres URL darmowego API zwracającego losowe fakty w formacie JSON
const char* urlAPI = "https://uselessfacts.jsph.pl/api/v2/facts/random";

void setup() {
  Serial.begin(115200);
  
  // Ustawienie trybu stacji (klienta) i połączenie z siecią
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Łączenie z Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); 
    Serial.print(".");
  }
  Serial.println("\nPołączono! Otrzymany adres IP: " + WiFi.localIP().toString());
}

void loop() {
  // Wykonaj zapytanie tylko jeśli połączenie Wi-Fi jest aktywne
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http; // Tworzenie obiektu klienta HTTP
    
    // 1. Inicjalizacja połączenia z podanym adresem URL
    http.begin(urlAPI);
    
    // 2. Wysłanie żądania HTTP GET i odebranie kodu statusu odpowiedzi
    int kodOdpowiedzi = http.GET();

    // 3. Sprawdzenie, czy połączenie powiodło się (kod HTTP 200 oznacza "OK")
    if (kodOdpowiedzi == HTTP_CODE_OK) {
      // Pobranie całej odpowiedzi serwera jako surowy ciąg znaków String
      String odpowiedzRaw = http.getString();
      
      // Tworzenie dynamicznego dokumentu JSON w pamięci RAM
      JsonDocument doc;
      
      // Deserializacja surowego tekstu JSON na strukturę obiektową
      DeserializationError blad = deserializeJson(doc, odpowiedzRaw);
      
      if (blad == DeserializationError::Ok) {
        Serial.println("\n========================================");
        Serial.print("Dzisiejszy bezużyteczny fakt: ");
        
        // Odczytanie wartości powiązanej z kluczem "text" i konwersja na String
        String fakt = doc["text"].as<String>();
        Serial.println(fakt);
        
        Serial.println("========================================\n");
      } else {
        Serial.print("Błąd parsowania JSON: ");
        Serial.println(blad.f_str());
      }
    } else {
      Serial.printf("Błąd żądania HTTP. Kod błędu: %d\n", kodOdpowiedzi);
    }
    
    // 4. Zamknięcie sesji HTTP i zwolnienie zasobów sieciowych
    http.end();
  } else {
    Serial.println("Brak połączenia z Wi-Fi. Próba ponownego połączenia...");
  }
  
  delay(10000); // Pobieraj nowy fakt co 10 sekund (nie spamuj serwera zbyt często!)
}
```


## 🛠️ Zadanie do samodzielnego wykonania: Pobieranie danych z innego API

Odwiedź [listę publicznych API](https://github.com/public-apis/public-apis) i wybierz inne publiczne API (kolumna Auth = `No`). Wybierz interesującą Cię przez siebie kategorię API, kliknij w nazwę wybranego API, a następnie wybierz interesujący Cię Endpoint. Wyświetl pobrane z niego informacje na Serial Monitorze. Alternatywnie możesz użyć darmowego API pogodowego (np. [Open-Meteo](https://open-meteo.com/en)) i pobrać aktualną temperaturę dla wybranego przez siebie miasta.

<details>
<summary>Pokaż przykładowe rozwiązanie (API Open-Meteo)</summary>

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Nazwa_Hotspotu";
const char* password = "Haslo_Hotspotu";

// Pobieranie temperatury dla Warszawy z Open-Meteo
const char* urlAPI = "http://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&current_weather=true";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nPołączono z Wi-Fi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(urlAPI);

    int kodOdpowiedzi = http.GET();

    if (kodOdpowiedzi == HTTP_CODE_OK) {
      String odpowiedzRaw = http.getString();
      JsonDocument doc;
      DeserializationError blad = deserializeJson(doc, odpowiedzRaw);

      if (!blad) {
        float temperatura = doc["current_weather"]["temperature"];
        float predkoscWiatru = doc["current_weather"]["windspeed"];
        
        Serial.println("\n=== POGODA DLA WARSZAWY ===");
        Serial.printf("Temperatura: %.1f C\n", temperatura);
        Serial.printf("Prędkość wiatru: %.1f km/h\n", predkoscWiatru);
        Serial.println("===========================\n");
      } else {
        Serial.print("Błąd parsowania JSON: ");
        Serial.println(blad.f_str());
      }
    } else {
      Serial.printf("Błąd HTTP: %d\n", kodOdpowiedzi);
    }
    http.end();
  }
  delay(15000); // Pobieraj co 15 sekund
}
```
</details>

