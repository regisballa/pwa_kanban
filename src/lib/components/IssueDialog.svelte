<script>
	// format von date-fns, um das heutige Datum ins Formular zu schreiben
	import { format } from 'date-fns';
	// Funktion zum Anlegen eines neuen Issues
	import { addIssue } from '../issues.svelte.js';

	// hier speichern wir das <dialog>-Element (über bind:this unten)
	let dialog;

	// Formularfelder. $state = wenn der Benutzer tippt, ändert sich der Wert
	let title = $state(''); // Titel, am Anfang leer
	let description = $state(''); // Beschreibung, am Anfang leer
	let dueDate = $state(''); // Due-Date, wird beim Öffnen auf heute gesetzt
	let storyPoints = $state(3); // Standard: 3 Story Points
	let priority = $state('medium'); // Standard: mittlere Priorität

	// Farbe der Priority-Buttons, wenn sie ausgewählt sind.
	// peer-checked = Style, wenn das versteckte Radio-Feld davor ausgewählt ist
	const prioChecked = {
		low: 'peer-checked:bg-prio-low peer-checked:border-prio-low',
		medium: 'peer-checked:bg-prio-medium peer-checked:border-prio-medium',
		high: 'peer-checked:bg-prio-high peer-checked:border-prio-high'
	};

	// gleiche Tailwind-Klassen für alle Eingabefelder (so müssen wir sie nur einmal schreiben)
	const input =
		'rounded-lg border border-line bg-paper px-2.5 py-2 text-[15px] normal-case tracking-normal text-ink focus:outline-2 focus:outline-lane-doing';
	// gleiche Klassen für alle Beschriftungen (kleine graue Großbuchstaben)
	const label = 'flex flex-col gap-1 text-xs uppercase tracking-wider text-ink-soft';

	// export = diese Funktion kann die Seite von außen aufrufen (dialog.open())
	export function open() {
		// Due-Date auf heute setzen, Format "2026-11-02" (das braucht <input type="date">)
		dueDate = format(new Date(), 'yyyy-MM-dd');
		// den Dialog als Modal öffnen (Hintergrund wird dunkel und gesperrt)
		dialog.showModal();
	}

	// den Dialog schließen
	function close() {
		dialog.close();
	}

	// läuft, wenn man auf "Anlegen" klickt
	function onSubmit(event) {
		// verhindern, dass der Browser die Seite neu lädt
		event.preventDefault();
		// neues Issue mit den Werten aus dem Formular anlegen
		addIssue({ title, description, dueDate, storyPoints, priority });

		// Formular leeren für das nächste Issue
		title = '';
		description = '';
		storyPoints = 3;
		priority = 'medium';
		// Dialog schließen
		close();
	}
</script>

<!--
	Das HTML <dialog>-Element. bind:this speichert es in der Variable "dialog".
	m-auto = in der Mitte, w-[min(...)] = max. 440px breit, auf dem Handy etwas schmaler.
	backdrop: = Style für den dunklen Hintergrund hinter dem Dialog
-->
<dialog
	bind:this={dialog}
	class="m-auto w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-line bg-card text-ink shadow-2xl backdrop:bg-ink/35 backdrop:backdrop-blur-sm"
>
	<!-- das Formular. onsubmit ruft unsere Funktion onSubmit auf -->
	<form onsubmit={onSubmit} class="flex flex-col gap-4 p-6">
		<h2 class="font-serif text-2xl font-semibold">Neues Issue</h2>

		<!-- Titel. bind:value = Feld und Variable sind verbunden. required = Pflichtfeld -->
		<label class={label}>
			Title
			<input class={input} bind:value={title} required maxlength="80" placeholder="Was ist zu tun?" />
		</label>

		<!-- Beschreibung, mehrzeilig -->
		<label class={label}>
			Description
			<textarea class={input} bind:value={description} rows="3" placeholder="Details"></textarea>
		</label>

		<!-- zwei Felder nebeneinander (grid-cols-2) -->
		<div class="grid grid-cols-2 gap-3">
			<!-- Due-Date mit Kalender-Auswahl vom Browser -->
			<label class={label}>
				Due-Date
				<input class={input} type="date" bind:value={dueDate} required />
			</label>

			<!-- Story Points als Auswahlliste -->
			<label class={label}>
				Story Points
				<select class={input} bind:value={storyPoints}>
					<!-- für jede Zahl eine Option (typische Story-Point-Werte) -->
					{#each [1, 2, 3, 5, 8, 13] as sp}
						<option value={sp}>{sp}</option>
					{/each}
				</select>
			</label>
		</div>

		<!-- Priorität als drei Buttons -->
		<fieldset>
			<legend class="mb-1 text-xs uppercase tracking-wider text-ink-soft">Priority</legend>
			<div class="flex gap-2">
				<!-- für jede Priorität ein Button -->
				{#each ['low', 'medium', 'high'] as p}
					<label class="flex-1">
						<!-- echtes Radio-Feld, aber unsichtbar (sr-only). peer = der span danach reagiert darauf -->
						<input type="radio" class="peer sr-only" bind:group={priority} value={p} />
						<!-- der sichtbare Button. Ist das Radio ausgewählt, wird er farbig -->
						<span
							class="block cursor-pointer rounded-lg border border-line py-2 text-center capitalize peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-ink {prioChecked[p]}"
						>
							{p}
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<!-- Buttons unten rechts (justify-end) -->
		<div class="mt-1 flex justify-end gap-2">
			<!-- type="button" = schickt das Formular NICHT ab, schließt nur -->
			<button
				type="button"
				class="cursor-pointer rounded-full border border-line bg-card px-4 py-2 hover:border-ink-soft"
				onclick={close}
			>
				Abbrechen
			</button>
			<!-- type="submit" = schickt das Formular ab, dann läuft onSubmit -->
			<button type="submit" class="cursor-pointer rounded-full bg-ink px-4 py-2 text-paper hover:bg-ink/85">
				Anlegen
			</button>
		</div>
	</form>
</dialog>
