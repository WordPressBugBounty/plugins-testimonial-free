<?php
/**
 * List Block
 *
 * @since 4.1.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Blocks/BlockTypes
 */

namespace ShapedPlugin\TestimonialFree\Blocks\BlockTypes;

use ShapedPlugin\TestimonialFree\Blocks\Includes\RenderTestimonialBlock;

defined( 'ABSPATH' ) || exit;

/**
 * List Block Class
 *
 * Registers and renders the testimonial List block — one testimonial per
 * row, the reviewer image beside the content. Shares the Grid block's schema,
 * cards and renderer (`render_grid_blocks()`); only `blockName` differs, so the
 * layout itself is CSS (a one-column flex wrapper and the row divider) emitted
 * by `Styles\SharedCss`.
 *
 * @since 4.1.0
 */
class ZigzagList extends RenderTestimonialBlock {

	/**
	 * Block name (slug) without namespace.
	 *
	 * @var string
	 */
	protected $block_name = 'zigzag-list';
}
