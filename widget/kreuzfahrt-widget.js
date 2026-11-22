/*!
 * Kreuzfahrt-Angebote-Widget für augenliebe-reiseblog.de
 * Lädt kreuzfahrt-angebote.json und zeigt die Angebote als Karten
 * mit einem Kategorie-Menü zum Filtern an.
 *
 * Einbindung:
 *   <div id="kreuzfahrt-angebote"></div>
 *   <script src=".../kreuzfahrt-widget.js" defer></script>
 *
 * Optionale Attribute am Container:
 *   data-src="URL zur JSON-Datei"      (Standard: GitHub-Repository, Branch main)
 *   data-kategorie="Grönland"          (Kategorie, die beim Laden aktiv ist)
 */
(function () {
  "use strict";

  var DEFAULT_SRC =
    "https://raw.githubusercontent.com/squid1406-dev/json/main/kreuzfahrt-angebote.json";
  var ALLE = "Alle";

  // ---------- Bilder ----------
  // Optional: eigene Fotos pro Kategorie (vollständige Bild-Adresse, z. B. aus der
  // Pixpa-Mediathek). Ist ein Foto hinterlegt, erscheint es oben auf der Karte. Leer = nur Icon.
  // Ein Feld "bild" direkt im Angebot (JSON) hat Vorrang vor dieser Liste.
  var BILDER = {
    "Antarktis": "",
    "Spitzbergen / Arktis": "",
    "Grönland": "",
    "Südsee": "",
    "Südamerika": "",
    "Ostsee / Europa": "",
    "Black Week / Last-Minute": "",
    "Solo-Angebot": "",
    "Sonstiges": ""
  };

  // Anbieter-Abzeichen auf dem Bild: "logo" (Logo des Anbieters) oder "name" (Name als Etikett).
  // Lässt sich pro Seite mit data-anbieter="logo" bzw. "name" am Container überschreiben.
  var ANBIETER_ANZEIGE = "name";
  // Logos liegen als Kopie im Repository (Ordner logos/), damit Besucher keine Anfragen an fremde Server schicken
  var LOGO_BASIS = "https://cdn.jsdelivr.net/gh/squid1406-dev/json@main/logos/";
  var LOGOS = {
    "eisexpeditionen.de": "eisexpeditionen.de.png",
    "kreuzfahrten-und-weltreisen.de": "kreuzfahrten-und-weltreisen.de.png"
  };

  // Illustrationen im Farbschema der Seite (wenn kein eigenes Foto hinterlegt ist)
  var G1 = "#37685d", G2 = "#567e72", HG = "#eef3f1";
  var WELLEN =
    '<path d="M0 138q40-10 80 0t80 0 80 0 80 0v42H0z" fill="' + G2 + '" opacity=".35"/>' +
    '<path d="M0 150q40-8 80 0t80 0 80 0 80 0v30H0z" fill="' + G1 + '"/>';
  var SONNE = '<circle cx="252" cy="48" r="20" fill="' + G2 + '" opacity=".25"/>';
  var SZENEN = {
    schiff: SONNE +
      '<path d="M104 132h112l-14 16h-84z" fill="' + G1 + '"/>' +
      '<path d="M124 118h70v14h-70z" fill="' + G2 + '"/><path d="M138 106h40v12h-40z" fill="' + G2 + '" opacity=".8"/>' +
      '<path d="M168 92h10v14h-10z" fill="' + G1 + '"/>' +
      '<path d="M130 123h4v4h-4zm10 0h4v4h-4zm10 0h4v4h-4zm10 0h4v4h-4zm10 0h4v4h-4zm10 0h4v4h-4z" fill="#fff"/>',
    eisberg: SONNE +
      '<path d="M62 142l34-58 20 16 28-40 38 52 14-10 26 40z" fill="#fff" stroke="' + G2 + '" stroke-width="1.5"/>' +
      '<path d="M144 60l-10 44 28 38h20l-14-36z" fill="' + G2 + '" opacity=".18"/>',
    berge: SONNE +
      '<path d="M0 142l58-62 34 30 50-52 52 58 36-28 90 54z" fill="' + G2 + '" opacity=".55"/>' +
      '<path d="M142 58l-15 16 9-2 9 7 8-9zm-50 22l-11 12 8-2 6 5z" fill="#fff"/>',
    fjord: SONNE +
      '<path d="M0 142l40-50 30 22 40-40 46 68z" fill="' + G2 + '" opacity=".5"/>' +
      '<path d="M190 142l22-34 16 10 18-24 26 48z" fill="#fff" stroke="' + G2 + '" stroke-width="1.5"/>',
    palme: '<circle cx="110" cy="96" r="30" fill="' + G2 + '" opacity=".22"/>' +
      '<path d="M160 142q50-30 120 0z" fill="' + G2 + '" opacity=".6"/>' +
      '<path d="M222 136q-6-36 8-70" stroke="' + G1 + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M230 66q-24-8-42 8 22-4 42-8zm0 0q20-14 42-4-22 0-42 4zm0 0q-8-22-30-26 18 10 30 26zm0 0q14-20 36-18-20 6-36 18zm0 0q-2 22-18 34 12-16 18-34z" fill="' + G1 + '"/>',
    leuchtturm: SONNE +
      '<path d="M138 142l8-64h20l8 64z" fill="' + G1 + '"/>' +
      '<path d="M142 112h28l1.6 12h-31.2zm2.4-22h23.2l1.2 9h-25.6z" fill="#fff"/>' +
      '<path d="M144 66h24v12h-24z" fill="' + G2 + '"/><path d="M140 64h32l-16-10z" fill="' + G1 + '"/>' +
      '<path d="M100 142q40-14 112 0z" fill="' + G2 + '" opacity=".5"/>'
  };
  // Motiv (aus Kategorie bzw. Titel) → Szene
  var SZENE_FUER = { eisberg: "eisberg", berge: "berge", fjord: "fjord", palme: "palme", leuchtturm: "leuchtturm" };

  // Farben und Schriften von augenliebe-reiseblog.de (Pixpa-Theme)
  var CSS =
    ".kfw{--kfw-gruen:#37685d;--kfw-gruen-hell:#567e72;--kfw-gruen-flaeche:#eef3f1;--kfw-text:#14201e;--kfw-grau:#5f6b68;--kfw-rand:#dfe6e3;--kfw-rot:#9b3d32;" +
    "--kfw-titel:'Playfair Display',Georgia,serif;--kfw-schrift:'Josefin Sans','Helvetica Neue',Arial,sans-serif;" +
    "font-family:var(--kfw-schrift);font-weight:300;font-size:16px;color:var(--kfw-text);line-height:1.5;margin:1.5em 0;text-align:left}" +
    ".kfw *{box-sizing:border-box;border-radius:0!important}" +
    ".kfw i,.kfw em{font-style:normal}" +
    ".kfw h3,.kfw ul,.kfw li,.kfw p{text-align:left;letter-spacing:normal;text-transform:none}" +
    ".kfw ul{list-style:none;padding:0}.kfw li{list-style:none;padding:0;margin-left:0}.kfw li::before{content:none}" +
    ".kfw-kopf{display:flex;flex-wrap:wrap;gap:.75em;align-items:center;justify-content:space-between;margin-bottom:1em}" +
    ".kfw-stand{font-size:.85em;color:var(--kfw-grau);letter-spacing:.03em}" +
    ".kfw-sort{font:inherit;font-size:.9em;padding:.4em .6em;border:1px solid var(--kfw-rand);background:#fff;color:var(--kfw-text);margin-left:.3em}" +
    ".kfw-menu{display:flex;flex-wrap:wrap;gap:.5em;margin:0 0 1.5em}" +
    ".kfw .kfw-menu button{font-family:var(--kfw-titel);font-size:.85em;font-weight:400;text-transform:uppercase;letter-spacing:.06em;" +
    "cursor:pointer;padding:.55em 1.1em;margin:0;border:1px solid var(--kfw-gruen);background:#fff;color:var(--kfw-gruen);" +
    "transition:background .15s,color .15s;box-shadow:none}" +
    ".kfw .kfw-menu button[aria-pressed=false]:hover{background:var(--kfw-gruen-flaeche)}" +
    ".kfw .kfw-menu button[aria-pressed=true]{background:var(--kfw-gruen);color:#fff}" +
    ".kfw-menu .kfw-anzahl{opacity:.7;margin-left:.35em;font-size:.85em}" +
    ".kfw-liste{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25em}" +
    ".kfw-karte{display:flex;flex-direction:column;border:1px solid var(--kfw-rand);padding:1.25em;background:#fff}" +
    ".kfw .kfw-bild{display:block;margin:-1.25em -1.25em 1.1em;aspect-ratio:16/9;overflow:hidden;background:#eef3f1}" +
    ".kfw .kfw-bild img{display:block;width:100%;height:100%;object-fit:cover;margin:0;max-width:none}" +
    ".kfw .kfw-bild{position:relative}" +
    ".kfw-oben{display:flex;align-items:center;justify-content:space-between;gap:.75em;margin:0 0 .6em;min-height:28px}" +
    ".kfw-logo{flex:none;display:flex;align-items:center}" +
    ".kfw .kfw-logo img{width:28px;height:28px;object-fit:contain;margin:0;opacity:.9}" +
    ".kfw-mono{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:1px solid var(--kfw-gruen);font-family:var(--kfw-titel);font-size:15px;color:var(--kfw-gruen);line-height:1}" +
    ".kfw-oben-name{flex-direction:column;align-items:flex-start;gap:.15em}" +
    ".kfw-anbieter{color:var(--kfw-gruen);font-size:.92em;font-weight:400;letter-spacing:.02em;line-height:1.3}" +
    ".kfw-kat{line-height:1.4;font-size:.8em;font-weight:400;text-transform:uppercase;letter-spacing:.12em;color:var(--kfw-gruen-hell);margin:0}" +
    ".kfw .kfw-titel{font-family:var(--kfw-titel);font-size:1.6em;font-weight:400;line-height:1.3;color:var(--kfw-gruen);margin:0 0 .75em;padding:0}" +
    ".kfw .kfw-daten{margin:0 0 1em;font-size:14px!important;font-weight:300;line-height:1.6;color:var(--kfw-grau);opacity:.8;letter-spacing:.02em}" +
    ".kfw-trenner{margin:0 .15em;opacity:.6}" +
    ".kfw-wert{white-space:nowrap}" +
    ".kfw .kfw-notiz{font-weight:300;font-size:16.5px!important;line-height:1.45;color:var(--kfw-grau);font-style:normal;margin:0 0 1em}" +
    ".kfw-fuss{margin-top:auto;padding-top:.9em;border-top:1px solid var(--kfw-rand);display:flex;align-items:flex-end;justify-content:space-between;gap:.75em;flex-wrap:wrap}" +
    ".kfw-preis{font-family:var(--kfw-titel);font-size:1.8em;color:var(--kfw-gruen);line-height:1.2}" +
    ".kfw-preis small{font-family:var(--kfw-schrift);font-size:.45em;color:var(--kfw-grau)}" +
    ".kfw-alt{display:block;font-family:var(--kfw-schrift);font-size:.45em;color:var(--kfw-grau);text-decoration:line-through}" +
    ".kfw-rabatt{display:inline-block;background:var(--kfw-rot);color:#fff;font-family:var(--kfw-schrift);font-size:.4em;padding:.2em .45em;margin-left:.4em;vertical-align:middle}" +
    ".kfw .kfw-link{display:inline-block;padding:.75em 1.3em;background:var(--kfw-gruen);border:1px solid var(--kfw-gruen);color:#fff!important;text-decoration:none!important;" +
    "font-family:var(--kfw-titel);font-size:.88em;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;transition:background .15s,color .15s}" +
    ".kfw .kfw-link:hover{background:#fff;color:var(--kfw-gruen)!important}" +
    ".kfw-hinweis{font-size:.8em;color:var(--kfw-grau);margin-top:1.25em}" +
    ".kfw-leer,.kfw-fehler{padding:1em;border:1px dashed var(--kfw-rand);color:var(--kfw-grau);background:#fff}" +
    // Startseiten-Teaser
    ".kfw-t-kopf{text-align:center;margin:0 0 1.75em}" +
    ".kfw .kfw-t-text{font-size:15px;line-height:1.6;margin:.8em auto 0;max-width:36em;text-align:inherit}" +
    ".kfw-t-mehr{text-align:center;margin-top:1.75em}" +
    ".kfw .kfw-mehr{display:inline-flex;align-items:center;gap:.6em;padding:.85em 1.6em;border:1px solid var(--kfw-gruen);color:var(--kfw-gruen)!important;background:transparent;" +
    "text-decoration:none!important;font-size:.85em;text-transform:uppercase;letter-spacing:.14em;transition:background .15s,color .15s}" +
    ".kfw .kfw-mehr::after{content:'\\203A';font-size:1.4em;line-height:1}" +
    ".kfw .kfw-mehr:hover{background:var(--kfw-gruen);color:#fff!important}" +
    ".kfw-t-drei{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}" +
    ".kfw-zeile{display:grid;grid-template-columns:150px 1fr auto;gap:1.25em;align-items:center;background:#fff}" +
    ".kfw-zeile .kfw-bild{margin:0;aspect-ratio:3/2}" +
    ".kfw-zeile .kfw-titel{font-size:1.5em;margin:0 0 .35em}" +
    ".kfw-zeile .kfw-daten{margin:0}" +
    ".kfw-zeile .kfw-oben{margin-bottom:.35em}" +
    ".kfw-zeile-preis{display:flex;flex-direction:column;align-items:flex-end;gap:.6em;text-align:right}" +
    ".kfw-t-liste .kfw-zeile{padding:1.25em 0;border-bottom:1px solid var(--kfw-rand);background:transparent}" +
    ".kfw-t-liste .kfw-zeile:first-child{border-top:1px solid var(--kfw-rand)}" +
    ".kfw-t-liste{max-width:980px;margin:0 auto}" +
    ".kfw-t-buehne{display:grid;grid-template-columns:minmax(220px,1fr) 2.2fr;gap:2.5em;align-items:center;padding:2.5em;background:linear-gradient(135deg,var(--kfw-gruen),#5f8f84)}" +
    ".kfw .kfw-t-buehne .kfw-t-kopf{text-align:left;margin-bottom:1.5em}" +
    ".kfw .kfw-t-buehne .kfw-t-text{color:#fff}" +
    ".kfw-t-buehne .kfw-t-mehr{text-align:left;margin:0}" +
    ".kfw .kfw-t-buehne .kfw-mehr{border-color:#fff;color:#fff!important}" +
    ".kfw .kfw-t-buehne .kfw-mehr:hover{background:#fff;color:var(--kfw-gruen)!important}" +
    ".kfw-t-rechts{display:flex;flex-direction:column;gap:.9em}" +
    ".kfw-t-rechts .kfw-zeile{padding:.9em;grid-template-columns:120px 1fr auto}" +
    ".kfw-preis{white-space:nowrap}" +
    "@media (max-width:760px){.kfw-zeile,.kfw-t-rechts .kfw-zeile{grid-template-columns:96px 1fr;gap:.9em 1em;align-items:start}" +
    ".kfw-zeile .kfw-bild{aspect-ratio:1/1}.kfw-zeile .kfw-titel{font-size:1.25em}" +
    ".kfw-zeile-preis{grid-column:1/-1;flex-direction:row;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.6em;min-width:0}" +
    ".kfw-zeile .kfw-preis{font-size:1.5em}.kfw .kfw-zeile .kfw-link{padding:.7em 1em}" +
    ".kfw-t-buehne{grid-template-columns:1fr;padding:1.5em}}" +
    "@media (max-width:480px){.kfw-liste{grid-template-columns:1fr}}";

  // ---------- Hilfsfunktionen ----------

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function sichererLink(url) {
    return /^https?:\/\//i.test(url || "") ? url : "";
  }

  var euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  function datum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? m[3] + "." + m[2] + "." + m[1] : "";
  }

  // Doppelte Einträge (gleicher Link, Termin und Preis) nur einmal anzeigen.
  function ohneDubletten(offers) {
    var gesehen = {};
    return offers.filter(function (o) {
      var key = [o.link, o.abfahrt, o.preis].join("|");
      if (gesehen[key]) return false;
      gesehen[key] = true;
      return true;
    });
  }

  var SORTIERUNG = {
    preis: function (a, b) { return (a.preis || Infinity) - (b.preis || Infinity); },
    abfahrt: function (a, b) {
      // Angebote ohne festes Datum ans Ende
      return (a.abfahrt || "9999") < (b.abfahrt || "9999") ? -1 : (a.abfahrt || "9999") > (b.abfahrt || "9999") ? 1 : 0;
    },
    rabatt: function (a, b) { return rabatt(b) - rabatt(a); }
  };

  function rabatt(o) {
    return o.orig && o.preis && o.orig > o.preis ? Math.round((1 - o.preis / o.orig) * 100) : 0;
  }

  // Motiv nach Kategorie und Titel (bestimmt die Illustration)
  function iconFuer(o) {
    // Zuerst nach Kategorie entscheiden, dann nach Titel
    return motiv(o.kategorie) || motiv(o.titel) || "schiff";
  }

  function motiv(text) {
    var t = (text || "").toLowerCase();
    if (/solo|single/.test(t)) return "person";
    if (/antarktis|eisberg|polar/.test(t)) return "eisberg";
    if (/grönland|island|fjord/.test(t)) return "fjord";
    if (/spitzbergen|arktis|norweg|alaska|südamerika|anden|patagon/.test(t)) return "berge";
    if (/südsee|karibik|papeete|tahiti|insel|seychell|malediv/.test(t)) return "palme";
    if (/transatlantik|weltreise|panama/.test(t)) return "kompass";
    if (/ostsee|nordsee|küste|archipel|europa|britisch/.test(t)) return "leuchtturm";
    if (/oliven|mittelmeer|kanaren|madeira|adria|ägäis/.test(t)) return "sonne";
    if (/black week|last-minute/.test(t)) return "stern";
    return "";
  }

  function illustration(o) {
    // Kategorie zuerst; hat sie kein eigenes Motiv (z. B. "Black Week"), entscheidet der Titel
    var szene = SZENEN[SZENE_FUER[motiv(o.kategorie)] || SZENE_FUER[motiv(o.titel)]] || SZENEN.schiff;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="320" height="180" fill="' + HG + '"/>' + szene + WELLEN + "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function domain(url) {
    var m = /^https?:\/\/(?:www\.)?([^\/:?#]+)/i.exec(url || "");
    return m ? m[1].toLowerCase() : "";
  }

  function anbieterName(o) {
    // "eisexpeditionen.de (Black Week)" → "eisexpeditionen.de"
    return String(o.anbieter || domain(o.link)).replace(/\s*\(.*\)\s*$/, "");
  }

  function abzeichen(o, modus) {
    var name = anbieterName(o);
    if (!name) return "";
    var datei = LOGOS[domain(o.link)];
    if (modus === "logo") {
      var inhalt = datei
        ? '<img src="' + esc(LOGO_BASIS + datei) + '" alt="' + esc(name) + '" title="' + esc(name) + '" loading="lazy">'
        : '<span class="kfw-mono" title="' + esc(name) + '">' + esc(name.charAt(0).toUpperCase()) + "</span>";
      return '<span class="kfw-logo">' + inhalt + "</span>";
    }
    return '<span class="kfw-anbieter">' + esc(name) + "</span>";
  }

  function bild(o, modus) {
    var foto = sichererLink(o.bild) || sichererLink(BILDER[o.kategorie]);
    var ersatz = illustration(o);
    var img = foto
      ? '<img src="' + esc(foto) + '" alt="' + esc(o.titel) + '" loading="lazy" ' +
        "onerror=\"this.onerror=null;this.src='" + ersatz + "';this.alt=''\">"
      : '<img src="' + ersatz + '" alt="" aria-hidden="true">';
    return '<div class="kfw-bild">' + img + "</div>";
  }

  function datenHtml(o, modus) {
    var daten = [];
    if (o.schiff) daten.push(esc(o.schiff));
    daten.push(o.abfahrt ? esc(datum(o.abfahrt)) : "Termin auf Anfrage");
    if (o.dauer) daten.push(esc(o.dauer) + " Tage");
    if (o.kabine && o.kabine !== "Unbekannt") daten.push(esc(o.kabine) + "kabine");
    if (o.anbieter && modus !== "name") daten.push(esc(o.anbieter));
    return '<div class="kfw-daten">' + daten.map(function (d) { return '<span class="kfw-wert">' + d + "</span>"; })
      .join(' <span class="kfw-trenner">|</span> ') + "</div>";
  }

  function preisHtml(o) {
    var r = rabatt(o);
    return '<div class="kfw-preis">' + (o.preis
      ? (o.orig && r ? '<span class="kfw-alt">statt ' + esc(euro.format(o.orig)) + "</span>" : "") +
        "<small>ab </small>" + esc(euro.format(o.preis)) +
        (r ? '<span class="kfw-rabatt">−' + r + " %</span>" : "") +
        "<small> p. P.</small>"
      : "<small>Preis auf Anfrage</small>") + "</div>";
  }

  function linkHtml(o, text) {
    var link = sichererLink(o.link);
    return link ? '<a class="kfw-link" href="' + esc(link) + '" target="_blank" rel="noopener nofollow sponsored">' + (text || "Zum Angebot") + "</a>" : "";
  }

  function obenHtml(o, modus) {
    return '<div class="kfw-oben' + (modus === "name" ? " kfw-oben-name" : "") + '"><span class="kfw-kat">' +
      esc(o.kategorie || "Sonstiges") + "</span>" + abzeichen(o, modus) + "</div>";
  }

  function karte(o, modus, kompakt) {
    return (
      '<article class="kfw-karte">' +
      bild(o, modus) + obenHtml(o, modus) +
      '<h3 class="kfw-titel">' + esc(o.titel) + "</h3>" +
      datenHtml(o, modus) +
      (o.notiz && !kompakt ? '<div class="kfw-notiz">' + esc(o.notiz) + "</div>" : "") +
      '<div class="kfw-fuss">' + preisHtml(o) + linkHtml(o) + "</div></article>"
    );
  }

  // Kompakte Zeile für die Startseiten-Layouts "buehne" und "liste"
  function zeile(o, modus) {
    return (
      '<article class="kfw-zeile">' + bild(o, modus) +
      '<div class="kfw-zeile-text">' + obenHtml(o, modus) +
      '<h3 class="kfw-titel">' + esc(o.titel) + "</h3>" + datenHtml(o, modus) + "</div>" +
      '<div class="kfw-zeile-preis">' + preisHtml(o) + linkHtml(o) + "</div></article>"
    );
  }



  function init(root) {
    if (root.getAttribute("data-kfw-init")) return;
    root.setAttribute("data-kfw-init", "1");
    root.classList.add("kfw");
    root.innerHTML = '<div class="kfw-leer">Angebote werden geladen …</div>';

    var src = root.getAttribute("data-src") || DEFAULT_SRC;

    fetch(src, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) { aufbauen(root, data); })
      .catch(function (err) {
        root.innerHTML =
          '<div class="kfw-fehler">Die Kreuzfahrt-Angebote konnten gerade nicht geladen werden. Bitte später noch einmal versuchen.</div>';
        if (window.console) console.error("Kreuzfahrt-Widget:", err);
      });
  }

  function aufbauen(root, data) {
    var offers = ohneDubletten((data && data.offers) || []);
    if (root.getAttribute("data-max")) return teaser(root, offers);

    // Kategorien mit Anzahl, nach Häufigkeit sortiert; "Sonstiges" immer am Ende.
    var zaehler = {};
    offers.forEach(function (o) {
      var k = o.kategorie || "Sonstiges";
      o.kategorie = k;
      zaehler[k] = (zaehler[k] || 0) + 1;
    });
    var kategorien = Object.keys(zaehler).sort(function (a, b) {
      if (a === "Sonstiges") return 1;
      if (b === "Sonstiges") return -1;
      return zaehler[b] - zaehler[a] || a.localeCompare(b, "de");
    });

    var start = katAusHash() || root.getAttribute("data-kategorie") || ALLE;
    var modus = root.getAttribute("data-anbieter") || ANBIETER_ANZEIGE;
    var state = { kat: zaehler[start] ? start : ALLE, sort: "preis" };

    root.innerHTML =
      '<div class="kfw-kopf">' +
      (data.stand ? '<span class="kfw-stand">Stand: ' + esc(datum(data.stand) || data.stand) + "</span>" : "<span></span>") +
      '<label class="kfw-stand">Sortieren: <select class="kfw-sort">' +
      '<option value="preis">Preis aufsteigend</option>' +
      '<option value="abfahrt">Abfahrt</option>' +
      '<option value="rabatt">Höchster Rabatt</option>' +
      "</select></label></div>" +
      '<nav aria-label="Kategorien"><ul class="kfw-menu">' +
      [ALLE].concat(kategorien).map(function (k) {
        var n = k === ALLE ? offers.length : zaehler[k];
        return '<li><button type="button" data-kat="' + esc(k) + '">' + esc(k) +
          '<span class="kfw-anzahl">(' + n + ")</span></button></li>";
      }).join("") +
      "</ul></nav>" +
      '<div class="kfw-liste" aria-live="polite"></div>' +
      (data.hinweis ? '<p class="kfw-hinweis">' + esc(data.hinweis) + "</p>" : "");

    var liste = root.querySelector(".kfw-liste");
    var buttons = root.querySelectorAll(".kfw-menu button");
    var select = root.querySelector(".kfw-sort");

    function zeichnen() {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-pressed", buttons[i].getAttribute("data-kat") === state.kat ? "true" : "false");
      }
      var auswahl = offers
        .filter(function (o) { return state.kat === ALLE || o.kategorie === state.kat; })
        .slice()
        .sort(SORTIERUNG[state.sort]);
      liste.innerHTML = auswahl.length
        ? auswahl.map(function (o) { return karte(o, modus); }).join("")
        : '<div class="kfw-leer">Aktuell keine Angebote in dieser Kategorie.</div>';
    }

    root.querySelector(".kfw-menu").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-kat]");
      if (!btn) return;
      state.kat = btn.getAttribute("data-kat");
      zeichnen();
      // Auswahl in der URL merken, damit Kategorien direkt verlinkt werden können
      if (history.replaceState) {
        history.replaceState(null, "", state.kat === ALLE ? location.pathname + location.search
          : "#kategorie=" + encodeURIComponent(state.kat));
      }
    });

    select.addEventListener("change", function () {
      state.sort = select.value;
      zeichnen();
    });

    zeichnen();
  }

  // ---------- Startseiten-Teaser ----------
  // <div data-kreuzfahrt-widget data-max="3" data-layout="karten|buehne|liste"
  //      data-auswahl="rabatt|preis|abfahrt|solo" data-mehr-link="/cruise"
  //      data-text="optionaler Begleittext"></div>
  var AUSWAHL = {
    rabatt: function (a, b) { return rabatt(b) - rabatt(a) || SORTIERUNG.preis(a, b); },
    preis: SORTIERUNG.preis,
    abfahrt: SORTIERUNG.abfahrt,
    solo: function (a, b) { return soloWert(b) - soloWert(a) || SORTIERUNG.preis(a, b); }
  };

  function soloWert(o) {
    var t = ((o.kategorie || "") + " " + (o.notiz || "") + " " + (o.anbieter || "")).toLowerCase();
    return /solo|single|einzelkabinenzuschlag (laut seite )?gering|entfällt|ohne zuschlag/.test(t) ? 1 : 0;
  }

  function teaser(root, offers) {
    var max = Math.max(1, parseInt(root.getAttribute("data-max"), 10) || 3);
    var layout = root.getAttribute("data-layout") || "liste";
    var modus = root.getAttribute("data-anbieter") || ANBIETER_ANZEIGE;
    var heute = new Date().toISOString().slice(0, 10);
    var auswahl = offers
      .filter(function (o) { return !o.abfahrt || o.abfahrt >= heute; })
      .sort(AUSWAHL[root.getAttribute("data-auswahl")] || AUSWAHL.rabatt)
      .slice(0, max);

    var mehr = sichererLink(root.getAttribute("data-mehr-link") || "") || root.getAttribute("data-mehr-link") || "/cruise";
    if (!/^(https?:\/\/|\/)/.test(mehr)) mehr = "/cruise";
    // Überschrift wird bewusst nicht erzeugt – sie wird im Seitenbaukasten (Pixpa) gesetzt.
    var kopf = root.getAttribute("data-text") ? '<div class="kfw-t-kopf"><p class="kfw-t-text">' + esc(root.getAttribute("data-text")) + "</p></div>" : "";
    var knopf = '<div class="kfw-t-mehr"><a class="kfw-mehr" href="' + esc(mehr) + '">Alle Angebote ansehen</a></div>';

    root.classList.add("kfw-teaser", "kfw-layout-" + layout);
    if (layout === "buehne") {
      root.innerHTML = '<div class="kfw-t-buehne"><div class="kfw-t-links">' + kopf + knopf + "</div>" +
        '<div class="kfw-t-rechts">' + auswahl.map(function (o) { return zeile(o, modus); }).join("") + "</div></div>";
    } else if (layout === "liste") {
      root.innerHTML = kopf + '<div class="kfw-t-liste">' + auswahl.map(function (o) { return zeile(o, modus); }).join("") + "</div>" + knopf;
    } else {
      root.innerHTML = kopf + '<div class="kfw-liste kfw-t-drei">' + auswahl.map(function (o) { return karte(o, modus, true); }).join("") + "</div>" + knopf;
    }
  }

  function katAusHash() {
    var m = /kategorie=([^&]+)/.exec(location.hash);
    try { return m ? decodeURIComponent(m[1]) : ""; } catch (e) { return ""; }
  }

  function start() {
    if (!document.getElementById("kfw-styles")) {
      var style = document.createElement("style");
      style.id = "kfw-styles";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    suchen();
    // Baukästen wie Pixpa fügen Seiteninhalte teils erst nachträglich ein
    // (Seitenwechsel ohne Neuladen). Neue Container daher ebenfalls erkennen.
    if (window.MutationObserver && document.body) {
      new MutationObserver(suchen).observe(document.body, { childList: true, subtree: true });
    }
  }

  function suchen() {
    var ziele = document.querySelectorAll("#kreuzfahrt-angebote, [data-kreuzfahrt-widget]");
    for (var i = 0; i < ziele.length; i++) init(ziele[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
