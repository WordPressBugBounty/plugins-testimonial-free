<?php
/**
 * Blocks Helper File.
 *
 * Provides helper functions for block registration and management.
 *
 * @since 4.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Blocks/Includes
 */

namespace ShapedPlugin\TestimonialFree\Blocks\Includes;

use ShapedPlugin\TestimonialFree\Admin\Dashboard\DashboardHelper;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Blocks Helper Class
 *
 * Provides static helper methods for block system.
 *
 * @since 4.0.0
 */
class BlocksHelper {

	/**
	 * Method sp_real_get_all_block_list.
	 *
	 * @param string $block_type is block_type key.
	 * @return array
	 */
	public static function sp_real_get_all_block_list( $block_type = '' ) {
		// child blocks list.
		$child_blocks = array(
			'sp-testimonial-pro/ajax-pagination',
			'sp-testimonial-pro/live-frontend-filter',
			'sp-testimonial-pro/ajax-testimonial-search',
			'sp-testimonial-pro/filter-by-group',
			'sp-testimonial-pro/filter-by-rating',
			'sp-testimonial-pro/review-summary',
		);

		// parent blocks list.
		$parent_blocks = array(
			'sp-testimonial-pro/testimonial-group',
		);

		// main blocks list.
		$main_blocks = array(
			'sp-testimonial-pro/carousel',
			'sp-testimonial-pro/slider',
			'sp-testimonial-pro/grid',
			'sp-testimonial-pro/zigzag-list',
			'sp-testimonial-pro/testimonial-submission-form',
			'sp-testimonial-pro/marquee',
			'sp-testimonial-pro/bento-grid',
			'sp-testimonial-pro/polaroid-grid',
			'sp-testimonial-pro/masonry',
			'sp-testimonial-pro/stacked-cards',
			'sp-testimonial-pro/spotlight',
			'sp-testimonial-pro/video-testimonials',
			'sp-testimonial-pro/review-badge',
			'sp-testimonial-pro/record-video',
		);

		$pro_blocks = array(
			'sp-testimonial-pro/live-frontend-filter',
			'sp-testimonial-pro/ajax-testimonial-search',
			'sp-testimonial-pro/filter-by-group',
			'sp-testimonial-pro/filter-by-rating',
			'sp-testimonial-pro/review-summary',
			'sp-testimonial-pro/marquee',
			'sp-testimonial-pro/bento-grid',
			'sp-testimonial-pro/polaroid-grid',
			'sp-testimonial-pro/masonry',
			'sp-testimonial-pro/stacked-cards',
			'sp-testimonial-pro/spotlight',
			'sp-testimonial-pro/video-testimonials',
			'sp-testimonial-pro/review-badge',
			'sp-testimonial-pro/record-video',
		);

		if ( $block_type ) {
			$block_list = array(
				'parent'     => $parent_blocks,
				'child'      => $child_blocks,
				'main'       => $main_blocks,
				'pro_blocks' => $pro_blocks,
			);
			return $block_list[ $block_type ] ?? array();
		}

		return array_merge( $main_blocks, $parent_blocks, $child_blocks );
	}

	/**
	 * Method sp_real_get_active_block_list.
	 *
	 * @return array
	 */
	public static function sp_real_get_active_block_list() {
		$blocks_visibility = (array) DashboardHelper::get_plugin_settings( 'active_blocks', array() );
		$active_block_list = array();
		foreach ( $blocks_visibility as $block ) {
			if ( $block['show'] ) {
				$active_block_list[] = $block['name'];
			}
		}
		return $active_block_list;
	}

	/**
	 * Method get_template_parts template part file locator.
	 *
	 * Searches for template files in the plugin's template-parts directory.
	 * Returns file path for use with require/include.
	 *
	 * @param string $template_name Template file name (without .php extension).
	 * @return string|false Template path if found, false otherwise.
	 */
	public static function get_template_parts( $template_name ) {
		// Sanitize template name.
		$template_name = sanitize_key( $template_name );
		// Define template directory path.
		$template_dir = SP_TFREE_PATH . 'Blocks/Templates/template-parts/';
		// Build full file path.
		$file_path = $template_dir . $template_name . '.php';

		// Check if file exists.
		if ( ! file_exists( $file_path ) ) {
			return false;
		}

		return $file_path;
	}

