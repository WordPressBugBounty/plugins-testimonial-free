/**
 * Pure helpers for the Saved Templates page (unit-tested without the DOM).
 */

/**
 * Build the render shortcode for a template ID.
 *
 * @param {number|string} id Template post ID.
 * @return {string} e.g. `[sp_real_template id="12"]`.
 */
export function buildTemplateShortcode(id) {
	const numeric = parseInt(id, 10);
	return `[sp_real_template id="${Number.isNaN(numeric) ? 0 : numeric}"]`;
}

/**
 * Case-insensitive title filter. Empty query returns the list unchanged.
 *
 * @param {Array<Object>} items  Template rows.
 * @param {string}        search Search query.
 * @return {Array<Object>} Filtered rows.
 */
export function filterTemplates(items, search) {
	const list = Array.isArray(items) ? items : [];
	const query = String(search || "")
		.trim()
		.toLowerCase();

	if ("" === query) {
		return list;
	}

	return list.filter((item) =>
		String(item.title || "")
			.toLowerCase()
			.includes(query)
	);
}

/**
 * Toggle a single ID in a selection array (immutable).
 *
 * @param {Array<number>} selected Current selected IDs.
 * @param {number}        id       ID to toggle.
 * @return {Array<number>} New selection.
 */
export function toggleSelection(selected, id) {
	const set = new Set(Array.isArray(selected) ? selected : []);

	if (set.has(id)) {
		set.delete(id);
	} else {
		set.add(id);
	}

	return [...set];
}

/**
 * Whether every visible row is selected (and there is at least one).
 *
 * @param {Array<Object>} items    Visible rows.
 * @param {Array<number>} selected Selected IDs.
 * @return {boolean} True when all visible rows are selected.
 */
export function allSelected(items, selected) {
	const list = Array.isArray(items) ? items : [];
	const set = new Set(Array.isArray(selected) ? selected : []);

	return list.length > 0 && list.every((item) => set.has(item.id));
}

/**
 * Select-all handler result: select every visible row, or clear when all are
 * already selected. Preserves selections not in the visible set.
 *
 * @param {Array<Object>} items    Visible rows.
 * @param {Array<number>} selected Current selection.
 * @return {Array<number>} New selection.
 */
export function toggleSelectAll(items, selected) {
	const list = Array.isArray(items) ? items : [];
	const visibleIds = list.map((item) => item.id);

	if (allSelected(list, selected)) {
		const visible = new Set(visibleIds);
		return (selected || []).filter((id) => !visible.has(id));
	}

	return [...new Set([...(selected || []), ...visibleIds])];
}
