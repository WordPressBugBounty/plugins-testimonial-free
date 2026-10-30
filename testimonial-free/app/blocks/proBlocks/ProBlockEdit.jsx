import { useBlockProps } from "@wordpress/block-editor";
import { useEffect, useRef } from "@wordpress/element";
import { ProBadgeIcon } from "../../ready-patterns/Icons";
import { generateDemoLink, pricingPageUrl, testimonialBlocksInfo } from "@testimonial/constants";
import { __ } from "@wordpress/i18n";
import proBlocks from "./config";
import { hasProUpgradeOpener, openProUpgradeDialog } from "./upgrade/openerRegistry";
import useInsertedTeaser from "./upgrade/useInsertedTeaser";
import "./pro-blocks-style.scss";

// PREVIEW_IMAGES.
const PREVIEW_IMAGES = proBlocks.reduce((map, { name, previewImage }) => {
	map[name] = previewImage;
	return map;
}, {});

// ProBlockEdit.
// Picking a Pro block in the inserter opens the "Do more with Real Testimonials
// Pro" dialog and takes the block straight back out, as WP Carousel Free does:
// free has nothing to render for it. A Pro block already saved in a post (by
// Pro before a downgrade) stays put and shows the upgrade notice below.
const ProBlockEdit = ({ name, attributes, clientId }) => {
	const { isPreview } = attributes;
	const blockProps = useBlockProps({ className: "sp-real-pro-block-preview" });
	const PreviewImage = PREVIEW_IMAGES[name];
	const { justInserted, removeSilently } = useInsertedTeaser(clientId);
	// Without a dialog host (the widgets screen) the block stays and shows the notice.
	const handsOff = justInserted && !isPreview && hasProUpgradeOpener();
	// StrictMode runs mount effects twice; a ref survives that, so the dialog opens and the block goes once.
	const hasHandedOff = useRef(false);

	useEffect(() => {
		if (!handsOff || hasHandedOff.current) {
			return;
		}

		hasHandedOff.current = true;
		openProUpgradeDialog({ blockName: name });
		removeSilently();
		// Once, for the insert that mounted this block.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handsOff]);

	if (handsOff) {
		return <div {...blockProps} />;
	}

	if (isPreview && PreviewImage) {
		return (
			<div {...blockProps}>
				<PreviewImage />
			</div>
		);
	}

	const selectedBlock = testimonialBlocksInfo[name];
	// The layout block itself is Pro-only, so "View Demo" shows it live on the
	// demo site, same link as the dashboard Blocks cards.
	const patternSlug = selectedBlock?.patternSlug;

	return (
		<div {...blockProps}>
			<div className="sp-real-pro-block-notice sp-d-flex sp-align-center sp-justify-between">
				<p className="sp-real-pro-block-label sp-d-i-flex sp-align-center sp-gap-4px">
					{__("Unlock this premium", "testimonial-free")}{" "}
					<span className="sp-real-pro-block-title">{selectedBlock?.title}</span>{" "}
					{__("layout block with Pro", "testimonial-free")}
				</p>
				<div className="sp-real-pro-blocks-buttons sp-d-flex sp-align-center sp-gap-8px">
					{patternSlug && (
						<a
							target="_blank"
							rel="noreferrer"
							href={generateDemoLink(patternSlug)}
							className="sp-real-pro-block-view-demo"
						>
							{__("View Demo", "testimonial-free")}
						</a>
					)}
					<a
						target="_blank"
						rel="noreferrer"
						href={pricingPageUrl}
						className="sp-real-upgrade-to-pro-btn sp-d-flex sp-align-center sp-gap-8px"
					>
						<ProBadgeIcon color="#fff" />
						{__("Upgrade to Pro Now!", "testimonial-free")}
					</a>
				</div>
			</div>
		</div>
	);
};

export default ProBlockEdit;
