/**
 * Editor-level Build with AI modal host + header launcher.
 */
import { useEffect, useState } from "@wordpress/element";
import { registerPlugin } from "@wordpress/plugins";
import { registerHeaderToolbarButton } from "../blocks/shared/headerToolbarButton";
import AIBuilderModal from "./AIBuilderModal";
import CreateWithAIButton from "./CreateWithAIButton";
import { isAIBuilderEnabled, AUTO_OPEN } from "./constants";
import { setAIBuilderOpener, openAIBuilder } from "./openerRegistry";

const AIBuilderHost = () => {
	const [state, setState] = useState({ isOpen: false, clientId: null, blockName: null, isRefining: false });

	useEffect(
		() =>
			setAIBuilderOpener(({ clientId = null, blockName = null, isRefining = false } = {}) => {
				setState({ isOpen: true, clientId, blockName, isRefining });
			}),
		[]
	);

	return (
		<AIBuilderModal
			isOpen={state.isOpen}
			onClose={() => setState((current) => ({ ...current, isOpen: false }))}
			targetClientId={state.clientId}
			requestedBlockName={state.blockName}
			isRefining={state.isRefining}
		/>
	);
};

/**
 * Open the modal once when the editor was reached from the dashboard
 * "Build with AI" button (post-new.php?...&rtp_ai_builder=true).
 *
 * The host registers its opener only after the editor mounts, so the open is
 * retried until the host takes it.
 */
const maybeAutoOpen = () => {
	const url = new URL(window.location.href);
	if ("true" !== url.searchParams.get(AUTO_OPEN.QUERY_ARG)) {
		return;
	}
	url.searchParams.delete(AUTO_OPEN.QUERY_ARG);
	window.history.replaceState({}, "", url.toString());

	let attempts = 0;
	const timer = setInterval(() => {
		attempts++;
		if (openAIBuilder() || attempts >= AUTO_OPEN.MAX_ATTEMPTS) {
			clearInterval(timer);
		}
	}, AUTO_OPEN.POLL_INTERVAL);
};

/**
 * Register the modal host and the header launcher.
 *
 * A switched-off module gets no launcher and no host, which leaves no
 * registered opener and so makes every entry point inert too.
 */
export const registerAIBuilderHost = () => {
	if (!isAIBuilderEnabled()) {
		return;
	}

	registerHeaderToolbarButton({
		slotClass: "sp-real-ai-builder-launcher",
		button: <CreateWithAIButton />,
		onClick: () => openAIBuilder({}),
	});
	registerPlugin("sp-real-ai-builder", {
		render: AIBuilderHost,
	});
	maybeAutoOpen();
};
