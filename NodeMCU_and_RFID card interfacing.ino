#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define SS_PIN D4  // SDA -> D4 (GPIO2)
#define RST_PIN D3 // RST -> D3 (GPIO0)

const char* ssid = "YOUR wifi name";
const char* password = "YOUR password";

MFRC522 mfrc522(SS_PIN, RST_PIN);
ESP8266WebServer server(80);
LiquidCrystal_I2C lcd(0x27, 16, 2);

String card_list[] = {"*********", "#########"};  // set the rfid hexcode here

String product_info[][3] = {
    {"Apple", "0", "20"},
    {"Banana", "0", "10"},
    {"Orange", "0", "15"},
    {"Milk", "0", "10"},
    {"Bread", "0", "30"},
    {"Eggs", "0", "3"}
};

int total_card = sizeof(product_info) / sizeof(product_info[0]);
String card_num = "";

void setup() {
    Serial.begin(115200);
    SPI.begin();
    mfrc522.PCD_Init();
    lcd.begin();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Scan the product...");

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    server.on("/", handleRoot);
    server.begin();
    Serial.println("HTTP Server started...");
}

void loop() {
    server.handleClient();

    if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    card_num = getCardNumber();
    showData();
}

String getCardNumber() {
    String UID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        UID += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
        UID += String(mfrc522.uid.uidByte[i], HEX);
    }
    UID.toUpperCase();
    return UID;
}

void showData() {
    bool product_found = false;
    lcd.clear();

    for (int i = 0; i < total_card; i++) {
        if (card_num.equalsIgnoreCase(card_list[i])) {
            product_found = true;
            int count = product_info[i][1].toInt() + 1;
            product_info[i][1] = String(count);

            lcd.setCursor(0, 0);
            lcd.print("Item: ");
            lcd.print(product_info[i][0]);
            lcd.setCursor(0, 1);
            lcd.print("Price: $");
            lcd.print(product_info[i][2]);
            delay(3000);
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Scan the product...");
            return;
        }
    }

    lcd.setCursor(0, 0);
    lcd.print("Unknown Product");
    delay(3000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Scan the product...");
}

void handleRoot() {
    String jsonResponse = "[";

    for (int i = 0; i < total_card; i++) {
        if (i > 0) jsonResponse += ",";
        jsonResponse += "{";
        jsonResponse += "\"item\":\"" + product_info[i][0] + "\",";
        jsonResponse += "\"count\":\"" + product_info[i][1] + "\",";
        jsonResponse += "\"price\":\"$" + product_info[i][2] + "\"";
        jsonResponse += "}";
    }

    jsonResponse += "]";

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
   
    server.send(200, "application/json", jsonResponse);
}