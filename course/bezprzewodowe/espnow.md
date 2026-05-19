# Ćwiczenie 13 – ESP-NOW: komunikacja peer-to-peer

> [!WARNING] 👥 To ćwiczenie wymaga **dwóch płytek ESP32-C6**
> ESP-NOW to komunikacja bezpośrednia między dwoma (lub więcej) układami ESP. Nie da się jej zasymulować na jednej płytce. Jeśli nie masz drugiej płytki – wróć do tego ćwiczenia później lub poproś o pomoc osobę obok.

**ESP-NOW** to autorski protokół firmy Espressif. Pozwala na bezpośrednią komunikację między układami ESP bez pośrednictwa routera Wi-Fi. Dane płyną bezpośrednio, opóźnienia są minimalne, a zasięg sięga ok. 200 m na otwartym terenie.

---

## Jak działa ESP-NOW?

Zamiast adresów IP, ESP-NOW identyfikuje urządzenia przez **adresy MAC** – unikalne 6-bajtowe identyfikatory fizyczne każdej karty sieciowej. Aby Płytka A mogła wysłać dane do Płytki B, musi znać jej adres MAC.

> [!IMPORTANT] Klucz do komunikacji: adres MAC
> Każdy ESP32 ma unikalny adres MAC. Płytka nadawcza **musi go znać** zanim wyśle cokolwiek.

---

## Krok 1: Odczyt adresu MAC odbiornika

Wgraj ten program na **Płytkę B** (Odbiornik) i odczytaj jej adres MAC z Serial Monitor:

```cpp
#include <WiFi.h>

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  Serial.print("Adres MAC tej płytki: ");
  Serial.println(WiFi.macAddress());
}

void loop() {}
```

> [!TIP] Zapisz adres MAC!
> Skopiuj wyświetlony adres (np. `24:DC:C3:A1:B2:C0`) do notatnika. Będziesz go potrzebował w kodzie Nadajnika w formacie szesnastkowym: `{0x24, 0xDC, 0xC3, 0xA1, 0xB2, 0xC0}`.

---

## Krok 2: Struktura przesyłanych danych

ESP-NOW najwygodniej przesyła ustrukturyzowane paczki danych (`struct`):

```cpp
typedef struct struct_message {
  char polecenie[10]; // np. "MIGANIE"
  int wartosc;        // dowolna wartość liczbowa
} struct_message;
```

Struktura musi być **identyczna** w kodzie Nadajnika i Odbiornika.

---

## Krok 3: Kod Nadajnika (Płytka A)

```cpp
#include <esp_now.h>
#include <WiFi.h>

// UZUPEŁNIJ: wpisz adres MAC Płytki B (Odbiornika)
uint8_t adresOdbiornika[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

typedef struct struct_message {
  char polecenie[10];
  int wartosc;
} struct_message;

struct_message wysylaneDane;
esp_now_peer_info_t peerInfo;

void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("Status transmisji: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Sukces" : "Błąd");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Błąd inicjalizacji ESP-NOW");
    return;
  }
  esp_now_register_send_cb((esp_now_send_cb_t)onDataSent);

  memcpy(peerInfo.peer_addr, adresOdbiornika, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Nie udało się dodać odbiornika");
    return;
  }
}

void loop() {
  strcpy(wysylaneDane.polecenie, "MIGANIE");
  wysylaneDane.wartosc = random(10, 100);

  esp_now_send(adresOdbiornika, (uint8_t *)&wysylaneDane, sizeof(wysylaneDane));
  Serial.println("Wysłano pakiet!");
  delay(2000);
}
```

---

## Krok 4: Kod Odbiornika (Płytka B)

```cpp
#include <esp_now.h>
#include <WiFi.h>

const int PIN_LED = 2;

typedef struct struct_message {
  char polecenie[10];
  int wartosc;
} struct_message;

struct_message odebraneDane;

void onDataRecv(const esp_now_recv_info_t *recv_info, const uint8_t *incomingData, int len) {
  memcpy(&odebraneDane, incomingData, sizeof(odebraneDane));
  Serial.print("Odebrano od: ");
  for (int i = 0; i < 6; i++) {
    Serial.printf("%02X", recv_info->src_addr[i]);
    if (i < 5) Serial.print(":");
  }
  Serial.printf(" | Polecenie: %s | Wartość: %d\n",
                odebraneDane.polecenie, odebraneDane.wartosc);

  if (strcmp(odebraneDane.polecenie, "MIGANIE") == 0) {
    digitalWrite(PIN_LED, HIGH);
    delay(50);
    digitalWrite(PIN_LED, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Błąd inicjalizacji ESP-NOW");
    return;
  }
  esp_now_register_recv_cb((esp_now_recv_cb_t)onDataRecv);
  Serial.println("Odbiornik ESP-NOW gotowy – nasłuchuję...");
}

void loop() {
  // Odbiór realizowany asynchronicznie przez callback onDataRecv
}
```

---

## Zadanie do samodzielnego wykonania: bezprzewodowy kontroler gestów

Połącz ESP-NOW z wiedzą z modułu Protokoły:

1. **Płytka A (Nadajnik):** Podłącz MPU6050 przez I2C. Zmień strukturę na `float katX; float katY;`. W pętli wysyłaj kąty nachylenia 10 razy na sekundę.
2. **Płytka B (Odbiornik):** Reaguj na odebrany kąt – gdy `katX > 30.0`, zapal LED; gdy `katX < -30.0`, gaś LED.

<details>
<summary>Wskazówka: modyfikacja struktury</summary>
Struktura musi być identyczna na obu płytkach:

```cpp
typedef struct struct_message {
  float katX;
  float katY;
} struct_message;
```
</details>
