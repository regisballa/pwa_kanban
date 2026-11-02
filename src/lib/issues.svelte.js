// Diese Datei speichert alle Issues an einem Ort.
// Die Endung .svelte.js erlaubt uns, $state hier zu benutzen.

// "browser" ist true, wenn der Code im Browser läuft (nicht beim Build auf dem Server)
import { browser } from '$app/env';

// Unter diesem Namen speichern wir die Daten im localStorage
const STORAGE_KEY = 'kanban-issues';

// Die 4 Spalten (Lanes) vom Board: id für den Code, title für die Anzeige
export const LANES = [
	{ id: 'do', title: 'Do' }, // Aufgaben, die noch offen sind
	{ id: 'doing', title: 'Doing' }, // Aufgaben, an denen man gerade arbeitet
	{ id: 'done', title: 'Done' }, // fertige Aufgaben
	{ id: 'archiv', title: 'Archiv' } // alte Aufgaben, die man aufheben will
];

// Diese Funktion lädt die gespeicherten Issues aus dem localStorage
function load() {
	// Beim Build gibt es kein localStorage, darum eine leere Liste zurückgeben
	if (!browser) return [];
	// try: wenn etwas schiefgeht, springt der Code in catch
	try {
		// Text aus localStorage holen und mit JSON.parse in ein Array umwandeln.
		// ?? [] bedeutet: wenn nichts gespeichert ist, nimm eine leere Liste
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
	} catch {
		// Wenn die Daten kaputt sind, starten wir mit einer leeren Liste
		return [];
	}
}

// $state macht das Objekt reaktiv: ändert sich etwas, zeigt Svelte es sofort an.
// Beim Start füllen wir es mit den Daten aus load()
export const board = $state({ issues: load() });

// Diese Funktion speichert alle Issues im localStorage
function save() {
	// localStorage kann nur Text speichern, darum JSON.stringify (Array zu Text)
	localStorage.setItem(STORAGE_KEY, JSON.stringify(board.issues));
}

// Ein neues Issue anlegen. "data" kommt aus dem Formular im Dialog
export function addIssue(data) {
	// push hängt ein neues Objekt hinten an die Liste an
	board.issues.push({
		id: crypto.randomUUID(), // zufällige, eindeutige ID
		title: data.title, // Titel aus dem Formular
		description: data.description, // Beschreibung aus dem Formular
		createdAt: new Date().toISOString(), // jetzt = Erstellungsdatum, als Text
		dueDate: data.dueDate, // Fälligkeitsdatum, z.B. "2026-11-05"
		storyPoints: Number(data.storyPoints), // als Zahl speichern, damit wir rechnen können
		priority: data.priority, // "low", "medium" oder "high"
		lane: 'do' // ein neues Issue startet immer in "Do"
	});
	// nach jeder Änderung speichern
	save();
}

// Ein Issue in eine andere Lane verschieben (beim Drag & Drop)
export function moveIssue(id, lane) {
	// das Issue mit der passenden ID suchen
	const issue = board.issues.find((i) => i.id === id);
	// nicht gefunden oder schon in dieser Lane: nichts tun
	if (!issue || issue.lane === lane) return null;

	// neue Lane setzen
	issue.lane = lane;
	// speichern
	save();
	// wenn die neue Lane "done" ist, geben wir das Issue zurück (für die Notification)
	return lane === 'done' ? issue : null;
}

// Ein Issue löschen
export function deleteIssue(id) {
	// filter behält alle Issues, deren ID NICHT gleich der gelöschten ID ist
	board.issues = board.issues.filter((i) => i.id !== id);
	// speichern
	save();
}
