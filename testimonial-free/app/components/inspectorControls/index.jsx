import { __ } from "@wordpress/i18n";
import { InspectorControls } from "@wordpress/block-editor";
import { testimonialBlocksInfo } from "@testimonial/constants";
import { onOpenBlockPatternPopup } from "../../ready-patterns/Controls";
import "./editor.scss";

const InspectorControl = ({ attributes, setAttributes, Inspector }) => {
	const { blockName } = attributes;
	const blockInfo = testimonialBlocksInfo[`sp-testimonial-pro/${blockName}`];
	const isShowReadyPatternButton = blockInfo?.patternSlug;

	return (
		<InspectorControls>
			<div className="sp-testimonial-tabs-panel">
				{/* Ready Patterns + Documentation buttons */}
				{(isShowReadyPatternButton || blockInfo?.docLink) && (
					<div className="sp-real-tab-panel-header-actions">
						{isShowReadyPatternButton && (
							<button
								type="button"
								className="sp-real-header-action sp-real-header-action-patterns"
								onClick={(event) => onOpenBlockPatternPopup(event, blockName)}
							>
								{__("Ready Patterns", "testimonial-free")}
							</button>
						)}
						{blockInfo?.docLink && (
							<a
								className="sp-real-header-action sp-real-header-action-docs"
								href={blockInfo.docLink}
								target="_blank"
								rel="noreferrer"
							>
								{__("Documentation", "testimonial-free")}
							</a>
						)}
					</div>
				)}
				<Inspector attributes={attributes} setAttributes={setAttributes} />
			</div>
		</InspectorControls>
	);
};

export default InspectorControl;
