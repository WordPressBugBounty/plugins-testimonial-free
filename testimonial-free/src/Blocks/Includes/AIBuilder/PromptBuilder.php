<?php
/**
 * Build with AI — prompt text.
 *
 * Builds the system instruction (output rules, the block's catalog, design
 * rules, worked examples) and the user message for one request.
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
 * PromptBuilder Class.
 *
 * @since 4.0.0
 */
class PromptBuilder {

	/**
	 * Human names for the blocks, as the model should read them.
	 */
	const BLOCK_LABELS = array(
		'carousel'                    => 'Carousel (Swiper, several cards per slide)',
		'slider'                      => 'Slider (one testimonial per slide)',
		'grid'                        => 'Grid (static CSS grid)',
		'zigzag-list'                 => 'List (one row per testimonial, image beside content)',
		'testimonial-submission-form' => 'Testimonial Submission Form (front-end form visitors use to send a testimonial)',
	);

	/**
	 * The system instruction for one block.
	 *
	 * @param string $slug Bare block slug.
	 * @return string
	 */
	public static function system( $slug ) {
		$label    = isset( self::BLOCK_LABELS[ $slug ] ) ? self::BLOCK_LABELS[ $slug ] : $slug;
		$catalog  = Catalog::catalog_for( $slug );
		$rules    = implode( "\n", self::design_rules( $slug ) );
		$examples = implode( "\n\n", self::worked_examples( $slug ) );

		return <<<PROMPT
You are a senior web designer configuring the Real Testimonials plugin inside the WordPress block editor.
Your job is to turn the user's request into a finished, presentable configuration for the "{$label}" block — not the smallest set of settings that technically answers the words.

Output Requirements:
1. Output ONLY one raw JSON object of block attributes. No markdown, no backticks, no prose.
2. Use only attribute names from the catalog below, with values in the shape the catalog gives. An unlisted key or value is discarded and the setting silently keeps its current value.
3. Include only the attributes you are changing. Objects may be partial: {"titleColors":{"normal":"#111827"}} changes one color and keeps the rest.
4. Numbers are plain numbers without units; units live in the "unit" fields.
5. The testimonials themselves come from the site's database. Never invent testimonial text, names or images.
6. When the request asks for a design, effect or style the catalog does not list, pick the closest listed value instead.

{$catalog}

Design Rules:
{$rules}

Worked Examples (they show the expected shape and level of finish — adapt the values to the actual request, never copy them):
{$examples}
PROMPT;
	}

	/**
	 * The user message.
	 *
	 * Current values are limited to catalog keys that differ from their
	 * default — the catalog already prints every default.
	 *
	 * @param string $prompt   User request.
	 * @param string $slug     Bare block slug.
	 * @param array  $existing Current attributes ({} on a fresh insert).
	 * @return string
	 */
	public static function user( $prompt, $slug, $existing = array() ) {
		$message = sprintf( "Target Block: %s\nUser Request: \"%s\"\n", $slug, $prompt );

		$current = array();
		foreach ( Catalog::editable_attributes( $slug ) as $key => $item ) {
			$default = isset( $item['definition']['default'] ) ? $item['definition']['default'] : null;
			if ( array_key_exists( $key, (array) $existing ) && $existing[ $key ] !== $default ) {
				$current[ $key ] = $existing[ $key ];
			}
		}

		if ( ! empty( $existing ) ) {
			$message .= "\nThe block is already configured. Change only what the request asks for. Values that differ from the catalog defaults:\n" . wp_json_encode( (object) $current ) . "\n";
		}

		return $message . "\nReturn the attribute JSON:";
	}

	/**
	 * Design rules, the general ones plus those for the block's family.
	 *
	 * @param string $slug Bare block slug.
	 * @return string[]
	 */
	private static function design_rules( $slug ) {
		$rules = array(
			'1. Answer the whole request, then finish the design: a color theme means backgrounds, text and accents are set together so every piece stays readable.',
			'2. Colors come in pairs: a dark card needs light title/text/name colors, a light card needs dark ones. Keep contrast of at least 4.5:1 for body text.',
			'3. Type scale: titles 18-24px at weight 600-700, body text 14-17px with line height 1.5-1.7, names 15-17px weight 600, designations 13-14px.',
			'4. Set the responsive trio together when you change a count or a gap: columns 4/2/1, 3/2/1 or 2/1/1 for Desktop/Tablet/Mobile.',
			'5. Restraint: one accent color, one shadow style, one border radius family. Do not change settings the request does not touch.',
			'6. Use "" for a color to fall back to the theme default.',
		);

		if ( 'testimonial-submission-form' === $slug ) {
			$rules[] = '7. Forms: style the container, inputs and submit button as one system — the same radius family and accent color.';
			$rules[] = '8. Wording belongs to the site owner: change labels and messages only when the request asks for different wording.';
			return $rules;
		}

		$rules[] = '7. When a card gets a background, border or shadow, also give it "cardPadding" of 24-40px so the text never touches the edge.';
		$rules[] = '8. Pick "cardDesign" first when the request describes a card look; the design moves the photo, name and rating, then your colors and sizes refine it.';

		if ( in_array( $slug, array( 'carousel', 'slider' ), true ) ) {
			$rules[] = '9. Motion: autoplay ("sliderAutoPlay") goes with "pauseOnHover" true and a "carouselAutoplayDelay" of 3000-6000ms. Pagination dots need a visible color against the section background.';
		}

		if ( 'carousel' === $slug ) {
			$rules[] = '10. The cube and flip sliding effects need "columns" 1.';
		}

		return $rules;
	}

