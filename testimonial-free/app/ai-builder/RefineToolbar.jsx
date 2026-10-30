/**
 * "Refine with AI" block-toolbar button for every configured main block.
 *
 * One `editor.BlockEdit` filter instead of a button in fourteen Edit files.
 */
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { isAIBlock, isAIBuilderEnabled, isConfiguredBlock } from "./constants";
import { openAIBuilder } from "./openerRegistry";
import { ToolbarIcon } from "./icons";

const withRefineButton = createHigherOrderComponent(
	(BlockEdit) => (props) => {
		const { name, clientId, attributes, isSelected } = props;
		const showRefine =
			isSelected && !attributes?.isPreview && isAIBlock(name) && isConfiguredBlock(name, attributes);

		return (
			<>
				{showRefine && (
					<BlockControls group="other">
						<ToolbarGroup>
							<ToolbarButton
								className="sp-real-source-toolbar__refine-with-ai"
								icon={<ToolbarIcon />}
								label={__("Refine with AI", "testimonial-free")}
								onClick={() => openAIBuilder({ clientId, blockName: name, isRefining: true })}
							>
								{__("Refine with AI", "testimonial-free")}
							</ToolbarButton>
						</ToolbarGroup>
					</BlockControls>
				)}
				<BlockEdit {...props} />
			</>
		);
	},
	"withSpRealRefineButton"
);

export const registerRefineToolbar = () => {
	if (!isAIBuilderEnabled()) {
		return;
	}
	addFilter("editor.BlockEdit", "sp-real/ai-refine", withRefineButton);
};