	/**
	 * Whether a specific module is enabled in the dashboard.
	 *
	 * Mirrors the editor-side getModulesSettings('<module_key>') gate. When the
	 * module is turned off, its functionality is not output on the
	 * frontend. Defaults to true when the setting was never saved.
	 *
	 * @param string $module_name is module name.
	 * @return bool
	 */
	public static function is_active_module( $module_name ) {
		$modules = (array) DashboardHelper::get_plugin_settings( 'modules', array() );
		return isset( $modules[ $module_name ] ) ? (bool) $modules[ $module_name ]['is_active'] : true;
	}

	/**
	 * Inline SVG markup for a navigation-arrow style.
	 *
	 * Self-contained `<svg>` strings keyed by the `navIconName` value (each with
	 * its native viewBox + `fill="currentColor"` so color/size controls apply).
	 * Unknown keys fall back to `chevron-solid`. The same icon serves both the
	 * prev and next buttons — prev is rotated 180° via CSS.
	 *
	 * @param string $arrow_style Arrow style key (e.g. `chevron-solid`).
	 * @return string Inline SVG markup.
	 */
	public static function get_navigation_arrow_svg_icon( $arrow_style ) {
		$svgs = array(
			'chevron-solid'          => '<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.49995 6.40003L1.89995 0.700024C1.49995 0.300024 0.899951 0.300024 0.499951 0.700024C0.0999514 1.10002 0.0999514 1.70002 0.499951 2.10002L5.39995 7.00003L0.499951 11.9C0.299951 12.1 0.199951 12.3 0.199951 12.6C0.199951 13.2 0.599951 13.6 1.19995 13.6C1.49995 13.6 1.69995 13.5 1.89995 13.3L7.59995 7.60003C7.89995 7.40003 7.89995 6.80002 7.49995 6.40003Z"/></svg>',
			'chevron-outline'        => '<svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.25005 17.25C1.05823 17.25 0.866234 17.1767 0.719797 17.0302C0.426734 16.7372 0.426734 16.2626 0.719797 15.9697L7.68955 8.99998L0.719797 2.03023C0.426734 1.73716 0.426734 1.2626 0.719797 0.969727C1.01286 0.676852 1.48742 0.676664 1.7803 0.969727L9.2803 8.46973C9.57336 8.76279 9.57336 9.23735 9.2803 9.53023L1.7803 17.0302C1.63386 17.1767 1.44186 17.25 1.25005 17.25Z"/></svg>',
			'chevron-bold'           => '<svg width="10" height="15" viewBox="0 0 10 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.35391 8.29922L2.97891 14.6742C2.53828 15.1148 1.82578 15.1148 1.38984 14.6742L0.330469 13.6148C-0.110156 13.1742 -0.110156 12.4617 0.330469 12.0258L4.84922 7.50703L0.330469 2.98828C-0.110156 2.54766 -0.110156 1.83516 0.330469 1.39922L1.38516 0.330469C1.82578 -0.110156 2.53828 -0.110156 2.97422 0.330469L9.34922 6.70547C9.79453 7.14609 9.79453 7.85859 9.35391 8.29922Z"/></svg>',
			'double-chevron'         => '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.34237 13.3157C5.97377 12.9471 5.97377 12.3607 6.34237 11.992L11.3271 7.00727L6.34237 2.0225C5.97377 1.6539 5.97377 1.06746 6.34237 0.698816C6.71097 0.330212 7.29741 0.330212 7.66605 0.698816L13.3126 6.34541C13.6813 6.71401 13.6813 7.30045 13.3126 7.66909L7.66609 13.3157C7.29749 13.676 6.71105 13.676 6.34237 13.3157Z"/><path d="M0.687342 13.3158C0.318738 12.9471 0.318738 12.3607 0.687342 11.9921L5.67211 7.0073L0.687342 2.01421C0.318738 1.64561 0.318738 1.05917 0.687342 0.690529C1.05595 0.321888 1.64238 0.321925 2.01103 0.690529L7.65765 6.33708C8.02626 6.70569 8.02626 7.29213 7.65765 7.66077L2.01103 13.3074C1.65078 13.676 1.05598 13.676 0.687342 13.3158Z"/></svg>',
			'arrow-solid'            => '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.5387 9.5107H11.016L7.83315 12.9702C7.27005 13.5773 7.31411 14.5371 7.92618 15.1002C8.53337 15.6633 9.50048 15.6266 10.0562 15.0194L15.577 9.0212C15.8414 8.7323 15.9712 8.36993 15.9712 8.00024C15.9712 7.63055 15.839 7.26577 15.577 6.97928L10.0562 0.981084C9.49797 0.373899 8.53337 0.334726 7.92618 0.900287C7.31163 1.46339 7.2676 2.42313 7.83315 3.03032L11.016 6.48978H1.5387C0.706242 6.48978 0.0280762 7.16063 0.0280762 8.0004C0.0280762 8.84017 0.70384 9.51102 1.5387 9.51102V9.5107Z"/></svg>',
			'arrow-outline'          => '<svg width="18" height="16" viewBox="0 0 18 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.489 9.73014H2.05357C0.0195797 9.73014 0.0195797 6.28366 2.05357 6.28366H11.489L8.60752 3.40218C7.19503 1.98969 9.62451 -0.496291 11.037 0.972699L17.026 6.96166C17.6475 7.52665 17.6475 8.48715 17.026 9.10864C15.0485 11.0861 13.0145 13.0636 11.037 15.0976C9.62451 16.5101 7.13853 14.0806 8.60752 12.6116L11.489 9.73014ZM13.636 8.82614L9.22902 13.2896C8.60752 13.8546 9.79401 15.0411 10.4155 14.4196C12.393 12.4421 14.427 10.4646 16.4045 8.43065C16.6305 8.20465 16.6305 7.80915 16.4045 7.58315L10.4155 1.59419C9.85051 0.972699 8.66402 2.15919 9.22902 2.78069L13.636 7.18766H2.05357C1.20607 7.18766 1.20607 8.82614 2.05357 8.82614H13.636Z"/></svg>',
			'arrow-minimal'          => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 21.4993C14.372 21.4993 14.244 21.4503 14.146 21.3533C13.951 21.1583 13.951 20.8412 14.146 20.6462L22.793 11.9992L14.147 3.35325C13.952 3.15825 13.952 2.84125 14.147 2.64625C14.342 2.45125 14.659 2.45125 14.854 2.64625L23.854 11.6462C24.049 11.8412 24.049 12.1582 23.854 12.3532L14.854 21.3533C14.756 21.4503 14.628 21.4993 14.5 21.4993Z"/><path d="M23.5 12.4993H0.5C0.224 12.4993 0 12.2753 0 11.9993C0 11.7233 0.224 11.4993 0.5 11.4993H23.5C23.776 11.4993 24 11.7233 24 11.9993C24 12.2753 23.776 12.4993 23.5 12.4993Z"/></svg>',
			'chevron-border-line'    => '<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.10076 6.80249L3.29436 0.996084C2.63187 0.334234 1.56115 0.334718 0.899298 0.996084C0.238376 1.65701 0.236804 2.7293 0.899771 3.39114L5.5082 7.99998L0.899367 12.6088C0.238445 13.2688 0.236873 14.3425 0.89984 15.0034C1.55931 15.6639 2.6312 15.6669 3.29446 15.0034L9.10086 9.19703C9.42123 8.87775 9.59686 8.4528 9.59686 7.99994C9.59686 7.54756 9.42124 7.12212 9.10086 6.80241L9.10076 6.80249ZM8.41654 8.51336L2.61013 14.3198C2.32662 14.6033 1.86683 14.6033 1.58332 14.3198C1.29981 14.0372 1.29981 13.5769 1.58332 13.2934L6.87683 7.99994L1.58332 2.70684C1.29981 2.42379 1.29981 1.96354 1.58332 1.68051C1.86637 1.39652 2.32755 1.39747 2.61013 1.68004L8.41654 7.48644C8.69973 7.77012 8.69973 8.22975 8.41654 8.51325V8.51336Z"/></svg>',
			'double-chevron-outline' => '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.68926 7.33426C4.95939 7.74031 4.95939 8.26528 4.68926 8.66963L0.897206 14.3696C0.747699 14.5939 0.734108 14.8793 0.861528 15.1171C0.98895 15.355 1.2353 15.5011 1.50373 15.5011L3.69877 15.5011C4.3002 15.5011 4.85745 15.2021 5.19044 14.7026L9.01647 8.95166C9.40043 8.37402 9.40043 7.62818 9.01647 7.05054L5.19045 1.2996C4.85745 0.800113 4.3002 0.501098 3.69877 0.501098L1.50373 0.501098C1.2353 0.501098 0.988951 0.648907 0.86153 0.88506C0.734109 1.12121 0.7477 1.40834 0.897208 1.6326L4.68926 7.33426ZM1.31175 1.12631C1.33044 1.09233 1.3865 1.01078 1.50543 1.01078L3.69877 1.01078C4.1286 1.01078 4.52786 1.22485 4.76571 1.58163L8.59174 7.33426C8.86187 7.74031 8.86187 8.26528 8.59174 8.66963L4.76571 14.4206C4.52785 14.779 4.1286 14.9914 3.69877 14.9914L1.50373 14.9914C1.3848 14.9914 1.32874 14.9099 1.31005 14.8759C1.29136 14.8419 1.25568 14.7502 1.32024 14.6516L5.11399 8.95166C5.49795 8.37402 5.49795 7.62818 5.11399 7.05054L1.32194 1.35057C1.25738 1.25203 1.29306 1.16199 1.31175 1.12631Z"/><path d="M10.6204 7.33426C10.8905 7.74031 10.8905 8.26528 10.6204 8.66963L6.82835 14.3696C6.67884 14.5939 6.66525 14.8793 6.79267 15.1171C6.92009 15.355 7.16644 15.5011 7.43487 15.5011L9.62991 15.5011C10.2313 15.5011 10.7886 15.2021 11.1216 14.7026L14.9459 8.95166C15.3299 8.37402 15.3299 7.62818 14.9459 7.05054L11.1199 1.2996C10.7869 0.800113 10.2296 0.501098 9.62821 0.501098L7.43317 0.501098C7.16474 0.501098 6.91839 0.648907 6.79097 0.88506C6.66355 1.12291 6.67714 1.40834 6.82665 1.6326L10.6204 7.33426ZM7.24289 1.12631C7.26158 1.09233 7.31765 1.01078 7.43657 1.01078L9.62991 1.01078C10.0597 1.01078 10.459 1.22485 10.6969 1.58163L14.5229 7.33426C14.793 7.74031 14.793 8.26528 14.5229 8.66963L10.6968 14.4206C10.459 14.779 10.0597 14.9914 9.62991 14.9914L7.43487 14.9914C7.31595 14.9914 7.25988 14.9099 7.24119 14.8759C7.2225 14.8419 7.18683 14.7502 7.25139 14.6516L11.0451 8.95166C11.4291 8.37402 11.4291 7.62818 11.0451 7.05054L7.25309 1.35057C7.18683 1.25203 7.2242 1.16199 7.24289 1.12631Z"/></svg>',
			'triangle-outline'       => '<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.49388 5.55745L1.14605 0.340058C0.985044 0.239429 0.782513 0.233825 0.616667 0.326556C0.450567 0.418268 0.3479 0.592775 0.3479 0.782568V11.2174C0.3479 11.4071 0.450567 11.5817 0.616667 11.6739C0.695896 11.7172 0.782513 11.7391 0.86964 11.7391C0.965682 11.7391 1.06173 11.7126 1.14605 11.6599L9.49388 6.44247C9.64622 6.34694 9.73921 6.18007 9.73921 5.99996C9.73921 5.81985 9.64622 5.65298 9.49388 5.55745ZM1.39138 10.276V1.72389L8.23284 5.99996L1.39138 10.276Z"/></svg>',
			'arrow-line'             => '<svg width="11" height="9" viewBox="0 0 11 9" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10.2911 3.72177L6.79413 0.224809C6.49438 -0.0749362 5.99482 -0.0749362 5.69507 0.224809C5.39533 0.524553 5.39533 1.02412 5.69507 1.32386L7.89318 3.52197H0.799311C0.299745 3.52197 0 3.82172 0 4.22136C0 4.621 0.299745 5.02067 0.799311 5.02067H7.99308L5.69507 7.21878C5.39533 7.51853 5.39533 8.01809 5.69507 8.31784C5.79499 8.41776 5.99482 8.51766 6.19464 8.51766C6.39446 8.51766 6.59428 8.41773 6.6942 8.31784L10.1912 4.82085C10.5908 4.42118 10.5908 4.02151 10.2911 3.72177Z"/></svg>',
			'arrow-send'             => '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M15.7508 9.52841L4.89386 2.09998C4.67615 1.95084 4.3853 1.97026 4.18931 2.14683C3.99331 2.32283 3.94359 2.6114 4.06816 2.84282L7.92238 9.99983L4.06816 17.1574C4.02245 17.2426 4.00017 17.3357 4.00017 17.4283C4.00017 17.5865 4.06531 17.742 4.1893 17.8534C4.38587 18.03 4.67672 18.0488 4.89386 17.9003L15.7508 10.4718C16.0622 10.2581 16.0622 9.74155 15.7508 9.52841ZM9.07493 10.2707C9.12007 10.1861 9.14293 10.093 9.14293 9.99983C9.14293 9.90669 9.12007 9.81355 9.07493 9.72898L6.18927 4.37079L14.4165 9.99983L6.18927 15.6289L9.07493 10.2707Z"/></svg>',
		);

		$key = sanitize_key( (string) $arrow_style );
		if ( ! isset( $svgs[ $key ] ) ) {
			$key = 'chevron-solid';
		}

		return $svgs[ $key ];
	}

