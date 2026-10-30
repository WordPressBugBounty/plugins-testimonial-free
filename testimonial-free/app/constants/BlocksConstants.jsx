import { __ } from "@wordpress/i18n";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Dots,
	DynamicDots,
	Fraction,
	Numbers,
	Scrollbar,
	Stepper,
	Strokes,
} from "@testimonial/icons";
import {
	ArrowLine,
	ArrowMinimal,
	ArrowOutline,
	ArrowSend,
	ArrowSolid,
	ChevronBold,
	ChevronBorderLine,
	ChevronOutline,
	ChevronSolid,
	DoubleChevron,
	DoubleChevronOutline,
	TriangleOutline,
} from "../components";

export const borderStyles = [
	{
		label: <span className="sp-real-border-none">{__("None", "testimonial-free")}</span>,
		value: "none",
	},
	{
		label: <span className="sp-real-border-solid"></span>,
		value: "solid",
	},
	{
		label: <span className="sp-real-border-dashed"></span>,
		value: "dashed",
	},
	{
		label: <span className="sp-real-border-dotted"></span>,
		value: "dotted",
	},
	{
		label: <span className="sp-real-border-double"></span>,
		value: "double",
	},
];

export const dividerStyles = [
	{
		label: <span className="sp-real-border-none">{__("None", "testimonial-free")}</span>,
		value: "none",
	},
	{
		label: <span className="sp-real-divider-line sp-real-divider-solid"></span>,
		value: "solid",
	},
	{
		label: <span className="sp-real-divider-line sp-real-divider-dashed"></span>,
		value: "dashed",
	},
	{
		label: <span className="sp-real-divider-line sp-real-divider-dotted"></span>,
		value: "dotted",
	},
	{
		label: <span className="sp-real-divider-line sp-real-divider-double"></span>,
		value: "double",
	},
];

export const cardContentLabels = {
	reviewer_image: __("Reviewer Image", "testimonial-free"),
	testimonial_title: __("Testimonial Title", "testimonial-free"),
	testimonial_text: __("Testimonial Text", "testimonial-free"),
	rating: __("Rating", "testimonial-free"),
	reviewer_name: __("Reviewer Name", "testimonial-free"),
	designation: __("Designation", "testimonial-free"),
	company_info: __("Company Info", "testimonial-free"),
	location: __("Location", "testimonial-free"),
	date: __("Date", "testimonial-free"),
	social_profiles: __("Social Profiles", "testimonial-free"),
	custom_fields: __("Custom Fields", "testimonial-free"),
};

export const SWIPER_PAGINATION_DOTS_OPTIONS = [
	{ label: __("Dots", "testimonial-free"), value: "dots", icon: <Dots /> },
	{
		label: __("Stepper", "testimonial-free"),
		value: "stepper",
		icon: <Stepper />,
	},
	{
		label: __("Dynamic", "testimonial-free"),
		value: "dynamic",
		icon: <DynamicDots />,
		isPro: true,
	},
	{
		label: __("Strokes", "testimonial-free"),
		value: "strokes",
		icon: <Strokes />,
		isPro: true,
	},
	{
		label: __("Scrollbar", "testimonial-free"),
		value: "scrollbar",
		icon: <Scrollbar />,
		isPro: true,
	},
	{
		label: __("Fraction", "testimonial-free"),
		value: "fraction",
		icon: <Fraction />,
		isPro: true,
	},
	{
		label: __("Numbers", "testimonial-free"),
		value: "number",
		icon: <Numbers />,
		isPro: true,
	},
];

export const textAlignmentOptions = [
	{ label: <AlignLeft />, value: "left", tooltip: __("Left", "testimonial-free") },
	{ label: <AlignCenter />, value: "center", tooltip: __("Center", "testimonial-free") },
	{ label: <AlignRight />, value: "right", tooltip: __("Right", "testimonial-free") },
];

/**
 * Arrow icon options for Next/Previous Icon picker.
 * Each option: { label, value, icon: Component }
 */
export const ARROW_ICON_OPTIONS = [
	{ label: __("Chevron Solid", "testimonial-free"), value: "chevron-solid", icon: <ChevronSolid /> },
	{ label: __("Chevron Outline", "testimonial-free"), value: "chevron-outline", icon: <ChevronOutline /> },
	{ label: __("Chevron Bold", "testimonial-free"), value: "chevron-bold", icon: <ChevronBold /> },
	{ label: __("Double Chevron", "testimonial-free"), value: "double-chevron", icon: <DoubleChevron /> },
	{ label: __("Arrow Solid", "testimonial-free"), value: "arrow-solid", icon: <ArrowSolid /> },
	{ label: __("Arrow Outline", "testimonial-free"), value: "arrow-outline", icon: <ArrowOutline /> },
	{ label: __("Arrow Minimal", "testimonial-free"), value: "arrow-minimal", icon: <ArrowMinimal /> },
	{ label: __("Chevron Border Line", "testimonial-free"), value: "chevron-border-line", icon: <ChevronBorderLine /> },
	{
		label: __("Double Chevron Outline", "testimonial-free"),
		value: "double-chevron-outline",
		icon: <DoubleChevronOutline />,
	},
	{ label: __("Triangle Outline", "testimonial-free"), value: "triangle-outline", icon: <TriangleOutline /> },
	{ label: __("Arrow Line", "testimonial-free"), value: "arrow-line", icon: <ArrowLine /> },
	{ label: __("Arrow Send", "testimonial-free"), value: "arrow-send", icon: <ArrowSend /> },
];

export const cardItemsPositions = {
	"design-one": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	"design-two": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	"design-three": [1, 2, 4, 3, 5, 6, 7, 8, 9, 10, 11],
	"design-four": [1, 5, 4, 6, 2, 3, 7, 8, 9, 10, 11],
	"design-five": [4, 2, 3, 1, 5, 6, 7, 8, 9, 10, 11],
	"design-six": [4, 2, 3, 1, 5, 6, 7, 8, 9, 10, 11],
	"list-design-one": [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11],
};
