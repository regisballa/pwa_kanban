<script>
	import { format } from 'date-fns';
	import { addIssue } from '../issues.svelte.js';

	let dialog; // Referenz auf das <dialog>-Element

	// Formularfelder
	let title = $state('');
	let description = $state('');
	let dueDate = $state('');
	let storyPoints = $state(3);
	let priority = $state('medium');

	// Farbe der Priority-Buttons, wenn ausgewählt
	const prioChecked = {
		low: 'peer-checked:bg-prio-low peer-checked:border-prio-low',
		medium: 'peer-checked:bg-prio-medium peer-checked:border-prio-medium',
		high: 'peer-checked:bg-prio-high peer-checked:border-prio-high'
	};

	// Gleiche Klassen für alle Eingabefelder
	const input =
		'rounded-lg border border-line bg-paper px-2.5 py-2 text-[15px] normal-case tracking-normal text-ink focus:outline-2 focus:outline-lane-doing';
	const label = 'flex flex-col gap-1 text-xs uppercase tracking-wider text-ink-soft';

	// Diese Funktion kann die Seite von außen aufrufen
	export function open() {
		dueDate = format(new Date(), 'yyyy-MM-dd');
		dialog.showModal();
	}

	function close() {
		dialog.close();
	}

	function onSubmit(event) {
		event.preventDefault();
		addIssue({ title, description, dueDate, storyPoints, priority });

		// Formular leeren
		title = '';
		description = '';
		storyPoints = 3;
		priority = 'medium';
		close();
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-line bg-card text-ink shadow-2xl backdrop:bg-ink/35 backdrop:backdrop-blur-sm"
>
	<form onsubmit={onSubmit} class="flex flex-col gap-4 p-6">
		<h2 class="font-serif text-2xl font-semibold">Neues Issue</h2>

		<label class={label}>
			Title
			<input class={input} bind:value={title} required maxlength="80" placeholder="Was ist zu tun?" />
		</label>

		<label class={label}>
			Description
			<textarea class={input} bind:value={description} rows="3" placeholder="Details"></textarea>
		</label>

		<div class="grid grid-cols-2 gap-3">
			<label class={label}>
				Due-Date
				<input class={input} type="date" bind:value={dueDate} required />
			</label>

			<label class={label}>
				Story Points
				<select class={input} bind:value={storyPoints}>
					{#each [1, 2, 3, 5, 8, 13] as sp}
						<option value={sp}>{sp}</option>
					{/each}
				</select>
			</label>
		</div>

		<fieldset>
			<legend class="mb-1 text-xs uppercase tracking-wider text-ink-soft">Priority</legend>
			<div class="flex gap-2">
				{#each ['low', 'medium', 'high'] as p}
					<label class="flex-1">
						<input type="radio" class="peer sr-only" bind:group={priority} value={p} />
						<span
							class="block cursor-pointer rounded-lg border border-line py-2 text-center capitalize peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-ink {prioChecked[p]}"
						>
							{p}
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<div class="mt-1 flex justify-end gap-2">
			<button
				type="button"
				class="cursor-pointer rounded-full border border-line bg-card px-4 py-2 hover:border-ink-soft"
				onclick={close}
			>
				Abbrechen
			</button>
			<button type="submit" class="cursor-pointer rounded-full bg-ink px-4 py-2 text-paper hover:bg-ink/85">
				Anlegen
			</button>
		</div>
	</form>
</dialog>
