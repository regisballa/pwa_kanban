// Export-Funktionen: ICS (Kalender), CSV (Tabelle) und Teilen

// Funktionen von date-fns: format (Datum als Text), addDays (Tage dazu), parseISO (Text zu Datum)
import { format, addDays, parseISO } from 'date-fns';

// Hilfsfunktion: einen Text als Datei herunterladen
function download(filename, content, type) {
	// Blob = eine Datei im Speicher, mit Inhalt und Dateityp
	const blob = new Blob([content], { type });
	// eine temporäre URL für diese Datei erstellen
	const url = URL.createObjectURL(blob);
	// einen unsichtbaren Link erstellen
	const a = document.createElement('a');
	// der Link zeigt auf die Datei
	a.href = url;
	// download sagt dem Browser: speichere die Datei mit diesem Namen
	a.download = filename;
	// den Link per Code anklicken, so startet der Download
	a.click();
	// die temporäre URL wieder freigeben (Speicher sparen)
	URL.revokeObjectURL(url);
}

// Sonderzeichen für ICS maskieren, sonst versteht der Kalender den Text falsch
function icsText(text) {
	// ?? '' = wenn text leer ist, nimm einen leeren Text
	return (text ?? '')
		.replace(/\\/g, '\\\\') // Backslash wird zu doppeltem Backslash
		.replace(/;/g, '\\;') // ; bekommt einen Backslash davor
		.replace(/,/g, '\\,') // , bekommt einen Backslash davor
		.replace(/\n/g, '\\n'); // neue Zeile wird zu \n
}

// Ein Issue als Kalender-Termin exportieren (ganzer Tag am Due-Date)
export function exportIcs(issue) {
	// das Due-Date von Text in ein Datum umwandeln
	const due = parseISO(issue.dueDate);
	// Zeitstempel im ICS-Format, z.B. 20261102T074042Z
	const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

	// Die ICS-Datei Zeile für Zeile bauen
	const ics = [
		'BEGIN:VCALENDAR', // Anfang vom Kalender
		'VERSION:2.0', // ICS-Version
		'PRODID:-//PWA Kanban//DE', // Name von unserem Programm
		'BEGIN:VEVENT', // Anfang vom Termin
		`UID:${issue.id}@pwa-kanban`, // eindeutige ID vom Termin
		`DTSTAMP:${stamp}`, // wann die Datei erstellt wurde
		`DTSTART;VALUE=DATE:${format(due, 'yyyyMMdd')}`, // Start: das Due-Date
		`DTEND;VALUE=DATE:${format(addDays(due, 1), 'yyyyMMdd')}`, // Ende: einen Tag später (ganzer Tag)
		`SUMMARY:${icsText(issue.title)}`, // Titel vom Termin
		// Beschreibung mit Text, Story Points und Priorität
		`DESCRIPTION:${icsText(`${issue.description}\nStory Points: ${issue.storyPoints}\nPriority: ${issue.priority}`)}`,
		'END:VEVENT', // Ende vom Termin
		'END:VCALENDAR' // Ende vom Kalender
	].join('\r\n'); // ICS braucht \r\n als Zeilenende

	// Datei herunterladen, Name = Titel vom Issue
	download(`${issue.title}.ics`, ics, 'text/calendar');
}

// Ein Feld für CSV vorbereiten
function csvField(value) {
	// Wert in "..." setzen und " im Text verdoppeln (so will es CSV)
	return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

// Alle Issues als CSV-Datei exportieren
export function exportCsv(issues) {
	// erste Zeile: die Spaltennamen
	const header = ['Title', 'Description', 'Lane', 'Created', 'Due', 'Story Points', 'Priority'];
	// für jedes Issue eine Zeile bauen
	const rows = issues.map((i) =>
		[
			i.title, // Titel
			i.description, // Beschreibung
			i.lane, // Lane, z.B. "doing"
			format(parseISO(i.createdAt), 'yyyy-MM-dd HH:mm'), // Erstellungsdatum schön formatiert
			i.dueDate, // Due-Date
			i.storyPoints, // Story Points
			i.priority // Priorität
		]
			.map(csvField) // jedes Feld vorbereiten
			.join(';') // Felder mit ; trennen (deutsches Excel erkennt das)
	);

	// ﻿ am Anfang: damit Excel Umlaute (ä, ö, ü) richtig zeigt.
	// Dann Kopfzeile und alle Zeilen mit Zeilenumbruch verbinden
	const csv = '﻿' + [header.map(csvField).join(';'), ...rows].join('\r\n');
	// Datei herunterladen
	download('kanban-issues.csv', csv, 'text/csv');
}

// Ein Issue mit der Web Share API teilen (z.B. per WhatsApp am Handy).
// async, weil das Teilen etwas Zeit braucht und wir darauf warten (await)
export async function shareIssue(issue) {
	// der Text, den wir teilen
	const text = `${issue.title}\n${issue.description}\nFällig: ${issue.dueDate} · ${issue.storyPoints} SP · ${issue.priority}`;

	// Gibt es die Web Share API in diesem Browser?
	if (navigator.share) {
		try {
			// das Teilen-Menü vom System öffnen
			await navigator.share({ title: issue.title, text });
		} catch {
			// Benutzer hat abgebrochen, nichts tun
		}
	} else {
		// Kein Web Share (z.B. Firefox am PC): Text in die Zwischenablage kopieren
		await navigator.clipboard.writeText(text);
		// dem Benutzer Bescheid geben
		alert('Teilen wird hier nicht unterstützt. Text wurde kopiert.');
	}
}
