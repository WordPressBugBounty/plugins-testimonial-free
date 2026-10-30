/**
 * Enforce a column count the prompt states outright ("4 columns") when the
 * model's own answer drifted off it.
 */

/**
 * @param {string} promptText User prompt.
 * @return {number|null} Column count clamped to 1-12, or null when none is named.
 */
export function extractColumnCount(promptText) {
	const match = /(\d+)\s*[- ]?\s*columns?\b/i.exec(promptText || "");
	if (!match) {
		return null;
	}
	const columns = parseInt(match[1], 10);
	return Number.isFinite(columns) && columns > 0 ? Math.min(columns, 12) : null;
}

/**
 * Patch the Desktop `columns` value from the prompt. Returns the same
 * reference when the prompt names no count or the block has no `columns`.
 *
 * @param {Object} attributes Attributes to patch.
 * @param {string} promptText User prompt.
 * @return {Object} Patched attributes.
 */
export function applyColumnOverride(attributes, promptText) {
	const columns = extractColumnCount(promptText);
	const current = attributes?.columns;
	if (!columns || !current?.device || current.device.Desktop === columns) {
		return attributes;
	}

	return {
		...attributes,
		columns: {
			...current,
			device: { ...current.device, Desktop: columns },
		},
	};
}
