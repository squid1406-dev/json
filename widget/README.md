# Kreuzfahrt-Angebote-Widget

Zeigt die Angebote aus `kreuzfahrt-angebote.json` als Karten an, mit einem
Kategorie-Menü zum Filtern und einer Sortierung (Preis, Abfahrt, Rabatt).
Die Daten werden beim Seitenaufruf live aus diesem Repository geladen –
automatische Updates der JSON erscheinen also ohne Änderung an der Webseite
(GitHub cached die Datei bis zu 5 Minuten).

## Einbinden in WordPress (augenliebe-reiseblog.de)

Seite oder Beitrag bearbeiten → Block **„Individuelles HTML“** einfügen → einsetzen:

```html
<div id="kreuzfahrt-angebote"></div>
<script src="https://cdn.jsdelivr.net/gh/squid1406-dev/json@main/widget/kreuzfahrt-widget.js" defer></script>
```

Die jsDelivr-Adresse funktioniert erst, wenn `widget/` im Branch `main` liegt.
Alternativ den kompletten Inhalt von `kreuzfahrt-widget.js` zwischen
`<script>` und `</script>` direkt in den HTML-Block kopieren.

## Optionen

| Attribut am `<div>` | Wirkung |
|---|---|
| `data-src="https://…/datei.json"` | Andere JSON-Quelle verwenden |
| `data-kategorie="Grönland"` | Diese Kategorie ist beim Laden aktiv |

Kategorien lassen sich direkt verlinken, z. B.
`https://www.augenliebe-reiseblog.de/kreuzfahrten/#kategorie=Antarktis`.

Farben anpassen: in der CSS-Variablen `--kfw-akzent` (Standard `#0b6e8a`).

## Testen

`widget/demo.html` im Browser öffnen.
