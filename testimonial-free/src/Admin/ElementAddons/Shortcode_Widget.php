<?php
/**
 * Framework options.class file.
 *
 * @link https://shapedplugin.com
 * @since 2.0.0
 *
 * @package Testimonial_free
 * @subpackage Testimonial_free/Admin
 */

namespace ShapedPlugin\TestimonialFree\Admin\ElementAddons;

use ShapedPlugin\TestimonialFree\Frontend\Helper;
use ShapedPlugin\TestimonialFree\Frontend\Frontend;

/**
 * Elementor real testimonial free shortcode Widget.
 *
 * @since 2.5.2
 */
class Shortcode_Widget extends \Elementor\Widget_Base {
	/**
	 * Get widget name.
	 *
	 * @since 2.5.2
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'real_testimonial_Pro_shortcode';
	}

	/**
	 * Get widget title.
	 *
	 * @since 2.5.2
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Real Testimonial', 'testimonial-free' );
	}

	/**
	 * Get widget icon.
	 *
	 * @since 2.5.2
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'sp-rt-icon';
	}

	/**
	 * Get widget categories.
	 *
	 * @since 2.5.2
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return array( 'basic' );
	}

	/**
	 * Get all post list.
	 *
	 * @since 2.5.2
	 * @return array
	 */
	public function sprtp_post_list() {
		$post_list   = array();
		$sprtp_posts = new \WP_Query(
			array(
				'post_type'      => 'spt_shortcodes',
				'post_status'    => 'publish',
				'posts_per_page' => 9999,
			)
		);
		$posts       = $sprtp_posts->posts;
		foreach ( $posts as $post ) {
			$post_list[ $post->ID ] = $post->post_title;
		}
		krsort( $post_list );
		return $post_list;
	}

	/**
	 * Controls register.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			array(
				'label' => __( 'Content', 'testimonial-free' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'sp_testimonial_pro_shortcode',
			array(
				'label'       => __( 'Real Testimonial Shortcode(s)', 'testimonial-free' ),
				'type'        => \Elementor\Controls_Manager::SELECT2,
				'label_block' => true,
				'default'     => '',
				'options'     => $this->sprtp_post_list(),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render testimonial shortcode widget output on the frontend.
	 *
	 * @since 2.5.2
	 * @access protected
	 */
	protected function render() {

		$settings                 = $this->get_settings_for_display();
		$sp_testimonial_shortcode = $settings['sp_testimonial_pro_shortcode'];

		if ( '' === $sp_testimonial_shortcode ) {
			echo '<div style="text-align: center; margin-top: 0; padding: 10px" class="elementor-add-section-drag-title">Select a shortcode</div>';
			return;
		}

		$generator_id = $sp_testimonial_shortcode;

		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			$post_id         = $generator_id;
			$setting_options = get_option( 'sp_testimonial_pro_options' );
			$shortcode_data  = get_post_meta( $post_id, 'sp_tpro_shortcode_options', true );
			$layout_data     = get_post_meta( $post_id, 'sp_tpro_layout_options', true );

			$main_section_title = get_the_title( $post_id );

			// Load dynamic style.
			$dynamic_style = Frontend::load_dynamic_style( $post_id, $shortcode_data, $layout_data );
			echo '<style>' . esc_html( $dynamic_style['dynamic_css'] ) . '</style>';

			Helper::sp_testimonial_html_show( $post_id, $setting_options, $shortcode_data, $layout_data, $main_section_title );
			?>
			<script>
			jQuery('#sp-testimonial-preloader-' + <?php echo esc_attr( $generator_id ); ?>).animate({ opacity: 0, zIndex: -99 }, 600);
			</script>
			<script src="<?php echo esc_url( SP_TFREE_URL . 'Frontend/assets/js/sp-scripts.min.js' ); ?>" ></script>
			<?php
		} else {
			echo do_shortcode( '[sp_testimonial id="' . esc_attr( $generator_id ) . '"]' );
		}
	}
}
