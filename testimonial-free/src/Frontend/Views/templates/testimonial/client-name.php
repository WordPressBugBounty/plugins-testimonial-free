<?php
/**
 * Client Name.
 *
 * This template can be overridden by copying it to your theme/testimonial-free/templates/testimonial/client-name.php
 *
 * @package    Testimonial_Free
 * @subpackage Testimonial_Free/Frontend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<<?php echo esc_attr( $reviewer_name_tag ); ?> class="sp-testimonial-client-name">
<?php
do_action( 'sptpro_before_testimonial_client_name' );
	echo \ShapedPlugin\TestimonialFree\Includes\Sanitizer::kses_inline( $tfree_name ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_kses inline allow-list.
do_action( 'sptpro_after_testimonial_client_name' );
?>
</<?php echo esc_attr( $reviewer_name_tag ); ?>>