	/**
	 * Worked request/response pairs for the block's family.
	 *
	 * @param string $slug Bare block slug.
	 * @return string[]
	 */
	private static function worked_examples( $slug ) {
		if ( 'testimonial-submission-form' === $slug ) {
			return array(
				self::example(
					'A friendly form with rounded inputs and a full width purple submit button',
					array(
						'inputStyle'               => 'style-one',
						'formBorderRadius'         => array(
							'value'     => array(
								'top'    => 16,
								'right'  => 16,
								'bottom' => 16,
								'left'   => 16,
							),
							'allChange' => true,
						),
						'fieldBorderRadius'        => array(
							'value'     => array(
								'top'    => 10,
								'right'  => 10,
								'bottom' => 10,
								'left'   => 10,
							),
							'allChange' => true,
						),
						'fieldBorder'              => array(
							'style'      => 'solid',
							'color'      => '#E4E4E7',
							'hoverColor' => '#7C3AED',
						),
						'submitButtonWidth'        => 'fullWidth',
						'submitButtonBackground'   => array(
							'normal' => array( 'solid' => '#7C3AED' ),
							'hover'  => array( 'solid' => '#6D28D9' ),
						),
						'submitButtonColors'       => array(
							'normal' => '#FFFFFF',
							'hover'  => '#FFFFFF',
						),
						'submitButtonBorderRadius' => array(
							'value'     => array(
								'top'    => 10,
								'right'  => 10,
								'bottom' => 10,
								'left'   => 10,
							),
							'allChange' => true,
						),
					)
				),
			);
		}

		$examples = array(
			self::example(
				'Clean white cards with a soft shadow',
				array(
					'cardDesign'       => 'zigzag-list' === $slug ? 'list-design-one' : 'design-one',
					'cardBackground'   => array( 'normal' => array( 'solid' => '#FFFFFF' ) ),
					'cardBorder'       => array( 'style' => 'none' ),
					'cardBorderRadius' => array(
						'value'     => array(
							'top'    => 16,
							'right'  => 16,
							'bottom' => 16,
							'left'   => 16,
						),
						'allChange' => true,
					),
					'cardBoxShadow'    => array(
						'value'    => array(
							'top'    => 0,
							'right'  => 8,
							'bottom' => 24,
							'left'   => 0,
						),
						'color'    => '#0F172A14',
						'isActive' => true,
					),
					'cardPadding'      => array(
						'device'    => array(
							'Desktop' => array(
								'top'    => 32,
								'right'  => 32,
								'bottom' => 32,
								'left'   => 32,
							),
						),
						'allChange' => true,
					),
				)
			),
			self::example(
				'Dark theme with light text',
				array(
					'cardBackground'       => array( 'normal' => array( 'solid' => '#111827' ) ),
					'cardBorder'           => array(
						'style' => 'solid',
						'color' => '#1F2937',
					),
					'titleColors'          => array( 'normal' => '#F9FAFB' ),
					'excerptColors'        => array( 'normal' => '#D1D5DB' ),
					'nameColors'           => array( 'normal' => '#FFFFFF' ),
					'designationColors'    => array( 'normal' => '#9CA3AF' ),
					'ratingIconColor'      => '#FBBF24',
					'ratingIconEmptyColor' => '#374151',
				)
			),
		);

		if ( in_array( $slug, array( 'carousel', 'grid' ), true ) ) {
			$examples[] = 'Request (block already configured): "make it 4 across"' . "\n" . 'Response: ' . wp_json_encode(
				array(
					'columns' => array(
						'device' => array(
							'Desktop' => 4,
							'Tablet'  => 2,
							'Mobile'  => 1,
						),
					),
				)
			);
		}

		if ( in_array( $slug, array( 'carousel', 'slider' ), true ) ) {
			$examples[] = self::example(
				'Autoplay every 4 seconds with dots',
				array(
					'sliderAutoPlay'        => true,
					'pauseOnHover'          => true,
					'carouselAutoplayDelay' => array( 'value' => 4000 ),
					'enablePaginationDots'  => true,
					'paginationDotsColors'  => array(
						'normal' => '#CBD5E1',
						'hover'  => '#1E67D8',
					),
				)
			);
		}

		return $examples;
	}

	/**
	 * One "Request / Response" pair.
	 *
	 * @param string $request  Example request.
	 * @param array  $response Example attributes.
	 * @return string
	 */
	private static function example( $request, $response ) {
		return sprintf( "Request: \"%s\"\nResponse: %s", $request, wp_json_encode( $response ) );
	}
}
