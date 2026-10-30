/**
 * Saved Templates hero — shown while the library is empty: explain the
 * feature and offer the one action worth taking. Once templates exist the
 * toolbar takes over and the hero goes away, so the "create" call to action
 * is never duplicated.
 */

import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../../store";
import { PlusIcon } from "./Icons";

/**
 * @return {JSX.Element} Hero card.
 */
export default function SavedTemplatesHero() {
	const { homeUrl = "", pluginUrl = "" } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const createUrl = `${homeUrl}wp-admin/post-new.php?post_type=sp_real_template&rtpblock_inserter=true`;

	return (
		<div className="sp-real-saved-template-hero">
			<div className="sp-real-saved-template-hero__text">
				<div className="sp-real-saved-template-hero__title-wrap">
					<h2 className="sp-real-saved-template-hero__title">
						{__("Create Reusable Templates", "testimonial-free")}
					</h2>
					<p className="sp-real-saved-template-hero__desc">
						{__(
							"Create a testimonial template once and reuse it anywhere with a shortcode — pages, posts, widgets, or page builders like Elementor and Divi.",
							"testimonial-free"
						)}
					</p>
				</div>
				{homeUrl ? (
					<a href={createUrl} rel="noreferrer" className="sp-real-saved-template-hero__cta">
						<PlusIcon />
						{__("Create a Saved Template", "testimonial-free")}
					</a>
				) : null}
			</div>
			{pluginUrl ? (
				<div className="sp-real-saved-template-hero__media">
					<img
						className="sp-real-saved-template-hero__art"
						src={`${pluginUrl}src/Admin/assets/images/saved-template-promo-bg.png`}
						alt=""
						loading="eager"
						decoding="async"
					/>
				</div>
			) : null}
		</div>
	);
}
