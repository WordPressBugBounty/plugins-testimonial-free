<?php
/**
 * Sanitizers for visitor-submitted testimonial data and its rendered output.
 *
 * Every public submission pipeline (the Testimonial Submission Form block and
 * the classic shortcode form) stores through the input half, and
 * every template that prints a testimonial body or reviewer field renders
 * through the output half, so a payload missed on the way in is still inert on
 * the way out.
 *
 * @since 4.1.1
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Includes
 */

namespace ShapedPlugin\TestimonialFree\Includes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Sanitizer Class.
 */
class Sanitizer {

	/**
	 * Image types a visitor may upload as a reviewer photo.
	 *
	 * @var string[]
	 */
	const IMAGE_MIMES = array( 'image/jpeg', 'image/png', 'image/gif', 'image/webp' );

	/**
	 * Sanitize a single-line value submitted by a visitor.
	 *
	 * `sanitize_text_field()` keeps a malformed tag such as `< span …>` because
	 * PHP's strip_tags() does not treat whitespace after `<` as a tag. KSES later
	 * rebuilds that into a live element, so every `<` that survives is stored
	 * as an entity and can never become markup again.
	 *
	 * @param mixed $value Raw, unslashed value.
	 * @return string
	 */
	public static function public_text( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		return self::neutralize_markup( sanitize_text_field( (string) $value ) );
	}

	/**
	 * Sanitize a multi-line value submitted by a visitor (the testimonial body).
	 *
	 * Besides the malformed-tag handling of public_text(), shortcode brackets are
	 * stored as an entity: the body is rendered through `the_content`, and a
	 * visitor must not be able to run `[gallery ids=…]` or any other shortcode.
	 *
	 * @param mixed $value Raw, unslashed value.
	 * @return string
	 */
	public static function public_textarea( $value ) {
		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$value = self::neutralize_markup( sanitize_textarea_field( (string) $value ) );

		return str_replace( '[', '&#91;', $value );
	}

	/**
	 * Encode every `<` left after tag stripping.
	 *
	 * @param string $value Already tag-stripped text.
	 * @return string
	 */
	private static function neutralize_markup( $value ) {
		return str_replace( '<', '&lt;', $value );
	}

	/**
	 * Attachment fields that override what WordPress reads from an upload.
	 *
	 * Media_handle_upload() copies a JPEG's embedded IPTC caption and title into
	 * the attachment, which lets a visitor store arbitrary post HTML (the caption
	 * is printed by `[gallery]`, captions and attachment pages). A visitor upload
	 * keeps none of it.
	 *
	 * @param string $file_name Uploaded file name.
	 * @return array Post data for media_handle_upload().
	 */
	public static function upload_post_data( $file_name ) {
		return array(
			'post_title'   => sanitize_text_field( pathinfo( (string) $file_name, PATHINFO_FILENAME ) ),
			'post_content' => '',
			'post_excerpt' => '',
		);
	}

	/**
	 * Render a testimonial body.
	 *
	 * The post allow-list without any `data-*` attribute. Those attributes drive
	 * client-side behaviour — the Interactivity API's `data-wp-*` directives,
	 * Swiper's `data-swiper-settings`, the read-more `data-full-content` — and a
	 * testimonial body has no business configuring scripts.
	 *
	 * @param string $content    Filtered content.
	 * @param bool   $allow_embeds Keep oEmbed iframes (the classic views autoembed).
	 * @return string
	 */
	public static function kses_content( $content, $allow_embeds = false ) {
		return wp_kses( (string) $content, self::content_allowed_html( $allow_embeds ) );
	}

	/**
	 * Allowed HTML for a testimonial body.
	 *
	 * @param bool $allow_embeds Add the iframe element oEmbed produces.
	 * @return array
	 */
	public static function content_allowed_html( $allow_embeds = false ) {
		static $cache = array();

		$key = $allow_embeds ? 'embeds' : 'post';
		if ( isset( $cache[ $key ] ) ) {
			return $cache[ $key ];
		}

		$allowed = wp_kses_allowed_html( 'post' );
		foreach ( $allowed as $tag => $attributes ) {
			if ( ! is_array( $attributes ) ) {
				continue;
			}
			foreach ( array_keys( $attributes ) as $attribute ) {
				if ( 0 === strpos( (string) $attribute, 'data-' ) ) {
					unset( $allowed[ $tag ][ $attribute ] );
				}
			}
		}

		$allowed['source'] = array(
			'src'    => true,
			'type'   => true,
			'srcset' => true,
			'sizes'  => true,
			'media'  => true,
		);

		if ( $allow_embeds ) {
			$allowed['iframe'] = array(
				'src'             => true,
				'width'           => true,
				'height'          => true,
				'title'           => true,
				'class'           => true,
				'style'           => true,
				'frameborder'     => true,
				'allow'           => true,
				'allowfullscreen' => true,
				'loading'         => true,
				'referrerpolicy'  => true,
				'sandbox'         => true,
			);
		}

		$cache[ $key ] = $allowed;

		return $allowed;
	}

	/**
	 * Render a reviewer field (name, designation, company, location, title…).
	 *
	 * Inline formatting only — the admin metabox allows span/em/strong in these
	 * fields — so a form control such as `<textarea name="post_title">` can never
	 * be printed into the admin preview, which renders inside `form#post`.
	 *
	 * @param string $value Stored value.
	 * @return string
	 */
	public static function kses_inline( $value ) {
		return wp_kses( (string) $value, self::inline_allowed_html() );
	}

	/**
	 * Allowed HTML for a reviewer field.
	 *
	 * @return array
	 */
	public static function inline_allowed_html() {
		$styled = array(
			'class' => true,
			'style' => true,
		);

		return array(
			'span'   => $styled,
			'em'     => $styled,
			'strong' => $styled,
			'b'      => $styled,
			'i'      => $styled,
			'u'      => $styled,
			'small'  => $styled,
			'sub'    => $styled,
			'sup'    => $styled,
			'mark'   => $styled,
			'br'     => array(),
			'a'      => array(
				'href'   => true,
				'title'  => true,
				'target' => true,
				'rel'    => true,
				'class'  => true,
			),
		);
	}

	/**
	 * Encode a value for a `<script type="application/ld+json">` block.
	 *
	 * The hex flags turn `<`, `>`, `&`, `'` and `"` into `\u00XX` escapes so no
	 * value can close the script element.
	 *
	 * @param mixed $value Value to encode.
	 * @return string JSON.
	 */
	public static function json_ld( $value ) {
		return (string) wp_json_encode( $value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
	}
}
