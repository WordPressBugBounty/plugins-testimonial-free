<?php
/**
 * Build with AI — block router.
 *
 * On a fresh insert, a prompt that names a block of its own ("a zigzag list",
 * "a review form") is built on that block rather than on the one the modal
 * opened with.
 *
 * @since 4.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Blocks/Includes/AIBuilder
 */

namespace ShapedPlugin\TestimonialFree\Blocks\Includes\AIBuilder;

use ShapedPlugin\TestimonialFree\Blocks\Includes\BlocksHelper;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * BlockRouter Class.
 *
 * @since 4.0.0
 */
class BlockRouter {

	/**
	 * Phrases that name a block, per slug. Longer phrases are listed first.
	 */
	const ALIASES = array(
		'testimonial-submission-form' => array( 'submission form', 'review form', 'testimonial form', 'collect testimonials', 'collect reviews', 'feedback form' ),
		'zigzag-list'                 => array( 'zigzag', 'zig-zag', 'alternating list' ),
		'slider'                      => array( 'slider', 'one at a time' ),
		'grid'                        => array( 'grid' ),
		'carousel'                    => array( 'carousel' ),
	);

	/**
	 * The block a prompt names, or the requested one.
	 *
	 * A prompt that names the requested block keeps it. Otherwise the first
	 * block, in ALIASES order, with a phrase in the prompt wins — only when it
	 * is active on this site.
	 *
	 * @param string $prompt    User prompt.
	 * @param string $requested Requested bare slug.
	 * @return string Bare slug.
	 */
	public static function resolve( $prompt, $requested ) {
		$text = ' ' . strtolower( preg_replace( '/[^a-z0-9\s-]+/i', ' ', $prompt ) ) . ' ';

		if ( self::names( $text, $requested ) ) {
			return $requested;
		}

		$active = BlocksHelper::sp_real_get_active_block_list();
		foreach ( array_keys( self::ALIASES ) as $slug ) {
			if ( in_array( Catalog::PREFIX . $slug, $active, true ) && self::names( $text, $slug ) ) {
				return $slug;
			}
		}

		return $requested;
	}

	/**
	 * Whether the normalized prompt names a block.
	 *
	 * @param string $text Space-padded, lower-case prompt.
	 * @param string $slug Bare slug.
	 * @return bool
	 */
	private static function names( $text, $slug ) {
		$phrases = isset( self::ALIASES[ $slug ] ) ? self::ALIASES[ $slug ] : array();
		foreach ( $phrases as $phrase ) {
			if ( false !== strpos( $text, ' ' . $phrase . ' ' ) ) {
				return true;
			}
		}
		return false;
	}
}
