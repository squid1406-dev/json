/*!
 * Reiseziele-Widget für augenliebe-reiseblog.de
 * Teasert die Seiten unterhalb von "Reiseziele" an – nur Text und Linien-Icons, keine Fotos.
 *
 * Einbindung:
 *   <div data-reiseziele data-layout="kacheln"></div>
 *   <script src=".../reiseziele-widget.js"></script>
 *
 * data-layout: "kacheln" (Icon-Kacheln), "regionen" (nach Regionen gruppiert) oder "band" (grünes Textband)
 * data-label:  Beschriftung im Layout "band" (Standard: "Reiseziele")
 */
(function () {
  "use strict";

  // Neue Reiseziele hier ergänzen: Name, Seite, Teaser, Icon (siehe ICONS) und Region (siehe REGIONEN)
  var ZIELE = [
    { name: "Dänemark", url: "/reiseziele/daenemark", text: "Kilometerlange Strände, Hygge-Gefühl und eine entspannte Lebensart", icon: "haeuser", region: "nord" },
    { name: "Deutschland", url: "/reiseziele/deutschland", text: "Von der Ostsee bis zu den Alpen – Reisevielfalt vor der Haustür", icon: "leuchtturm", region: "mitte" },
    { name: "Frankreich", url: "/reiseziele/frankreich", text: "Kultur, Kulinarik und atemberaubende Landschaften", icon: "eiffelturm", region: "sued" },
    { name: "Italien", url: "/reiseziele/italien", text: "La dolce vita und Kunsthighlights ohne Ende", icon: "zypressen", region: "sued" },
    { name: "Norwegen", url: "/reiseziele/norwegen", text: "Fjorde, Mitternachtssonne und Nordlichter", icon: "fjord", region: "nord" },
    { name: "Österreich", url: "/reiseziele/oesterreich", text: "Schnell erreicht und schön im Winter wie im Sommer", icon: "huette", region: "mitte" },
    { name: "Portugal", url: "/reiseziele/portugal", text: "Küstenlandschaften, charmante Städte und kulinarische Genüsse", icon: "sonne", region: "sued" },
    { name: "Schweiz", url: "/reiseziele/schweiz", text: "Unterwegs zwischen weißen Gipfeln und blauen Seen", icon: "gipfel", region: "mitte" },
    { name: "Spitzbergen", url: "/reiseziele/spitzbergen", text: "Verliebt in die Arktis", icon: "eisberg", region: "nord" },
    { name: "USA", url: "/reiseziele/usa", text: "Das Land der unbegrenzten Möglichkeiten", icon: "canyon", region: "amerika" }
  ];

  var REGIONEN = [
    { id: "nord", name: "Skandinavien & Arktis", icon: "fjord" },
    { id: "mitte", name: "Deutschland & Alpen", icon: "gipfel" },
    { id: "sued", name: "Südeuropa", icon: "sonne" },
    { id: "amerika", name: "Nordamerika", icon: "canyon" }
  ];

  // Linien-Icons 32×32, Strichstärke 1.5, Farbe über currentColor
  var ICONS = {
    haeuser: '<path d="M3 27V14l4-5 4 5v13M11 27V12l4-5 4 5v15M19 27V15l4-4 4 4v12"/><path d="M2 27h28"/><path d="M6 18h2M6 22h2M14 16h2M14 20h2M22 19h2M22 23h2"/>',
    leuchtturm: '<path d="M12 27l2-15h4l2 15z"/><path d="M13 8h6v4h-6z"/><path d="M16 4v4"/><path d="M13.2 18h5.6M12.6 23h6.8"/><path d="M5 9l5 1.5M27 9l-5 1.5"/><path d="M3 27c2 0 2-1 4-1s2 1 4 1M21 27c2 0 2-1 4-1s2 1 4 1"/>',
    eiffelturm: '<path d="M16 3v3"/><path d="M14.5 6h3l1 7h-5z"/><path d="M13.5 13h5l1.5 6h-8z"/><path d="M12 19h8l3 8h-3.5a3.5 3.5 0 0 0-7 0H9z"/><path d="M11 13h10M10 19h12"/>',
    zypressen: '<path d="M10 27V24M10 24c-3-3-3-10 0-17 3 7 3 14 0 17z"/><path d="M20 27v-2M20 25c-2.5-2.5-2.5-8 0-13 2.5 5 2.5 10.5 0 13z"/><path d="M26 27v-2M26 25c-1.8-2-1.8-6 0-9 1.8 3 1.8 7 0 9z"/><path d="M3 27h27"/>',
    fjord: '<path d="M2 22l7-11 5 6 4-5 4 4 3-3 5 9"/><path d="M8.5 12l-1.5 2.4 1.6-.4 1.3 1.1"/><path d="M2 26c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/><circle cx="24" cy="7" r="2"/>',
    huette: '<path d="M2 26l9-14 5 7 4-5 10 12z"/><path d="M11 12l-2 3h4z"/><path d="M19 26v-5l3-2.5 3 2.5v5"/><path d="M21.5 26v-2.5h1.5V26"/>',
    sonne: '<circle cx="16" cy="13" r="5"/><path d="M16 3v2.5M8.9 5.9l1.8 1.8M6 13h2.5M23.5 13H26M21.3 7.7l1.8-1.8"/><path d="M2 22c2.3 0 2.3-1.5 4.7-1.5S9 22 11.3 22s2.3-1.5 4.7-1.5 2.3 1.5 4.7 1.5 2.3-1.5 4.6-1.5S27.7 22 30 22"/><path d="M5 27c2 0 2-1.2 4-1.2s2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2"/>',
    gipfel: '<path d="M2 27l10-13 3 3 4-11 11 21z"/><path d="M19 6l-2.6 7.2 2.3-1.2 2.2 2 1.4-2.4"/><path d="M12 14l-2 2.6 2-.6 1.2.8"/>',
    eisberg: '<path d="M7 18l4-8 3 3 4-7 6 12"/><path d="M2 18h28"/><path d="M7 18l3 8h12l4-8"/><path d="M14 22h4"/>',
    canyon: '<path d="M2 27h28"/><path d="M4 27v-9h2v-3h6v3h2v9"/><path d="M18 27V13h2v-3h5v3h2v14"/><circle cx="16" cy="6" r="2"/>'
  };

  var CSS =
    ".rzw{--rzw-gruen:#37685d;--rzw-gruen-hell:#567e72;--rzw-flaeche:#eef3f1;--rzw-rand:#dfe6e3;--rzw-grau:#5f6b68;" +
    "--rzw-titel:'Playfair Display',Georgia,serif;--rzw-schrift:'Josefin Sans',Arial,sans-serif;" +
    "font-family:var(--rzw-schrift);font-weight:300;font-size:16px;color:var(--rzw-grau);margin:0;text-align:left;line-height:1.5}" +
    ".rzw *{box-sizing:border-box;border-radius:0}" +
    ".rzw a{text-decoration:none!important;color:inherit;border:0!important;box-shadow:none!important;background-image:none!important}" +
    ".rzw ul{list-style:none;margin:0;padding:0}.rzw li{list-style:none;margin:0;padding:0}.rzw li::before{content:none}" +
    ".rzw p,.rzw h3{margin:0;padding:0;text-align:left;letter-spacing:normal;text-transform:none}" +
    ".rzw-icon{display:inline-flex;align-items:center;justify-content:center;color:var(--rzw-gruen)}" +
    ".rzw-icon svg{display:block;width:100%;height:100%}" +
    ".rzw .rzw-name{font-family:var(--rzw-titel);font-weight:400;color:var(--rzw-gruen);line-height:1.25}" +
    ".rzw .rzw-text{font-size:14.5px!important;line-height:1.5;color:var(--rzw-grau)}" +
    ".rzw-mehr{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--rzw-gruen-hell)}" +
    ".rzw-mehr::after{content:' \\203A';font-size:1.3em}" +

    // A: Icon-Kacheln
    ".rzw-kacheln ul{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}" +
    ".rzw.rzw-kacheln li{background:#fff;border:1px solid var(--rzw-rand)!important;box-shadow:none!important;transition:border-color .2s}" +
    ".rzw-kacheln a{display:flex;flex-direction:column;height:100%;padding:22px 18px 18px}" +
    ".rzw-kacheln .rzw-icon{width:52px;height:52px;padding:10px;background:var(--rzw-flaeche);margin-bottom:14px;transition:background .2s,color .2s}" +
    ".rzw-kacheln .rzw-name{font-size:1.3em;margin-bottom:.35em}" +
    ".rzw-kacheln .rzw-text{flex:1;margin-bottom:14px}" +
    ".rzw.rzw-kacheln li:hover{border-color:var(--rzw-gruen)!important}" +
    ".rzw-kacheln a:hover .rzw-icon{background:var(--rzw-gruen);color:#fff}" +
    "@media (max-width:1000px){.rzw-kacheln ul{grid-template-columns:repeat(3,1fr)}}" +
    "@media (max-width:620px){.rzw-kacheln ul{grid-template-columns:1fr 1fr;gap:10px}.rzw-kacheln a{padding:16px 14px}" +
    ".rzw-kacheln .rzw-text{display:none}.rzw-kacheln .rzw-name{font-size:1.15em}}" +

    // B: Regionen
    ".rzw-regionen{display:grid;grid-template-columns:repeat(4,1fr);gap:0}" +
    ".rzw-region{padding:4px 26px}" +
    ".rzw-region+.rzw-region{border-left:1px solid var(--rzw-rand)}" +
    ".rzw-region-kopf{display:flex;align-items:center;gap:12px;padding-bottom:14px;margin-bottom:6px;border-bottom:1px solid var(--rzw-rand)}" +
    ".rzw-region-kopf .rzw-icon{width:40px;height:40px;flex:none}" +
    ".rzw .rzw-region-name{font-family:'Great Vibes',cursive;font-size:28px;line-height:1.1;color:var(--rzw-gruen-hell);font-weight:400}" +
    ".rzw-region li{border-bottom:1px dotted #c9d4d0}" +
    ".rzw-region li:last-child{border-bottom:0}" +
    ".rzw-region li a{display:block;padding:12px 0}" +
    ".rzw-region .rzw-name{font-size:1.15em;letter-spacing:.08em;text-transform:uppercase;transition:color .2s}" +
    ".rzw-region .rzw-name::after{content:' \\203A';opacity:0;transition:opacity .2s}" +
    ".rzw-region .rzw-text{display:block;margin-top:2px}" +
    ".rzw-region a:hover .rzw-name::after{opacity:1}" +
    "@media (max-width:1000px){.rzw-regionen{grid-template-columns:1fr 1fr;row-gap:28px}.rzw-region:nth-child(3){border-left:0}}" +
    "@media (max-width:620px){.rzw-regionen{grid-template-columns:1fr}.rzw-region{padding:0}.rzw-region+.rzw-region{border-left:0}}" +

    // C: Textband
    ".rzw-band{background:linear-gradient(135deg,var(--rzw-gruen),#5f8f84);padding:22px 28px;display:flex;align-items:center;gap:28px;flex-wrap:wrap}" +
    ".rzw-band .rzw-label{font-family:'Great Vibes',cursive;font-size:34px;line-height:1;color:#fff;flex:none}" +
    ".rzw-band ul{display:flex;flex-wrap:wrap;align-items:center;gap:10px 34px;flex:1}" +
    ".rzw-band a{font-family:var(--rzw-titel);font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#fff!important;" +
    "text-underline-offset:5px}" +
    ".rzw-band a:hover{text-decoration:underline!important;text-decoration-thickness:1px!important}" +
    "@media (max-width:760px){.rzw-band{flex-direction:column;align-items:flex-start;gap:12px;padding:20px}.rzw-band ul{gap:10px 22px}}";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function icon(name) {
    return '<span class="rzw-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.fjord) + "</svg></span>";
  }

  function kacheln() {
    return "<ul>" + ZIELE.map(function (z) {
      return '<li><a href="' + esc(z.url) + '">' + icon(z.icon) +
        '<h3 class="rzw-name">' + esc(z.name) + "</h3>" +
        '<p class="rzw-text">' + esc(z.text) + "</p>" +
        '<span class="rzw-mehr">Entdecken</span></a></li>';
    }).join("") + "</ul>";
  }

  function regionen() {
    return REGIONEN.map(function (r) {
      var ziele = ZIELE.filter(function (z) { return z.region === r.id; });
      if (!ziele.length) return "";
      return '<div class="rzw-region"><div class="rzw-region-kopf">' + icon(r.icon) +
        '<h3 class="rzw-region-name">' + esc(r.name) + "</h3></div><ul>" +
        ziele.map(function (z) {
          return '<li><a href="' + esc(z.url) + '"><span class="rzw-name">' + esc(z.name) + "</span>" +
            '<span class="rzw-text">' + esc(z.text) + "</span></a></li>";
        }).join("") + "</ul></div>";
    }).join("");
  }

  function band(root) {
    return '<span class="rzw-label">' + esc(root.getAttribute("data-label") || "Reiseziele") + "</span><ul>" +
      ZIELE.map(function (z) { return '<li><a href="' + esc(z.url) + '" title="' + esc(z.text) + '">' + esc(z.name) + "</a></li>"; }).join("") + "</ul>";
  }

  function aufbauen(root) {
    if (root.getAttribute("data-rzw-init")) return;
    root.setAttribute("data-rzw-init", "1");
    var layout = root.getAttribute("data-layout") || "kacheln";
    root.className += " rzw rzw-" + layout;
    root.setAttribute("role", "navigation");
    root.setAttribute("aria-label", "Reiseziele");
    root.innerHTML = layout === "band" ? band(root) : layout === "regionen" ? regionen() : kacheln();
  }

  function suchen() {
    var ziele = document.querySelectorAll("[data-reiseziele]");
    for (var i = 0; i < ziele.length; i++) aufbauen(ziele[i]);
  }

  function start() {
    if (!document.getElementById("rzw-styles")) {
      var style = document.createElement("style");
      style.id = "rzw-styles";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    suchen();
    if (window.MutationObserver && document.body) {
      new MutationObserver(suchen).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
