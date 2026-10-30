/**
 * Horizontally scrolling rail of starter prompts.
 *
 * One starter per free block, in `Catalog::BLOCKS` order. Each keeps the
 * block's default layout and card design — what a plain insert shows — and
 * changes only simple settings: counts, columns, autoplay, a divider style,
 * required fields. Each prompt names its block with a `BlockRouter::ALIASES`
 * phrase and never lists card contents: a model-sent `cardContents` order
 * overrides the card design's own reorder. Every option named is one the free
 * inspector unlocks.
 */
import { __, isRTL } from "@wordpress/i18n";
import { forwardRef, useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { useInstanceId, useMergeRefs, useRefEffect } from "@wordpress/compose";
import { isInsertableBlock, BLOCK_PREFIX } from "./constants";

export const STARTER_PROMPTS = [
	{
		label: __("Autoplay Carousel", "testimonial-free"),
		prompt: "Create a testimonial carousel that autoplays every 4 seconds with pause on hover and pagination dots.",
		blockName: `${BLOCK_PREFIX}carousel`,
	},
	{
		label: __("Autoplay Slider", "testimonial-free"),
		prompt: "Create a testimonial slider that autoplays every 5 seconds with pause on hover and pagination dots.",
		blockName: `${BLOCK_PREFIX}slider`,
	},
	{
		label: __("Four-Column Grid", "testimonial-free"),
		prompt: "Create a testimonial grid with 4 columns on desktop, 2 on tablet and 1 on mobile, showing 8 testimonials.",
		blockName: `${BLOCK_PREFIX}grid`,
	},
	{
		label: __("Divided List", "testimonial-free"),
		prompt: "Create a zigzag list of 5 testimonials with dashed row dividers between the rows.",
		blockName: `${BLOCK_PREFIX}zigzag-list`,
	},
	{
		label: __("Required Fields Form", "testimonial-free"),
		prompt: "Create a testimonial submission form that makes the reviewer name and email required.",
		blockName: `${BLOCK_PREFIX}testimonial-submission-form`,
	},
];

const EDGE_TOLERANCE = 1;

/**
 * Reports which ends of a horizontal scroller still hide content.
 * RTL scrollLeft runs from 0 towards negative values, so its magnitude is used.
 *
 * @param {HTMLElement} element Scroll container.
 * @return {{start: boolean, end: boolean}} Hidden content per end.
 */
const getOverflow = (element) => {
	const offset = Math.abs(element.scrollLeft);
	const maxOffset = element.scrollWidth - element.clientWidth;

	return {
		start: offset > EDGE_TOLERANCE,
		end: offset < maxOffset - EDGE_TOLERANCE,
	};
};

/**
 * Chevron that points towards the given logical end, mirrored for RTL.
 *
 * @param {Object} props           Component props.
 * @param {string} props.direction `start` or `end`.
 */
const ChevronIcon = ({ direction }) => {
	const pointsLeft = ("start" === direction) !== isRTL();

	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
			<path
				d={pointsLeft ? "M11 4.5 6.5 9 11 13.5" : "M7 4.5 11.5 9 7 13.5"}
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

/**
 * Arrow button that pages the rail towards one end.
 */
const RailArrow = forwardRef(({ direction, label, controls, onClick }, ref) => (
	<button
		ref={ref}
		type="button"
		aria-label={label}
		aria-controls={controls}
		onClick={onClick}
		className="sp-real-ai-starter-more sp-d-flex sp-align-center sp-justify-center"
	>
		<ChevronIcon direction={direction} />
	</button>
));

/**
 * Starter prompt pills with arrows that render only while pills are hidden on that side.
 *
 * @param {Object}   props                Component props.
 * @param {Function} props.onSelectPrompt Receives the chosen starter.
 */
const StarterPillsRail = ({ onSelectPrompt }) => {
	const railId = useInstanceId(StarterPillsRail, "sp-real-ai-starters-rail");
	const railRef = useRef(null);
	const startArrowRef = useRef(null);
	const endArrowRef = useRef(null);
	const pendingFocusRef = useRef(null);
	const [overflow, setOverflow] = useState({ start: false, end: false });

	const availablePrompts = useMemo(() => STARTER_PROMPTS.filter((item) => isInsertableBlock(item.blockName)), []);

	const overflowObserverRef = useRefEffect((rail) => {
		const update = () => {
			const next = getOverflow(rail);
			const { activeElement } = rail.ownerDocument;

			if (!next.end && activeElement === endArrowRef.current) {
				pendingFocusRef.current = startArrowRef;
			}
			if (!next.start && activeElement === startArrowRef.current) {
				pendingFocusRef.current = endArrowRef;
			}

			setOverflow((current) => {
				if (current.start === next.start && current.end === next.end) {
					return current;
				}
				return next;
			});
		};

		update();
		rail.addEventListener("scroll", update, { passive: true });
		const observer = new rail.ownerDocument.defaultView.ResizeObserver(update);
		observer.observe(rail);

		return () => {
			rail.removeEventListener("scroll", update);
			observer.disconnect();
		};
	}, []);

	const mergedRailRef = useMergeRefs([railRef, overflowObserverRef]);

	useEffect(() => {
		const target = pendingFocusRef.current;
		if (!target) {
			return;
		}
		pendingFocusRef.current = null;
		target.current?.focus();
	}, [overflow]);

	if (!availablePrompts.length) {
		return null;
	}

	const scrollRail = (direction) => {
		const rail = railRef.current;
		if (!rail) {
			return;
		}
		const step = Math.round(rail.clientWidth * 0.75) * direction;
		rail.scrollBy({ left: isRTL() ? -step : step, behavior: "smooth" });
	};

	const railClassName = [
		"sp-real-ai-starters__rail sp-d-flex sp-align-center sp-gap-8px",
		overflow.start && "has-overflow-start",
		overflow.end && "has-overflow-end",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="sp-real-ai-starters sp-d-flex sp-align-center sp-gap-8px">
			<span className="sp-real-ai-starters__label">{__("Try a starter", "testimonial-free")}</span>
			{overflow.start && (
				<RailArrow
					ref={startArrowRef}
					direction="start"
					label={__("Previous starters", "testimonial-free")}
					controls={railId}
					onClick={() => scrollRail(-1)}
				/>
			)}
			<div id={railId} ref={mergedRailRef} className={railClassName}>
				{availablePrompts.map((item) => (
					<button
						key={item.label}
						type="button"
						onClick={() => onSelectPrompt(item)}
						className="sp-real-ai-starter-pill"
					>
						{item.label}
					</button>
				))}
			</div>
			{overflow.end && (
				<RailArrow
					ref={endArrowRef}
					direction="end"
					label={__("More starters", "testimonial-free")}
					controls={railId}
					onClick={() => scrollRail(1)}
				/>
			)}
		</div>
	);
};

export default StarterPillsRail;
