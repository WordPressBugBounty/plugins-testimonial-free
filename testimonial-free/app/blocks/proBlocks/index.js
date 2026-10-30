/**
 * Pro blocks registration.
 *
 * Registers every Pro-only block (bento-grid, marquee, masonry,
 * polaroid-grid, stacked-cards, spotlight, video-testimonials, review-badge,
 * record-video) from a single config loop. Each block renders a static
 * preview via the shared ProBlockEdit; save returns null. Inserting one opens
 * the upgrade dialog (upgrade/) and removes the block again.
 */
import { registerBlockType } from "@wordpress/blocks";
import { isActiveBlock } from "@testimonial/controls";
import ProBlockEdit from "./ProBlockEdit";
import proBlocks from "./config";
import { registerProUpgradeDialog } from "./upgrade/host";

// Editor-level host for the dialog a Pro block opens when it is inserted.
registerProUpgradeDialog();

proBlocks.forEach(({ previewImage, ...metadata }) => {
	if (!isActiveBlock(metadata.name)) {
		return;
	}

	registerBlockType(metadata.name, {
		...metadata,
		edit: ProBlockEdit,
		save: () => null,
	});
});
