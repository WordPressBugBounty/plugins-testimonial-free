/**
 * "Do more with Real Testimonials Pro" — what picking a Pro block in the
 * inserter opens instead of putting the block on the canvas. Same dialog as
 * WP Carousel Free's.
 *
 * The Pro layouts drifting the way a Marquee does, the Pro features in two
 * columns, and the way to upgrade.
 */
import { Modal } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import { demoBaseUrl, generateDemoLink, pricingPageUrl, testimonialBlocksInfo } from "@testimonial/constants";
import proBlocks from "../config";
import "./pro-upgrade-dialog.scss";

/**
 * Pro features listed in the dialog. Each one is checked against the Pro
 * plugin (counts: `main_blocks` and `cardDesignIcons`; effect names as Pro's
 * inspector labels them) — keep it that way rather than rounding up.
 *
 * @return {Array<string>} Feature labels.
 */
function getFeatures() {
	return [
		__("All Pro Blocks", "testimonial-free"),
		__("11 Layout Blocks & 6 Card Designs", "testimonial-free"),
		__("Video Testimonials & Video Recorder", "testimonial-free"),
		__("Review Badge & AI Review Summary", "testimonial-free"),
		__("Popup Submission Form & reCAPTCHA", "testimonial-free"),
		__("Auto-Publish by Rating & Email Notifications", "testimonial-free"),
		__("Fade, Spring, Ken Burns & Coverflow Effects", "testimonial-free"),
		__("Live Filter, AJAX Search, Group & Rating Filters", "testimonial-free"),
		__("Reviewer Social Profiles & Verified Badges", "testimonial-free"),
		__("Read More, Quote Symbols & Content Length", "testimonial-free"),
		__("Entrance & Scroll Animations", "testimonial-free"),
		__("Regular Updates & Priority Support", "testimonial-free"),
	];
}

/**
 * The Pro blocks, starting with the one that asked for the dialog.
 *
 * @param {string} [blockName] Pro block that opened the dialog.
 * @return {Array<Object>} Pro block config entries.
 */
function getLayoutCards(blockName) {
	const start = Math.max(
		0,
		proBlocks.findIndex(({ name }) => name === blockName)
	);

	return [...proBlocks.slice(start), ...proBlocks.slice(0, start)];
}

/**
 * One drifting lane of layout cards, doubled so the loop never shows a gap.
 *
 * @param {Object} props
 * @param {string} props.blockName Pro block that opened the dialog.
 * @return {JSX.Element} Lane.
 */
function LayoutLane({ blockName }) {
	const cards = getLayoutCards(blockName);

	return (
		<div className="sp-real-pro-upgrade-lanes" aria-hidden="true">
			<div className="sp-real-pro-upgrade-lane">
				{[...cards, ...cards].map(({ name, title, previewImage: PreviewImage }, index) => (
					<figure key={`${name}-${index}`} className="sp-real-pro-upgrade-card">
						<span className="sp-real-pro-upgrade-card-image">
							<PreviewImage />
						</span>
						<figcaption>{title}</figcaption>
					</figure>
				))}
			</div>
		</div>
	);
}

/**
 * The dialog.
 *
 * @param {Object}   props
 * @param {string}   [props.blockName] Pro block that opened it.
 * @param {Function} props.onClose     Closes the dialog.
 * @return {JSX.Element} Dialog.
 */
export default function ProUpgradeDialog({ blockName, onClose }) {
	const info = proBlocks.find(({ name }) => name === blockName);
	// Opens the patterns page on the block's own filter, same link as the
	// dashboard Blocks cards; the whole catalog when no block asked.
	const patternSlug = testimonialBlocksInfo[blockName]?.patternSlug;
	const demoLink = patternSlug ? generateDemoLink(patternSlug) : demoBaseUrl;

	return (
		<Modal
			className="sp-real-pro-upgrade"
			overlayClassName="sp-real-pro-upgrade-overlay"
			title={__("Real Testimonials Pro", "testimonial-free")}
			onRequestClose={onClose}
			__experimentalHideHeader
		>
			<div className="sp-real-pro-upgrade-visual">
				<LayoutLane blockName={blockName} />
				<button
					type="button"
					className="sp-real-pro-upgrade-close"
					aria-label={__("Close", "testimonial-free")}
					onClick={onClose}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>
			<div className="sp-real-pro-upgrade-body">
				<div className="sp-real-pro-upgrade-intro">
					{info && <span className="sp-real-pro-upgrade-eyebrow">{__("Pro Block", "testimonial-free")}</span>}
					<h2 className="sp-real-pro-upgrade-title">
						{info
							? sprintf(
									/* translators: %s: Pro block title, e.g. "Marquee". */
									__("Unlock %s with Real Testimonials Pro", "testimonial-free"),
									info.title
								)
							: __("Do more with Real Testimonials Pro", "testimonial-free")}
					</h2>
					<p className="sp-real-pro-upgrade-subtitle">
						{info
							? sprintf(
									/* translators: %s: Pro block description, ending in a full stop. */
									__(
										"%s Upgrade to use it, along with every Pro block and feature below.",
										"testimonial-free"
									),
									info.description
								)
							: __(
									"More layouts, effects and features for every testimonial showcase.",
									"testimonial-free"
								)}
					</p>
				</div>
				<ul className="sp-real-pro-upgrade-features">
					{getFeatures().map((feature) => (
						<li key={feature}>{feature}</li>
					))}
				</ul>
				<div className="sp-real-pro-upgrade-actions">
					<a className="sp-real-pro-upgrade-demo" href={demoLink} target="_blank" rel="noopener noreferrer">
						{info
							? sprintf(
									/* translators: %s: Pro block title, e.g. "Marquee". */
									__("View %s Demo", "testimonial-free"),
									info.title
								)
							: __("View Demo", "testimonial-free")}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
						</svg>
					</a>
					<a
						className="sp-real-pro-upgrade-cta"
						href={pricingPageUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						{__("Upgrade to Pro", "testimonial-free")}
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</a>
					<span className="sp-real-pro-upgrade-guarantee">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
						</svg>
						{__("14-day money-back guarantee", "testimonial-free")}
					</span>
				</div>
			</div>
		</Modal>
	);
}
