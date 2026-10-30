<?php
/**
 * Build with AI — attribute validator.
 *
 * Everything the model returns passes through here before it reaches the
 * editor. A key is kept only when Catalog lists it for the block, and every
 * leaf is checked against the shape of the attribute's registered default:
 * a wrong type, an unlisted value or an unknown child key is dropped, so the
 * setting keeps its current value instead of breaking the block.
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
 * ValueValidator Class.
 *
 * @since 4.0.0
 */
class ValueValidator {

	/**
	 * Generic numeric bounds for lengths and offsets.
	 */
	const NUMBER_MIN = -2000;

	/**
	 * Generic numeric ceiling.
	 */
	const NUMBER_MAX = 5000;

	/**
	 * Longest free-text value accepted.
	 */
	const TEXT_MAX = 300;

	/**
	 * Validate an AI answer against a block's catalog.
	 *
	 * Objects the model sends partially are merged over the current value, so
	 * `{"normal":"#111"}` changes one color and keeps the hover one.
	 *
	 * @param array  $generated Decoded model output.
	 * @param string $slug      Bare block slug.
	 * @param array  $existing  The block's current attributes ({} on a fresh insert).
	 * @return array Only the attributes that changed, validated.
	 */
	public static function sanitize( $generated, $slug, $existing = array() ) {
		$editable = Catalog::editable_attributes( $slug );
		$result   = array();

		foreach ( (array) $generated as $key => $value ) {
			if ( ! is_string( $key ) || ! isset( $editable[ $key ] ) ) {
				continue;
			}

			$definition = $editable[ $key ]['definition'];
			$default    = isset( $definition['default'] ) ? $definition['default'] : null;
			$current    = array_key_exists( $key, (array) $existing ) ? $existing[ $key ] : $default;
			$clean      = self::validate_value( $slug, $key, $editable[ $key ]['shape'], $value, $current, $default );

			if ( null !== $clean && $clean !== $current ) {
				$result[ $key ] = $clean;
			}
		}

		return self::apply_dependencies( $result, (array) $existing );
	}

	/**
	 * Validate one attribute value by its shape.
	 *
	 * @param string $slug    Bare block slug.
	 * @param string $key     Attribute name.
	 * @param string $shape   Shape from Catalog::shape_of().
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @param mixed  $default Registered default.
	 * @return mixed|null Clean value, or null to drop it.
	 */
	private static function validate_value( $slug, $key, $shape, $value, $current, $default ) {
		switch ( $shape ) {
			case 'boolean':
				return self::to_bool( $value );
			case 'number':
				return self::to_number( $value, $key );
			case 'enum':
				return self::to_enum( $value, Catalog::enum_for( $slug, $key ) );
			case 'text':
				return self::to_text( $value );
			case 'color':
				return self::to_color( $value );
			case 'responsive':
				return self::responsive( $key, $value, $current, $default );
			case 'responsive_spacing':
				return self::responsive_spacing( $key, $value, $current, $default );
			case 'spacing':
				return self::spacing( $key, $value, $current, $default );
			case 'shadow':
				return self::shadow( $key, $value, $current );
			case 'range':
				return self::range( $key, $value, $current );
			case 'typography':
				return self::typography( $value, $current );
			case 'background':
				return self::background( $value, $current );
			case 'background_single':
				return self::background_state( $value, $current );
			case 'colors':
				return self::colors( $value, $current );
			case 'border':
				return self::border( $value, $current );
			case 'rating_icons':
				return self::rating_icons( $value );
			case 'card_contents':
				return self::card_contents( $value, $current );
			case 'form_fields':
				return self::form_fields( $value, $current );
			default:
				return null;
		}
	}

	/**
	 * Settings that only work together, resolved after every key is validated.
	 *
	 * Free's inspector writes nothing beside a pick that the model could get
	 * wrong, so only the no-op is dropped: re-sending the current sliding
	 * effect is not a change.
	 *
	 * @param array $result   Validated changes.
	 * @param array $existing Current attributes.
	 * @return array
	 */
	private static function apply_dependencies( $result, $existing ) {
		if ( isset( $result['slidingEffect'] ) && isset( $existing['slidingEffect'] ) && $result['slidingEffect'] === $existing['slidingEffect'] ) {
			unset( $result['slidingEffect'] );
		}

		return $result;
	}

