import { cardItemsPositions } from "@testimonial/constants";
import { inArray } from "@testimonial/controls";

// Reorder cardContents to match the design's position template, appending any
// items not covered by the template so nothing is lost.
const getReorderedContents = (newDesign, cardContents) => {
	// A design with no position template (an unknown or renamed slug) keeps the
	// author's order rather than throwing on `undefined.map`.
	const positions = cardItemsPositions[newDesign] || [];
	const reordered = positions.map((id) => cardContents.find((item) => item.id === id)).filter(Boolean);
	cardContents.forEach((item) => {
		if (!reordered.some((i) => i.id === item.id)) {
			reordered.push(item);
		}
	});
	return reordered;
};

const changeSpacing = (attr, newVal) => {
	return {
		...attr,
		device: {
			...attr.device,
			Desktop: newVal,
		},
	};
};

// The List block's own designs — `list-design-*`. They render a horizontal row,
// so the avatar takes no bottom margin. Only `list-design-one` is selectable in
// the free plugin; the other two are Pro and locked in the picker.
export const isListDesign = (design) => Boolean(design?.startsWith("list-design-"));

const changeBoxSpacing = (attr, newVal) => {
	return {
		...attr,
		value: newVal,
	};
};

// List Design 1 is a bare row. The (lack of a) frame has to travel as attributes,
// not as a stylesheet rule keyed on the design class: dynamic CSS
// (`#uniqueId .sp-real-card-inner`) outranks any such rule, so a card
// border/padding left at the shared defaults would frame it.
const LIST_FRAME_NONE = {
	border: { style: "none", color: "#DDDDDD", hoverColor: "#DDDDDD" },
	borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
	radius: { top: 0, right: 0, bottom: 0, left: 0 },
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
};

// Build the attribute patch for a card design change: reorders cardContents and
// applies per-design default margins. Shared by GeneralTab and CardDesignPicker.
export const buildCardDesignAttributes = (newDesign, attributes) => {
	const {
		cardContents,
		imageMargin,
		excerptMargin,
		ratingIconMargin,
		designationMargin,
		cardBorder,
		cardBorderWidth,
		cardBorderRadius,
		cardPadding,
	} = attributes;

	if (isListDesign(newDesign)) {
		return {
			cardDesign: newDesign,
			cardAlignment: "left",
			cardContents: getReorderedContents(newDesign, cardContents),
			// The image is its own column here, so no gap below it.
			imageMargin: changeSpacing(imageMargin, { top: 0, right: 0, bottom: 0, left: 0 }),
			excerptMargin: changeSpacing(excerptMargin, { top: 12, right: 0, bottom: 12, left: 0 }),
			ratingIconMargin: changeSpacing(ratingIconMargin, { top: 0, right: 0, bottom: 8, left: 0 }),
			designationMargin: changeSpacing(designationMargin, { top: 2, right: 0, bottom: 2, left: 0 }),
			cardBorder: { ...cardBorder, ...LIST_FRAME_NONE.border },
			cardBorderWidth: changeBoxSpacing(cardBorderWidth, LIST_FRAME_NONE.borderWidth),
			cardBorderRadius: changeBoxSpacing(cardBorderRadius, LIST_FRAME_NONE.radius),
			cardPadding: changeSpacing(cardPadding, LIST_FRAME_NONE.padding),
		};
	}

	return {
		cardDesign: newDesign,
		cardAlignment: inArray(["design-one", "design-two"], newDesign) ? "center" : "left",
		cardContents: getReorderedContents(newDesign, cardContents),
		imageMargin: inArray(["design-five", "design-six"], newDesign)
			? changeSpacing(imageMargin, { top: 32, right: 0, bottom: 0, left: 0 })
			: changeSpacing(imageMargin, { top: 0, right: 0, bottom: 12, left: 0 }),
		excerptMargin:
			newDesign === "design-three"
				? changeSpacing(excerptMargin, { top: 0, right: 0, bottom: 12, left: 0 })
				: changeSpacing(excerptMargin, { top: 12, right: 0, bottom: 12, left: 0 }),
		ratingIconMargin: inArray(["design-three", "design-five", "design-six"], newDesign)
			? changeSpacing(ratingIconMargin, { top: 0, right: 0, bottom: 0, left: 0 })
			: changeSpacing(ratingIconMargin, { top: 12, right: 0, bottom: 12, left: 0 }),
		designationMargin:
			newDesign === "design-six"
				? changeSpacing(designationMargin, { top: 2, right: 0, bottom: 12, left: 0 })
				: changeSpacing(designationMargin, { top: 2, right: 0, bottom: 2, left: 0 }),
	};
};

// Convenience: apply a card design change directly via setAttributes.
export const applyCardDesign = (newDesign, attributes, setAttributes) => {
	setAttributes(buildCardDesignAttributes(newDesign, attributes));
};
