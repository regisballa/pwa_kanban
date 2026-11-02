<script>
	import { format } from 'date-fns';
	import { de } from 'date-fns/locale';

	let { total, onAdd, onExport } = $props();

	const today = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de });
</script>

<header class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
	<div>
		<p class="mb-1 text-sm text-ink-soft">{today}</p>
		<h1 class="font-serif text-5xl font-semibold leading-none tracking-tight">Kanban</h1>
		<p class="mt-2 font-serif italic text-ink-soft">{total} Issues auf dem Board</p>
	</div>

	<div class="flex gap-2">
		<button
			class="cursor-pointer rounded-full border border-line bg-card px-4 py-2 hover:border-ink-soft"
			onclick={onExport}
		>
			CSV Export
		</button>
		<button
			class="cursor-pointer rounded-full bg-ink px-4 py-2 text-paper hover:bg-ink/85"
			onclick={onAdd}
		>
			+ Neues Issue
		</button>
	</div>
</header>