	/**
	 * Coerce to a boolean.
	 *
	 * @param mixed $value Value.
	 * @return bool|null
	 */
	private static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}

		if ( 1 === $value || 0 === $value ) {
			return (bool) $value;
		}

		if ( is_string( $value ) ) {
			$value = strtolower( trim( $value ) );
			if ( in_array( $value, array( 'true', '1', 'yes', 'on' ), true ) ) {
				return true;
			}
			if ( in_array( $value, array( 'false', '0', 'no', 'off' ), true ) ) {
				return false;
			}
		}

		return null;
	}

	/**
	 * Coerce to a clamped number; '' passes through as "unset".
	 *
	 * @param mixed  $value Value.
	 * @param string $key   Attribute name, for its own range.
	 * @param float  $min   Floor when the key has no range of its own.
	 * @param float  $max   Ceiling when the key has no range of its own.
	 * @return int|float|string|null
	 */
	private static function to_number( $value, $key = '', $min = self::NUMBER_MIN, $max = self::NUMBER_MAX ) {
		if ( '' === $value ) {
			return '';
		}

		if ( ! is_numeric( $value ) ) {
			return null;
		}

		if ( isset( Catalog::NUMBER_RANGES[ $key ] ) ) {
			list( $min, $max ) = Catalog::NUMBER_RANGES[ $key ];
		}

		$number = min( max( (float) $value, $min ), $max );
		return floor( $number ) === $number ? (int) $number : round( $number, 2 );
	}

	/**
	 * Match a value against an allowed set, case-insensitively.
	 *
	 * @param mixed $value   Value.
	 * @param array $allowed Allowed values.
	 * @return string|null The canonical allowed value.
	 */
	private static function to_enum( $value, $allowed ) {
		if ( ! is_scalar( $value ) || empty( $allowed ) ) {
			return null;
		}

		$value = strtolower( trim( (string) $value ) );
		foreach ( $allowed as $option ) {
			if ( strtolower( $option ) === $value ) {
				return $option;
			}
		}

		return null;
	}

	/**
	 * Plain, length-capped text.
	 *
	 * @param mixed $value Value.
	 * @return string|null
	 */
	private static function to_text( $value ) {
		if ( ! is_scalar( $value ) ) {
			return null;
		}

		$text = sanitize_text_field( (string) $value );
		return function_exists( 'mb_substr' ) ? mb_substr( $text, 0, self::TEXT_MAX ) : substr( $text, 0, self::TEXT_MAX );
	}

	/**
	 * A CSS color the block CSS can print as-is, or '' for "unset".
	 *
	 * @param mixed $value Value.
	 * @return string|null
	 */
	public static function to_color( $value ) {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		if ( '' === $value || 'transparent' === strtolower( $value ) ) {
			return strtolower( $value );
		}

		if ( preg_match( '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.%\s,\/]+\)$/i', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^var\(--[a-z0-9-]+\)$/i', $value ) ) {
			return $value;
		}

		return null;
	}

	/**
	 * A CSS gradient, or a theme variable.
	 *
	 * @param mixed $value Value.
	 * @return string|null
	 */
	private static function to_gradient( $value ) {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		if ( preg_match( '/^var\(--[a-z0-9-]+\)$/i', $value ) ) {
			return $value;
		}

		if ( preg_match( '/^(?:linear|radial)-gradient\([#a-z0-9\s,.%()\/-]+\)$/i', $value ) ) {
			return $value;
		}

		return null;
	}

	/**
	 * A length unit, changeable only when the attribute already uses one.
	 *
	 * A unitless (`''`) or time/word unit is part of what the value means, so
	 * the current one is kept whatever the model sends.
	 *
	 * @param mixed  $value   Model unit.
	 * @param string $current Current unit.
	 * @return string
	 */
	private static function unit( $value, $current ) {
		$lengths = Catalog::LEAF_ENUMS['length.unit'];
		if ( ! in_array( $current, $lengths, true ) ) {
			return $current;
		}

		$unit = self::to_enum( $value, $lengths );
		return null === $unit ? $current : $unit;
	}

	/**
	 * `{ device: { Desktop, Tablet, Mobile }, unit: {…} }`.
	 *
	 * @param string $key     Attribute name.
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @param mixed  $default Registered default.
	 * @return array|null
	 */
	private static function responsive( $key, $value, $current, $default ) {
		$current = self::as_array( $current, $default );
		if ( ! is_array( $value ) ) {
			// A bare number is read as the Desktop value.
			if ( ! is_numeric( $value ) ) {
				return null;
			}
			$value = array( 'device' => array( 'Desktop' => $value ) );
		}

		foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
			if ( isset( $value['device'] ) && is_array( $value['device'] ) && array_key_exists( $device, $value['device'] ) ) {
				$number = self::to_number( $value['device'][ $device ], $key );
				if ( null !== $number ) {
					$current['device'][ $device ] = $number;
				}
			}
			if ( isset( $value['unit'][ $device ] ) && isset( $current['unit'][ $device ] ) ) {
				$current['unit'][ $device ] = self::unit( $value['unit'][ $device ], $current['unit'][ $device ] );
			}
		}

		return $current;
	}

	/**
	 * `{ device: { Desktop: {top…}, … }, unit: {…}, allChange }`.
	 *
	 * @param string $key     Attribute name.
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @param mixed  $default Registered default.
	 * @return array|null
	 */
	private static function responsive_spacing( $key, $value, $current, $default ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$current = self::as_array( $current, $default );
		foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
			if ( isset( $value['device'][ $device ] ) ) {
				$current['device'][ $device ] = self::sides( $value['device'][ $device ], isset( $current['device'][ $device ] ) ? $current['device'][ $device ] : array(), $key );
			}
			if ( isset( $value['unit'] ) && is_array( $current['unit'] ?? null ) && isset( $current['unit'][ $device ] ) ) {
				$unit                       = is_array( $value['unit'] ) ? ( $value['unit'][ $device ] ?? null ) : $value['unit'];
				$current['unit'][ $device ] = self::unit( $unit, $current['unit'][ $device ] );
			}
		}

		if ( array_key_exists( 'allChange', $value ) && array_key_exists( 'allChange', $current ) ) {
			$all = self::to_bool( $value['allChange'] );
			if ( null !== $all ) {
				$current['allChange'] = $all;
			}
		}

		return $current;
	}

	/**
	 * `{ value: {top…}, unit, allChange }`.
	 *
	 * @param string $key     Attribute name.
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @param mixed  $default Registered default.
	 * @return array|null
	 */
	private static function spacing( $key, $value, $current, $default ) {
		$current = self::as_array( $current, $default );
		if ( is_numeric( $value ) ) {
			// A bare number is read as "all four sides".
			$value = array(
				'value'     => array_fill_keys( array( 'top', 'right', 'bottom', 'left' ), $value ),
				'allChange' => true,
			);
		}

		if ( ! is_array( $value ) ) {
			return null;
		}

		if ( isset( $value['value'] ) ) {
			$current['value'] = self::sides( $value['value'], isset( $current['value'] ) ? $current['value'] : array(), $key );
		}

		if ( isset( $value['unit'], $current['unit'] ) ) {
			$current['unit'] = self::unit( $value['unit'], $current['unit'] );
		}

		if ( array_key_exists( 'allChange', $value ) && array_key_exists( 'allChange', $current ) ) {
			$all = self::to_bool( $value['allChange'] );
			if ( null !== $all ) {
				$current['allChange'] = $all;
			}
		}

		return $current;
	}

	/**
	 * Four sides; a bare number sets all of them.
	 *
	 * @param mixed  $value   Model sides.
	 * @param array  $current Current sides.
	 * @param string $key     Attribute name.
	 * @return array
	 */
	private static function sides( $value, $current, $key ) {
		$current = is_array( $current ) ? $current : array();
		if ( is_numeric( $value ) ) {
			$value = array_fill_keys( array( 'top', 'right', 'bottom', 'left' ), $value );
		}

		if ( ! is_array( $value ) ) {
			return $current;
		}

		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			if ( array_key_exists( $side, $value ) ) {
				$number = self::to_number( $value[ $side ], $key );
				if ( null !== $number ) {
					$current[ $side ] = $number;
				}
			}
		}

		return $current;
	}

	/**
	 * `{ value: {top…}, unit: Outset|Inset, color, isActive }`.
	 *
	 * @param string $key     Attribute name.
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @return array|null
	 */
	private static function shadow( $key, $value, $current ) {
		if ( ! is_array( $value ) || ! is_array( $current ) ) {
			return null;
		}

		if ( isset( $value['value'] ) ) {
			$current['value'] = self::sides( $value['value'], isset( $current['value'] ) ? $current['value'] : array(), $key );
		}

		if ( isset( $value['unit'] ) ) {
			$unit = self::to_enum( $value['unit'], Catalog::LEAF_ENUMS['shadow.unit'] );
			if ( null !== $unit ) {
				$current['unit'] = $unit;
			}
		}

		if ( isset( $value['color'] ) ) {
			$color = self::to_color( $value['color'] );
			if ( null !== $color ) {
				$current['color'] = $color;
			}
		}

		if ( array_key_exists( 'isActive', $value ) ) {
			$active = self::to_bool( $value['isActive'] );
			if ( null !== $active ) {
				$current['isActive'] = $active;
			}
		}

		return $current;
	}

	/**
	 * `{ value, unit }` — the unit is fixed by the attribute.
	 *
	 * @param string $key     Attribute name.
	 * @param mixed  $value   Model value.
	 * @param mixed  $current Current value.
	 * @return array|null
	 */
	private static function range( $key, $value, $current ) {
		if ( ! is_array( $current ) ) {
			return null;
		}

		$raw    = is_array( $value ) ? ( $value['value'] ?? null ) : $value;
		$number = self::to_number( $raw, $key, 0, 100000 );
		if ( null === $number ) {
			return null;
		}

		$current['value'] = $number;
		return $current;
	}

	/**
	 * `{ family, fontWeight, style, transform, decoration }` — family is never set.
	 *
	 * @param mixed $value   Model value.
	 * @param mixed $current Current value.
	 * @return array|null
	 */
	private static function typography( $value, $current ) {
		if ( ! is_array( $value ) || ! is_array( $current ) ) {
			return null;
		}

		foreach ( array( 'fontWeight', 'style', 'transform', 'decoration' ) as $leaf ) {
			if ( ! isset( $value[ $leaf ] ) ) {
				continue;
			}
			$clean = self::to_enum( $value[ $leaf ], Catalog::LEAF_ENUMS[ 'font.' . $leaf ] );
			if ( null !== $clean ) {
				$current[ $leaf ] = $clean;
			}
		}

		return $current;
	}

	/**
	 * `{ normal: {style, solid, gradient}, hover: {…} }` — only states the
	 * attribute already has.
	 *
	 * @param mixed $value   Model value.
	 * @param mixed $current Current value.
	 * @return array|null
	 */
	private static function background( $value, $current ) {
		if ( ! is_array( $current ) ) {
			return null;
		}

		if ( is_string( $value ) ) {
			// A bare color is read as the normal solid fill.
			$value = array( 'normal' => array( 'solid' => $value ) );
		}

		if ( ! is_array( $value ) ) {
			return null;
		}

		foreach ( $current as $state => $fill ) {
			if ( isset( $value[ $state ] ) ) {
				$current[ $state ] = self::background_state( $value[ $state ], $fill );
			}
		}

		return $current;
	}

	/**
	 * One background state: `{ style, solid, gradient }`.
	 *
	 * @param mixed $value   Model value.
	 * @param mixed $current Current value.
	 * @return array|null
	 */
	private static function background_state( $value, $current ) {
		if ( ! is_array( $current ) ) {
			return null;
		}

		if ( is_string( $value ) ) {
			$value = array( 'solid' => $value );
		}

		if ( ! is_array( $value ) ) {
			return $current;
		}

		if ( isset( $value['solid'] ) ) {
			$color = self::to_color( $value['solid'] );
			if ( null !== $color ) {
				$current['solid'] = $color;
				if ( ! isset( $value['style'] ) ) {
					$current['style'] = 'solid';
				}
			}
		}

		if ( isset( $value['gradient'] ) ) {
			$gradient = self::to_gradient( $value['gradient'] );
			if ( null !== $gradient ) {
				$current['gradient'] = $gradient;
			}
		}

		if ( isset( $value['style'] ) ) {
			$style = self::to_enum( $value['style'], Catalog::LEAF_ENUMS['bg.style'] );
			if ( null !== $style ) {
				$current['style'] = $style;
			}
		}

		return $current;
	}

	/**
	 * `{ normal, hover[, active] }` colors — only states the attribute has.
	 *
	 * @param mixed $value   Model value.
	 * @param mixed $current Current value.
	 * @return array|null
	 */
	private static function colors( $value, $current ) {
		if ( ! is_array( $current ) ) {
			return null;
		}

		if ( is_string( $value ) ) {
			$value = array( 'normal' => $value );
		}

		if ( ! is_array( $value ) ) {
			return null;
		}

		foreach ( array_keys( $current ) as $state ) {
			if ( isset( $value[ $state ] ) ) {
				$color = self::to_color( $value[ $state ] );
				if ( null !== $color ) {
					$current[ $state ] = $color;
				}
			}
		}

		return $current;
	}

	/**
	 * `{ style, color[, hoverColor] }`.
	 *
	 * @param mixed $value   Model value.
	 * @param mixed $current Current value.
	 * @return array|null
	 */
	private static function border( $value, $current ) {
		if ( ! is_array( $value ) || ! is_array( $current ) ) {
			return null;
		}

		if ( isset( $value['style'] ) ) {
			$style = self::to_enum( $value['style'], Catalog::LEAF_ENUMS['border.style'] );
			if ( null !== $style ) {
				$current['style'] = $style;
			}
		}

		foreach ( array( 'color', 'hoverColor' ) as $leaf ) {
			if ( isset( $value[ $leaf ] ) && array_key_exists( $leaf, $current ) ) {
				$color = self::to_color( $value[ $leaf ] );
				if ( null !== $color ) {
					$current[ $leaf ] = $color;
				}
			}
		}

		return $current;
	}

	/**
	 * `{ active, inactive }` — only a listed pair.
	 *
	 * @param mixed $value Model value.
	 * @return array|null
	 */
	private static function rating_icons( $value ) {
		if ( ! is_array( $value ) || ! isset( $value['active'], $value['inactive'] ) ) {
			return null;
		}

		foreach ( Catalog::RATING_ICON_SETS as $pair ) {
			if ( $pair[0] === $value['active'] && $pair[1] === $value['inactive'] ) {
				return array(
					'active'   => $pair[0],
					'inactive' => $pair[1],
				);
			}
		}

		return null;
	}

	/**
	 * Reorder and toggle `cardContents`. Every current entry survives, with its
	 * id; items the model names come first, in its order.
	 *
	 * @param mixed $value   Model list.
	 * @param mixed $current Current list.
	 * @return array|null
	 */
	private static function card_contents( $value, $current ) {
		if ( ! is_array( $value ) || ! is_array( $current ) ) {
			return null;
		}

		$by_name = array();
		foreach ( $current as $item ) {
			if ( isset( $item['name'] ) ) {
				$by_name[ $item['name'] ] = $item;
			}
		}

		$ordered = array();
		foreach ( $value as $item ) {
			$name = is_array( $item ) && isset( $item['name'] ) ? (string) $item['name'] : '';
			if ( ! isset( $by_name[ $name ] ) || isset( $ordered[ $name ] ) ) {
				continue;
			}
			$entry = $by_name[ $name ];
			if ( array_key_exists( 'is_active', $item ) ) {
				$active = self::to_bool( $item['is_active'] );
				if ( null !== $active ) {
					$entry['is_active'] = $active;
				}
			}
			$ordered[ $name ] = $entry;
		}

		if ( empty( $ordered ) ) {
			return null;
		}

		foreach ( $by_name as $name => $entry ) {
			if ( ! isset( $ordered[ $name ] ) ) {
				$ordered[ $name ] = $entry;
			}
		}

		return array_values( $ordered );
	}

	/**
	 * Relabel existing `formFields` and flip `required`. The model can neither
	 * add, hide or remove a field nor change one's name, type or id.
	 *
	 * @param mixed $value   Model list.
	 * @param mixed $current Current list.
	 * @return array|null
	 */
	private static function form_fields( $value, $current ) {
		if ( ! is_array( $value ) || ! is_array( $current ) ) {
			return null;
		}

		$changes = array();
		foreach ( $value as $item ) {
			if ( is_array( $item ) && ! empty( $item['fieldName'] ) ) {
				$changes[ (string) $item['fieldName'] ] = $item;
			}
		}

		foreach ( $current as $index => $field ) {
			$name = isset( $field['fieldName'] ) ? $field['fieldName'] : '';
			if ( ! isset( $changes[ $name ] ) ) {
				continue;
			}

			foreach ( Catalog::FORM_FIELD_KEYS as $leaf ) {
				if ( ! array_key_exists( $leaf, $changes[ $name ] ) ) {
					continue;
				}
				$clean = 'required' === $leaf ? self::to_bool( $changes[ $name ][ $leaf ] ) : self::to_text( $changes[ $name ][ $leaf ] );
				if ( null !== $clean ) {
					$current[ $index ][ $leaf ] = $clean;
				}
			}
		}

		return $current;
	}

	/**
	 * The current value as an array, falling back to the default's shape.
	 *
	 * @param mixed $current Current value.
	 * @param mixed $default Registered default.
	 * @return array
	 */
	private static function as_array( $current, $default ) {
		if ( is_array( $current ) ) {
			return $current;
		}

		return is_array( $default ) ? $default : array();
	}
}
