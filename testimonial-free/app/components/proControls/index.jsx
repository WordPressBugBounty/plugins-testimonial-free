/* eslint-disable jsx-a11y/anchor-has-content */
import { __ } from "@wordpress/i18n";
import { createInterpolateElement } from "@wordpress/element";
import { ProBadgeIcon } from "../../ready-patterns/Icons";
import { ProCategoryIcon } from "../../icons";
import { API_ENDPOINTS } from "../../ready-patterns/constants";
import "./editor.scss";

// ProFeaturesBox.
export const ProFeaturesBox = ({
	title = __("Pro Features", "testimonial-free"),
	description = "",
	features = [],
	buttonLabel = __("Unlock Pro Features", "testimonial-free"),
}) => (
	<div className="sp-real-pro-features-box sp-real-component-mb">
		<h4 className="sp-real-pro-features-box__title">{title}</h4>
		{description && <p className="sp-real-pro-features-box__desc">{description}</p>}
		<ul className="sp-real-pro-features-box__list">
			{features.map((feature, index) => (
				<li key={index}>{feature}</li>
			))}
		</ul>
		<a
			className="sp-real-pro-features-box__btn sp-d-flex sp-align-center sp-justify-center sp-gap-4px"
			href={API_ENDPOINTS.UPGRADE_URL}
			target="_blank"
			rel="noopener noreferrer"
		>
			<ProBadgeIcon color="#fff" />
			{buttonLabel}
		</a>
	</div>
);

// ProNoteBox.
export const ProNoteBox = ({ children }) => (
	<div className="sp-real-pro-note-box sp-real-component-mb">
		<p className="sp-real-pro-note-box__text">{children}</p>
	</div>
);

/**
 * Testimonial-content-tab promo: highlights trimmed text and quote symbols
 * with an inline upgrade link.
 */
export const TestimonialContentProNote = () => (
	<ProNoteBox>
		{createInterpolateElement(
			__(
				"Keep cards neat and easy to read with trimmed text and eye-catching quote symbols. <a>Unlock with Pro!</a>",
				"testimonial-free"
			),
			{
				a: (
					<a
						className="sp-real-pro-note-box__link"
						href={API_ENDPOINTS.UPGRADE_URL}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			}
		)}
	</ProNoteBox>
);

/**
 * Reviewer-details-tab promo: verified badges and reviewer designation linking
 * with an inline upgrade link.
 */
export const ReviewerDetailsProNote = () => (
	<ProNoteBox>
		{createInterpolateElement(
			__(
				"Show visitors your reviewers are real with verified badges and clickable designations. <a>Unlock with Pro!</a>",
				"testimonial-free"
			),
			{
				a: (
					<a
						className="sp-real-pro-note-box__link"
						href={API_ENDPOINTS.UPGRADE_URL}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			}
		)}
	</ProNoteBox>
);

// ProCornerBadge.
// Crown chip pinned to the top-right corner of a Pro-locked picker tile, always
// visible. Same mark as WP Carousel Free's locked cards, drawn smaller. Sits
// inside a `.sp-real-pro-locked` tile, which dims the preview and owns the click.
export const ProCornerBadge = () => (
	<span className="sp-real-pro-corner-badge" aria-hidden="true">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" focusable="false">
			<path
				stroke="currentColor"
				strokeWidth={1.185}
				d="M10.384 5.882c.18.329.478.572.842.648.322.068.652-.007.922-.203l.112-.092 1.396-1.279 1.159-1.062-.81 6.437H2.124l-.812-6.437 2.556 2.341c.288.264.666.373 1.035.295.364-.076.662-.32.841-.648l2.32-4.254 2.32 4.254Z"
			/>
			<path
				fill="currentColor"
				d="M13.851 14.873H2.274c-.373 0-.674-.369-.674-.824V12.24h12.925v1.81c0 .454-.301.823-.674.823Z"
			/>
		</svg>
	</span>
);

// ProCardBadge.
// Corner crown plus an "Upgrade to Pro" tooltip revealed on hover, for the
// larger locked cards of the start screen (WP Carousel Free's wizard cards).
export const ProCardBadge = () => (
	<>
		<ProCornerBadge />
		<span className="sp-real-pro-card-tooltip">{__("Upgrade to Pro", "testimonial-free")}</span>
	</>
);

// ProPanelTitle.
// Inspector PanelBody title with the circled Pro crown — the same mark as the
// "Pro Blocks" inserter category — for panels that hold nothing but an upsell
// teaser (Email Notification, Motion Effects, ...).
export const ProPanelTitle = ({ label }) => (
	<span className="sp-real-pro-panel-title">
		{label}
		<ProCategoryIcon />
	</span>
);
