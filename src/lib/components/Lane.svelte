<script>
	// Die Karten-Komponente importieren (eine Karte = ein Issue)
	import IssueCard from './IssueCard.svelte';
	// Funktion zum Verschieben eines Issues
	import { moveIssue } from '../issues.svelte.js';
	// Funktion für die Notification bei "Done"
	import { notifyDone } from '../notify.js';

	// Props = Daten, die die Seite an diese Komponente gibt:
	// lane = welche Spalte (z.B. Do), issues = die Issues in dieser Spalte
	let { lane, issues } = $props();

	// Farbe pro Lane. Ganze Klassennamen, damit Tailwind sie beim Build findet
	const colors = {
		do: { top: 'border-t-lane-do', text: 'text-lane-do' }, // grau-blau
		doing: { top: 'border-t-lane-doing', text: 'text-lane-doing' }, // gelb-braun
		done: { top: 'border-t-lane-done', text: 'text-lane-done' }, // grün
		archiv: { top: 'border-t-lane-archiv', text: 'text-lane-archiv' } // grau
	};

	// Summe der Story Points in dieser Lane.
	// $derived rechnet automatisch neu, wenn sich die Issues ändern.
	// reduce: startet bei 0 und addiert die Story Points von jedem Issue
	let points = $derived(issues.reduce((sum, i) => sum + i.storyPoints, 0));

	// true, solange man ein Issue über diese Lane zieht (für die Hervorhebung)
	let hover = $state(false);

	// läuft immer wieder, während man ein Issue über die Lane zieht
	function onDragOver(event) {
		// ohne preventDefault erlaubt der Browser das Ablegen (Drop) nicht
		event.preventDefault();
		// Lane hervorheben
		hover = true;
	}

	// läuft, wenn man das Issue in dieser Lane loslässt
	function onDrop(event) {
		// Standardverhalten vom Browser verhindern (z.B. Link öffnen)
		event.preventDefault();
		// Hervorhebung wieder ausschalten
		hover = false;
		// die ID lesen, die die Karte beim Ziehen mitgegeben hat
		const id = event.dataTransfer.getData('text/plain');
		// Issue in diese Lane verschieben
		const doneIssue = moveIssue(id, lane.id);
		// wenn es jetzt "Done" ist, eine Notification zeigen
		if (doneIssue) notifyDone(doneIssue);
	}
</script>

<!--
	Die Lane (Spalte). Tailwind-Klassen:
	flex flex-col = Inhalt untereinander, gap-3 = Abstand, rounded-xl = runde Ecken,
	border-t-[3px] = dicker Rand oben in der Lane-Farbe.
	Wenn hover true ist: gestrichelter Rand und hellerer Hintergrund.
	ondragover / ondragleave / ondrop = Drag & Drop Events
-->
<section
	class="flex min-h-48 flex-col gap-3 rounded-xl border border-t-[3px] p-3.5 transition sm:min-h-[60vh]
		{colors[lane.id].top}
		{hover ? 'border-dashed border-ink-soft bg-card' : 'border-line bg-card/50'}"
	ondragover={onDragOver}
	ondragleave={() => (hover = false)}
	ondrop={onDrop}
>
	<!-- Kopf der Lane: Name, Anzahl Issues und Summe der Story Points -->
	<header class="flex items-baseline gap-2">
		<!-- Name der Lane, z.B. "Doing" -->
		<h2 class="font-serif text-xl font-semibold">{lane.title}</h2>
		<!-- wie viele Issues in dieser Lane sind -->
		<span class="text-sm text-ink-soft">{issues.length}</span>
		<!-- Summe der Story Points, ml-auto schiebt es nach rechts -->
		<span
			class="ml-auto rounded-full border border-current px-2 py-0.5 text-xs font-semibold {colors[lane.id].text}"
		>
			{points} SP
		</span>
	</header>

	<!-- Liste mit allen Karten dieser Lane -->
	<div class="flex flex-1 flex-col gap-3">
		<!-- für jedes Issue eine Karte zeigen. (issue.id) = Schlüssel, damit Svelte jede Karte erkennt -->
		{#each issues as issue (issue.id)}
			<IssueCard {issue} />
		<!-- {:else} wird gezeigt, wenn die Lane leer ist -->
		{:else}
			<p
				class="grid min-h-24 flex-1 place-items-center rounded-xl border border-dashed border-line font-serif italic text-lane-archiv"
			>
				Hierher ziehen
			</p>
		{/each}
	</div>
</section>
