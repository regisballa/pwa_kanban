// Hier sind alle Issues gespeichert.
// $state macht die Daten reaktiv: wenn sie sich ändern, aktualisiert Svelte die Seite.

import { browser } from '$app/env';

const STORAGE_KEY = 'kanban-issues';

export const LANES = [
	{ id: 'do', title: 'Do' },
	{ id: 'doing', title: 'Doing' },
	{ id: 'done', title: 'Done' },
	{ id: 'archiv', title: 'Archiv' }
];

// Daten aus localStorage laden (oder leere Liste)
function load() {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
	} catch {
		return [];
	}
}

export const board = $state({ issues: load() });

// Alle Issues in localStorage speichern
function save() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(board.issues));
}

// Neues Issue anlegen, es startet immer in "Do"
export function addIssue(data) {
	board.issues.push({
		id: crypto.randomUUID(),
		title: data.title,
		description: data.description,
		createdAt: new Date().toISOString(),
		dueDate: data.dueDate,
		storyPoints: Number(data.storyPoints),
		priority: data.priority,
		lane: 'do'
	});
	save();
}

// Issue in eine andere Lane verschieben.
// Gibt das Issue zurück, wenn es neu auf "done" gesetzt wurde.
export function moveIssue(id, lane) {
	const issue = board.issues.find((i) => i.id === id);
	if (!issue || issue.lane === lane) return null;

	issue.lane = lane;
	save();
	return lane === 'done' ? issue : null;
}

export function deleteIssue(id) {
	board.issues = board.issues.filter((i) => i.id !== id);
	save();
}
