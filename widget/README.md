# Kreuzfahrt-Angebote-Widget

Zeigt die Angebote aus `kreuzfahrt-angebote.json` als Karten an, mit einem
Kategorie-Menü zum Filtern und einer Sortierung (Preis, Abfahrt, Rabatt).
Die Daten werden beim Seitenaufruf live aus diesem Repository geladen –
automatische Updates der JSON erscheinen also ohne Änderung an der Webseite
(GitHub cached die Datei bis zu 5 Minuten).

## Einbinden in Pixpa

Seite im Pixpa-Editor öffnen → Block **„Embed Code“ / „HTML“** hinzufügen → einsetzen:

```html
<div id="kreuzfahrt-angebote"></div>
<script src="https://cdn.jsdelivr.net/gh/squid1406-dev/json@main/kreuzfahrt-widget.js"></script>
```

Wichtig:

- **Nicht** `raw.githubusercontent.com/...` oder `github.com/.../blob/...` als
  Script-Adresse verwenden. GitHub liefert die Datei dort als Text bzw. als
  HTML-Seite aus, der Browser führt sie nicht aus. Immer die jsDelivr-Adresse nehmen.
- Pixpa führt Scripte im Editor-Vorschaubild meist nicht aus. Zum Testen die
  **veröffentlichte** Seite aufrufen.
- jsDelivr cached Dateien bis zu 12 Stunden. Nach einer Änderung an der
  JS-Datei ggf. `https://purge.jsdelivr.net/gh/squid1406-dev/json@main/kreuzfahrt-widget.js`
  im Browser aufrufen. (Die Angebote selbst kommen ohne diese Verzögerung direkt von GitHub.)
- Alternative: Script-Zeile unter *Einstellungen → Externe Dienste / Code
  einbetten (Header)* einfügen und im Seiten-Block nur das `<div>` lassen.

## Optionen

| Attribut am `<div>` | Wirkung |
|---|---|
| `data-src="https://…/datei.json"` | Andere JSON-Quelle verwenden |
| `data-kategorie="Grönland"` | Diese Kategorie ist beim Laden aktiv |
| `data-anbieter="logo"` | Grünes Anbieter-Logo statt Anbietername (Standard: `name`) |

Kategorien lassen sich direkt verlinken, z. B.
`https://www.augenliebe-reiseblog.de/kreuzfahrten/#kategorie=Antarktis`.

Farben anpassen: in der CSS-Variablen `--kfw-akzent` (Standard `#0b6e8a`).

## Testen

`widget/demo.html` im Browser öffnen.

## Startseiten-Teaser (max. 3 Angebote)

```html
<div data-kreuzfahrt-widget data-max="3"></div>
<script src="https://cdn.jsdelivr.net/gh/squid1406-dev/json@VERSION/kreuzfahrt-widget.js"></script>
```

| Attribut | Wirkung | Standard |
|---|---|---|
| `data-max` | Anzahl der Angebote (schaltet den Teaser ein) | – |
| `data-layout` | `liste`, `karten` oder `buehne` | `liste` |
| `data-auswahl` | `rabatt`, `preis`, `abfahrt` oder `solo` | `rabatt` |
| `data-kicker` | kleine Zeile über der Überschrift | Solo an Bord |
| `data-titel` | Überschrift (Schreibschrift) | Aktuelle Kreuzfahrtangebote |
| `data-text` | optionaler Begleittext | – |
| `data-mehr-link` | Ziel des Knopfs „Alle Angebote ansehen“ | `/cruise` |

Angebote mit vergangenem Abfahrtsdatum werden nicht angezeigt.
