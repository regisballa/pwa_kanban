<script>
	import IssueCard from './IssueCard.svelte';
	import { moveIssue } from '../issues.svelte.js';
	import { notifyDone } from '../notify.js';

	let { lane, issues } = $props();

	// Farbe pro Lane (ganze Klassennamen, damit Tailwind sie findet)
	const colors = {
		do: { top: 'border-t-lane-do', text: 'text-lane-do' },
		doing: { top: 'border-t-lane-doing', text: 'text-lane-doing' },
		done: { top: 'border-t-lane-done', text: 'text-lane-done' },
		archiv: { top: 'border-t-lane-archiv', text: 'text-lane-archiv' }
	};

	// Summe der Story Points in dieser Lane
	let points = $derived(issues.reduce((sum, i) => sum + i.storyPoints, 0));

	// true, solange ein Issue über dieser Lane schwebt (für die Hervorhebung)
	let hover = $state(false);

	function onDragOver(event) {
		event.preventDefault(); // nötig, sonst ist Drop nicht erlaubt
		hover = true;
	}

	function onDrop(event) {
		event.preventDefault();
		hover = false;
		const id = event.dataTransfer.getData('text/plain');
		const doneIssue = moveIssue(id, lane.id);
		if (doneIssue) notifyDone(doneIssue);
	}
</script>

<section
	class="flex min-h-48 flex-col gap-3 rounded-xl border border-t-[3px] p-3.5 transition sm:min-h-[60vh]
		{colors[lane.id].top}
		{hover ? 'border-dashed border-ink-soft bg-card' : 'border-line bg-card/50'}"
	ondragover={onDragOver}
	ondragleave={() => (hover = false)}
	ondrop={onDrop}
>
	<header class="flex items-baseline gap-2">
		<h2 class="font-serif text-xl font-semibold">{lane.title}</h2>
		<span class="text-sm text-ink-soft">{issues.length}</span>
		<span
			class="ml-auto rounded-full border border-current px-2 py-0.5 text-xs font-semibold {colors[lane.id].text}"
		>
			{points} SP
		</span>
	</header>

	<div class="flex flex-1 flex-col gap-3">
		{#each issues as issue (issue.id)}
			<IssueCard {issue} />
		{:else}
			<p
				class="grid min-h-24 flex-1 place-items-center rounded-xl border border-dashed border-line font-serif italic text-lane-archiv"
			>
				Hierher ziehen
			</p>
		{/each}
	</div>
</section>
