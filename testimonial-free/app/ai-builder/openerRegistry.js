/**
 * Opener registry for the Build with AI modal.
 *
 * One listener — the modal host — so every entry point (header button,
 * first-insert picker, block toolbar) opens the same modal instance.
 */
import { isAIBuilderEnabled, DEFAULT_BLOCK_NAME } from "./constants";

let listener = null;

export function setAIBuilderOpener(fn) {
	listener = fn;
	return () => {
		listener = null;
	};
}

/**
 * Open the modal.
 *
 * @param {Object}  [options]
 * @param {?string} [options.clientId]   Block to update, or null for a fresh insert.
 * @param {string}  [options.blockName]  Block type to build or refine.
 * @param {boolean} [options.isRefining] True when the target is already configured.
 * @return {boolean} True when the modal host took the request.
 */
export function openAIBuilder({ clientId = null, blockName = DEFAULT_BLOCK_NAME, isRefining = false } = {}) {
	if (!isAIBuilderEnabled() || typeof listener !== "function") {
		return false;
	}
	listener({ clientId, blockName, isRefining });
	return true;
}
