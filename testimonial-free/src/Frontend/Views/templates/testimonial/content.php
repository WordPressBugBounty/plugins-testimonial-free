<?php
/**
 * Testimonial content.
 *
 * This template can be overridden by copying it to your theme/testimonial-free/templates/testimonial/content.php
 *
 * @package    Testimonial_Free
 * @subpackage Testimonial_Free/Frontend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
$content     = apply_filters( 'the_content', get_the_content() );
$review_text = apply_filters( 'sp_testimonial_review_content', $content, $post_id );
$review_text = str_replace( ']]>', ']]&gt;', $review_text );
?>
<div class="sp-testimonial-client-testimonial">
	<?php do_action( 'sptpro_before_testimonial_content' ); ?>
	<div class="sp-testimonial-content">
	<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_kses post allow-list minus data-*, plus <source> and oEmbed iframes for video/audio.
		echo \ShapedPlugin\TestimonialFree\Includes\Sanitizer::kses_content( $review_text, true );
	?>
	</div>
	<?php do_action( 'sptpro_after_testimonial_content' ); ?>
</div>
<?php
