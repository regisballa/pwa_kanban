// Eine Notification zeigen, wenn ein Issue auf "Done" gezogen wird.
// async, weil wir auf die Erlaubnis vom Benutzer warten müssen
export async function notifyDone(issue) {
	// Wenn der Browser keine Notifications kann, sofort aufhören
	if (!('Notification' in window)) return;

	// "default" = der Benutzer wurde noch nie gefragt
	if (Notification.permission === 'default') {
		// den Benutzer um Erlaubnis fragen und auf die Antwort warten
		await Notification.requestPermission();
	}
	// Wenn der Benutzer "Nein" gesagt hat, aufhören
	if (Notification.permission !== 'granted') return;

	// Überschrift der Notification
	const title = 'Erledigt ✓';
	// Text und Bild der Notification
	const options = { body: `"${issue.title}" ist jetzt Done.`, icon: '/icon-192.png' };

	// den Service Worker holen (den gibt es, wenn die App als PWA läuft)
	const registration = await navigator.serviceWorker?.getRegistration();
	if (registration) {
		// über den Service Worker zeigen: so geht es auch am Handy
		registration.showNotification(title, options);
	} else {
		// ohne Service Worker: normale Notification
		new Notification(title, options);
	}
}
