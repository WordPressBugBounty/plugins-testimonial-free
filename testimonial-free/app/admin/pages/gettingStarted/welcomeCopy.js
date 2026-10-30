/**
 * Pure helpers for the dashboard welcome card copy.
 *
 * A first visit (no testimonial section placed anywhere yet) is welcomed to
 * the plugin; a returning author is invited to build the next one.
 */

import { __, sprintf } from "@wordpress/i18n";

/**
 * The greeting line: "Good morning, Saiful 👋", or "Good morning 👋" without
 * a name.
 *
 * @param {string} greeting    "Good morning" / "Good afternoon" / "Good evening".
 * @param {string} displayName The user's display name, ready to show.
 * @return {string} Greeting line.
 */
export function getSalutation(greeting, displayName) {
	if (displayName) {
		return sprintf(
			/* translators: 1: "Good morning" / "Good afternoon" / "Good evening", 2: the user's display name */
			__("%1$s, %2$s 👋", "testimonial-free"),
			greeting,
			displayName
		);
	}

	return sprintf(
		/* translators: %s: "Good morning" / "Good afternoon" / "Good evening" */
		__("%s 👋", "testimonial-free"),
		greeting
	);
}

/**
 * The returning-user lead, naming only the ways to start this site offers —
 * Ready Patterns can be switched off and the AI builder may be unavailable.
 * Whole sentences per case so each one translates on its own.
 *
 * @param {Object}  options
 * @param {boolean} options.patterns Ready Patterns is offered.
 * @param {boolean} options.ai       The AI builder is offered.
 * @return {string} Lead sentence.
 */
function getReturningLead({ patterns, ai }) {
	if (patterns && ai) {
		return __("Start from a ready pattern, let AI build it for you, or start blank.", "testimonial-free");
	}

	if (patterns) {
		return __("Start from a ready pattern, or start blank.", "testimonial-free");
	}

	if (ai) {
		return __("Let AI build it for you, or start blank.", "testimonial-free");
	}

	return __("Start blank in the block editor.", "testimonial-free");
}

/**
 * Title and lead for the welcome card.
 *
 * @param {Object}  options
 * @param {boolean} options.hasPlacements The site already has a testimonial section placed.
 * @param {boolean} options.patterns      Ready Patterns is offered.
 * @param {boolean} options.ai            The AI builder is offered.
 * @return {{title: string, lead: string}} Copy.
 */
export function getWelcomeCopy({ hasPlacements = false, patterns = false, ai = false } = {}) {
	if (hasPlacements) {
		return {
			title: __("Ready to create your next testimonial showcase?", "testimonial-free"),
			lead: getReturningLead({ patterns, ai }),
		};
	}

	return {
		title: __("Welcome to Real Testimonials", "testimonial-free"),
		lead: __(
			"Turn customer praise into trust that wins more sales, in minutes. Choose how you'd like to start.",
			"testimonial-free"
		),
	};
}
