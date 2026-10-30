/**
 * Time-of-day greeting.
 */

import { __ } from "@wordpress/i18n";

/**
 * Return a greeting for the given 24h hour.
 *
 * Pure (hour in, string out) so it is trivially unit-testable; the caller
 * supplies `new Date().getHours()`.
 *
 * @param {number} hour Hour of day, 0–23.
 * @return {string} Localized greeting.
 */
export function getGreeting(hour) {
	if (hour < 12) {
		return __("Good morning", "testimonial-free");
	}

	if (hour < 18) {
		return __("Good afternoon", "testimonial-free");
	}

	return __("Good evening", "testimonial-free");
}

/**
 * A display name with the first letter of each word in capitals, for the
 * greeting ("saiful" → "Saiful", "john doe" → "John Doe"). The rest of each
 * word is left as typed, so "McDonald" or "DeShawn" keep their own capitals.
 *
 * @param {string} name Display name.
 * @return {string} Name for the greeting.
 */
export function capitalizeName(name) {
	return String(name || "")
		.trim()
		.replace(/(^|[\s-])(\p{L})/gu, (match, before, letter) => before + letter.toLocaleUpperCase());
}

/**
 * The name a greeting addresses the user by: the profile's First Name when
 * set, otherwise the first word of the display name ("jahirul islam" →
 * "Jahirul"). A set First Name is used whole, so "Mary Jane" stays intact.
 *
 * @param {string} firstName   Profile First Name; may be empty.
 * @param {string} displayName Display name, the fallback.
 * @return {string} First name, capitalised; empty when neither is set.
 */
export function getFirstName(firstName, displayName) {
	const first = String(firstName || "").trim();

	if (first) {
		return capitalizeName(first);
	}

	return capitalizeName(
		String(displayName || "")
			.trim()
			.split(/\s+/)[0]
	);
}
