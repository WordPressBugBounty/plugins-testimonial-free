/**
 * Shimmer skeleton bone.
 *
 * Used only where data is fetched async and the layout is known before the
 * data. Respects `prefers-reduced-motion` (static gray, no animation) via CSS
 * and is hidden from assistive tech.
 */

import "./skeleton.scss";

/**
 * @param {Object}        props
 * @param {string|number} [props.width]     CSS width.
 * @param {string|number} [props.height]    CSS height.
 * @param {string}        [props.className] Extra class.
 * @param {string}        [props.radius]    Border radius.
 * @return {JSX.Element} Skeleton bone.
 */
export default function Skeleton({ width = "100%", height = "1em", className = "", radius = "4px" }) {
	return (
		<span
			className={`sp-real-skeleton ${className}`.trim()}
			style={{ width, height, borderRadius: radius }}
			aria-hidden="true"
		/>
	);
}
