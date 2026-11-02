# PWA Kanban-Board

Ein Kanban-Board mit SvelteKit. Es läuft komplett im Browser, speichert alles in `localStorage` und funktioniert als installierbare PWA auch offline.

**Live:** _hier den Weblink eintragen_

## Funktionen

- 4 Lanes: Do, Doing, Done, Archiv
- Neues Issue über ein HTML `<dialog>` anlegen
- Issues mit Drag & Drop verschieben (native HTML5 Drag & Drop, keine Library)
- Ein Issue hat: Title, Description, Creation-Date, Due-Date, Story Points, Priority
- Alle Issues und ihre Lane werden in `localStorage` gespeichert
- Summe der Story Points pro Lane
- Rote Warnung, wenn das Due-Date vorbei ist (nur in Do und Doing)
- Notification, wenn ein Issue auf Done gezogen wird
- Ein Issue als `.ics` exportieren (Kalender)
- Ein Issue mit der Web Share API teilen (Fallback: Text kopieren)
- Alle Issues als `.csv` exportieren
- Datum und Zeit mit **date-fns** (deutsches Format, z.B. "vor 5 Minuten")
- PWA: installierbar und offline nutzbar (Service Worker + Manifest)

## Starten

```bash
npm install
npm run dev       # Entwicklung auf http://localhost:5173
npm run build     # fertige Seite im Ordner build/
npm run preview   # Build lokal testen (auch PWA und offline)
```

Hinweis: Der Service Worker läuft nur im Build (`npm run preview`), nicht im Dev-Modus.

## Projektstruktur

```
src/
  app.html                    HTML-Grundgerüst, Link zum Manifest
  app.css                     Tailwind-Import und eigene Farben (@theme)
  service-worker.js           Cache für Offline-Betrieb
  routes/
    +layout.js                ssr = false, prerender = true
    +layout.svelte            lädt app.css
    +page.svelte              die Seite: Header, 4 Lanes, Dialog
  lib/
    issues.svelte.js          Daten ($state) und localStorage
    export.js                 ICS, CSV, Web Share
    notify.js                 Notification bei Done
    components/
      Header.svelte           Titel, Datum, Buttons
      Lane.svelte             eine Spalte, Drop-Ziel, Story-Point-Summe
      IssueCard.svelte        eine Karte, Drag-Start, Warnung, Aktionen
      IssueDialog.svelte      Formular im <dialog>
static/
  manifest.webmanifest        PWA-Manifest
  icon-192.png, icon-512.png  App-Icons
```

## So funktioniert es

**Daten:** In `issues.svelte.js` ist ein `$state`-Objekt mit allen Issues. Jede Funktion (`addIssue`, `moveIssue`, `deleteIssue`) ändert die Daten und ruft danach `save()` auf. `save()` schreibt alles als JSON in `localStorage`. Beim Start lädt `load()` die Daten wieder.

**Drag & Drop:** Die Karte hat `draggable="true"`. Bei `dragstart` wird die ID des Issues in `dataTransfer` gespeichert. Die Lane erlaubt den Drop mit `preventDefault()` in `dragover`. Bei `drop` liest die Lane die ID und ruft `moveIssue` auf.

**Dialog:** `IssueDialog.svelte` hat ein `<dialog>`-Element. Mit `showModal()` wird es geöffnet, mit `close()` geschlossen. Die Seite ruft die Funktion `open()` der Komponente über `bind:this` auf.

**Überfällig:** `isPast(endOfDay(dueDate))` von date-fns prüft, ob der Tag vorbei ist. Dann bekommt die Karte rote Tailwind-Klassen (`bg-warn-bg`, `border-warn`) und einen Warntext.

**Design:** Alles ist mit Tailwind gestylt. Eigene Farben wie `bg-paper` oder `text-ink` sind in `app.css` im `@theme`-Block definiert. Klassen, die von Daten abhängen (Priorität, Lane), stehen als ganze Namen in einem Objekt, damit Tailwind sie beim Build findet.

**PWA:** Das Manifest beschreibt Name, Farben und Icons. Der Service Worker legt beim Installieren alle Dateien in den Cache und liefert sie danach aus dem Cache. So startet die App auch ohne Internet.

## Technik

- SvelteKit mit Svelte 5 (Runes: `$state`, `$derived`, `$props`)
- Tailwind CSS v4 (alle Styles als Klassen direkt in den Komponenten)
- `@sveltejs/adapter-static` (statische Seite)
- date-fns
- Deployment auf Netlify (`netlify.toml`)

## Bekannte Grenzen

- HTML5 Drag & Drop funktioniert auf Touch-Geräten (Handy) nur eingeschränkt.
- Web Share API gibt es nicht in jedem Desktop-Browser. Dann wird der Text in die Zwischenablage kopiert.