	/**
	 * Inline SVG markup for a rating icon.
	 *
	 * Self-contained `<svg>` strings keyed by rating icon name (the
	 * `active`/`inactive` values of the `ratingIconSet` attribute). Each is sized
	 * to `1em` so the parent font-size controls dimensions, and painted via
	 * `currentColor`. Unknown keys return an empty string. Mirrors the editor's
	 * `RATING_ICONS` map in `app/constants/ratingIcons.jsx` — keep both in sync.
	 *
	 * @param string $icon_name Rating icon key (e.g. `star-fill`).
	 * @return string Inline SVG markup, or '' when the key is unknown.
	 */
	public static function get_rating_svg_icon( $icon_name ) {
			// Free rating icons only (styles 1-6). Pro styles (7-16) are removed.
			$paths = array(
				'star-fill'           => 'M8 0.5L10.5306 5.38372L16 6.2424L12.0816 10.1064L12.9524 15.5L8 13.0313L3.07483 15.5L3.91837 10.1064L0 6.2424L5.4966 5.38372L8 0.5Z',
				'star-stroke'         => 'M10.5303 5.38379L16 6.24219L12.082 10.1064L12.9521 15.5L8 13.0312L3.0752 15.5L3.91797 10.1064L0 6.24219L5.49707 5.38379L8 0.5L10.5303 5.38379ZM6.28613 6.47461L2.53809 7.05957L5.19922 9.68359L4.62012 13.3818L7.46191 11.959L7.99805 11.6895L11.3945 13.3818L10.7979 9.68652L13.4629 7.05859L9.74414 6.47461L8.00586 3.11914L6.28613 6.47461Z',
				'star-empty'          => 'M8 0.5L10.5306 5.38372L16 6.2424L12.0816 10.1064L12.9524 15.5L8 13.0313L3.07483 15.5L3.91837 10.1064L0 6.2424L5.4966 5.38372L8 0.5Z',
				'circle-star-empty-1' => 'M14.7998 8C14.7998 4.24399 11.756 1.2002 8 1.2002C4.24399 1.2002 1.2002 4.24399 1.2002 8C1.2002 11.756 4.24399 14.7998 8 14.7998C11.756 14.7998 14.7998 11.756 14.7998 8ZM9.42383 6.34668L12.5 6.83008L10.2959 9.00391L10.7861 12.0371L8 10.6484L5.22949 12.0371L5.7041 9.00391L3.5 6.83008L6.5918 6.34668L8 3.59961L9.42383 6.34668ZM7.24902 7.25684L5.61426 7.51172L6.77148 8.65137L6.51758 10.2725L7.99902 9.53125L9.4873 10.2725L9.22656 8.65332L9.59375 8.29199L10.3857 7.50977L8.76855 7.25684L8.00391 5.7832L7.24902 7.25684ZM16 8C16 12.4187 12.4187 16 8 16C3.58125 16 0 12.4187 0 8C0 3.58125 3.58125 0 8 0C12.4187 0 16 3.58125 16 8Z',
				'circle-star-empty'   => 'M8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16ZM6.55313 6.00937L8 3.175L9.44687 6.00937L12.5906 6.50937L10.3406 8.75937L10.8375 11.9031L8 10.4594L5.1625 11.9031L5.65938 8.75937L3.40938 6.50937L6.55313 6.00937Z',
				'circle-star-fill'    => 'M8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16ZM6.55313 6.00937L8 3.175L9.44687 6.00937L12.5906 6.50937L10.3406 8.75937L10.8375 11.9031L8 10.4594L5.1625 11.9031L5.65938 8.75937L3.40938 6.50937L6.55313 6.00937Z',
				'circle-star-fill-1'  => 'M8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16ZM6.55313 6.00937L8 3.175L9.44687 6.00937L12.5906 6.50937L10.3406 8.75937L10.8375 11.9031L8 10.4594L5.1625 11.9031L5.65938 8.75937L3.40938 6.50937L6.55313 6.00937Z',
				'square-star-empty'   => 'M16 16H0V0H16V16ZM6.35742 6.25586L2.75 6.82812L5.32129 9.4043L4.76758 13L8 11.3545L11.25 13L10.6787 9.4043L13.25 6.82812L9.66113 6.25586L8 3L6.35742 6.25586Z',
				'square-star-fill'    => 'M16 16H0V0H16V16ZM6.35742 6.25586L2.75 6.82812L5.32129 9.4043L4.76758 13L8 11.3545L11.25 13L10.6787 9.4043L13.25 6.82812L9.66113 6.25586L8 3L6.35742 6.25586Z',
				'star-fill-1'         => 'M7.11576 2.22646C7.48653 1.50313 8.51957 1.50086 8.89353 2.22254L10.2986 4.93417C10.445 5.21667 10.7171 5.41265 11.0314 5.462L14.0418 5.93463C14.8528 6.06195 15.1734 7.05816 14.5889 7.63455L12.4498 9.74405C12.2193 9.97128 12.1131 10.296 12.1647 10.6154L12.6427 13.5761C12.7725 14.3801 11.9382 14.9938 11.2093 14.6305L8.44821 13.2541C8.16658 13.1137 7.8353 13.1141 7.55398 13.2551L4.81185 14.6295C4.0849 14.9939 3.25012 14.3844 3.37576 13.581L3.83999 10.6128C3.88973 10.2948 3.78334 9.97224 3.55416 9.74623L1.41412 7.63587C0.829378 7.05923 1.15053 6.06258 1.96193 5.93582L4.99423 5.46212C5.31038 5.41273 5.58381 5.21502 5.72978 4.93027L7.11576 2.22646Z',
				'star-stroke-1'       => 'M7.11601 2.22628C7.48686 1.50321 8.51938 1.50088 8.89335 2.22238L10.2986 4.93429C10.445 5.2166 10.7169 5.41221 11.031 5.46163L14.0418 5.93429C14.8527 6.06161 15.1732 7.05809 14.5887 7.63449L12.45 9.74386C12.2197 9.971 12.1134 10.2956 12.1648 10.615L12.6424 13.5759C12.7641 14.3298 12.0383 14.9166 11.3465 14.6872L11.2088 14.6306L8.44804 13.2536C8.16646 13.1134 7.83475 13.1136 7.55351 13.2546L4.81132 14.6296L4.6746 14.6862C3.9843 14.9168 3.25797 14.334 3.37577 13.5808L3.83964 10.613C3.88313 10.3349 3.80754 10.0531 3.63456 9.83566L3.55448 9.74581L1.41386 7.63546C0.829528 7.05884 1.15059 6.06312 1.96171 5.93624L4.99394 5.46163C5.27046 5.41844 5.51429 5.26205 5.66874 5.03292L5.72929 4.93038L7.11601 2.22628ZM6.79765 5.47726C6.47653 6.10372 5.87501 6.53949 5.17948 6.64816L2.53984 7.06027L4.39628 8.89132C4.9005 9.38855 5.13461 10.0989 5.02519 10.7985L4.62089 13.3816L7.0164 12.1823L7.13359 12.1277C7.68633 11.8901 8.31274 11.8894 8.86601 12.1257L8.9832 12.1804L11.3953 13.3816L10.9803 10.8064C10.8669 10.1036 11.1003 9.38922 11.6072 8.88937L13.4637 7.05831L10.8455 6.64718C10.154 6.53862 9.55524 6.10754 9.2332 5.48605L8.00566 3.11886L6.79765 5.47726Z',
			);

			$path = $paths[ sanitize_key( (string) $icon_name ) ] ?? '';
			if ( ! $path ) {
				return '';
			}
			$svg = '<svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' . $path . '" fill="currentColor"/></svg>';
			return $svg;
	}

