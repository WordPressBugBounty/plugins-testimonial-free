<?php
/**
 * API management class for admin dashboard.
 *
 * @link https://shapedplugin.com/
 * @since 4.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Admin
 * @author ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\TestimonialFree\Admin\Dashboard;

use ShapedPlugin\TestimonialFree\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\TestimonialFree\Blocks\Includes\BlocksHelper;
use ShapedPlugin\TestimonialFree\Blocks\Includes\AI;
use ShapedPlugin\TestimonialFree\Blocks\Includes\ConnectorBridge;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * ManageAPI Class.
 *
 * Handles all REST API and AJAX endpoints for the dashboard.
 */
class ManageAPI {

	/**
	 * REST API namespace.
	 *
	 * @var string
	 */
	private const REST_NAMESPACE = 'sp-rtp/v2';

	/**
	 * Character a masked AI key is padded with. No provider key contains it, so a submitted
	 * value carrying it is a mask the dashboard echoed back.
	 *
	 * @var string
	 */
	private const KEY_MASK_CHAR = '*';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// REST API endpoints.
		add_action( 'rest_api_init', array( $this, 'sp_real_dashboard_register_rest_routes' ) );
		// AJAX handlers (backward compatibility).
		add_action( 'wp_ajax_sp_real_get_user_consent', array( $this, 'sp_real_get_user_consent' ) );
		// Dashboard placements table.
		add_action( 'wp_ajax_sp_real_block_usage', array( $this, 'sp_real_block_usage' ) );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function sp_real_dashboard_register_rest_routes() {
		// Get/update dashboard settings.
		register_rest_route(
			self::REST_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'sp_real_get_plugin_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'sp_real_update_plugin_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		// Get changelog.
		register_rest_route(
			self::REST_NAMESPACE,
			'/changelog',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'sp_real_get_changelog' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		// User consent.
		register_rest_route(
			self::REST_NAMESPACE,
			'/consent',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rest_handle_consent' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
		// Saved templates — server-side search + pagination for the dashboard
		// table. Mutations (duplicate / trash) run through the core entity
		// store in the dashboard, so there is deliberately no mutation route —
		// and never a singular `/saved-template` route: WP_REST_Server keys
		// routes by regex and it would replace this one.
		register_rest_route(
			self::REST_NAMESPACE,
			'/saved-templates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_saved_templates' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		// AI provider key check — the AI Configuration tab calls it before saving.
		register_rest_route(
			self::REST_NAMESPACE,
			'/ai-verify',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'verify_ai_credentials' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'provider'     => array(
						'type'              => 'string',
						'required'          => true,
						'enum'              => array_keys( AI::PROVIDERS ),
						'sanitize_callback' => 'sanitize_key',
						'validate_callback' => 'rest_validate_request_arg',
					),
					'api_key'      => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'model'        => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'workspace_id' => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Export post options — Testimonial Views / Forms for the Tools page.
		register_rest_route(
			self::REST_NAMESPACE,
			'/export-posts',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'sp_real_get_export_posts' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'type' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'spt_shortcodes', 'spt_testimonial_form' ),
					),
				),
			)
		);
	}

	/**
	 * REST API: Get {id,value,label} options for a Tools-export post type.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function sp_real_get_export_posts( $request ) {
		$type    = $request->get_param( 'type' );
		$allowed = array( 'spt_shortcodes', 'spt_testimonial_form' );
		if ( ! in_array( $type, $allowed, true ) ) {
			return new \WP_REST_Response( array(), 200 );
		}
		return new \WP_REST_Response( DashboardHelper::sp_real_post_options( $type ), 200 );
	}

	/**
	 * REST API: Get dashboard settings.
	 *
	 * @return \WP_REST_Response
	 */
	public function sp_real_get_plugin_settings() {
		return new \WP_REST_Response( $this->sp_real_api_response_data(), 200 );
	}

	/**
	 * REST API: Update dashboard settings.
	 *
	 * Switching the Advanced Controls "Contribute" option on sends the diagnostic data once, after
	 * the response has gone out so a slow collector never stalls the save; switching it off also
	 * retires the consent admin notice, since the user has now made the choice.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function sp_real_update_plugin_settings( $request ) {
		$query_data   = $request->get_json_params();
		$new_settings = $query_data['settings'] ?? array();

		// Validate input is array.
		if ( ! is_array( $new_settings ) ) {
			return new \WP_Error(
				'invalid_data',
				__( 'Invalid settings data.', 'testimonial-free' ),
				array( 'status' => 400 )
			);
		}

		if ( ! empty( $new_settings ) ) {
			// AI keys arrive masked unless the user typed a new one.
			$new_settings = $this->map_ai_keys(
				$new_settings,
				function ( $api_key, $slug ) {
					return $this->resolve_submitted_key( $slug, $api_key );
				}
			);

			$was_allowed = rest_sanitize_boolean( DashboardHelper::get_plugin_settings( 'rtp_allow_anonymous_data', false ) );
			$is_allowed  = rest_sanitize_boolean( $new_settings['rtp_allow_anonymous_data'] ?? false );
			if ( $was_allowed && ! $is_allowed ) {
				$new_settings['rtp_ignored_consent_notice'] = true;
			}

			update_option( DashboardHelper::$sp_real_plugin_settings_key, $new_settings );

			if ( $is_allowed && ! $was_allowed ) {
				add_action( 'shutdown', array( $this, 'sp_real_send_data_after_response' ), PHP_INT_MAX );
			}
		}

		return new \WP_REST_Response( $this->sp_real_api_response_data(), 200 );
	}

	/**
	 * Method sp_real_api_response_data.
	 *
	 * @return array
	 */
	public function sp_real_api_response_data() {
		$current_user = wp_get_current_user();
		$settings     = DashboardHelper::get_plugin_settings();

		// AI keys are masked before the response leaves the server; sending the
		// mask back means "keep the stored key".
		$settings = $this->map_ai_keys(
			$settings,
			function ( $api_key ) {
				return $this->mask_api_key( $api_key );
			}
		);

		return array(
			'dashboardInfo' => array(
				'pluginUrl'     => SP_RT_PLUGIN_URL,
				'pluginVersion' => SP_TFREE_VERSION,
				'homeUrl'       => home_url( '/' ),
				'userName'      => $current_user->display_name ?? '',
				'adminUrl'      => admin_url(),
				// The profile's First Name, for greetings; empty when not set
				// (the greeting then takes the first word of `userName`).
				'userFirstName' => trim( (string) ( $current_user->first_name ?? '' ) ),
				// Picks the welcome copy (first visit vs returning). Null until
				// the placements report has been built once.
				'hasPlacements' => BlockUsage::stored_has_placements(),
				'allBlockList'  => array(
					'main'      => BlocksHelper::sp_real_get_all_block_list( 'main' ),
					'parent'    => BlocksHelper::sp_real_get_all_block_list( 'parent' ),
					'child'     => BlocksHelper::sp_real_get_all_block_list( 'child' ),
					'proBlocks' => BlocksHelper::sp_real_get_all_block_list( 'pro_blocks' ),
				),
				// WordPress Connectors state per AI provider — credential presence
				// only, so opening the dashboard never calls a provider.
				'aiConnectors'  => ConnectorBridge::get_public_statuses( array_keys( AI::PROVIDERS ), false ),
				// Registry order, which picks the Primary when none is stored.
				'aiProviderOrder' => array_keys( AI::PROVIDERS ),
				'connectorsUrl' => ConnectorBridge::settings_url(),
			),
			'settings'      => $settings,
			'rtpShortcodes' => DashboardHelper::sp_testimonial_pro_post_list(),
		);
	}

	/**
	 * REST API: Verify unsaved AI provider credentials with one tiny request.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function verify_ai_credentials( $request ) {
		$result = AI::verify_credentials(
			$request['provider'],
			array(
				// A masked key means "the stored one": the user changed only the model or workspace.
				'api_key'      => $this->resolve_submitted_key( $request['provider'], $request['api_key'] ),
				'model'        => $request['model'],
				'workspace_id' => $request['workspace_id'],
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response( array( 'valid' => true ), 200 );
	}

	/**
	 * REST API: Get changelog.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function sp_real_get_changelog( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		$changelog = get_transient( 'sp_rtp_changelogs' );

		if ( empty( $changelog ) ) {
			$changelog = $this->sp_real_fetch_changelog_from_api();
		}

		return new \WP_REST_Response(
			array(
				'changelog' => $changelog,
			),
			200
		);
	}

	/**
	 * REST API: Handle user consent.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function rest_handle_consent( $request ) {
		$query_data = $request->get_json_params();

		// user consent.
		$allow_anonymous_data = false;
		$user_consent         = isset( $query_data['shareData'] ) ? rest_sanitize_boolean( $query_data['shareData'] ) : false;
		if ( $user_consent ) {
			$allow_anonymous_data = true;
			$this->sp_real_send_data_to_rtp_sdr();
		}

		// update option data.
		DashboardHelper::update_plugin_settings( 'rtp_visited_setup_wizard', true );
		DashboardHelper::update_plugin_settings( 'rtp_allow_anonymous_data', $allow_anonymous_data );

		return new \WP_REST_Response(
			array(
				'message' => 'Successfully done',
			),
			200
		);
	}

	/**
	 * REST API: Get saved templates.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_saved_templates( $request ) {
		$search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
		$page     = max( 1, absint( $request->get_param( 'page' ) ?? 1 ) );
		$per_page = max( 1, min( 100, absint( $request->get_param( 'per_page' ) ?? 10 ) ) );

		$args = array(
			'post_type'      => SavedTemplates::POST_TYPE,
			'post_status'    => 'any',
			'posts_per_page' => $per_page,
			'offset'         => ( $page - 1 ) * $per_page,
			's'              => $search,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		$query     = new \WP_Query( $args );
		$templates = array();
		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				$templates[] = $this->prepare_saved_template_row( $post );
			}
		}

		return new \WP_REST_Response(
			array(
				'templates'   => $templates,
				'total_items' => (int) $query->found_posts,
			),
			200
		);
	}

	/**
	 * One saved-template row for the dashboard table.
	 *
	 * @param \WP_Post $post Saved template post.
	 * @return array<string, mixed>
	 */
	private function prepare_saved_template_row( $post ) {
		$block_types = $this->get_template_block_types( $post->post_content );
		$title       = '' !== trim( $post->post_title ) ? $post->post_title : __( '(no title)', 'testimonial-free' );

		return array(
			'id'          => (int) $post->ID,
			'title'       => $title,
			'status'      => $post->post_status,
			'date'        => $post->post_date,
			'dateDisplay' => get_the_date( '', $post ),
			'modified'    => $post->post_modified,
			'shortcode'   => '[sp_real_template id="' . $post->ID . '"]',
			'editUrl'     => get_edit_post_link( $post->ID, 'raw' ) ? get_edit_post_link( $post->ID, 'raw' ) : admin_url( 'post.php?post=' . $post->ID . '&action=edit' ),
			'blockTypes'  => $block_types,
			'blockLabel'  => $this->get_template_block_label( $block_types ),
		);
	}

	/**
	 * Display names of every plugin block a saved template holds, in document
	 * order. A block disabled from the dashboard is not registered, so its
	 * slug prettified is the fallback.
	 *
	 * @param string $content Saved template post content.
	 * @return string[] Block titles.
	 */
	private function get_template_block_types( $content ) {
		if ( ! preg_match_all( '#<!--\s+wp:sp-testimonial-pro/([a-z0-9-]+)#', (string) $content, $matches ) ) {
			return array();
		}

		$registry = \WP_Block_Type_Registry::get_instance();
		$types    = array();
		foreach ( $matches[1] as $slug ) {
			$type = $registry->get_registered( 'sp-testimonial-pro/' . $slug );
			$name = ( $type && ! empty( $type->title ) ) ? $type->title : ucwords( str_replace( '-', ' ', $slug ) );
			if ( ! in_array( $name, $types, true ) ) {
				$types[] = $name;
			}
		}

		return $types;
	}

	/**
	 * The Block column's compact label: first block name plus a count of the
	 * rest ("Grid +1"), or an empty string when the template holds none.
	 *
	 * @param string[] $block_types Block titles.
	 * @return string
	 */
	private function get_template_block_label( $block_types ) {
		$count = count( $block_types );
		if ( 0 === $count ) {
			return '';
		}
		if ( 1 === $count ) {
			return $block_types[0];
		}
		return sprintf( /* translators: 1: block name, 2: count of further blocks */ __( '%1$s +%2$d', 'testimonial-free' ), $block_types[0], $count - 1 );
	}

	/**
	 * AJAX: the dashboard Overview page's placements table.
	 *
	 * @return void
	 */
	public function sp_real_block_usage() {
		if ( ! $this->check_permission() ) {
			wp_send_json_error( array( 'message' => __( 'You do not have permission to do that.', 'testimonial-free' ) ), 403 );
		}

		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, DashboardHelper::$sp_real_dashboard_nonce_key ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid nonce.', 'testimonial-free' ) ), 403 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified above.
		$force = isset( $_POST['refresh'] ) && 'true' === sanitize_text_field( wp_unslash( $_POST['refresh'] ) );

		wp_send_json_success( BlockUsage::report( $force ) );
	}

	/**
	 * Fetches changelog from the remote API.
	 * Stores the changelog in a transient for caching (1 day).
	 *
	 * @return string The changelog content or empty string on failure.
	 */
	protected function sp_real_fetch_changelog_from_api() {
		$api_url  = 'https://api.wordpress.org/plugins/info/1.0/testimonial-free.json';
		$response = wp_safe_remote_get( esc_url_raw( $api_url ), array( 'timeout' => 15 ) );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return '';
		}

		$api_data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! isset( $api_data['sections']['changelog'] ) ) {
			return '';
		}

