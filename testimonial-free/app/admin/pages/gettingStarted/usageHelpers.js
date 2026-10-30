/**
 * Pure helpers for the "Testimonial Placements" table.
 *
 * Rows come from BlockUsage::report(): { key, source, location, layouts,
 * names, modified, editUrl }. `source` is "block", "shortcode", "form" or
 * "template"; `location` is null for a view, form or saved template placed
 * nowhere.
 */

import { __ } from "@wordpress/i18n";

/** Rows shown at first, and added by each "Load more". */
export const PAGE_SIZE = 5;

/** Layout names written out before the rest fold behind "+N". */
export const LAYOUT_LIMIT = 5;

/**
 * Display name of a placement source.
 *
 * @param {string} source "block", "shortcode", "form" or "template".
 * @return {string} Name.
 */
export function sourceLabel(source) {
	switch (source) {
		case "shortcode":
			return __("Shortcode", "testimonial-free");
		case "form":
			return __("Form", "testimonial-free");
		case "template":
			return __("Saved Template", "testimonial-free");
		default:
			return __("Block", "testimonial-free");
	}
}

/** Source keys, in the order their filter tabs appear. */
export const SOURCES = ["block", "shortcode", "form", "template"];

/**
 * The filter tabs above the table.
 *
 * Only worth showing when the report mixes sources: with every row of one
 * type, "All" and that type would list the same rows. When shown, only the
 * types present get a tab, so none of them leads to an empty table.
 *
 * @param {Array} rows Report rows.
 * @return {Array<{key: string, label: string}>} Tabs, All first; empty when
 *                                               fewer than two types are used.
 */
export function sourceFilters(rows) {
	const present = new Set((Array.isArray(rows) ? rows : []).map((row) => row?.source));
	const used = SOURCES.filter((source) => present.has(source));

	if (used.length < 2) {
		return [];
	}

	const labels = {
		block: __("Blocks", "testimonial-free"),
		shortcode: __("Shortcodes", "testimonial-free"),
		form: __("Forms", "testimonial-free"),
		template: __("Saved Templates", "testimonial-free"),
	};

	return [
		{ key: "all", label: __("All", "testimonial-free") },
		...used.map((source) => ({ key: source, label: labels[source] })),
	];
}

/**
 * Rows matching the selected source and the search text.
 *
 * The search reads the location's title and type, the view, form or template
 * names, and the layouts, ignoring case.
 *
 * @param {Array}  rows           Report rows.
 * @param {Object} filters
 * @param {string} filters.source "all" or a source key.
 * @param {string} filters.query  Text to find.
 * @return {Array} Matching rows, in report order.
 */
export function filterRows(rows, { source = "all", query = "" } = {}) {
	const needle = String(query || "")
		.trim()
		.toLowerCase();

	return (Array.isArray(rows) ? rows : []).filter((row) => {
		if (source && "all" !== source && row?.source !== source) {
			return false;
		}

		if (!needle) {
			return true;
		}

		return [
			row?.location?.title,
			row?.location?.type,
			...(Array.isArray(row?.names) ? row.names : []),
			...(Array.isArray(row?.layouts) ? row.layouts : []),
		]
			.join(" ")
			.toLowerCase()
			.includes(needle);
	});
}

/**
 * Split layout names into the ones written out and the ones folded away.
 *
 * @param {string[]} layouts Layout names.
 * @param {number}   [limit] How many to write out.
 * @return {{shown: string[], rest: string[]}} Both parts.
 */
export function splitLayouts(layouts, limit = LAYOUT_LIMIT) {
	const list = Array.isArray(layouts) ? layouts : [];

	return { shown: list.slice(0, limit), rest: list.slice(limit) };
}

/**
 * Short, locale-aware date for "Last updated".
 *
 * @param {number} timestamp Unix seconds.
 * @return {string} Date, or a dash when there is none.
 */
export function formatDate(timestamp) {
	if (!timestamp) {
		return "—";
	}

	try {
		return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(
			new Date(timestamp * 1000)
		);
	} catch (error) {
		return "—";
	}
}
