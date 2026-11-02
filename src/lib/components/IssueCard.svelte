<script>
	import { format, formatDistanceToNow, parseISO, isPast, endOfDay } from 'date-fns';
	import { de } from 'date-fns/locale';
	import { deleteIssue } from '../issues.svelte.js';
	import { exportIcs, shareIssue } from '../export.js';

	let { issue } = $props();

	// Farbe des linken Rands je nach Priorität
	const prioColor = {
		low: 'border-l-prio-low',
		medium: 'border-l-prio-medium',
		high: 'border-l-prio-high'
	};

	// date-fns: Datum schön anzeigen
	let due = $derived(format(parseISO(issue.dueDate), 'd. MMM yyyy', { locale: de }));
	let created = $derived(
		formatDistanceToNow(parseISO(issue.createdAt), { addSuffix: true, locale: de })
	);

	// Warnung, wenn das Due-Date vorbei ist und das Issue noch offen ist
	let overdue = $derived(
		isPast(endOfDay(parseISO(issue.dueDate))) && issue.lane !== 'done' && issue.lane !== 'archiv'
	);

	// Beim Ziehen die ID mitgeben, damit die Lane weiß, welches Issue es ist
	function onDragStart(event) {
		event.dataTransfer.setData('text/plain', issue.id);
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

<article
	class="cursor-grab rounded-xl border border-l-4 px-4 py-3 shadow-sm transition hover:shadow-md active:-rotate-1 active:cursor-grabbing
		{overdue ? 'border-warn bg-warn-bg' : `border-line bg-card ${prioColor[issue.priority]}`}"
	draggable="true"
	ondragstart={onDragStart}
>
	<header class="flex items-start justify-between gap-2">
		<h3 class="font-serif text-lg font-semibold leading-tight">{issue.title}</h3>
		<span
			class="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-paper text-xs font-semibold"
			title="Story Points"
		>
			{issue.storyPoints}
		</span>
	</header>

	{#if issue.description}
		<p class="mt-1.5 whitespace-pre-line text-sm text-ink-soft">{issue.description}</p>
	{/if}

	{#if overdue}
		<p class="mt-2 text-sm font-semibold text-warn">⚠ Überfällig seit {due}</p>
	{/if}

	<dl class="mt-2.5 flex gap-5 text-[13px]">
		<div>
			<dt class="text-[11px] uppercase tracking-wider text-ink-soft">Fällig</dt>
			<dd>{due}</dd>
		</div>
		<div>
			<dt class="text-[11px] uppercase tracking-wider text-ink-soft">Priorität</dt>
			<dd class="capitalize">{issue.priority}</dd>
		</div>
	</dl>

	<footer class="mt-3 flex items-center justify-between border-t border-dashed border-line pt-2">
		<span class="text-xs text-ink-soft">erstellt {created}</span>
		<div class="flex gap-1 text-xs text-ink-soft">
			<button class="cursor-pointer rounded px-1.5 py-0.5 hover:bg-paper hover:text-ink" onclick={() => shareIssue(issue)}>
				Teilen
			</button>
			<button class="cursor-pointer rounded px-1.5 py-0.5 hover:bg-paper hover:text-ink" onclick={() => exportIcs(issue)}>
				ICS
			</button>
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
