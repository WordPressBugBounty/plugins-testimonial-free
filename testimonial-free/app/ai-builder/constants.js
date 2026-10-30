/**
 * Build with AI — shared constants.
 */
import { getModulesSettings, isActiveBlock } from "@testimonial/controls";

export const BLOCK_PREFIX = "sp-testimonial-pro/";

export const DEFAULT_BLOCK_NAME = `${BLOCK_PREFIX}carousel`;

// The dashboard Quick Start "Build with AI" button opens a new page with this
// arg set to "true"; the editor opens the modal once and strips it.
export const AUTO_OPEN = {
	QUERY_ARG: "rtp_ai_builder",
	POLL_INTERVAL: 200,
	MAX_ATTEMPTS: 50,
};

// The attributes a block needs before it leaves its first-insert picker —
// mirrors EditorWrapper's `cardDesign` check and `Catalog::LAYOUT_KEYS`. Only
// the five blocks free registers; the Pro-only teasers are never AI blocks.
// The form block has no picker.
export const LAYOUT_KEYS = {
	carousel: ["cardDesign"],
	slider: ["cardDesign"],
	grid: ["cardDesign"],
	"zigzag-list": ["cardDesign"],
	"testimonial-submission-form": [],
};

export const AI_BLOCK_SLUGS = Object.keys(LAYOUT_KEYS);

export const toSlug = (blockName = "") => blockName.replace(BLOCK_PREFIX, "");

export const isAIBlock = (blockName = "") =>
	blockName.startsWith(BLOCK_PREFIX) && AI_BLOCK_SLUGS.includes(toSlug(blockName));

export const isConfiguredBlock = (blockName, attributes = {}) =>
	(LAYOUT_KEYS[toSlug(blockName)] || []).every((key) => Boolean(attributes?.[key]));

export const isAIBuilderEnabled = () =>
	Boolean(window.sp_real_localize_data?.aiBuilder?.enabled) && Boolean(getModulesSettings("ai_block_builder"));

export const isInsertableBlock = (blockName) => isAIBlock(blockName) && isActiveBlock(blockName);
