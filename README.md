# BP-Gruppe-55-ERDPAY

Dieses Projekt bietet ein umfangreiches Dashboard für die Verwaltung von digitalen Assets im Erdstall-Netzwerk. Es ermöglicht Benutzern, Sitzungen zu erstellen und wiederherzustellen, Kontostände einzusehen, Tokens zu übertragen und zu minten.

#### Dateien Übersicht:

1. **balance.ts**:
   - Zuständig für das Anzeigen des Kontostands eines Benutzers und das Ansehen von Token-Details.

2. **dashboard.ts**:
   - Implementiert das Hauptdashboard für die Navigation zwischen verschiedenen Funktionen wie Kontostandsanzeige, Token-Übertragung und Token-Prägung.

3. **mint.ts**:
   - Ermöglicht das Prägen neuer Tokens, sowohl einzeln als auch mehrere gleichzeitig.

4. **setup_client.ts**:
   - Initialisiert einen neuen Erdstall-Client für die Netzwerkverbindung.

5. **setup_session.ts**:
   - Bietet Funktionen zum Erstellen einer neuen Sitzung oder zum Wiederherstellen einer vorhandenen Sitzung über einen privaten Schlüssel.

6. **tooltip.ts**:
   - Eine Hilfsfunktion, die interaktive Tooltips zu beliebigen Elementen für zusätzliche Informationen hinzufügt.

7. **transfer.ts**:
   - Verwaltet die Übertragung von Tokens zwischen Konten und unterstützt die Auswahl von Token-IDs.

8. **utils.ts**:
   - Eine Sammlung von Hilfsfunktionen für verschiedene Aufgaben wie Adressüberprüfung, Fehleranzeige und Generierung zufälliger Adressen oder Token-IDs.

9. **widget.ts**:
   - Das Haupt-Widget, das den Zugangspunkt für Benutzerinteraktionen bietet und auf das Hauptdashboard, die Kontostandsanzeige für Gäste und weitere Funktionen verweist.

#### HTML-Datei (index.html):

- **Struktur**: Definiert den Rahmen der Webseite, einschließlich des `head` für Metadaten und des `body` für den Inhalt.
- **Font Awesome Icons**: Für die Verwendung von Icons innerhalb des Dashboards.
- **Style Link**: Bindet das Stylesheet `style.css` für die Gestaltung ein.
- **App Container**: Ein `div`-Element mit der ID `app`, das als Container für das Haupt-Widget dient.
- **Script Tag**: Lädt das `widget.ts` Script, welches das Dashboard initialisiert.

### Entwicklungssetup:

Um das Projekt zu starten, folgen Sie diesen Schritten:

1. Installieren Sie Node.js und npm, falls noch nicht geschehen.
2. Klonen Sie das Projekt oder extrahieren Sie die Dateien in einen lokalen Ordner.
3. Führen Sie `npm install` im Projektverzeichnis aus, um Abhängigkeiten zu installieren.
4. Nutzen Sie `npm run build`, um die TypeScript-Dateien zu JavaScript zu kompilieren.
5. Öffnen Sie `index.html` in einem Browser, um das Dashboard zu nutzen.

### Dashboard Nutzung:

Das ErdPay Dashboard ist über `index.html` zugänglich. Nach dem Öffnen im Browser können Benutzer auf verschiedene Funktionen des Dashboards zugreifen, einschließlich Sitzungsmanagement, Kontostandsanzeige, Token-Übertragung und -Prägung.

Dieses Readme bietet einen grundlegenden Überblick über die Projektstruktur und Funktionalität. Für detaillierte Informationen zu den Funktionen und zur Entwicklungsumgebung wird empfohlen, die Kommentare im Code und die Dokumentation der genutzten Bibliotheken zu lesen.
