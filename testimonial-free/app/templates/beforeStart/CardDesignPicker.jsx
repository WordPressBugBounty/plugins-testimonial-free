import { __ } from "@wordpress/i18n";
import { memo } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { Tooltip } from "@wordpress/components";
import { onOpenBlockPatternPopup } from "../../ready-patterns/Controls";
import { ProCardBadge } from "../../components/proControls";
import { testimonialBlocksInfo } from "@testimonial/constants";
import { BLOCK_DESIGN_ICONS, cardDesignIcons } from "../../blocks/shared/Icons";
import { applyCardDesign } from "../../blocks/shared/cardDesign";
import CreateWithAIButton from "../../ai-builder/CreateWithAIButton";
import { isAIBuilderEnabled } from "../../ai-builder/constants";
import "./editor.scss";

const CardDesignPicker = ({ blockName, clientId = "", attributes, setAttributes }) => {
	const designIcons = BLOCK_DESIGN_ICONS[blockName] || cardDesignIcons;
	// Main blocks carry a `patternSlug`; child and shortcode blocks do not.
	const hasReadyPatterns = Boolean(testimonialBlocksInfo[`sp-testimonial-pro/${blockName}`]?.patternSlug);
	const { removeBlocks } = useDispatch("core/block-editor");
	const handleRemoveBlockByID = () => {
		removeBlocks(clientId);
	};

	const onChangeCardDesign = (newDesign) => applyCardDesign(newDesign, attributes, setAttributes);

	return (
		<div className="sp-real-before-start__card">
			<div className="sp-real-card-design-variation-picker sp-d-flex sp-flex-col">
				<div className="sp-real-before-start__header sp-d-flex sp-flex-col sp-gap-10px sp-align-center">
					<h3 className="sp-real-before-start__title">{__("Choose Your Card Design", "testimonial-free")}</h3>
					<p className="sp-real-before-start__subtitle">
						{__(
							"Select a design to display your testimonials. You can change it anytime.",
							"testimonial-free"
						)}
					</p>
				</div>
				<div className="sp-real-card-design-picker-popup sp-w-full sp-d-flex sp-justify-center sp-align-center">
					<div className="sp-real-card-design-picker-popup_wrapper sp-d-flex sp-flex-wrap sp-align-center sp-justify-center sp-gap-10px">
						{designIcons?.map(({ Icon, value, label, pro }) =>
							// A locked card carries its own "Upgrade to Pro" tooltip, so it
							// skips the label tooltip the free cards get.
							pro ? (
								<span
									key={value}
									className="sp-real-icon-set sp-d-flex sp-align-center sp-justify-center sp-real-pro-locked"
									aria-label={`${label} (${__("Pro", "testimonial-free")})`}
								>
									<Icon />
									<ProCardBadge />
								</span>
							) : (
								<Tooltip key={value} text={label} placement="top">
									<span
										className="sp-real-icon-set sp-cursor-pointer sp-d-flex sp-align-center sp-justify-center"
										onClick={() => onChangeCardDesign(value)}
									>
										<Icon />
									</span>
								</Tooltip>
							)
						)}
					</div>
				</div>
				{/* bottom */}
				<div className="sp-real-design-picker-actions sp-d-flex sp-align-center sp-justify-center sp-gap-10px">
					{hasReadyPatterns && (
						<span
							className="sp-real-block-preview-button sp-real-ready-patterns sp-d-flex sp-align-center sp-justify-center"
							onClick={(event) => onOpenBlockPatternPopup(event, blockName, handleRemoveBlockByID)}
						>
							{__("Use a Pattern", "testimonial-free")}
						</span>
					)}
					{isAIBuilderEnabled() && (
						<span className="sp-real-ai-builder-launcher">
							<CreateWithAIButton clientId={clientId} blockName={`sp-testimonial-pro/${blockName}`} />
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default memo(CardDesignPicker);
