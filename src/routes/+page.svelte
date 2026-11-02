<script>
	import Header from '../lib/components/Header.svelte';
	import Lane from '../lib/components/Lane.svelte';
	import IssueDialog from '../lib/components/IssueDialog.svelte';
	import { board, LANES } from '../lib/issues.svelte.js';
	import { exportCsv } from '../lib/export.js';

	let dialog; // Referenz auf die IssueDialog-Komponente
</script>

<main class="mx-auto max-w-[1300px] px-4 py-8">
	<Header
		total={board.issues.length}
		onAdd={() => dialog.open()}
		onExport={() => exportCsv(board.issues)}
	/>

	<!-- Handy: 1 Spalte, Tablet: 2 Spalten, Desktop: 4 Spalten -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each LANES as lane (lane.id)}
			<Lane {lane} issues={board.issues.filter((i) => i.lane === lane.id)} />
		{/each}
	</div>
</main>

<IssueDialog bind:this={dialog} />
