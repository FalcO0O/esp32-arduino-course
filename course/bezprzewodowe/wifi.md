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

## Czym jest DNS i mDNS?

Aby połączyć się z serwerem, urządzenia sieciowe muszą znać jego adres IP (np. `192.168.4.1`). Ponieważ zapamiętywanie adresów liczbowych jest uciążliwe, powstały systemy tłumaczenia nazw na adresy IP:

- **DNS (Domain Name System):** Globalna baza danych. Kiedy wpisujesz w przeglądarce `google.com`, serwer DNS w Internecie tłumaczy tę nazwę na odpowiadający jej adres IP serwera Google. Wymaga to jednak zewnętrznego serwera DNS i połączenia z Internetem.
- **mDNS (Multicast DNS):** Rozwiązanie stworzone z myślą o sieciach lokalnych, które **nie wymaga** żadnego centralnego serwera. Urządzenia w sieci lokalnej wysyłają zapytania grupowe (multicast). Kiedy wpisujesz adres `http://esp32.local`, Twój komputer pyta w eterze: *"Kto nazywa się esp32.local?"*, a płytka ESP32 bezpośrednio odpowiada: *"To mój adres IP!"*. Pozwala to łatwo wejść na naszą płytkę w sieci lokalnej wpisując przyjazną nazwę.

---

## Ćwiczenie 1: Serwer WWW z Access Point i mDNS

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

**Zadanie:** Dodaj obsługę drugiej diody (inny GPIO, np. GPIO3) z przyciskami „Włącz LED2" / „Wyłącz LED2" na ścieżki `/on2` i `/off2`.

---

## Czym jest REST API?

**REST API** to styl komunikacji sieciowej: klient (ESP32) wysyła żądanie HTTP do serwera i dostaje odpowiedź w formacie **JSON**.

Przykładowy JSON:

```json
{
  "text": "Honey is the only food that never expires.",
  "language": "en"
}
```

---

## Ćwiczenie 2: Klient HTTP – losowe ciekawostki z API

> [!IMPORTANT] Wymagania
> Przed wgraniem włącz na smartfonie **Przenośny punkt dostępowy (Hotspot Wi-Fi)** i wpisz jego dane w kodzie.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// UZUPEŁNIJ: dane Twojego hotspotu
const char* ssid     = "Nazwa_Hotspotu";
const char* password = "Haslo_Hotspotu";

const char* urlAPI = "https://uselessfacts.jsph.pl/api/v2/facts/random";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Łączenie z Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nPołączono! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(urlAPI);
    int kod = http.GET();

    if (kod == HTTP_CODE_OK) {
      String odpowiedz = http.getString();
      JsonDocument doc;
      if (deserializeJson(doc, odpowiedz) == DeserializationError::Ok) {
        Serial.println("\n========================================");
        Serial.print("Fakt: ");
        Serial.println(doc["text"].as<String>());
        Serial.println("========================================\n");
      }
    } else {
      Serial.printf("Błąd HTTP: %d\n", kod);
    }
    http.end();
  }
  delay(10000); // Pobieraj nowy fakt co 10 sekund
}
```

**Zadanie:** Odwiedź listę publicznych API (np. [github.com/public-apis/public-apis](https://github.com/public-apis/public-apis)) i wybierz inne publiczne API (kolumna Auth = `No`). Podmień URL i zmodyfikuj parsowanie JSON pod nową strukturę odpowiedzi, wypisując inne klucze.
