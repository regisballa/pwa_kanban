<script>
	// format von date-fns, um das heutige Datum schön zu zeigen
	import { format } from 'date-fns';
	// deutsche Sprache für Wochentag und Monat
	import { de } from 'date-fns/locale';

	// Props von der Seite: total = Anzahl Issues, onAdd und onExport = Funktionen für die Buttons
	let { total, onAdd, onExport } = $props();

	// heutiges Datum, z.B. "Montag, 2. November 2026"
	const today = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de });
</script>

<!-- Kopfzeile. flex justify-between = links Titel, rechts Buttons. flex-wrap = am Handy untereinander -->
<header class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
	<!-- linke Seite: Datum, Titel, Anzahl -->
	<div>
		<p class="mb-1 text-sm text-ink-soft">{today}</p>
		<h1 class="font-serif text-5xl font-semibold leading-none tracking-tight">Kanban</h1>
		<p class="mt-2 font-serif italic text-ink-soft">{total} Issues auf dem Board</p>
	</div>

	<!-- rechte Seite: die zwei Buttons -->
	<div class="flex gap-2">
		<!-- CSV Export: ruft die Funktion onExport von der Seite auf -->
		<button
			class="cursor-pointer rounded-full border border-line bg-card px-4 py-2 hover:border-ink-soft"
			onclick={onExport}
		>
			CSV Export
		</button>
		<!-- Neues Issue: ruft onAdd auf, das öffnet den Dialog -->
		<button
			class="cursor-pointer rounded-full bg-ink px-4 py-2 text-paper hover:bg-ink/85"
			onclick={onAdd}
		>
			+ Neues Issue
		</button>
	</div>
</header>
