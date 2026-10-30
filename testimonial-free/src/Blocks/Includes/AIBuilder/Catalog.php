<?php
/**
 * Build with AI — attribute vocabulary.
 *
 * The single source of what the model may set: which keys exist per block,
 * which values a string may take, and how each value is shaped. The prompt
 * text (catalog_for()) and the validator (ValueValidator) both read from here,
 * so the model is never offered a value the validator would discard.
 *
 * Free plugin rule: every enum below lists only the values the free inspector
 * lets a user pick. A value the inspector shows as locked Pro (card designs
 * 3-6, center/coverflow, fade/creative, Pro pagination and arrow styles, Pro
 * rating icons, …) must never be added here, or Build with AI becomes a way
 * around the lock.
 *
 * @since 4.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Blocks/Includes/AIBuilder
 */

namespace ShapedPlugin\TestimonialFree\Blocks\Includes\AIBuilder;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Catalog Class.
 *
 * @since 4.0.0
 */
class Catalog {

	/**
	 * Block name prefix.
	 */
	const PREFIX = 'sp-testimonial-pro/';

	/**
	 * Every block Build with AI can build, in router preference order.
	 */
	const BLOCKS = array(
		'carousel',
		'slider',
		'grid',
		'zigzag-list',
		'testimonial-submission-form',
	);

	/**
	 * The attributes a block needs before it leaves its first-insert picker,
	 * with the value a fresh AI insert falls back to. Mirrors EditorWrapper's
	 * `cardDesign` check and `LAYOUT_KEYS` in app/ai-builder/constants.js.
	 */
	const LAYOUT_KEYS = array(
		'carousel'    => array( 'cardDesign' => 'design-one' ),
		'slider'      => array( 'cardDesign' => 'design-one' ),
		'grid'        => array( 'cardDesign' => 'design-one' ),
		'zigzag-list' => array( 'cardDesign' => 'list-design-one' ),
	);

	/**
	 * Keys the model never sets: identity, editor plumbing, ids it cannot know,
	 * raw code, Pro-only features whose attribute free still registers, and
	 * behaviour that belongs to the site owner (publishing policy, AJAX submit).
	 */
	const DENIED_KEYS = array(
		'uniqueId',
		'parentId',
		'blockName',
		'template',
		'align',
		'isPreview',
		'fontLists',
		'preloader',
		'hideOnDesktop',
		'hideOnTablet',
		'hideOnMobile',
		'customClassName',
		'customIdName',
		'customCSS',
		'customJS',
		'includesItems',
		'excludesItems',
		'reviewerFallbackCustomImage',
		'aspectRatioCustom',
		'dateFormat',
		'enableLiveFrontendFilter',
		'enableAjaxTestimonialSearch',
		'enableAjaxPagination',
		'enableSEOSchemaMarkup',
		'itemsAlignment',
		'testimonialStatus',
		'ajaxFormSubmission',
		'termsAndConditionLink',
		'submitButtonIcon',
		'uploadIcon',
		'maxFileSize',
		'showFieldsPreview',
	);

	/**
	 * Carousel settings grid and list register (shared attribute group) but
	 * show no control for — the model must not change what the author cannot
	 * see or undo.
	 */
	const SLIDER_ONLY_KEYS = array(
		'carouselStyle',
		'slidingEffect',
		'sliderAutoPlay',
		'carouselSpeed',
		'carouselAutoplayDelay',
		'slideToScroll',
		'enableNavigationArrow',
		'enablePaginationDots',
		'carouselDirection',
		'pauseOnHover',
		'infiniteLoop',
		'tabAndKeyNavigation',
		'mouseWheelControl',
		'freeScrollMode',
	);

	/**
	 * Per-block denied keys, merged with DENIED_KEYS: attributes a block
	 * registers without a control for them.
	 */
	const BLOCK_DENIED_KEYS = array(
		'carousel'    => array( 'rowGap' ),
		'slider'      => array( 'columns', 'columnGap', 'rowGap' ),
		'grid'        => self::SLIDER_ONLY_KEYS,
		// SLIDER_ONLY_KEYS plus the column pair — spelled out, since array
		// spread in a constant expression is not safe on PHP 7.4.
		'zigzag-list' => array(
			'carouselStyle',
			'slidingEffect',
			'sliderAutoPlay',
			'carouselSpeed',
			'carouselAutoplayDelay',
			'slideToScroll',
			'enableNavigationArrow',
			'enablePaginationDots',
			'carouselDirection',
			'pauseOnHover',
			'infiniteLoop',
			'tabAndKeyNavigation',
			'mouseWheelControl',
			'freeScrollMode',
			'columns',
			'columnGap',
		),
	);

