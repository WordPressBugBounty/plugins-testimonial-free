import { __ } from "@wordpress/i18n";
import { CarouselBlockIcon } from "../blocks/carousel/icon";
import { GridBlockIcon } from "../blocks/grid/icon";
import { ZigzagListBlockIcon } from "../blocks/zigzag-list/icon";
import { SubmissionFormBlockIcon } from "../blocks/testimonial-submission-form/icon";
import {
	MasonryBlockIcon,
	MarqueeBlockIcon,
	BentoGridBlockIcon,
	PolaroidGridBlockIcon,
	StackedCardsBlockIcon,
	SpotlightBlockIcon,
	VideoTestimonialBlockIcon,
	ReviewBadgeBlockIcon,
	RecordVideoBlockIcon,
} from "../blocks/proBlocks/icons";
import { SliderBlockIcon } from "../blocks/slider/icon";
import { TestimonialShortcodeBlockIcon } from "../blocks/shortcode/icon";
import { TestimonialFormShortcodeBlockIcon } from "../blocks/shortcode-form/icon";
import { AjaxPaginationBlockIcon } from "../blocks/ajax-pagination/icon";
import {
	AjaxSearchBlockIcon,
	FilterByGroupBlockIcon,
	FilterByRatingBlockIcon,
	LiveFrontendFilterBlockIcon,
	ReviewSummaryBlockIcon,
} from "../icons/proBlocksIcon";

export const docsBaseUrl = "https://docs.realtestimonials.io/guide/";

export const generateDocLink = (link) => {
	return `${docsBaseUrl}${link}`;
};

export const demoBaseUrl = "https://realtestimonials.io/patterns/";

/**
 * Link to a block's patterns on the live demo site. Consumed by the dashboard
 * Blocks cards "Demo" link and the Pro-block teasers' "View Demo" button.
 *
 * @param {string} blockSlug Bare block slug, e.g. "carousel".
 * @returns {string} The demo URL with the block's filter as the hash.
 */
export const generateDemoLink = (blockSlug) => {
	return `${demoBaseUrl}#${blockSlug}`;
};

