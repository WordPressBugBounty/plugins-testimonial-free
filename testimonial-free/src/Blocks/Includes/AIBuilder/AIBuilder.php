<?php
/**
 * Build with AI — request orchestration.
 *
 * Prompt in, validated attributes out: route the block, build the prompt,
 * call the provider through Blocks\Includes\AI, validate the answer. No
 * markup and no transport of its own.
 *
 * @since 4.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Blocks/Includes/AIBuilder
 */

namespace ShapedPlugin\TestimonialFree\Blocks\Includes\AIBuilder;

use ShapedPlugin\TestimonialFree\Blocks\Includes\AI;
use ShapedPlugin\TestimonialFree\Blocks\Includes\BlocksHelper;
use ShapedPlugin\TestimonialFree\Blocks\Includes\ConnectorBridge;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * AIBuilder Class.
 *
 * @since 4.0.0
 */
class AIBuilder {

	/**
	 * Dashboard module key (shared with the Pro plugin's option).
	 */
	const MODULE = 'ai_block_builder';

	/**
	 * Longest prompt accepted, in characters.
	 */
	const MAX_PROMPT_LENGTH = 1000;

	/**
	 * Whether Build with AI is available: the module is on and the site has not
	 * switched AI off (`WP_AI_SUPPORT` / `wp_supports_ai`).
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		/**
		 * Filter whether Build with AI is available.
		 *
		 * @param bool $enabled Module state.
		 */
		return (bool) apply_filters( 'sp_real_ai_builder_enabled', BlocksHelper::is_active_module( self::MODULE ) && ConnectorBridge::site_allows_ai() );
	}

	/**
	 * Turn a prompt into block attributes.
	 *
	 * Only the requested provider is asked — no silent failover. A failure
	 * carries `provider`, `label` and `reason` (AI::failure_reason()) in its
	 * data, so the modal can offer the next connected provider instead.
	 *
	 * @param string $prompt   User prompt.
	 * @param string $slug     Requested bare block slug.
	 * @param array  $existing Current attributes of a configured block ({} for a fresh build).
	 * @param string $provider Requested provider slug ('' for Auto).
	 * @param string $model    Model of the requested provider ('' for its saved default).
	 * @return array|\WP_Error `{ blockName, attributes }`.
	 */
	public static function generate( $prompt, $slug, $existing = array(), $provider = '', $model = '' ) {
		$prompt   = self::trim_prompt( $prompt );
		$existing = is_array( $existing ) ? $existing : array();

		if ( '' === $prompt ) {
			return new \WP_Error( 'sp_real_ai_empty_prompt', __( 'Describe the block you want to create.', 'testimonial-free' ), array( 'status' => 400 ) );
		}

		if ( empty( AI::connected_providers() ) ) {
			return new \WP_Error( 'sp_real_ai_no_provider', AI::no_provider_message(), array( 'status' => 400 ) );
		}

		$is_fresh = empty( $existing );
		if ( $is_fresh ) {
			$slug = BlockRouter::resolve( $prompt, $slug );
		}

		$answer = AI::complete_json(
			PromptBuilder::system( $slug ),
			PromptBuilder::user( $prompt, $slug, $existing ),
			$provider,
			array(
				'model'    => $model,
				'failover' => false,
			)
		);

		if ( null === $answer ) {
			$error = AI::last_error();
			$code  = ( isset( $error['code'] ) && 'invalid_json' === $error['code'] ) ? 'sp_real_ai_invalid_json' : 'sp_real_ai_provider_error';
			return new \WP_Error(
				$code,
				AI::format_error( $error ),
				array(
					'status'   => 502,
					'provider' => isset( $error['provider'] ) ? $error['provider'] : '',
					'label'    => isset( $error['label'] ) ? $error['label'] : '',
					'reason'   => AI::failure_reason( $error ),
				)
			);
		}

		$attributes = ValueValidator::sanitize( $answer, $slug, $existing );

		if ( $is_fresh && isset( Catalog::LAYOUT_KEYS[ $slug ] ) ) {
			$attributes = array_merge( Catalog::LAYOUT_KEYS[ $slug ], $attributes );
		}

		return array(
			'blockName'  => $slug,
			'attributes' => (object) $attributes,
		);
	}

	/**
	 * Trim and cap the prompt.
	 *
	 * @param string $prompt User prompt.
	 * @return string
	 */
	private static function trim_prompt( $prompt ) {
		$prompt = trim( (string) $prompt );
		return function_exists( 'mb_substr' ) ? mb_substr( $prompt, 0, self::MAX_PROMPT_LENGTH ) : substr( $prompt, 0, self::MAX_PROMPT_LENGTH );
	}
}
