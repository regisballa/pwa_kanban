// Service Worker: speichert alle Dateien im Cache, damit die App offline läuft.
// SvelteKit registriert diese Datei automatisch.
import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';
import { resolve } from '$app/paths';

const CACHE = `kanban-cache-${version}`;

// immutable = JS/CSS von Vite, assets = alles aus /static, prerendered = index.html
const ASSETS = [...immutable, ...assets, ...prerendered].map((file) => resolve(file.path));

// 1. Installieren: alle Dateien in den Cache legen
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

// 2. Aktivieren: alte Caches von früheren Versionen löschen
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

// 3. Fetch: zuerst im Cache suchen, sonst aus dem Netz laden
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		caches.match(event.request, { ignoreVary: true }).then((cached) => {
			if (cached) return cached;
			// Offline und nicht im Cache: die Startseite zeigen
			return fetch(event.request).catch(() => caches.match(resolve('/')));
		})
	);
});
