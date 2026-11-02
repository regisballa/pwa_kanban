<script>
	// die drei Komponenten importieren
	import Header from '../lib/components/Header.svelte'; // Kopfzeile
	import Lane from '../lib/components/Lane.svelte'; // eine Spalte
	import IssueDialog from '../lib/components/IssueDialog.svelte'; // Formular für neue Issues
	// board = alle Issues, LANES = die 4 Spalten
	import { board, LANES } from '../lib/issues.svelte.js';
	// Funktion für den CSV-Export
	import { exportCsv } from '../lib/export.js';

	// hier speichern wir die Dialog-Komponente (über bind:this unten), damit wir dialog.open() aufrufen können
	let dialog;
</script>

<!-- der ganze Inhalt. mx-auto = in der Mitte, max-w = nicht breiter als 1300px -->
<main class="mx-auto max-w-[1300px] px-4 py-8">
	<!-- Kopfzeile. Wir geben die Anzahl Issues und zwei Funktionen mit -->
	<Header
		total={board.issues.length}
		onAdd={() => dialog.open()}
		onExport={() => exportCsv(board.issues)}
	/>

	<!-- Grid für die Lanes. Handy: 1 Spalte, Tablet (sm): 2 Spalten, Desktop (lg): 4 Spalten -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- für jede der 4 Lanes eine Lane-Komponente -->
		{#each LANES as lane (lane.id)}
			<!-- filter: nur die Issues geben, die in dieser Lane sind -->
			<Lane {lane} issues={board.issues.filter((i) => i.lane === lane.id)} />
		{/each}
	</div>
</main>

<!-- der Dialog ist am Anfang unsichtbar. bind:this speichert ihn in "dialog" -->
<IssueDialog bind:this={dialog} />
