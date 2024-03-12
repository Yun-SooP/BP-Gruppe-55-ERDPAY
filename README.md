# BP-Gruppe-55-ERDPAY

# Integration des Pay Buttons in Ihre Webanwendung

Die `eventPayPopup`-Funktion ermöglicht es Ihren Nutzern, Zahlungen über unser sicheres und benutzerfreundliches Interface zu tätigen. Hier ist eine Anleitung, wie Sie den Pay Button in Ihre Website integrieren können.

## Voraussetzungen

- Node.js und npm müssen auf Ihrem System installiert sein, da sie zum Verwalten von Paketen benötigt werden.
- Ihr Projekt sollte bereits initialisiert sein (`npm init` oder `yarn init` wurde ausgeführt).

## Schritte zur Einbindung

### Schritt 1: Paket verlinken

1. Klone das Repository mit unserem Pay Button Code oder navigiere zum entsprechenden lokalen Verzeichnis.
2. Führe in diesem Verzeichnis `npm link` aus, um ein lokales Paket zu erstellen, das in anderen Projekten verlinkt werden kann.

### Schritt 2: Paket in Ihrem Projekt verlinken

1. Wechsle in das Verzeichnis deiner Webanwendung, in der der Pay Button eingebunden werden soll.
2. Führe `npm link erdpay` aus.

### Schritt 3: Pay Button verwenden

Nachdem du das Pay Button Paket in dein Projekt eingebunden hast, kannst du die `eventPayPopup` Funktion importieren und verwenden:

```javascript
import { eventPayPopup } from 'erdpay';

// Beispiel: Event-Listener für den Button hinzufügen
document.getElementById('dein-pay-button').addEventListener('click', () => {
  const tokenAddress = '0xTOKEN_ADRESSE_HIER'; // Ersetze dies mit der echten Token-Adresse
  const amount = 10; // Der Betrag, der bezahlt werden soll
  const recipientAddress = '0xEMPFAENGER_ADRESSE_HIER'; // Ersetze dies mit der echten Empfängeradresse

  eventPayPopup(tokenAddress, amount, recipientAddress)
    .then(paymentSuccess => {
      if (paymentSuccess) {
        console.log('Zahlung erfolgreich!');
      } else {
        console.log('Zahlung fehlgeschlagen!');
      }
    })
    .catch(error => {
      console.error('Ein Fehler ist aufgetreten:', error);
    });
});
```

### Wichtig zu wissen

- Die `eventPayPopup`-Funktion erwartet drei Parameter:
  - `tokenAddressToPay` (string): Die Adresse des Tokens, der für die Zahlung verwendet wird.
  - `amount` (number): Die Anzahl der Tokens, die gezahlt werden soll.
  - `recipientAddressToPay` (string): Die Adresse des Empfängers der Zahlung.
- Die Funktion gibt ein Promise zurück, das aufgelöst wird, sobald der Benutzer den Zahlungsvorgang abgeschlossen hat. Der Wert des Promises ist `true` bei erfolgreicher Zahlung und `false` bei Fehlschlag.

### Beispiel für die HTML-Integration

Füge einen Button in deine HTML-Datei ein, über den der Pay Popup aufgerufen wird:

```html
<button id="dein-pay-button">Jetzt bezahlen</button>
```

Stelle sicher, dass du die ID des Buttons (`dein-pay-button`) entsprechend anpasst, damit sie mit dem im JavaScript-Code verwendeten übereinstimmt.

