import { createRoot } from "@wordpress/element";
import Library from "./Library";

// Close modal.
let modalRoot = null;

export const onRemoveSinglePatternPopup = () => {
	if (modalRoot) {
		modalRoot.unmount();
		modalRoot = null;
	}
	const modalNode = document.querySelector(".sp-real-patterns-builder-modal");
	if (modalNode) {
		modalNode.remove();
	}
	document.body.classList.remove("sp-real-patterns-popup-open");
};
/**
 * Mount the Ready Patterns library in a fresh modal node.
 *
 * @param {Object} libraryProps Props passed through to `<Library>`.
 */
const mountPatternLibrary = (libraryProps) => {
	// If modal already exists, do nothing.
	if (document.querySelector(".sp-real-patterns-builder-modal")) {
		return;
	}

	const node = document.createElement("div");
	node.className = "sp-real-patterns-builder-modal sp-real-patterns-blocks-layouts";
	document.body.appendChild(node);

	modalRoot = createRoot(node);
	modalRoot.render(<Library isShow={true} onClose={onRemoveSinglePatternPopup} {...libraryProps} />);
	document.body.classList.add("sp-real-patterns-popup-open");

	// Close when clicking outside.
	setTimeout(() => {
		node.addEventListener("click", (event) => {
			if (event.target === node) {
				onRemoveSinglePatternPopup();
			}
		});
	}, 0);
};

/**
 * Open the Ready Patterns modal — the filter sidebar is always visible and the
 * Block Type facet is preselected to the invoking block ("All Patterns" for an
 * unknown slug), so the user can narrow or widen back out.
 *
 * @param {Object}           e           Click event.
 * @param {string}           blockName   Block slug to preselect in the facet.
 * @param {Function|boolean} removeBlock Optional placeholder remover (first-insert picker).
 */
export const onOpenBlockPatternPopup = (e, blockName, removeBlock = false) => {
	e.preventDefault();
	mountPatternLibrary({ initialBlockType: blockName, removeBlock });
};