export const testimonialBlocksInfo = {
	"sp-testimonial-pro/live-frontend-filter": {
		Icon: LiveFrontendFilterBlockIcon,
		title: __("Live Frontend Filter", "testimonial-free"),
		docLink: generateDocLink("blocks/live-frontend-filter"),
	},
	"sp-testimonial-pro/filter-by-group": {
		Icon: FilterByGroupBlockIcon,
		title: __("Filter By Group", "testimonial-free"),
		docLink: generateDocLink("blocks/filter-by-group"),
	},
	"sp-testimonial-pro/filter-by-rating": {
		Icon: FilterByRatingBlockIcon,
		title: __("Filter By Rating", "testimonial-free"),
		docLink: generateDocLink("blocks/filter-by-rating"),
	},
	"sp-testimonial-pro/review-summary": {
		Icon: ReviewSummaryBlockIcon,
		title: __("AI Review Summary", "testimonial-free"),
		docLink: generateDocLink("blocks/review-summary"),
	},
	"sp-testimonial-pro/ajax-testimonial-search": {
		Icon: AjaxSearchBlockIcon,
		title: __("Ajax Testimonial Search", "testimonial-free"),
		docLink: generateDocLink("blocks/ajax-testimonial-search"),
	},
	"sp-testimonial-pro/ajax-pagination": {
		Icon: AjaxPaginationBlockIcon,
		title: __("Ajax Pagination", "testimonial-free"),
		docLink: generateDocLink("blocks/ajax-pagination"),
	},
	// parent blocks.
	"sp-testimonial-pro/carousel": {
		Icon: CarouselBlockIcon,
		title: __("Carousel", "testimonial-free"),
		docLink: generateDocLink("blocks/carousel"),
		patternSlug: "carousel",
	},
	"sp-testimonial-pro/marquee": {
		Icon: MarqueeBlockIcon,
		title: __("Marquee", "testimonial-free"),
		docLink: generateDocLink("blocks/marquee"),
		patternSlug: "marquee",
	},
	"sp-testimonial-pro/slider": {
		Icon: SliderBlockIcon,
		title: __("Slider", "testimonial-free"),
		docLink: generateDocLink("blocks/slider"),
		patternSlug: "slider",
	},
	"sp-testimonial-pro/grid": {
		Icon: GridBlockIcon,
		title: __("Grid", "testimonial-free"),
		docLink: generateDocLink("blocks/grid"),
		patternSlug: "grid",
	},
	"sp-testimonial-pro/zigzag-list": {
		Icon: ZigzagListBlockIcon,
		title: __("List", "testimonial-free"),
		docLink: generateDocLink("blocks/zigzag-list"),
		patternSlug: "zigzag-list",
	},
	"sp-testimonial-pro/bento-grid": {
		Icon: BentoGridBlockIcon,
		title: __("Bento Grid", "testimonial-free"),
		docLink: generateDocLink("blocks/bento-grid"),
		patternSlug: "bento-grid",
	},
	"sp-testimonial-pro/polaroid-grid": {
		Icon: PolaroidGridBlockIcon,
		title: __("Polaroid Grid", "testimonial-free"),
		docLink: generateDocLink("blocks/polaroid-grid"),
		patternSlug: "polaroid-grid",
	},
	"sp-testimonial-pro/masonry": {
		Icon: MasonryBlockIcon,
		title: __("Masonry", "testimonial-free"),
		docLink: generateDocLink("blocks/masonry"),
		patternSlug: "masonry",
	},
	"sp-testimonial-pro/stacked-cards": {
		Icon: StackedCardsBlockIcon,
		title: __("Stacked Cards", "testimonial-free"),
		docLink: generateDocLink("blocks/stacked-cards"),
		patternSlug: "stacked-cards",
	},
	"sp-testimonial-pro/spotlight": {
		Icon: SpotlightBlockIcon,
		title: __("Spotlight", "testimonial-free"),
		docLink: generateDocLink("blocks/spotlight"),
		patternSlug: "spotlight",
	},
	"sp-testimonial-pro/video-testimonials": {
		Icon: VideoTestimonialBlockIcon,
		title: __("Video Testimonials", "testimonial-free"),
		docLink: generateDocLink("blocks/video-testimonials"),
		patternSlug: "video-testimonials",
	},
	"sp-testimonial-pro/review-badge": {
		Icon: ReviewBadgeBlockIcon,
		title: __("Review Badge", "testimonial-free"),
		docLink: generateDocLink("blocks/review-badge"),
		patternSlug: "review-badge",
	},
	"sp-testimonial-pro/record-video": {
		Icon: RecordVideoBlockIcon,
		title: __("Record Video", "testimonial-free"),
		docLink: generateDocLink("blocks/record-video"),
		patternSlug: "record-video",
	},
	"sp-testimonial-pro/testimonial-submission-form": {
		Icon: SubmissionFormBlockIcon,
		title: __("Testimonial Submission Form", "testimonial-free"),
		docLink: generateDocLink("blocks/submission-form"),
		patternSlug: "testimonial-submission-form",
	},
	// shortcode blocks.
	"sp-testimonial-pro/shortcode": {
		Icon: TestimonialShortcodeBlockIcon,
		title: __("Classic View Shortcode", "testimonial-free"),
		docLink: generateDocLink("blocks/real-testimonials-shortcode"),
	},
	"sp-testimonial-pro/form": {
		Icon: TestimonialFormShortcodeBlockIcon,
		title: __("Classic Form Shortcode", "testimonial-free"),
		docLink: generateDocLink("blocks/testimonials-form-shortcode"),
	},
};

export const pricingPageUrl = "https://realtestimonials.io/pricing/";
