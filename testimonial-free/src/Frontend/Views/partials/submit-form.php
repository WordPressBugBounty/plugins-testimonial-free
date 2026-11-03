<?php
/**
 * Testimonial submit form.
 *
 * @package    Testimonial_Free
 * @subpackage Testimonial_Free/Frontend
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use ShapedPlugin\TestimonialFree\Frontend\Helper;
use ShapedPlugin\TestimonialFree\Includes\Sanitizer;

if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] && ! empty( $_POST['action'] ) && 'testimonial_form' . $form_id === $_POST['action'] ) {
	$pid   = false;
	$nonce = isset( $_POST['testimonial_form_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['testimonial_form_nonce'] ) ) : '';
	if ( wp_verify_nonce( $nonce, 'testimonial_form' ) ) {
		$tpro_client_name                    = isset( $_POST['tpro_client_name'] ) ? Sanitizer::public_text( wp_unslash( $_POST['tpro_client_name'] ) ) : '';
		$tpro_client_email                   = isset( $_POST['tpro_client_email'] ) ? sanitize_email( wp_unslash( $_POST['tpro_client_email'] ) ) : '';
		$tpro_client_designation             = isset( $_POST['tpro_client_designation'] ) ? Sanitizer::public_text( wp_unslash( $_POST['tpro_client_designation'] ) ) : '';
		$tpro_company_name                   = isset( $_POST['tpro_client_company_name'] ) ? Sanitizer::public_text( wp_unslash( $_POST['tpro_client_company_name'] ) ) : '';
		$tpro_location                       = isset( $_POST['tpro_client_location'] ) ? Sanitizer::public_text( wp_unslash( $_POST['tpro_client_location'] ) ) : '';
		$tpro_phone                          = isset( $_POST['tpro_client_phone'] ) ? preg_replace( '/[^0-9+-]/', '', sanitize_text_field( wp_unslash( $_POST['tpro_client_phone'] ) ) ) : '';
		$tpro_website                        = isset( $_POST['tpro_client_website'] ) ? esc_url( sanitize_text_field( wp_unslash( $_POST['tpro_client_website'] ) ) ) : '';
		$tpro_testimonial_title              = isset( $_POST['tpro_testimonial_title'] ) ? Sanitizer::public_text( wp_unslash( $_POST['tpro_testimonial_title'] ) ) : '';
		$tpro_testimonial_text               = isset( $_POST['tpro_client_testimonial'] ) ? Sanitizer::public_textarea( wp_unslash( $_POST['tpro_client_testimonial'] ) ) : '';
		$tpro_rating_star                    = isset( $_POST['tpro_client_rating'] ) ? sanitize_key( $_POST['tpro_client_rating'] ) : '';
		$tpro_client_video_upload            = isset( $_POST['tpro_client_video_upload'] ) ? sanitize_key( $_POST['tpro_client_video_upload'] ) : '';
		$tpro_client_checkbox                = ! empty( $_POST['tpro_client_checkbox'] ) && ! empty( sanitize_text_field( wp_unslash( $_POST['tpro_client_checkbox'] ) ) ) ? '1' : '0';
		$tpro_auto_publish_ratings           = isset( $form_data['tpro_auto_publish_rating'] ) && is_array( $form_data['tpro_auto_publish_rating'] ) ? $form_data['tpro_auto_publish_rating'] : array();
		$tpro_admin_email                    = isset( $form_data['submission_email_to'] ) ? $form_data['submission_email_to'] : '';
		$tpro_reviewer_awaiting_notification = isset( $form_data['reviewer_awaiting_notification'] ) ? $form_data['reviewer_awaiting_notification'] : '';
		$tpro_approval_notification          = isset( $form_data['approval_notification'] ) ? $form_data['approval_notification'] : '';
		$tpro_admin_email_from               = isset( $form_data['submission_email_from'] ) ? $form_data['submission_email_from'] : '';
		$tpro_post_status                    = isset( $form_data['testimonial_approval_status'] ) ? $form_data['testimonial_approval_status'] : 'pending';
		if ( in_array( $tpro_post_status, array( 'based_on_rating_star', 'publish' ), true ) ) {
			$tpro_post_status = 'pending';
		}
		// ADD THE FORM INPUT TO $testimonial_form ARRAY.
		$testimonial_form = array(
			'post_title'   => $tpro_testimonial_title,
			'post_content' => $tpro_testimonial_text,
			'post_status'  => $tpro_post_status,
			'post_type'    => 'spt_testimonial',
			'meta_input'   => array(
				'sp_tpro_meta_options' => array(
					'tpro_name'            => $tpro_client_name,
					'tpro_email'           => $tpro_client_email,
					'tpro_designation'     => $tpro_client_designation,
					'tpro_company_name'    => $tpro_company_name,
					'tpro_location'        => $tpro_location,
					'tpro_phone'           => $tpro_phone,
					'tpro_website'         => $tpro_website,
					'tpro_rating'          => $tpro_rating_star,
					'tpro_client_checkbox' => $tpro_client_checkbox,
					'tpro_form_id'         => $form_id,
				),
			),
		);

		$tpro_redirect  = $form_data['tpro_redirect'];
		$response_data2 = false;

		// Save The Testimonial.
		$pid            = wp_insert_post( $testimonial_form );
		$validation_msg = '';
		if ( $pid ) {
			// Thanks message.
			$validation_msg .= $form_data['successful_message'];
			self::tpro_redirect( get_page_link() . '#submit' );
		}

		// Reviewer photo — only the one canonical file input, only when the form
		// shows the Image field, through the block form's upload guard (real
		// MIME check, size ceiling, IPTC caption dropped).
		Helper::store_classic_form_uploads( $pid, in_array( 'image', (array) $form_element, true ) );
	} else {
		wp_die( esc_html__( 'Our site is protected!', 'testimonial-free' ) );
	}
	$_POST = array();
} // END THE IF STATEMENT THAT STARTED THE WHOLE FORM.
