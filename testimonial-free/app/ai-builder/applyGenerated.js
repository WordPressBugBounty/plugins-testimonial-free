/**
 * Turn a sanitized AI answer into the attribute patch a block receives.
 *
 * Order matters: the design preset first (it moves margins, alignment and
 * columns the way picking the design by hand would), the AI's own values on
 * top of it, then an explicit column count from the prompt last.
 */
import { getBlockType } from "@wordpress/blocks";
import { buildCardDesignAttributes } from "../blocks/shared/cardDesign";
import { applyColumnOverride } from "./columnOverride";

/**
 * Registered defaults for a block type — the base a fresh insert builds on.
 *
 * @param {string} blockName Full block name.
 * @return {Object} Default attribute values.
 */
export const getDefaultAttributes = (blockName) => {
	const defaults = {};
	Object.entries(getBlockType(blockName)?.attributes || {}).forEach(([key, schema]) => {
		if (undefined !== schema?.default) {
			defaults[key] = schema.default;
		}
	});
	return defaults;
};

const changed = (key, generated, base) => undefined !== generated[key] && generated[key] !== base[key];

/**
 * The preset patch for the card design the AI picked or changed — the same
 * patch picking the design by hand writes (cardDesign.js).
 *
 * @param {Object} generated AI attributes.
 * @param {Object} base      Attributes the patch is built against.
 * @return {Object} Preset patch, or an empty object.
 */
const buildPreset = (generated, base) =>
	changed("cardDesign", generated, base) ? buildCardDesignAttributes(generated.cardDesign, base) : {};

/**
 * Build the final attribute patch for a block.
 *
 * @param {Object} options
 * @param {Object} options.generated Sanitized AI attributes.
 * @param {Object} options.base      Current attributes, or the type's defaults.
 * @param {string} options.prompt    User prompt.
 * @return {Object} Attribute patch.
 */
export const buildAttributePatch = ({ generated, base, prompt }) => {
	const preset = buildPreset(generated, base);
	const merged = { ...base, ...preset, ...generated };
	const patch = { ...preset, ...generated };
	const columnChecked = applyColumnOverride(merged, prompt);

	if (columnChecked !== merged) {
		patch.columns = columnChecked.columns;
	}

	return patch;
};
