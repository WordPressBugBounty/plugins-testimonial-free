import { Fragment, memo } from "@wordpress/element";
import { useCanvasPanelClick } from "@testimonial/hooks";
import {
	ClientImage,
	ClientDesignation,
	ClientRating,
	TestimonialContent,
	ClientName,
	TestimonialTitle,
} from "./TemplateParts";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const TestimonialCard = ({ testimonial, attributes, isSwiperSlide = false }) => {
	// Clicking a card section opens the inspector panel that controls it.
	const onCardSectionClick = useCanvasPanelClick();

	const { name, company, content, position, rating, thumbnail, title, video_url } = testimonial;

	const {
		blockName,
		cardDesign,
		cardContents = [],
		cardAlignment,
		cardHoverEffect,
		titleTag,
		nameHtmlTag,
		stripAllHTMLTags,
		reviewerFallbackImages,
		ratingIconSet,
	} = attributes;

	// Show the reviewer-image slot when there's a thumbnail OR an active fallback.
	const reviewerImageVisible = Boolean(thumbnail) || (reviewerFallbackImages || "mystery_person") !== "none";

	const titleAttrs = { titleTag };
	const contentAttrs = { stripAllHTMLTags };

	// Map of cardContents item.name → renderer. Each returns null when the
	// testimonial lacks the data needed for that slot.
	const renderers = {
		reviewer_image: () =>
			reviewerImageVisible && (
				<ClientImage
					attributes={{
						blockName,
						cardDesign,
						reviewerFallbackImages,
					}}
					data={{
						thumbnail,
						title,
						video_url,
						name,
					}}
				/>
			),
		testimonial_title: () => title && <TestimonialTitle title={title} attributes={titleAttrs} />,
		testimonial_text: () => content && <TestimonialContent content={content} attributes={contentAttrs} />,
		rating: () => <ClientRating rating={rating} ratingIconSet={ratingIconSet} />,
		reviewer_name: () => name && <ClientName name={name} tag={nameHtmlTag} />,
		designation: () => (position || company) && <ClientDesignation position={position} company={company} />,
	};

	const renderItem = (item) => {
		if (!item.is_active) {
			return null;
		}
		const renderer = renderers[item.name];
		if (!renderer) {
			return null;
		}
		const node = renderer();
		return node ? <Fragment key={item.name}>{node}</Fragment> : null;
	};

	const outerClass = cx(
		"sp-real-testimonial-card",
		`sp-real-card-${cardDesign}`,
		cardHoverEffect !== "none" && `sp-real-card-effect-${cardHoverEffect}`,
		isSwiperSlide && "sp-real-swiper-slide swiper-slide",
		blockName === "marquee" && "sp-real-marquee-item"
	);

	// The List block's designs put the reviewer image in its own column and wrap
	// every other slot beside it. PHP mirror: CardTemplate::render_body().
	const isListDesign = Boolean(cardDesign?.startsWith("list-design-"));

	return (
		<div className={outerClass} onClick={onCardSectionClick}>
			<div className={`sp-real-card-inner sp-align-${cardAlignment} sp-text-${cardAlignment}`}>
				{isListDesign ? (
					<>
						{cardContents.filter((item) => item.name === "reviewer_image").map(renderItem)}
						<div className={`sp-real-card-content-wrapper sp-d-flex sp-flex-col sp-align-${cardAlignment}`}>
							{cardContents.filter((item) => item.name !== "reviewer_image").map(renderItem)}
						</div>
					</>
				) : (
					cardContents.map(renderItem)
				)}
			</div>
		</div>
	);
};

export default memo(TestimonialCard);
