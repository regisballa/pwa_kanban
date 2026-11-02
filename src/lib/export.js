// Export-Funktionen: ICS (Kalender), CSV (Tabelle) und Teilen
import { format, addDays, parseISO } from 'date-fns';

// Hilfsfunktion: Text als Datei herunterladen
function download(filename, content, type) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

// Sonderzeichen für ICS maskieren
function icsText(text) {
	return (text ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');
}

// Ein Issue als Kalender-Termin (ganztägig am Due-Date)
export function exportIcs(issue) {
	const due = parseISO(issue.dueDate);
	const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

	const ics = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//PWA Kanban//DE',
		'BEGIN:VEVENT',
		`UID:${issue.id}@pwa-kanban`,
		`DTSTAMP:${stamp}`,
		`DTSTART;VALUE=DATE:${format(due, 'yyyyMMdd')}`,
		`DTEND;VALUE=DATE:${format(addDays(due, 1), 'yyyyMMdd')}`,
		`SUMMARY:${icsText(issue.title)}`,
		`DESCRIPTION:${icsText(`${issue.description}\nStory Points: ${issue.storyPoints}\nPriority: ${issue.priority}`)}`,
		'END:VEVENT',
		'END:VCALENDAR'
	].join('\r\n');

	download(`${issue.title}.ics`, ics, 'text/calendar');
}

// Ein Feld für CSV vorbereiten (Anführungszeichen verdoppeln)
function csvField(value) {
	return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

// Alle Issues als CSV. Semikolon, damit Excel (deutsch) die Spalten erkennt.
export function exportCsv(issues) {
	const header = ['Title', 'Description', 'Lane', 'Created', 'Due', 'Story Points', 'Priority'];
	const rows = issues.map((i) =>
		[
			i.title,
			i.description,
			i.lane,
			format(parseISO(i.createdAt), 'yyyy-MM-dd HH:mm'),
			i.dueDate,
			i.storyPoints,
			i.priority
		]
			.map(csvField)
			.join(';')
	);

	// ﻿ (BOM) sorgt dafür, dass Umlaute in Excel richtig angezeigt werden
	const csv = '﻿' + [header.map(csvField).join(';'), ...rows].join('\r\n');
	download('kanban-issues.csv', csv, 'text/csv');
}

// Ein Issue mit der Web Share API teilen
export async function shareIssue(issue) {
	const text = `${issue.title}\n${issue.description}\nFällig: ${issue.dueDate} · ${issue.storyPoints} SP · ${issue.priority}`;

	if (navigator.share) {
		try {
			await navigator.share({ title: issue.title, text });
		} catch {
			// Benutzer hat abgebrochen, nichts tun
		}
	} else {
		// Fallback für Browser ohne Web Share API (z.B. Firefox Desktop)
		await navigator.clipboard.writeText(text);
		alert('Teilen wird hier nicht unterstützt. Text wurde kopiert.');
	}
}