	/**
	 * Join a list of class names, dropping empty entries.
	 *
	 * @param array $classes List of class names (may include empty/false items).
	 * @return string Space-separated class string.
	 */
	public static function class_list( $classes ) {
		$classes = array_map( 'strval', (array) $classes );
		$classes = array_map( 'trim', $classes );

		return implode( ' ', array_filter( $classes ) );
	}

	/**
	 * Resolve the reviewer-image fallback source when a testimonial has no avatar.
	 *
	 * Free supports the `none` mode only (caller skips the image entirely).
	 * Mystery-person, smart-text-avatar, gravatar, and custom fallbacks are
	 * Pro-only, so any non-`none` mode resolves to an empty string here.
	 *
	 * @param string $mode Fallback mode.
	 * @param array  $data Testimonial data (unused in free).
	 * @return string Always empty string in free.
	 */
	public static function reviewer_fallback_src( $mode, $data = array() ) {
		unset( $mode, $data );
		return '';
	}

	/**
	 * Resolve an attribute-chosen heading tag against the tags the editor offers.
	 *
	 * `tag_escape()` only strips characters, so `script` or `style` would pass it.
	 *
	 * @param mixed  $tag     Stored tag name.
	 * @param string $default Fallback tag.
	 * @return string
	 */
	public static function safe_heading_tag( $tag, $default = 'span' ) {
		$tag = is_scalar( $tag ) ? strtolower( (string) $tag ) : '';

		return in_array( $tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'div' ), true ) ? $tag : $default;
	}

	/**
	 * Method find_block_attributes_by_id.
	 *
	 * @param int    $post_id is post id.
	 * @param string $unique_id is block unique id.
	 *
	 * @return object
	 */
	public static function find_block_attributes_by_id( $post_id, $unique_id ) {
		// search in post — only one the visitor could see, or the current user may edit.
		$post_id    = absint( $post_id );
		$find_block = null;
		$is_public  = $post_id && 'publish' === get_post_status( $post_id ) && ! post_password_required( $post_id );
		if ( $post_id && ( $is_public || current_user_can( 'edit_post', $post_id ) ) ) {
			$blocks     = parse_blocks( (string) get_post_field( 'post_content', $post_id ) );
			$find_block = self::search_blocks_recursive( $blocks, $unique_id );
		}

		// If not found in post/page, check Site Editor templates.
		if ( ! $find_block ) {
			$args      = array(
				'post_type'      => array( 'wp_template', 'wp_template_part' ),
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			);
			$templates = get_posts( $args );
			foreach ( $templates as $template ) {
				$blocks          = parse_blocks( $template->post_content );
				$template_blocks = self::search_blocks_recursive( $blocks, $unique_id );
				if ( $template_blocks ) {
					$find_block = $template_blocks;
				}
			}
		}
		// find in saved template.
		if ( ! $find_block ) {
			$saved_templates = get_posts(
				array(
					'post_type'      => 'sp_real_template',
					'post_status'    => 'publish',
					'posts_per_page' => -1,
				)
			);
			foreach ( $saved_templates as $saved_template ) {
				$blocks               = parse_blocks( $saved_template->post_content );
				$saved_template_block = self::search_blocks_recursive( $blocks, $unique_id );
				if ( $saved_template_block ) {
					$find_block = $saved_template_block;
					break;
				}
			}
		}
		// If block is still not found, return null.
		if ( ! $find_block ) {
			return null;
		}
		// Get block attributes and set defaults if not defined.
		$saved_attrs = $find_block['attrs'] ?? array();
		$block_name  = $find_block['blockName'] ?? 'sp-testimonial-pro/carousel';
		$block_type  = \WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

		$default_attrs = array();
		if ( $block_type ) {
			$schema = $block_type->get_attributes();
			foreach ( $schema as $attr_key => $attr_schema ) {
				if ( isset( $attr_schema['default'] ) ) {
					$default_attrs[ $attr_key ] = $attr_schema['default'];
				}
			}
		}
		// These variables are being used by included files.
		$attributes = wp_parse_args( $saved_attrs, $default_attrs );
		return $attributes;
	}

	/**
	 * Recursively searches for a block within a parsed block array by block name and uniqueId.
	 *
	 * @param array  $blocks      Array of parsed blocks (from parse_blocks()).
	 * @param string $unique_id   Unique ID of the block instance.
	 *
	 * @return array|null Returns the full block array when found, or null if not found.
	 */
	public static function search_blocks_recursive( $blocks, $unique_id ) {
		if ( ! $blocks || empty( $blocks ) ) {
			return null;
		}
		$our_blocks = self::sp_real_get_all_block_list( 'main' );

		foreach ( $blocks as $block ) {
			if ( in_array( $block['blockName'], $our_blocks, true ) ) {
				if ( isset( $block['attrs']['uniqueId'] ) && $block['attrs']['uniqueId'] === $unique_id ) {
					return $block;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$result = self::search_blocks_recursive( $block['innerBlocks'], $unique_id );
				if ( $result ) {
					return $result;
				}
			}
		}

		return null;
	}

	/**
	 * Check if current page is editor/admin.
	 *
	 * Only checks is_admin(), not wp_is_json_request() which causes issues
	 * with saved templates. Also handles page builders (Elementor, Divi).
	 *
	 * @return bool
	 */
	public static function is_editor_page() {
		$is_editor_page = is_admin();

		// Elementor editor - render blocks in editor mode.
		if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->editor ) && \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			$is_editor_page = false;
		}

		// Divi editor - Visual Builder and AJAX rendering.
		if ( ( isset( $_GET['et_fb'] ) && '1' === $_GET['et_fb'] ) ||
			( isset( $_POST['action'] ) && 'et_fb_ajax_render_shortcode' === $_POST['action'] ) ) {
			$is_editor_page = false;
		}

		return $is_editor_page;
	}
}
