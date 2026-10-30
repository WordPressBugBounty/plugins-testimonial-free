import { __ } from "@wordpress/i18n";

// default field set — used by the RESET action to restore the original fields.
// Free ships name/email/designation/rating/title/text; company name, website,
// phone, video, location, groups, and custom fields are Pro-only.
export const DEFAULT_FORM_FIELDS = [
	{
		id: 1,
		required: true,
		showField: true,
		fieldName: "tpro_client_name",
		label: "Full Name",
		placeholder: "Your full name",
		helpText: "",
		fieldWidth: { value: 50, unit: "%" },
	},
	{
		id: 2,
		required: true,
		showField: true,
		fieldName: "tpro_client_email",
		label: "E-mail Address",
		placeholder: "Your email address",
		helpText: "",
		fieldWidth: { value: 50, unit: "%" },
	},
	{
		id: 3,
		required: false,
		showField: true,
		fieldName: "tpro_client_designation",
		label: "Designation",
		placeholder: "Your professional role",
		helpText: "",
		fieldWidth: { value: 50, unit: "%" },
	},
	{
		id: 4,
		required: true,
		showField: true,
		fieldName: "tpro_client_rating",
		label: "Star Rating",
		placeholder: "",
		helpText: "Select a star rating from 1 to 5 stars.",
		fieldWidth: { value: 100, unit: "%" },
	},
	{
		id: 5,
		required: false,
		showField: true,
		fieldName: "tpro_testimonial_title",
		label: "Testimonial Title",
		placeholder: "Write a short title that summarizes your testimonial.",
		helpText: "A headline or tagline for your testimonial.",
		fieldWidth: { value: 100, unit: "%" },
		length: "unlimited",
		limit: { value: 10, unit: "words" },
	},
	{
		id: 6,
		required: false,
		showField: true,
		fieldName: "tpro_client_testimonial",
		label: "Testimonial Text",
		placeholder: "Write your testimonial here",
		helpText: "What do you think about us?",
		fieldWidth: { value: 100, unit: "%" },
		length: "unlimited",
		limit: { value: 60, unit: "words" },
	},
];

// Free additional fields addable via the "Add New Field" popup. Only the
// reviewer photo is free; every other add-field is a Pro upsell (PRO_FORM_FIELDS).
export const FORM_ADDITIONAL_FIELDS = [
	{
		required: false,
		showField: true,
		fieldName: "tpro_client_image",
		label: "Reviewer Photo",
		placeholder: "",
		helpText: "",
		fieldWidth: { value: 100, unit: "%" },
	},
];

export const ALL_FORM_FIELDS = [...DEFAULT_FORM_FIELDS, ...FORM_ADDITIONAL_FIELDS];

// Pro-only fields — shown as locked "(Pro)" teasers in the "Add New Field"
// popup. Not addable in free; the label mirrors the Pro plugin's popup.
export const PRO_FORM_FIELDS = [
	{ key: "company_name", label: __("Company Name", "testimonial-free") },
	{ key: "website", label: __("Website", "testimonial-free") },
	{ key: "phone", label: __("Phone or Mobile", "testimonial-free") },
	{ key: "video", label: __("Video Testimonial", "testimonial-free") },
	{ key: "social", label: __("Social Profile", "testimonial-free") },
	{ key: "media", label: __("Testimonial Media", "testimonial-free") },
	{ key: "custom", label: __("Custom Field", "testimonial-free") },
];
