/**
 * Pagination — shared footer for the Saved Templates list page:
 * "Page X of Y [ N Items ]" count plus the
 * prev / numbered / next button row. Renders nothing while the parent list is
 * loading. Reuses the saved-template pagination classes both pages share.
 */
import { __, _n, sprintf } from "@wordpress/i18n";
import { memo } from "@wordpress/element";
import { LeftArrow, RightArrow } from "../pages/saved-templates/Icons";

const Pagination = ({ currentPage, totalPages = 1, totalItems = 0, isLoading, onPageChange }) => {
	if (isLoading) {
		return null;
	}

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
	const itemCount = sprintf(
		/* translators: %s: number of saved templates. */
		_n("%s Item", "%s Items", totalItems, "testimonial-free"),
		totalItems
	);

	return (
		<div className="sp-real-saved-template-footer sp-d-flex sp-align-center sp-justify-between">
			<div className="sp-real-saved-template-count">
				{sprintf(
					/* translators: 1: current page number, 2: total page count. */
					__("Page %1$s of %2$s", "testimonial-free"),
					currentPage,
					totalPages || 1
				)}
				&nbsp; <span>[ {itemCount} ]</span>
			</div>
			<div className="sp-real-saved-template-pagination sp-d-flex sp-flex-row sp-align-center sp-justify-between sp-gap-8px">
				{pages?.length > 1 && (
					<>
						<button
							type="button"
							className={`sp-real-saved-template-pagination-btn btn-prev${
								currentPage === 1 ? " btn-disabled" : ""
							}`}
							onClick={() => onPageChange(currentPage !== 1 ? currentPage - 1 : 1)}
						>
							<LeftArrow />
						</button>
						{pages.map((item, i) => (
							<button
								type="button"
								key={i}
								className={`sp-real-saved-template-pagination-btn ${
									currentPage === item ? "btn-active" : "sp-btn-numb"
								}`}
								onClick={(e) => onPageChange(Number(e.target?.value))}
								value={item}
							>
								{item}
							</button>
						))}
						<button
							type="button"
							className={`sp-real-saved-template-pagination-btn sp-btn-next${
								currentPage === pages?.length ? " btn-disabled" : ""
							}`}
							onClick={() =>
								onPageChange(currentPage !== pages?.length ? currentPage + 1 : pages?.length)
							}
						>
							<RightArrow />
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default memo(Pagination);
