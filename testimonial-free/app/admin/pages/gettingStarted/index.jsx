/**
 * Dashboard Overview page.
 *
 * A welcome card — greeting, the ways to start and the intro video — above
 * the "Testimonial Placements" table.
 */

import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { getFirstName, getGreeting } from "../../utils/greeting";
import { STORE_NAME } from "../../store";
import { ToolbarIcon as BuildWithAIIcon } from "../../../ai-builder/icons";
import Placements from "./Placements";
import { getSalutation, getWelcomeCopy } from "./welcomeCopy";
import "./getting-started.scss";

const WELCOME_VIDEO_ID = "-eSIbpv8Hik";

/**
 * Dashboard Overview page.
 *
 * @return {JSX.Element} Page.
 */
const GettingStarted = () => {
	const {
		userName = "",
		userFirstName = "",
		hasPlacements = null,
		homeUrl = "",
		pluginUrl = "",
	} = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const modules = useSelect((select) => select(STORE_NAME).getSettings()?.modules, []);
	const isModuleActive = (key) => (modules?.[key] ? modules[key].is_active : true);

	// Every entry point opens a new page in the block editor — where a
	// testimonial section actually gets built. "Create from Scratch" lands
	// with the inserter open on the plugin's category, in the same tab so the
	// dashboard is still behind it on the way back.
	const createUrl = `${homeUrl}wp-admin/post-new.php?post_type=page&rtpblock_inserter=true`;
	const newPageUrl = `${homeUrl}wp-admin/post-new.php?post_type=page`;

	// The sibling deep link, with the Ready Patterns library already open
	// rather than sending the author off to the website. Hidden when the
	// module is off, since the library host is not registered at all in
	// that case.
	const readyPatternsUrl =
		homeUrl && isModuleActive("pattern_library")
			? `${homeUrl}wp-admin/post-new.php?post_type=page&realpatterns=true`
			: "";

	// Same idea for the AI builder: a new page with the builder already open.
	// Offered only when the editor will register it, so the button never
	// lands on an empty page.
	const aiBuilderUrl =
		homeUrl && isModuleActive("ai_block_builder")
			? `${homeUrl}wp-admin/post-new.php?post_type=page&rtp_ai_builder=true`
			: "";

	// The three ways to start, in order; the first one shown is the primary.
	const startActions = [
		readyPatternsUrl && {
			key: "patterns",
			href: readyPatternsUrl,
			label: __("Use a Pattern", "testimonial-free"),
			icon: "dashicons-screenoptions",
		},
		aiBuilderUrl && {
			key: "ai",
			href: aiBuilderUrl,
			label: __("Build with AI", "testimonial-free"),
			// The AI builder's own mark, as the editor header launcher draws it.
			iconNode: <BuildWithAIIcon />,
		},
		createUrl && {
			key: "scratch",
			href: createUrl,
			label: __("Start Blank", "testimonial-free"),
			icon: "dashicons-plus-alt2",
		},
	].filter(Boolean);
	const [videoOpen, setVideoOpen] = useState(false);

	// First visit or returning: known on load from the stored placements
	// report, and kept current by the report itself — its first scan when
	// nothing was stored, and every Sync after that.
	const [placementsExist, setPlacementsExist] = useState(true === hasPlacements);

	// The dashboard info arrives over REST after mount, so take the stored
	// answer once it lands; the placements report then keeps it current.
	useEffect(() => {
		if (null !== hasPlacements) {
			setPlacementsExist(true === hasPlacements);
		}
	}, [hasPlacements]);

	useEffect(() => {
		if (!videoOpen) {
			return undefined;
		}
		const onKeyDown = (event) => {
			if (event.key === "Escape") {
				setVideoOpen(false);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [videoOpen]);

	const salutation = getSalutation(getGreeting(new Date().getHours()), getFirstName(userFirstName, userName));
	const welcome = getWelcomeCopy({
		hasPlacements: placementsExist,
		patterns: !!readyPatternsUrl,
		ai: !!aiBuilderUrl,
	});

	return (
		<section className="sp-real-qs-page">
			<div className="sp-real-qs-hero">
				<div className="sp-real-qs-hero__text">
					<p className="sp-real-qs-greeting">{salutation}</p>
					<h1 className="sp-real-qs-title">{welcome.title}</h1>
					<p className="sp-real-qs-lead">{welcome.lead}</p>
					{startActions.length > 0 && (
						<div className="sp-real-qs-actions">
							{startActions.map((action, index) => (
								<a
									key={action.key}
									className={`sp-real-qs-start-btn sp-real-qs-start-btn--${action.key}${0 === index ? " is-primary" : ""}`}
									href={action.href}
								>
									{action.iconNode || (
										<span className={`dashicons ${action.icon}`} aria-hidden="true" />
									)}
									{action.label}
								</a>
							))}
						</div>
					)}
				</div>

				<button
					type="button"
					className="sp-real-qs-video"
					onClick={() => setVideoOpen(true)}
					aria-label={__("Play the introduction video", "testimonial-free")}
				>
					{pluginUrl && (
						<img
							className="sp-real-qs-video__thumb"
							src={`${pluginUrl}src/Admin/assets/images/video-overlay.jpg`}
							alt=""
							width="800"
							height="450"
							loading="eager"
							decoding="async"
						/>
					)}
					<span className="sp-real-qs-play-btn">
						<span className="dashicons dashicons-controls-play" aria-hidden="true" />
					</span>
				</button>
			</div>

			<Placements
				createUrl={newPageUrl}
				onReport={(report) => setPlacementsExist(Array.isArray(report?.rows) && report.rows.length > 0)}
			/>

			{videoOpen ? (
				<div
					className="sp-real-qs-modal"
					onClick={(event) => {
						if (event.target === event.currentTarget) {
							setVideoOpen(false);
						}
					}}
				>
					<div className="sp-real-qs-modal__content" role="dialog" aria-modal="true">
						<button
							type="button"
							className="sp-real-qs-modal__close"
							onClick={() => setVideoOpen(false)}
							aria-label={__("Close", "testimonial-free")}
						>
							×
						</button>
						<div className="sp-real-qs-modal__video">
							<iframe
								title={__("Real Testimonials video tutorial", "testimonial-free")}
								src={`https://www.youtube.com/embed/${WELCOME_VIDEO_ID}?autoplay=1&rel=0`}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
};

export default GettingStarted;
