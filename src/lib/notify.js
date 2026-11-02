// Notification, wenn ein Issue auf "Done" gesetzt wird

export async function notifyDone(issue) {
	if (!('Notification' in window)) return;

	// Beim ersten Mal fragt der Browser um Erlaubnis
	if (Notification.permission === 'default') {
		await Notification.requestPermission();
	}
	if (Notification.permission !== 'granted') return;

	const title = 'Erledigt ✓';
	const options = { body: `"${issue.title}" ist jetzt Done.`, icon: '/icon-192.png' };

	// Über den Service Worker klappt es auch am Handy (installierte PWA)
	const registration = await navigator.serviceWorker?.getRegistration();
	if (registration) {
		registration.showNotification(title, options);
	} else {
		new Notification(title, options);
	}
}
