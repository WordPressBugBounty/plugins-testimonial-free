/**
 * Pro block metadata.
 *
 * One entry per Pro-only block. Mirrors the former per-block `block.json`
 * files, converted to JS so icons/preview components can be referenced
 * directly and every block registered from a single loop (see index.js).
 */
import { __ } from "@wordpress/i18n";
import {
	BentoGridBlockIcon,
	BentoGridBlockPreviewImage,
	MarqueeBlockIcon,
	MarqueeBlockPreviewImage,
	MasonryBlockIcon,
	MasonryBlockPreviewImage,
	PolaroidGridBlockIcon,
	PolaroidGridBlockPreviewImage,
	StackedCardsBlockIcon,
	StackedCardsBlockPreviewImage,
	SpotlightBlockIcon,
	SpotlightBlockPreviewImage,
	VideoTestimonialBlockIcon,
	VideoTestimonialBlockPreviewImage,
	ReviewBadgeBlockIcon,
	ReviewBadgeBlockPreviewImage,
	RecordVideoBlockIcon,
	RecordVideoBlockPreviewImage,
} from "./icons";

// baseMetadata.
const baseMetadata = {
	apiVersion: 3,
	category: "sp-testimonial-pro-blocks",
	supports: {
		align: ["wide", "full"],
		customClassName: true,
	},
	attributes: {
		isPreview: {
			type: "boolean",
			default: false,
		},
		align: {
			type: "string",
			default: "wide",
		},
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
};

const proBlocks = [
	{
		...baseMetadata,
		name: "sp-testimonial-pro/bento-grid",
		title: __("Bento Grid", "testimonial-free"),
		description: __("Modern mixed-size testimonial cards in a stylish bento grid.", "testimonial-free"),
		icon: BentoGridBlockIcon,
		previewImage: BentoGridBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/marquee",
		title: __("Marquee", "testimonial-free"),
		description: __("Display testimonials in a continuous horizontal marquee.", "testimonial-free"),
		icon: MarqueeBlockIcon,
		previewImage: MarqueeBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/masonry",
		title: __("Masonry", "testimonial-free"),
		description: __("Dynamic masonry layout for testimonials with varying content lengths.", "testimonial-free"),
		icon: MasonryBlockIcon,
		previewImage: MasonryBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/polaroid-grid",
		title: __("Polaroid Grid", "testimonial-free"),
		description: __("Display testimonials in a stylish Polaroid-style photo grid layout.", "testimonial-free"),
		icon: PolaroidGridBlockIcon,
		previewImage: PolaroidGridBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/stacked-cards",
		title: __("Stacked Cards", "testimonial-free"),
		description: __("Display testimonials as a layered slider or a fanned card deck.", "testimonial-free"),
		icon: StackedCardsBlockIcon,
		previewImage: StackedCardsBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/spotlight",
		title: __("Spotlight", "testimonial-free"),
		description: __(
			"Put one review in the spotlight — as a tab set, an accordion carousel or a grid of reviewer photos.",
			"testimonial-free"
		),
		icon: SpotlightBlockIcon,
		previewImage: SpotlightBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/video-testimonials",
		title: __("Video Testimonials", "testimonial-free"),
		description: __("Showcase the video testimonials you collected, in a carousel or a grid.", "testimonial-free"),
		icon: VideoTestimonialBlockIcon,
		previewImage: VideoTestimonialBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/review-badge",
		title: __("Review Badge", "testimonial-free"),
		description: __("Show overall rating, review counts, and summary.", "testimonial-free"),
		icon: ReviewBadgeBlockIcon,
		previewImage: ReviewBadgeBlockPreviewImage,
	},
	{
		...baseMetadata,
		name: "sp-testimonial-pro/record-video",
		title: __("Record Video", "testimonial-free"),
		description: __(
			"Allow users to record and submit video testimonials directly from the frontend.",
			"testimonial-free"
		),
		supports: {
			...baseMetadata.supports,
			html: false,
		},
		icon: RecordVideoBlockIcon,
		previewImage: RecordVideoBlockPreviewImage,
	},
];

export default proBlocks;
