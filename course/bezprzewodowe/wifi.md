# Ćwiczenie 14 – Wi-Fi: serwer WWW i REST API

**Potrzebujesz:** 📱 Smartfon lub laptop z Wi-Fi (do połączenia z serwerem) oraz hotspot (do ćwiczenia REST API).

ESP32-C6 może działać w dwóch trybach sieciowych: jako **punkt dostępowy** (sam tworzy sieć) lub jako **klient stacji** (łączy się z istniejącą siecią).

---

## Tryby Wi-Fi

| Tryb | Symbol | Opis | Zastosowanie |
|:---|:---:|:---|:---|
| Access Point | `WIFI_AP` | ESP32 tworzy własną sieć Wi-Fi | Sterowanie lokalne bez routera |
| Station | `WIFI_STA` | ESP32 łączy się z routerem | Dostęp do Internetu |

---

## Czym jest mDNS?

W lokalnych sieciach Wi-Fi urządzenia komunikują się przez adresy IP (np. `192.168.4.1`). Zapamiętywanie liczb jest niewygodne. **mDNS** (*Multicast DNS*) pozwala nadać urządzeniu przyjazną nazwę z końcówką `.local` – zamiast IP wpisujesz w przeglądarce `http://esp32.local`.

---

## Ćwiczenie 14a: Serwer WWW z Access Point i mDNS

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

**Zadanie:** Dodaj obsługę drugiej diody (inny GPIO) z przyciskami „Włącz LED2" / „Wyłącz LED2" na trasy `/on2` i `/off2`.

---

## Czym jest REST API?

**REST API** to styl komunikacji sieciowej: klient (ESP32) wysyła żądanie HTTP do serwera (Internet) i dostaje odpowiedź w formacie **JSON** (*JavaScript Object Notation*).

Przykładowy JSON:
```json
{
  "text": "Honey is the only food that never expires.",
  "language": "en"
}
```

## Ćwiczenie 14b: Klient HTTP – losowe ciekawostki z API

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

**Zadanie:** Odwiedź [github.com/public-apis/public-apis](https://github.com/public-apis/public-apis) i wybierz inne publiczne API (kolumna Auth = `No`). Podmień URL i zmodyfikuj parsowanie JSON pod nową strukturę odpowiedzi.
