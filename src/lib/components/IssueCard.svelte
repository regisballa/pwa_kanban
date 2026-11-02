<script>
	// Funktionen von date-fns für Datum und Zeit
	import { format, formatDistanceToNow, parseISO, isPast, endOfDay } from 'date-fns';
	// deutsche Sprache für date-fns (z.B. "Nov." statt "Nov", "vor 5 Minuten")
	import { de } from 'date-fns/locale';
	// Funktion zum Löschen
	import { deleteIssue } from '../issues.svelte.js';
	// Funktionen zum Exportieren und Teilen
	import { exportIcs, shareIssue } from '../export.js';

	// Prop: das Issue, das diese Karte zeigt
	let { issue } = $props();

	// Farbe vom linken Rand je nach Priorität (ganze Klassennamen für Tailwind)
	const prioColor = {
		low: 'border-l-prio-low', // grün-grau
		medium: 'border-l-prio-medium', // gelb
		high: 'border-l-prio-high' // rot
	};

	// Due-Date schön anzeigen, z.B. "5. Nov. 2026"
	let due = $derived(format(parseISO(issue.dueDate), 'd. MMM yyyy', { locale: de }));
	// Erstellungsdatum als Abstand zu jetzt, z.B. "vor 5 Minuten"
	let created = $derived(
		formatDistanceToNow(parseISO(issue.createdAt), { addSuffix: true, locale: de })
	);

	// true, wenn das Due-Date vorbei ist UND das Issue noch nicht fertig ist.
	// endOfDay = Ende vom Tag (23:59), isPast = liegt in der Vergangenheit
	let overdue = $derived(
		isPast(endOfDay(parseISO(issue.dueDate))) && issue.lane !== 'done' && issue.lane !== 'archiv'
	);

	// läuft, wenn man anfängt, die Karte zu ziehen
	function onDragStart(event) {
		// die ID vom Issue mitgeben, damit die Lane beim Drop weiß, welches Issue es ist
		event.dataTransfer.setData('text/plain', issue.id);
		// dem Browser sagen: wir verschieben (nicht kopieren)
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

<!--
	Die Karte. draggable="true" = man kann sie ziehen.
	Wenn overdue: roter Rand und roter Hintergrund (Warnung).
	Sonst: normaler Rand und links die Farbe der Priorität.
	cursor-grab = Hand-Symbol, active:-rotate-1 = beim Ziehen leicht schräg
-->
<article
	class="cursor-grab rounded-xl border border-l-4 px-4 py-3 shadow-sm transition hover:shadow-md active:-rotate-1 active:cursor-grabbing
		{overdue ? 'border-warn bg-warn-bg' : `border-line bg-card ${prioColor[issue.priority]}`}"
	draggable="true"
	ondragstart={onDragStart}
>
	<!-- oben: Titel links, Story Points im Kreis rechts -->
	<header class="flex items-start justify-between gap-2">
		<h3 class="font-serif text-lg font-semibold leading-tight">{issue.title}</h3>
		<!-- size-7 = Breite und Höhe gleich, rounded-full = Kreis -->
		<span
			class="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-paper text-xs font-semibold"
			title="Story Points"
		>
			{issue.storyPoints}
		</span>
	</header>

	<!-- Beschreibung nur zeigen, wenn es eine gibt -->
	{#if issue.description}
		<!-- whitespace-pre-line = Zeilenumbrüche aus dem Text behalten -->
		<p class="mt-1.5 whitespace-pre-line text-sm text-ink-soft">{issue.description}</p>
	{/if}

	<!-- visuelle Warnung, wenn das Due-Date vorbei ist -->
	{#if overdue}
		<p class="mt-2 text-sm font-semibold text-warn">⚠ Überfällig seit {due}</p>
	{/if}

	<!-- Infos: Fälligkeitsdatum und Priorität. dl/dt/dd = Liste mit Begriff und Wert -->
	<dl class="mt-2.5 flex gap-5 text-[13px]">
		<div>
			<dt class="text-[11px] uppercase tracking-wider text-ink-soft">Fällig</dt>
			<dd>{due}</dd>
		</div>
		<div>
			<dt class="text-[11px] uppercase tracking-wider text-ink-soft">Priorität</dt>
			<!-- capitalize = erster Buchstabe groß ("low" wird "Low") -->
			<dd class="capitalize">{issue.priority}</dd>
		</div>
	</dl>

	<!-- unten: Erstellungszeit und Buttons. border-dashed = gestrichelte Linie oben -->
	<footer class="mt-3 flex items-center justify-between border-t border-dashed border-line pt-2">
		<span class="text-xs text-ink-soft">erstellt {created}</span>
		<div class="flex gap-1 text-xs text-ink-soft">
			<!-- Teilen mit der Web Share API -->
			<button class="cursor-pointer rounded px-1.5 py-0.5 hover:bg-paper hover:text-ink" onclick={() => shareIssue(issue)}>
				Teilen
			</button>
			<!-- als Kalender-Datei (.ics) herunterladen -->
			<button class="cursor-pointer rounded px-1.5 py-0.5 hover:bg-paper hover:text-ink" onclick={() => exportIcs(issue)}>
				ICS
			</button>
			<!-- Issue löschen -->
			<button
				class="cursor-pointer rounded px-1.5 py-0.5 hover:bg-paper hover:text-warn"
				onclick={() => deleteIssue(issue.id)}
				title="Löschen"
			>
				×
			</button>
		</div>
	</footer>
</article>