		$changelog = wp_kses_post( $api_data['sections']['changelog'] );

		set_transient( 'sp_rtp_changelogs', $changelog, DAY_IN_SECONDS );

		return $changelog;
	}

	/**
	 * Handle AJAX request to get and save user consent.
	 *
	 * This function processes user consent preferences for anonymous data sharing.
	 * It requires user authentication and nonce verification for security.
	 * Updates options for setup wizard visit status, anonymous data sharing preference,
	 * and website type. If consent is granted, it sends collected site data to the
	 * Real Testimonials SDR service.
	 *
	 * @return void Sends JSON response with success or error message.
	 */
	public function sp_real_get_user_consent() {
		// Check user capability.
		if ( ! $this->check_permission() ) {
			wp_send_json_error( __( 'Unauthorized access.', 'testimonial-free' ), 403 );
		}
		// Verify nonce.
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, DashboardHelper::$sp_real_dashboard_nonce_key ) ) {
			wp_send_json_error( __( 'Invalid nonce.', 'testimonial-free' ) );
		}

		// query data - sanitized when individual keys are accessed below.
		$query_data = isset( $_POST['queryData'] ) ? wp_unslash( $_POST['queryData'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- Nonce verified, sanitized after JSON decode.
		$query_data = json_decode( $query_data, true );
		$query_data = is_array( $query_data ) ? $query_data : array();
		// user consent.
		$allow_anonymous_data = false;
		$user_consent         = isset( $query_data['shareData'] ) ? rest_sanitize_boolean( $query_data['shareData'] ) : false;
		if ( $user_consent ) {
			$allow_anonymous_data = true;
			$this->sp_real_send_data_to_rtp_sdr();
		}
		// update option data.
		DashboardHelper::update_plugin_settings( 'rtp_visited_setup_wizard', true );
		DashboardHelper::update_plugin_settings( 'rtp_allow_anonymous_data', $allow_anonymous_data );
		// send response.
		wp_send_json_success(
			array(
				'message' => 'Successfully done',
			)
		);
	}

	/**
	 * Send the diagnostic data once the REST response is on its way.
	 *
	 * On PHP-FPM the connection is closed first, so the dashboard save returns at once; elsewhere
	 * the send still runs at the very end of the request.
	 *
	 * @return void
	 */
	public function sp_real_send_data_after_response() {
		if ( function_exists( 'fastcgi_finish_request' ) ) {
			fastcgi_finish_request();
		}
		$this->sp_real_send_data_to_rtp_sdr();
	}

	/**
	 * Collects and sends anonymous data to remote server.
	 * Uses DashboardHelper methods for data collection and sending.
	 */
	protected function sp_real_send_data_to_rtp_sdr() {
		$data = DashboardHelper::collect_anonymous_data();
		if ( empty( $data ) ) {
			return; // Local site or no data to send.
		}
		DashboardHelper::send_data_to_remote( $data );
	}

	/**
	 * Check permission for REST API requests.
	 *
	 * @return bool
	 */
	public function check_permission() {
		return current_user_can( apply_filters( 'sp_real_testimonial_ui_permission', 'manage_options' ) );
	}

	/**
	 * Obscure an AI provider key for the dashboard: up to six characters at each end around a
	 * fixed run of 24 mask characters, so the mask never tells the key's length.
	 *
	 * Each end shows at most a quarter of the key, so a short key is never revealed whole; one
	 * of 8 characters or fewer is masked entirely.
	 *
	 * @param string $api_key Raw key.
	 * @return string Empty string when there is no key.
	 */
	private function mask_api_key( $api_key ) {
		$api_key = trim( (string) $api_key );
		$length  = mb_strlen( $api_key );

		if ( 0 === $length ) {
			return '';
		}

		if ( $length <= 8 ) {
			return str_repeat( self::KEY_MASK_CHAR, $length );
		}

		$visible = min( 6, intdiv( $length, 4 ) );

		return mb_substr( $api_key, 0, $visible ) . str_repeat( self::KEY_MASK_CHAR, 24 ) . mb_substr( $api_key, -$visible );
	}

	/**
	 * The key a dashboard request means.
	 *
	 * The dashboard only holds the masked key, so a value carrying the mask character is that mask
	 * echoed back (or a mangled copy of it) and stands for the stored key. Anything else is a key
	 * the user typed, and an empty value clears it.
	 *
	 * @param string $provider  Provider slug.
	 * @param string $submitted Key as the dashboard sent it.
	 * @return string Raw key.
	 */
	private function resolve_submitted_key( $provider, $submitted ) {
		// Same cleaning `/ai-verify`'s schema applies, so the key saved is the key that was verified.
		$submitted = sanitize_text_field( (string) $submitted );

		if ( false === strpos( $submitted, self::KEY_MASK_CHAR ) ) {
			return $submitted;
		}

		$integrations = (array) DashboardHelper::get_plugin_settings( 'integrations', array() );
		$stored       = $integrations[ $provider ]['api_key'] ?? '';

		return is_string( $stored ) ? trim( $stored ) : '';
	}

	/**
	 * Run a callback over integrations.<slug>.api_key for every AI provider.
	 *
	 * @param mixed    $settings Plugin settings.
	 * @param callable $callback Receives ( $api_key, $slug ), returns the replacement.
	 * @return mixed
	 */
	private function map_ai_keys( $settings, $callback ) {
		if ( ! is_array( $settings ) || ! isset( $settings['integrations'] ) || ! is_array( $settings['integrations'] ) ) {
			return $settings;
		}

		foreach ( array_keys( AI::PROVIDERS ) as $slug ) {
			if ( ! isset( $settings['integrations'][ $slug ] ) || ! is_array( $settings['integrations'][ $slug ] ) ) {
				continue;
			}

			if ( ! array_key_exists( 'api_key', $settings['integrations'][ $slug ] ) ) {
				continue;
			}

			$api_key = $settings['integrations'][ $slug ]['api_key'];

			$settings['integrations'][ $slug ]['api_key'] = is_string( $api_key ) ? call_user_func( $callback, $api_key, $slug ) : '';
		}

		return $settings;
	}
}
