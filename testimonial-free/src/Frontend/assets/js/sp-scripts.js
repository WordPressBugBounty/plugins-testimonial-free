(function ($) {
	"use strict";

	/**
	 * Paint a loop re-order before the slide that follows it. slideToLoop()
	 * slides on the next frame with no reflow in between, so a re-order the
	 * slide cancelled out started no transition, and Swiper waited for its end
	 * forever — every later move was refused as still animating.
	 *
	 * @param {Object} swiper Swiper instance.
	 */
	function tfree_swiper_reflow(swiper) {
		swiper._clientLeft = swiper.wrapperEl.clientLeft;
	}

	/**
	 * The fewest slides Swiper 12's loop runs on at every breakpoint — its own
	 * formula from loopFix(): the slides in view plus the slides it moves across
	 * the seam, rounded up to whole groups.
	 *
	 * Keep in step with minimumSlidesForLoop() in src/Blocks/assets/js/script.js:
	 * the two runtimes ship as separate scripts, so the formula lives in both.
	 * Re-check both against Swiper's loopFix() on every vendor update.
	 *
	 * @param {Object} config Swiper options.
	 * @return {number} Minimum slide count.
	 */
	function tfree_swiper_loop_minimum(config) {
		var entries = [config];
		$.each(config.breakpoints || {}, function (key, entry) {
			entries.push($.extend({}, config, entry));
		});
		return Math.max.apply(null, entries.map(function (entry) {
			var bothDirections = !!(entry.centeredSlides || entry.slidesOffsetBefore || entry.slidesOffsetAfter);
			var perGroup = Math.max(1, Math.ceil(Number(entry.slidesPerGroup) || 1));
			var perView = Math.max(1, Math.ceil(Number(entry.slidesPerView) || 1));
			if (bothDirections && perView % 2 === 0) {
				perView += 1;
			}
			var looped = bothDirections ? Math.max(perGroup, Math.ceil(perView / 2)) : perGroup;
			if (looped % perGroup !== 0) {
				looped += perGroup - (looped % perGroup);
			}
			return perView + looped + Math.max(0, parseInt(entry.loopAdditionalSlides, 10) || 0);
		}));
	}

	/**
	 * Fit Infinite Loop to Swiper 12, which loops by re-ordering the real
	 * slides instead of cloning them and only warns and jams below its own
	 * minimum. A carousel too short to loop rewinds instead.
	 *
	 * @param {Object} config     Swiper options.
	 * @param {number} slideCount Slides in the wrapper.
	 * @return {Object} The same options.
	 */
	function tfree_fit_swiper_loop(config, slideCount) {
		if (config.loop && slideCount < tfree_swiper_loop_minimum(config)) {
			config.loop = false;
			config.rewind = true;
		}
		return config;
	}

	function SPTestimonialCarouselInit() {
		$('.sp-testimonial-free-section').each(function (index) {
			var _this = $(this),
				custom_id = $(this).attr('id'),
				preloader = _this.data('preloader');

			if ('1' == preloader) {
				var parents_class = $('#' + custom_id).parent('.sp-testimonial-free-wrapper'),
					parents_siblings_id = parents_class.find('.sp-testimonial-preloader').attr('id');

				setTimeout(function () {
					$('#' + parents_siblings_id).animate({ opacity: 1 }, 600).hide();
				}, 600);
				$('#' + custom_id).animate({ opacity: 1 }, 600)
			}

			var SliderId = $(this).attr('id');
			var SliderData = $(this).data('swiper');
			// Our copy of Swiper is namespaced; the "dequeue Swiper JS" setting
			// runs on the theme's global instead.
			var TfreeSwiper = window.SpRealSwiper || window.Swiper;
			if (TfreeSwiper && SliderData && !$('#' + SliderId + '.sp-testimonial-free-section').hasClass('swiper-initialized')) {
				var TestimonialSwiper = new TfreeSwiper('#' + SliderId + '.sp-testimonial-free-section', tfree_fit_swiper_loop({
					speed: SliderData.speed,
					slidesPerView: SliderData.slidesPerView.lg_desktop,
					slidesPerGroup: 1,
					spaceBetween: SliderData.spaceBetween,
					loop: SliderData.infinite,
					autoHeight: SliderData.adaptiveHeight,
					simulateTouch: SliderData.draggable,
					freeMode: SliderData.freeMode,
					allowTouchMove: SliderData.swipe,
					mousewheel: SliderData.swipeToSlide,
					slidesPerGroupSkip: 1,
					grabCursor: true,
					pagination:
						SliderData.dots == true
							? {
								el: '#' + SliderId + ' .testimonial-pagination',
								clickable: true,
							}
							: false,
					// A swipe, arrow or dot pauses AutoPlay only until it lands, and
					// Swiper's pointer-type check keeps a tap on a phone from
					// counting as a hover that never ends.
					autoplay: {
						delay: SliderData.autoplaySpeed,
						disableOnInteraction: false,
						pauseOnMouseEnter: SliderData.pauseOnHover && SliderData.autoplay,
					},
					navigation:
						SliderData.arrows == true
							? {
								nextEl: '#' + SliderId + ' .swiper-button-next.testimonial-nav-arrow',
								prevEl: '#' + SliderId + ' .swiper-button-prev.testimonial-nav-arrow',
								addIcons: false,
							}
							: false,
					a11y: {
						scrollOnFocus: false,
					},
					on: {
						loopFix: tfree_swiper_reflow,
					},
					breakpoints: {
						320: {
							slidesPerView: SliderData.slidesPerView.mobile,
							navigation:
								SliderData.navigation_mobile == true
									? {
										nextEl: '#' + SliderId + ' .swiper-button-next.testimonial-nav-arrow',
										prevEl: '#' + SliderId + ' .swiper-button-prev.testimonial-nav-arrow',
										addIcons: false,
									}
									: false,
							pagination:
								SliderData.pagination_mobile == true
									? {
										el: '#' + SliderId + ' .testimonial-pagination',
										clickable: true,
									}
									: false,
						},
						576: {
							slidesPerView: SliderData.slidesPerView.tablet,
						},
						736: {
							slidesPerView: SliderData.slidesPerView.laptop,
						},
						980: {
							slidesPerView: SliderData.slidesPerView.desktop,
						},
						1200: {
							slidesPerView: SliderData.slidesPerView.lg_desktop,
						},
					},
					keyboard: {
						enabled: true
					},
				}, $('#' + SliderId + '.sp-testimonial-free-section > .swiper-wrapper > .swiper-slide').length));
				if (SliderData.autoplay === false || (($(window).width() < 576) && SliderData.autoplay_mobile == false)) {
					TestimonialSwiper.autoplay.stop()
				}
			}
		});
	}

	/**
	 * Expose the initializer globally.
	 *
	 * The block editor canvas is an iframe since WordPress 6.3, so the editor has to
	 * be able to run the initializer on the window that owns the markup instead of
	 * pulling this file into the wrong document. Re-running it is safe: initialized
	 * carousels are skipped and hiding an already hidden preloader is a no-op.
	 */
	window.spTestimonialFreeInit = SPTestimonialCarouselInit;

	// Initialize the carousel when the document is ready
	$(document).ready(function () {
		SPTestimonialCarouselInit();
	});


	// Register the handler with Elementor's frontend event.
	$(window).on('elementor/frontend/init', function () {
		// For General Widget.
		elementorFrontend.hooks.addAction('frontend/element_ready/real_testimonial_Pro_shortcode.default', SPTestimonialCarouselInit);
		// For Deprecated wiget.
		elementorFrontend.hooks.addAction('frontend/element_ready/real_testimonial_free_shortcode.default', SPTestimonialCarouselInit);
	});

})(jQuery);