/**
 * Main Blocks Entry Point
 *
 * @since 4.0.0
 * @package TestimonialPro
 */

// Update block category
import { updateCategory } from "@wordpress/blocks";
import { CategoryIcon, ProCategoryIcon } from "../icons";
import { initPatternsLibrary } from "../ready-patterns/ToolbarButton";
import { registerAIBuilder } from "../ai-builder";

// Import editor styles
import "./editor.scss";
// Import frontend and editor both styles.
import "./style.scss";
// Import additional controls
import "../controls/redirect";
// Import saved template sidebar plugin
import "../admin/saved-template-sidebar";

// Update block category icon
updateCategory("sp-testimonial-pro", {
	icon: <CategoryIcon />,
});

updateCategory("sp-testimonial-pro-blocks", {
	icon: <ProCategoryIcon />,
});

// Patterns library deep-link auto-open.
initPatternsLibrary();

// Build with AI: modal host and "Refine with AI" toolbar button.
registerAIBuilder();

// import blocks.
import "./carousel";
import "./slider";
import "./grid";
import "./zigzag-list";
import "./testimonial-group";
import "./ajax-pagination";
import "./testimonial-submission-form";
import "./shortcode";
import "./shortcode-form";
import "./proBlocks";
