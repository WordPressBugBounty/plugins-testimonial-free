<?php
/**
 * The plugin gutenberg block Initializer.
 *
 * @link       https://shapedplugin.com/
 * @since      2.5.1
 *
 * @package    testimonial_free
 * @subpackage testimonial_free/Admin
 * @author     ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\TestimonialFree\Admin\GutenbergBlock;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use ShapedPlugin\TestimonialFree\Frontend\Helper;

if ( ! class_exists( 'ShapedPlugin\TestimonialFree\Admin\GutenbergBlock\Gutenberg_Block_Init' ) ) {
	/**
	 * Sp_Testimonial_free_Gutenberg_Block_Init class.
	 */
	class Gutenberg_Block_Init {
		/**
		 * Script and style suffix
		 *
		 * @since 2.5.3
		 * @access protected
		 * @var string
		 */
		protected $suffix;
		/**
		 * Custom Gutenberg Block Initializer.
		 */
		public function __construct() {
			$this->suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) || ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? '' : '.min';
			add_action( 'plugins_loaded', array( $this, 'sptf_testimonial_plugin_loaded' ) );
			add_action( 'init', array( $this, 'sptf_gutenberg_shortcode_block' ) );
			add_action( 'init', array( $this, 'sptf_gutenberg_form_shortcode_block' ) );
			add_action( 'enqueue_block_editor_assets', array( $this, 'sptf_block_editor_assets' ) );
			add_action( 'enqueue_block_assets', array( $this, 'sptf_block_canvas_assets' ) );
		}

		/**
		 * Register category for Testimonial blocks
		 */
		public function sptf_testimonial_plugin_loaded() {
			if ( version_compare( $GLOBALS['wp_version'], '5.7', '<' ) ) {
				add_filter( 'block_categories', array( $this, 'sptf_testimonial_block_category' ) );
			} else {
				add_filter( 'block_categories_all', array( $this, 'sptf_testimonial_block_category' ) );
			}
		}

		/**
		 * Method to register testimonial blocks category.
		 *
		 * @param mixed $categories block category.
		 *
		 * @return $categories array
		 */
		public function sptf_testimonial_block_category( $categories ) {
			return array_merge(
				array(
					array(
						'slug'  => 'testimonial-free',
						'title' => __( 'Real Testimonial', 'testimonial-free' ),
					),
				),
				$categories
			);
		}

		/**
		 * Register block editor script for backend.
		 *
		 * This hook only reaches the outer editor document. Since WordPress 6.3 the
		 * block canvas is an iframe and WordPress 7.1 iframes it unconditionally, so
		 * everything the rendered testimonial needs is enqueued in
		 * `sptf_block_canvas_assets()` instead.
		 */
		public function sptf_block_editor_assets() {
			$asset_file = SP_TFREE_PATH . 'Admin/GutenbergBlock/build/index.asset.php';
			$asset      = file_exists( $asset_file ) ? require $asset_file : array();

			$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array(
				'react-jsx-runtime',
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-element',
				'wp-escape-html',
				'wp-i18n',
				'wp-server-side-render',
			);
			$version      = isset( $asset['version'] ) ? $asset['version'] : SP_TFREE_VERSION;

			wp_enqueue_script(
				'sp-testimonial-pro-shortcode-block',
				plugins_url( '/GutenbergBlock/build/index.js', __DIR__ ),
				$dependencies,
				$version,
				true
			);

			/**
			 * The block configuration has to ride on the script that reads it. It used
			 * to be localized onto a front-end handle that only existed because it was
			 * listed as the block's `editor_script`.
			 */
			wp_localize_script(
				'sp-testimonial-pro-shortcode-block',
				'sp_testimonial_free',
				array(
					'ajax_url'      => admin_url( 'admin-ajax.php' ),
					'url'           => esc_url( SP_TFREE_URL ),
					'loadScript'    => SP_TFREE_URL . 'Frontend/assets/js/sp-scripts.min.js',
					'link'          => esc_url( admin_url( 'post-new.php?post_type=spt_shortcodes' ) ),
					'shortCodeList' => $this->sptf_post_list(),
				)
			);

			wp_localize_script(
				'sp-testimonial-pro-shortcode-block',
				'sp_testimonial_form_free',
				array(
					'ajax_url'      => admin_url( 'admin-ajax.php' ),
					'url'           => esc_url( SP_TFREE_URL ),
					'link'          => esc_url( admin_url( 'post-new.php?post_type=spt_shortcodes' ) ),
					'shortCodeList' => $this->sptf_form_shortcode_list(),
				)
			);

			/**
			 * Register block editor css file enqueue for backend.
			 *
			 * Kept for WordPress versions that still render the canvas in the same
			 * document as the editor chrome.
			 */
			wp_enqueue_style( 'sp-testimonial-swiper' );
			wp_enqueue_style( 'tfree-font-awesome' );
			wp_enqueue_style( 'tfree-deprecated-style' );
			wp_enqueue_style( 'tfree-style' );
		}

		/**
		 * Enqueue the testimonial front-end assets for the block editor canvas.
		 *
		 * `enqueue_block_editor_assets` only reaches the outer editor document, while
		 * WordPress collects `enqueue_block_assets` output for the iframed canvas in
		 * `_wp_get_iframed_editor_assets()`. Registering the assets here is what puts
		 * the testimonial CSS, jQuery and Swiper in the same document as the markup
		 * `ServerSideRender` renders.
		 *
		 * In the admin this hook only fires on block editor screens, and the
		 * `is_admin()` guard keeps the assets off front-end pages, where the shortcode
		 * keeps enqueueing them on demand.
		 *
		 * @since 3.1.17
		 */
		public function sptf_block_canvas_assets() {
			if ( ! is_admin() ) {
				return;
			}

			wp_enqueue_style( 'sp-testimonial-swiper' );
			wp_enqueue_style( 'tfree-font-awesome' );
			wp_enqueue_style( 'tfree-deprecated-style' );
			wp_enqueue_style( 'tfree-style' );

			wp_enqueue_script( 'sp-testimonial-swiper-js' );
			wp_enqueue_script( 'sp-testimonial-scripts' );

			/**
			 * The admin stylesheet is not loaded inside the canvas, and its block rules
			 * are scoped to the `block-editor-page` body class of the outer document,
			 * so the placeholder needs its own rules here.
			 */
			wp_add_inline_style(
				'tfree-style',
				'.sprtf-gutenberg-shortcode{padding:0;line-height:24px}.sprtf-gutenberg-shortcode::after{display:none}.sprtf_block_shortcode img{box-shadow:none}select.sprtf-shortcode-selector,select.sprtf-shortcode-selector:focus,select.sprtf-shortcode-selector:focus-visible{width:250px;padding:5px 25px 5px 5px;border:1px solid #ccc;font-size:13px}a.sp_testimonial_block_edit_button{font-size:16px;margin:10px 0}'
			);
		}

		/**
		 * Testimonials Shortcode list.
		 *
		 * @return array
		 */
		public function sptf_post_list() {
			$shortcodes = get_posts(
				array(
					'post_type'      => 'spt_shortcodes',
					'post_status'    => 'publish',
					'posts_per_page' => 9999,
				)
			);

			if ( count( $shortcodes ) < 1 ) {
				return array();
			}

			return array_map(
				function ( $shortcode ) {
						return (object) array(
							'id'    => absint( $shortcode->ID ),
							'title' => esc_html( $shortcode->post_title ),
						);
				},
				$shortcodes
			);
		}
		/**
		 * Forms Shortcode list.
		 *
		 * @return array
		 */
		public function sptf_form_shortcode_list() {
			$shortcodes = get_posts(
				array(
					'post_type'      => 'spt_testimonial_form',
					'post_status'    => 'publish',
					'posts_per_page' => 9999,
				)
			);

			if ( count( $shortcodes ) < 1 ) {
				return array();
			}

			return array_map(
				function ( $shortcode ) {
						return (object) array(
							'id'    => absint( $shortcode->ID ),
							'title' => esc_html( $shortcode->post_title ),
						);
				},
				$shortcodes
			);
		}

		/**
		 * Register Gutenberg shortcode block.
		 */
		public function sptf_gutenberg_shortcode_block() {
			/**
			 * Register Gutenberg block on server-side.
			 */
			register_block_type(
				'sp-testimonial-pro/shortcode',
				array(
					// Block API v3 tells WordPress the block is safe to render inside the
					// iframed editor canvas, which WordPress 7.1 always uses.
					'api_version'     => 3,
					'attributes'      => array(
						'shortcode'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'showInputShortcode' => array(
							'type'    => 'boolean',
							'default' => true,
						),
						'preview'            => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'is_admin'           => array(
							'type'    => 'boolean',
							'default' => is_admin(),
						),
					),
					'example'         => array(
						'attributes' => array(
							'preview' => true,
						),
					),
					// Enqueue blocks.editor.build.css in the editor only.
					'editor_style'    => array(),
					'render_callback' => array( $this, 'sp_testimonial_free_render_shortcode' ),
				)
			);
		}
		/**
		 * Register Gutenberg form shortcode block.
		 */
		public function sptf_gutenberg_form_shortcode_block() {
			wp_register_style( 'tfree-form-css', SP_TFREE_URL . 'Frontend/assets/css/form.css', array(), SP_TFREE_VERSION, '' );

			/**
			 * Register Gutenberg block on server-side.
			 */
			register_block_type(
				'sp-testimonial-pro/form',
				array(
					// Block API v3 tells WordPress the block is safe to render inside the
					// iframed editor canvas, which WordPress 7.1 always uses.
					'api_version'     => 3,
					'attributes'      => array(
						'shortcode'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'showInputShortcode' => array(
							'type'    => 'boolean',
							'default' => true,
						),
						'preview'            => array(
							'type'    => 'boolean',
							'default' => false,
						),
						'is_admin'           => array(
							'type'    => 'boolean',
							'default' => is_admin(),
						),
					),
					'example'         => array(
						'attributes' => array(
							'preview' => true,
						),
					),
					'editor_style'    => array( 'tfree-form-css' ),
					'render_callback' => array( $this, 'sp_testimonial_free_render_form_shortcode' ),
				)
			);
		}

		/**
		 * Render callback.
		 *
		 * @param string $attributes Shortcode.
		 * @return string
		 */
		public function sp_testimonial_free_render_shortcode( $attributes ) {
			$class_name = '';
			if ( ! empty( $attributes['className'] ) ) {
				$class_name = $attributes['className'];
			}

			if ( ! $attributes['is_admin'] ) {
				return '<div class="' . esc_attr( $class_name ) . '">' . do_shortcode( '[sp_testimonial id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
			}

			$edit_page_link = get_edit_post_link( sanitize_text_field( $attributes['shortcode'] ) );

			return '<div id="' . esc_attr( uniqid() ) . '" class="' . esc_attr( $class_name ) . '"><a href="' . esc_url( $edit_page_link ) . '" target="_blank" class="sp_testimonial_block_edit_button">Edit View</a>' . do_shortcode( '[sp_testimonial id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
		}

		/**
		 * Render testimonial form's callback.
		 *
		 * @param string $attributes Shortcode.
		 * @return string
		 */
		public function sp_testimonial_free_render_form_shortcode( $attributes ) {
			$class_name       = '';
			$load_google_font = '';
			$form_id          = (int) $attributes['shortcode'];
			$form_data        = get_post_meta( $form_id, 'sp_tpro_form_options', true );
			$setting_options  = get_option( 'sp_tpro_form_options' );

			if ( ! empty( $attributes['className'] ) ) {
				$class_name = $attributes['className'];
			}

			if ( ! $attributes['is_admin'] ) {
				return '<div class="' . esc_attr( $class_name ) . '">' . do_shortcode( '[sp_testimonial_form id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
			}

			$dynamic_style = Helper::load_form_dynamic_style( $form_id, $form_data, $setting_options );

			$edit_page_link = get_edit_post_link( sanitize_text_field( $attributes['shortcode'] ) );
			return '<div id="testimonial_form_' . esc_attr( $form_id ) . ' " class="' . esc_attr( $class_name ) . '"><a href="' . esc_url( $edit_page_link ) . '" target="_blank" class="sp_testimonial_block_edit_button">Edit View</a>' . do_shortcode( '[sp_testimonial_form id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
		}
	}
}