	/**
	 * Allowed values for string attributes, shared by every block that has them.
	 *
	 * Free values only. A key whose only free value is its default (for
	 * example carouselStyle, filterBy, titleLength, reviewerFallbackImages) is
	 * left out entirely, which keeps it invisible to the model.
	 */
	const ENUMS = array(
		'slidingEffect'             => array( 'slide', 'cube', 'flip' ),
		'carouselDirection'         => array( 'ltr', 'rtl' ),
		'rowDividerStyle'           => array( 'none', 'solid', 'dashed', 'dotted', 'double' ),
		'cardDesign'                => array( 'design-one', 'design-two' ),
		'cardAlignment'             => array( 'left', 'center', 'right' ),
		'cardHoverEffect'           => array( 'none', 'scale-up', 'scale-down', 'slide-up', 'slide-down', 'slide-left', 'slide-right' ),
		'orderBy'                   => array( 'date', 'title', 'modified', 'ID' ),
		'order'                     => array( 'ASC', 'DESC' ),
		'titleTag'                  => array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span' ),
		'nameHtmlTag'               => array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span' ),
		'imageResolution'           => array( 'original', 'thumbnail', 'medium', 'large' ),
		'aspectRatio'               => array( '1:1', '16:9', '4:3', '3:2', '21:9', 'original' ),
		'navIconName'               => array( 'chevron-solid', 'chevron-outline', 'chevron-bold', 'double-chevron', 'arrow-solid', 'arrow-outline', 'arrow-minimal', 'chevron-border-line', 'double-chevron-outline', 'triangle-outline', 'arrow-line', 'arrow-send' ),
		'navIconPosition'           => array( 'vertical_center', 'top_left', 'top_center', 'top_right', 'bottom_left', 'bottom_center', 'bottom_right' ),
		'paginationStyle'           => array( 'dots', 'stepper' ),
		'inputStyle'                => array( 'style-one', 'style-two' ),
		'submitButtonIconPosition'  => array( 'left', 'right' ),
		'submitButtonWidth'         => array( 'fullWidth', 'auto' ),
		'submitButtonAlignment'     => array( 'left', 'center', 'right' ),
		'submissionMessagePosition' => array( 'top', 'bottom' ),
		'textAlignment'             => array( 'left', 'center', 'right' ),
		'limit'                     => array( '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '18', '20', '24', '30' ),
	);

	/**
	 * Per-block enum overrides, where a block offers a different set.
	 */
	const BLOCK_ENUMS = array(
		'zigzag-list' => array(
			'cardDesign' => array( 'list-design-one' ),
		),
	);

	/**
	 * String attributes that take free text (labels and messages).
	 */
	const FREE_TEXT = array(
		'submitButtonLabel',
		'successMessage',
		'errorMessage',
		'requiredNoticeLabel',
		'termsAndConditionLabel',
		'termsAndConditionAnchorLabel',
	);

	/**
	 * Allowed values for leaves inside shaped objects.
	 */
	const LEAF_ENUMS = array(
		'border.style'    => array( 'none', 'solid', 'dashed', 'dotted', 'double' ),
		'shadow.unit'     => array( 'Outset', 'Inset' ),
		'bg.style'        => array( 'solid', 'gradient' ),
		'font.fontWeight' => array( '100', '200', '300', '400', '500', '600', '700', '800', '900' ),
		'font.style'      => array( 'normal', 'italic' ),
		'font.transform'  => array( 'none', 'uppercase', 'lowercase', 'capitalize' ),
		'font.decoration' => array( 'none', 'underline', 'line-through', 'overline' ),
		'length.unit'     => array( 'px', '%', 'em', 'rem' ),
	);

	/**
	 * Allowed rating icon pairs (`ratingIconSet`), active => inactive — the
	 * free styles of RATING_ICON_STYLES (app/constants/ratingIcons.jsx).
	 */
	const RATING_ICON_SETS = array(
		array( 'star-fill', 'star-stroke' ),
		array( 'star-fill', 'star-empty' ),
		array( 'circle-star-fill', 'circle-star-empty' ),
		array( 'circle-star-fill', 'circle-star-empty-1' ),
		array( 'square-star-fill', 'square-star-empty' ),
		array( 'star-fill-1', 'star-stroke-1' ),
	);

	/**
	 * `cardContents` item names free renders.
	 */
	const CARD_CONTENTS = array( 'reviewer_image', 'testimonial_title', 'testimonial_text', 'rating', 'reviewer_name', 'designation' );

	/**
	 * `formFields` item keys the model may change. `showField` is not one of
	 * them: free has no control for it, so a field hidden here could not be
	 * brought back from the inspector.
	 */
	const FORM_FIELD_KEYS = array( 'required', 'label', 'placeholder', 'helpText' );

	/**
	 * Numeric ceilings for leaves whose generic range would be wrong, keyed by
	 * attribute name: array( min, max ).
	 */
	const NUMBER_RANGES = array(
		'columns'       => array( 1, 8 ),
		'slideToScroll' => array( 1, 8 ),
	);

	/**
	 * Shape hints printed once at the top of the catalog.
	 */
	const SHAPES = array(
		'responsive'         => '{"device":{"Desktop":n,"Tablet":n,"Mobile":n},"unit":{"Desktop":"px","Tablet":"px","Mobile":"px"}} — Tablet/Mobile may be "" to inherit Desktop',
		'responsive_spacing' => '{"device":{"Desktop":{"top":n,"right":n,"bottom":n,"left":n},"Tablet":{…},"Mobile":{…}},"unit":{"Desktop":"px","Tablet":"px","Mobile":"px"},"allChange":bool} — allChange true when all four sides are equal',
		'spacing'            => '{"value":{"top":n,"right":n,"bottom":n,"left":n},"unit":"px","allChange":bool} — allChange true when all four sides are equal',
		'colors'             => '{"normal":"<color>","hover":"<color>"} — hex, rgba() or ""',
		'background'         => '{"normal":{"style":"solid|gradient","solid":"<color>","gradient":"linear-gradient(…)"},"hover":{…}}',
		'background_single'  => '{"style":"solid|gradient","solid":"<color>","gradient":"linear-gradient(…)"}',
		'typography'         => '{"fontWeight":"100…900","style":"normal|italic","transform":"none|uppercase|lowercase|capitalize","decoration":"none|underline|line-through|overline"} — never set "family"',
		'border'             => '{"style":"none|solid|dashed|dotted|double","color":"<color>","hoverColor":"<color>"}',
		'shadow'             => '{"value":{"top":x,"right":y,"bottom":blur,"left":spread},"unit":"Outset|Inset","color":"<color>","isActive":bool}',
		'range'              => '{"value":n} — keep the existing unit',
		'rating_icons'       => '{"active":"<icon>","inactive":"<icon>"}',
		'card_contents'      => '[{"name":"<item>","is_active":bool}, …] in display order',
		'form_fields'        => '[{"fieldName":"<existing field>","required":bool,"label":"…","placeholder":"…","helpText":"…"}, …] — only fields that already exist',
	);

	/**
	 * Registered attribute schema of a block.
	 *
	 * @param string $slug Bare block slug.
	 * @return array<string, array> Attribute definitions, or an empty array.
	 */
	public static function schema( $slug ) {
		if ( ! class_exists( '\WP_Block_Type_Registry' ) ) {
			return array();
		}

		$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( self::PREFIX . $slug );
		if ( ! $block_type ) {
			return array();
		}

		$attributes = $block_type->get_attributes();
		return is_array( $attributes ) ? $attributes : array();
	}

	/**
	 * Allowed values of a string attribute on a block, or null when the
	 * attribute takes no fixed set.
	 *
	 * @param string $slug Bare block slug.
	 * @param string $key  Attribute name.
	 * @return array|null
	 */
	public static function enum_for( $slug, $key ) {
		if ( isset( self::BLOCK_ENUMS[ $slug ][ $key ] ) ) {
			return self::BLOCK_ENUMS[ $slug ][ $key ];
		}

		return isset( self::ENUMS[ $key ] ) ? self::ENUMS[ $key ] : null;
	}

	/**
	 * Whether the model may never set a key on a block.
	 *
	 * @param string $slug Bare block slug.
	 * @param string $key  Attribute name.
	 * @return bool
	 */
	public static function is_denied( $slug, $key ) {
		if ( in_array( $key, self::DENIED_KEYS, true ) ) {
			return true;
		}

		return isset( self::BLOCK_DENIED_KEYS[ $slug ] ) && in_array( $key, self::BLOCK_DENIED_KEYS[ $slug ], true );
	}

	/**
	 * Whether a string attribute holds a single color.
	 *
	 * @param string $key Attribute name.
	 * @return bool
	 */
	public static function is_color_key( $key ) {
		return false !== stripos( $key, 'color' ) && ! isset( self::ENUMS[ $key ] );
	}

	/**
	 * Classify an attribute by its default value.
	 *
	 * A string with no enum, no free-text entry and no color in its name is
	 * invisible — which is also how a Pro-only string attribute stays out.
	 *
	 * @param string $key        Attribute name.
	 * @param array  $definition Attribute definition (`type`, `default`).
	 * @return string Shape name, or '' when the model may not set it.
	 */
	public static function shape_of( $key, $definition ) {
		$type    = isset( $definition['type'] ) ? $definition['type'] : '';
		$default = isset( $definition['default'] ) ? $definition['default'] : null;

		if ( 'cardContents' === $key ) {
			return 'card_contents';
		}

		if ( 'formFields' === $key ) {
			return 'form_fields';
		}

		if ( 'ratingIconSet' === $key ) {
			return 'rating_icons';
		}

		if ( 'boolean' === $type ) {
			return 'boolean';
		}

		if ( 'number' === $type || 'integer' === $type ) {
			return 'number';
		}

		if ( 'string' === $type ) {
			if ( in_array( $key, self::FREE_TEXT, true ) ) {
				return 'text';
			}
			if ( isset( self::ENUMS[ $key ] ) ) {
				return 'enum';
			}
			return self::is_color_key( $key ) ? 'color' : '';
		}

		if ( 'object' !== $type || ! is_array( $default ) ) {
			return '';
		}

		return self::object_shape( $default );
	}

	/**
	 * Classify an object default by the keys it carries.
	 *
	 * @param array $default Default value.
	 * @return string Shape name, or ''.
	 */
	public static function object_shape( $default ) {
		if ( isset( $default['device']['Desktop'] ) && is_array( $default['device']['Desktop'] ) ) {
			return 'responsive_spacing';
		}

		if ( isset( $default['device'] ) && array_key_exists( 'Desktop', (array) $default['device'] ) ) {
			return 'responsive';
		}

		if ( isset( $default['value'] ) && is_array( $default['value'] ) && array_key_exists( 'isActive', $default ) ) {
			return 'shadow';
		}

		if ( isset( $default['value'] ) && is_array( $default['value'] ) ) {
			return 'spacing';
		}

		if ( array_key_exists( 'value', $default ) && array_key_exists( 'unit', $default ) ) {
			return 'range';
		}

		if ( array_key_exists( 'fontWeight', $default ) ) {
			return 'typography';
		}

		if ( isset( $default['normal'] ) && is_array( $default['normal'] ) ) {
			return 'background';
		}

		if ( array_key_exists( 'solid', $default ) && array_key_exists( 'style', $default ) ) {
			return 'background_single';
		}

		if ( array_key_exists( 'normal', $default ) ) {
			return 'colors';
		}

		if ( array_key_exists( 'style', $default ) && array_key_exists( 'color', $default ) ) {
			return 'border';
		}

		return '';
	}

	/**
	 * Attributes of a block the model may set, with their shapes.
	 *
	 * @param string $slug Bare block slug.
	 * @return array<string, array{shape: string, definition: array}>
	 */
	public static function editable_attributes( $slug ) {
		$editable = array();

		foreach ( self::schema( $slug ) as $key => $definition ) {
			if ( self::is_denied( $slug, $key ) ) {
				continue;
			}

			$shape = self::shape_of( $key, $definition );
			if ( '' === $shape ) {
				continue;
			}

			if ( 'enum' === $shape && empty( self::enum_for( $slug, $key ) ) ) {
				continue;
			}

			$editable[ $key ] = array(
				'shape'      => $shape,
				'definition' => $definition,
			);
		}

		return $editable;
	}

	/**
	 * The attribute catalog text handed to the model for one block.
	 *
	 * One line per attribute: its name, its shape (or allowed values) and its
	 * current default, so the model sees the scale it is working in.
	 *
	 * @param string $slug Bare block slug.
	 * @return string
	 */
	public static function catalog_for( $slug ) {
		$editable = self::editable_attributes( $slug );
		$used     = array();
		$lines    = array();

		foreach ( $editable as $key => $item ) {
			$shape   = $item['shape'];
			$default = isset( $item['definition']['default'] ) ? $item['definition']['default'] : null;

			switch ( $shape ) {
				case 'enum':
					$lines[] = sprintf( '- "%s": one of %s (default %s)', $key, implode( ' | ', self::enum_for( $slug, $key ) ), wp_json_encode( $default ) );
					break;
				case 'boolean':
					$lines[] = sprintf( '- "%s": boolean (default %s)', $key, $default ? 'true' : 'false' );
					break;
				case 'text':
					$lines[] = sprintf( '- "%s": short text (default %s)', $key, wp_json_encode( $default ) );
					break;
				case 'color':
					$lines[] = sprintf( '- "%s": <color> (default %s)', $key, wp_json_encode( $default ) );
					break;
				case 'number':
					$lines[] = sprintf( '- "%s": number (default %s)', $key, wp_json_encode( $default ) );
					break;
				case 'rating_icons':
					$pairs = array();
					foreach ( self::RATING_ICON_SETS as $pair ) {
						$pairs[] = $pair[0] . '/' . $pair[1];
					}
					$used['rating_icons'] = true;
					$lines[]              = sprintf( '- "%s": <rating_icons>, pairs: %s', $key, implode( ', ', $pairs ) );
					break;
				case 'card_contents':
					$used['card_contents'] = true;
					$lines[]               = sprintf( '- "%s": <card_contents>, items: %s', $key, implode( ', ', self::CARD_CONTENTS ) );
					break;
				case 'form_fields':
					$names = array();
					foreach ( (array) $default as $field ) {
						if ( ! empty( $field['fieldName'] ) ) {
							$names[] = $field['fieldName'];
						}
					}
					$used['form_fields'] = true;
					$lines[]             = sprintf( '- "%s": <form_fields>, fields: %s', $key, implode( ', ', $names ) );
					break;
				default:
					$used[ $shape ] = true;
					$lines[]        = sprintf( '- "%s": <%s> (default %s)', $key, $shape, self::compact_default( $shape, $default ) );
			}
		}

		$shapes = array();
		foreach ( self::SHAPES as $shape => $text ) {
			if ( isset( $used[ $shape ] ) ) {
				$shapes[] = sprintf( '<%s> = %s', $shape, $text );
			}
		}

		return "Value shapes:\n" . implode( "\n", $shapes ) . "\n\nAttributes:\n" . implode( "\n", $lines );
	}

	/**
	 * A short rendering of a shaped default — the Desktop value is what tells
	 * the model the scale, the full nested object would only cost tokens.
	 *
	 * @param string $shape   Shape name.
	 * @param mixed  $default Default value.
	 * @return string
	 */
	private static function compact_default( $shape, $default ) {
		switch ( $shape ) {
			case 'responsive':
				return wp_json_encode( $default['device']['Desktop'] ) . self::unit_suffix( $default['unit']['Desktop'] ?? '' );
			case 'responsive_spacing':
				return self::sides( $default['device']['Desktop'] ) . self::unit_suffix( $default['unit']['Desktop'] ?? '' );
			case 'spacing':
				return self::sides( $default['value'] ) . self::unit_suffix( $default['unit'] ?? '' );
			case 'shadow':
				return self::sides( $default['value'] ) . ' ' . ( $default['color'] ?? '' ) . ( empty( $default['isActive'] ) ? ' off' : ' on' );
			case 'range':
				return wp_json_encode( $default['value'] ) . self::unit_suffix( $default['unit'] ?? '' );
			case 'typography':
				return 'weight ' . ( $default['fontWeight'] ?? '' );
			case 'background':
				return wp_json_encode( $default['normal']['solid'] ?? '' );
			default:
				return wp_json_encode( $default );
		}
	}

	/**
	 * Four sides as "t r b l".
	 *
	 * @param array $sides Side values.
	 * @return string
	 */
	private static function sides( $sides ) {
		$values = array();
		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$values[] = isset( $sides[ $side ] ) && '' !== $sides[ $side ] ? $sides[ $side ] : '-';
		}
		return implode( ' ', $values );
	}

	/**
	 * A unit, space-prefixed, or nothing.
	 *
	 * @param string $unit Unit.
	 * @return string
	 */
	private static function unit_suffix( $unit ) {
		return '' === (string) $unit ? '' : ' ' . $unit;
	}
}
