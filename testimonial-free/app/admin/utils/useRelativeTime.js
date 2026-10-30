/**
 * A "1 minute ago" label that keeps itself current.
 *
 * Recomputed in the browser so the label keeps up between refreshes, on a timer re-scheduled at
 * the next boundary that would change the wording and cleared on unmount (every tab switch).
 */

import { _n, sprintf } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";

const secondsSince = (timestamp) => Math.max(0, Math.floor(Date.now() / 1000) - timestamp);

/**
 * Turn a unix timestamp into a relative label.
 *
 * @param {number} timestamp Unix seconds.
 * @return {string} Relative label, or an empty string when there is nothing to describe.
 */
const formatRelativeTime = (timestamp) => {
	if (!timestamp) {
		return "";
	}

	const seconds = secondsSince(timestamp);

	if (60 > seconds) {
		const count = Math.max(1, seconds);
		/* translators: %d: number of seconds. */
		return sprintf(_n("%d second ago", "%d seconds ago", count, "testimonial-free"), count);
	}

	if (3600 > seconds) {
		const minutes = Math.floor(seconds / 60);
		/* translators: %d: number of minutes. */
		return sprintf(_n("%d minute ago", "%d minutes ago", minutes, "testimonial-free"), minutes);
	}

	if (86400 > seconds) {
		const hours = Math.floor(seconds / 3600);
		/* translators: %d: number of hours. */
		return sprintf(_n("%d hour ago", "%d hours ago", hours, "testimonial-free"), hours);
	}

	const days = Math.floor(seconds / 86400);
	/* translators: %d: number of days. */
	return sprintf(_n("%d day ago", "%d days ago", days, "testimonial-free"), days);
};

/**
 * How long until the relative label would change.
 *
 * @param {number} timestamp Unix seconds.
 * @return {number|null} Milliseconds until the next update, or null once it reads in days.
 */
const getRelativeTimeInterval = (timestamp) => {
	if (!timestamp) {
		return null;
	}

	const seconds = secondsSince(timestamp);

	if (60 > seconds) {
		return 1000;
	}

	if (3600 > seconds) {
		return 30000;
	}

	if (86400 > seconds) {
		return 300000;
	}

	return null;
};

/**
 * @param {number} timestamp Unix seconds of the moment being described.
 * @return {string} The relative label, refreshed as time passes.
 */
const useRelativeTime = (timestamp) => {
	const [label, setLabel] = useState(() => formatRelativeTime(timestamp));

	useEffect(() => {
		let timer;

		// Re-armed after every tick, so the delay grows as the label moves from seconds to hours.
		const tick = () => {
			setLabel(formatRelativeTime(timestamp));

			const delay = getRelativeTimeInterval(timestamp);
			if (null !== delay) {
				timer = setTimeout(tick, delay);
			}
		};

		tick();

		return () => clearTimeout(timer);
	}, [timestamp]);

	return label;
};

export default useRelativeTime;
