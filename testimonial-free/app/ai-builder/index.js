/**
 * Build with AI — editor entry point.
 */
import { registerAIBuilderHost } from "./ToolbarButton";
import { registerRefineToolbar } from "./RefineToolbar";

export { openAIBuilder } from "./openerRegistry";
export { isAIBuilderEnabled } from "./constants";

export const registerAIBuilder = () => {
	registerAIBuilderHost();
	registerRefineToolbar();
};
