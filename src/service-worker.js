// Service Worker: ein Script, das im Hintergrund läuft.
// Es speichert alle Dateien im Cache, damit die App auch ohne Internet läuft.
// SvelteKit findet diese Datei und registriert sie automatisch.

// Listen mit allen Dateien der App (von SvelteKit beim Build erstellt)
import { immutable, assets, prerendered } from '$app/manifest';
// version ändert sich bei jedem Build
import { version } from '$app/env';
// resolve macht aus einem Pfad eine vollständige URL
import { resolve } from '$app/paths';

// Name vom Cache, mit Version. Neuer Build = neuer Cache
const CACHE = `kanban-cache-${version}`;

// Alle Dateien, die wir speichern wollen:
// immutable = JS und CSS, assets = Dateien aus /static, prerendered = index.html
const ASSETS = [...immutable, ...assets, ...prerendered].map((file) => resolve(file.path));

// 1. Installieren: läuft einmal, wenn der Service Worker neu ist
self.addEventListener('install', (event) => {
	// waitUntil: warten, bis alles fertig ist
	event.waitUntil(
		caches
			.open(CACHE) // den Cache öffnen (oder neu erstellen)
			.then((cache) => cache.addAll(ASSETS)) // alle Dateien laden und speichern
			.then(() => self.skipWaiting()) // neuen Service Worker sofort aktiv machen
	);
});

// 2. Aktivieren: alte Caches von früheren Versionen löschen
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys() // die Namen von allen Caches holen
			// alle Caches löschen, die nicht unser aktueller Cache sind
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim()) // offene Seiten sofort übernehmen
	);
});

// 3. Fetch: läuft bei jeder Anfrage der Seite (z.B. JS-Datei, Bild)
self.addEventListener('fetch', (event) => {
	// nur GET-Anfragen behandeln (Dateien laden), alles andere normal lassen
	if (event.request.method !== 'GET') return;

	// wir geben selbst die Antwort
	event.respondWith(
		// zuerst im Cache suchen. ignoreVary: kleine Unterschiede im Header ignorieren
		caches.match(event.request, { ignoreVary: true }).then((cached) => {
			// gefunden: Datei aus dem Cache zurückgeben (funktioniert offline)
			if (cached) return cached;
			// nicht gefunden: aus dem Internet laden.
			// Wenn das nicht geht (offline), die Startseite aus dem Cache zeigen
			return fetch(event.request).catch(() => caches.match(resolve('/')));
		})
	);
});
