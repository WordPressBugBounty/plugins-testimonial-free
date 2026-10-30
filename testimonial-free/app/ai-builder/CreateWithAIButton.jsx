/**
 * Shared "Build with AI" launcher button.
 *
 * One button markup and one open path for every entry surface — the header
 * toolbar and the first-insert picker both click through the opener registry,
 * so they always open the same modal instance. Callers keep their own
 * `.sp-real-ai-builder-launcher` wrapper (the toolbar's is a DOM slot).
 */
import { __ } from "@wordpress/i18n";
import { ToolbarIcon } from "./icons";
import { openAIBuilder } from "./openerRegistry";

const CreateWithAIButton = ({ clientId = null, blockName = null }) => (
	<button
		type="button"
		className="sp-real-ai-builder-launcher__button sp-d-i-flex sp-align-center sp-gap-6px"
		onClick={() => openAIBuilder({ clientId, blockName })}
	>
		<ToolbarIcon />
		{__("Build with AI", "testimonial-free")}
	</button>
);

export default CreateWithAIButton;
