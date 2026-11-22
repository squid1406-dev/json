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

  var CSS =
    ".kfw{--kfw-akzent:#0b6e8a;--kfw-akzent-hell:#e6f3f6;--kfw-text:#222;--kfw-grau:#666;--kfw-rand:#e3e3e3;--kfw-rot:#c0392b;" +
    "font-family:inherit;color:var(--kfw-text);line-height:1.45;margin:1.5em 0}" +
    ".kfw *{box-sizing:border-box}" +
    ".kfw-kopf{display:flex;flex-wrap:wrap;gap:.75em;align-items:center;justify-content:space-between;margin-bottom:.75em}" +
    ".kfw-stand{font-size:.85em;color:var(--kfw-grau)}" +
    ".kfw-sort{font:inherit;font-size:.9em;padding:.35em .5em;border:1px solid var(--kfw-rand);border-radius:6px;background:#fff;color:inherit}" +
    ".kfw-menu{display:flex;flex-wrap:wrap;gap:.5em;margin:0 0 1.25em;padding:0;list-style:none}" +
    ".kfw-menu button{font:inherit;font-size:.9em;cursor:pointer;padding:.4em .9em;border-radius:999px;" +
    "border:1px solid var(--kfw-akzent);background:#fff;color:var(--kfw-akzent);transition:background .15s,color .15s}" +
    ".kfw-menu button[aria-pressed=false]:hover{background:var(--kfw-akzent-hell)}" +
    ".kfw-menu button[aria-pressed=true]{background:var(--kfw-akzent);color:#fff}" +
    ".kfw-menu .kfw-anzahl{opacity:.75;margin-left:.3em;font-size:.85em}" +
    ".kfw-liste{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1em}" +
    ".kfw-karte{display:flex;flex-direction:column;border:1px solid var(--kfw-rand);border-radius:10px;padding:1em;background:#fff}" +
    ".kfw-kat{align-self:flex-start;font-size:.75em;text-transform:uppercase;letter-spacing:.04em;color:var(--kfw-akzent);" +
    "background:var(--kfw-akzent-hell);border-radius:4px;padding:.15em .5em;margin-bottom:.5em}" +
    ".kfw-titel{font-size:1.05em;font-weight:700;margin:0 0 .4em}" +
    ".kfw-daten{margin:0 0 .75em;padding:0;list-style:none;font-size:.9em;color:var(--kfw-grau)}" +
    ".kfw-daten li{margin:.1em 0}" +
    ".kfw-notiz{font-size:.82em;color:var(--kfw-grau);font-style:italic;margin:0 0 .75em}" +
    ".kfw-fuss{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:.5em;flex-wrap:wrap}" +
    ".kfw-preis{font-size:1.3em;font-weight:700}" +
    ".kfw-preis small{font-size:.6em;font-weight:400;color:var(--kfw-grau)}" +
    ".kfw-alt{display:block;font-size:.8em;color:var(--kfw-grau);text-decoration:line-through;font-weight:400}" +
    ".kfw-rabatt{display:inline-block;background:var(--kfw-rot);color:#fff;font-size:.7em;border-radius:4px;padding:.1em .4em;margin-left:.4em;vertical-align:middle}" +
    ".kfw-link{display:inline-block;padding:.5em 1em;border-radius:6px;background:var(--kfw-akzent);color:#fff!important;text-decoration:none!important;font-size:.9em;white-space:nowrap}" +
    ".kfw-link:hover{opacity:.9}" +
    ".kfw-hinweis{font-size:.8em;color:var(--kfw-grau);margin-top:1em}" +
    ".kfw-leer,.kfw-fehler{padding:1em;border:1px dashed var(--kfw-rand);border-radius:8px;color:var(--kfw-grau)}" +
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

  // ---------- Darstellung ----------

  function karte(o) {
    var daten = [];
    if (o.schiff) daten.push("<li>🚢 " + esc(o.schiff) + "</li>");
    daten.push("<li>📅 " + (o.abfahrt ? esc(datum(o.abfahrt)) : "Termine auf Anfrage") + "</li>");
    if (o.dauer) daten.push("<li>⏱ " + esc(o.dauer) + " Tage</li>");
    if (o.kabine && o.kabine !== "Unbekannt") daten.push("<li>🛏 " + esc(o.kabine) + "kabine</li>");
    if (o.anbieter) daten.push("<li>🏷 " + esc(o.anbieter) + "</li>");

    var r = rabatt(o);
    var preis = o.preis
      ? (o.orig && r ? '<span class="kfw-alt">statt ' + esc(euro.format(o.orig)) + "</span>" : "") +
        "<small>ab </small>" + esc(euro.format(o.preis)) +
        (r ? '<span class="kfw-rabatt">−' + r + " %</span>" : "") +
        "<small> p. P.</small>"
      : "<small>Preis auf Anfrage</small>";

    var link = sichererLink(o.link);

    return (
      '<article class="kfw-karte">' +
      '<span class="kfw-kat">' + esc(o.kategorie || "Sonstiges") + "</span>" +
      '<h3 class="kfw-titel">' + esc(o.titel) + "</h3>" +
      '<ul class="kfw-daten">' + daten.join("") + "</ul>" +
      (o.notiz ? '<p class="kfw-notiz">' + esc(o.notiz) + "</p>" : "") +
      '<div class="kfw-fuss"><div class="kfw-preis">' + preis + "</div>" +
      (link
        ? '<a class="kfw-link" href="' + esc(link) + '" target="_blank" rel="noopener nofollow sponsored">Zum Angebot</a>'
        : "") +
      "</div></article>"
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
        ? auswahl.map(karte).join("")
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
    var ziele = document.querySelectorAll("#kreuzfahrt-angebote, [data-kreuzfahrt-widget]");
    for (var i = 0; i < ziele.length; i++) init(ziele[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
