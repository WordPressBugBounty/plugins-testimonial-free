/**
 * Saved Templates page — design/layout matches Logo Carousel Pro / WP
 * Carousel Pro.
 *
 * Search and pagination run server-side through the plugin store
 * (`/sp-rtp/v2/saved-templates`); duplicate and delete go through the
 * @wordpress/data core entity store on the `sp_real_template` post type —
 * there is deliberately no mutation REST route.
 *
 * Empty library: the hero card explains the feature and the table carries an
 * illustrated empty state; the toolbar and the pager only appear once there
 * is something to act on, so the "create" call to action is never duplicated.
 */

import { useCallback, useEffect, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { resolveSelect, useDispatch, useSelect } from "@wordpress/data";
import { Spinner } from "@wordpress/components";
import { STORE_NAME } from "../../store";
import { copyText, toastErrorMsg, toastSuccessMsg } from "../../functions";
import { toggleSelection, allSelected, toggleSelectAll } from "../../utils/templates";
import Pagination from "../../components/Pagination";
import { EditPencilIcon, CopyIcon, DeleteBinIcon, CheckIcon, PlusIcon, EmptyStateIcon } from "./Icons";
import SavedTemplatesHero from "./SavedTemplatesHero";
import "./saved-templates.scss";

const PER_PAGE = 10;
const POST_TYPE = "sp_real_template";
const COLUMN_COUNT = 6;

/**
 * Column names. The header row prints them, and each body cell repeats its own
 * in `data-label` so the phone layout — where the header is hidden and every
 * row folds into a card — can show it in front of the value.
 *
 * @return {Object<string, string>} Column key => label.
 */
function columnLabels() {
	return {
		title: __("Title", "testimonial-free"),
		block: __("Block", "testimonial-free"),
		shortcode: __("Shortcode", "testimonial-free"),
		date: __("Date", "testimonial-free"),
		action: __("Actions", "testimonial-free"),
	};
}

/**
 * @return {JSX.Element} Saved Templates page.
 */
const SavedTemplates = () => {
	const { homeUrl = "" } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const { templates: items = [], total_items: totalItems } = useSelect(
		(select) => select(STORE_NAME).getSaveTemplates(),
		[]
	);
	const loading = useSelect((select) => select(STORE_NAME).isTemplatesLoading(), []);
	const error = useSelect((select) => select(STORE_NAME).getTemplatesError(), []);
	const { fetchSavedTemplates } = useDispatch(STORE_NAME);
	const { saveEntityRecord, deleteEntityRecord } = useDispatch("core");

	const [searchValue, setSearchValue] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selected, setSelected] = useState([]);
	const [bulkAction, setBulkAction] = useState("");
	const [copiedId, setCopiedId] = useState(null);
	const [mutating, setMutating] = useState(false);
	const searchTimer = useRef(null);

	const createUrl = `${homeUrl}wp-admin/post-new.php?post_type=sp_real_template&rtpblock_inserter=true`;

	// Debounced server-side search; typing resets to the first page.
	useEffect(() => {
		if (searchTimer.current) {
			clearTimeout(searchTimer.current);
		}
		searchTimer.current = setTimeout(() => {
			setDebouncedSearch(searchValue);
			setCurrentPage(1);
		}, 100);
		return () => clearTimeout(searchTimer.current);
	}, [searchValue]);

	useEffect(() => {
		fetchSavedTemplates(debouncedSearch, currentPage, PER_PAGE);
	}, [fetchSavedTemplates, debouncedSearch, currentPage]);

	const refreshTemplates = useCallback(() => {
		fetchSavedTemplates(debouncedSearch, currentPage, PER_PAGE);
	}, [fetchSavedTemplates, debouncedSearch, currentPage]);

	/**
	 * Duplicate a template through the core entity store: the copy carries the
	 * source's raw content and meta, and lands as a draft.
	 *
	 * @param {number} id Template id.
	 */
	const duplicateShortcodeHandler = async (id) => {
		setMutating(true);
		try {
			const record = await resolveSelect("core").getEntityRecord("postType", POST_TYPE, id);
			const title = record?.title?.raw ? `${record.title.raw} (Copy)` : __("(Copy)", "testimonial-free");
			await saveEntityRecord("postType", POST_TYPE, {
				title,
				content: record?.content?.raw || "",
				meta: record?.meta || {},
				status: "draft",
			});
			toastSuccessMsg(__("Template duplicated.", "testimonial-free"));
			setCurrentPage(1);
			fetchSavedTemplates(debouncedSearch, 1, PER_PAGE);
		} catch (duplicateError) {
			toastErrorMsg(__("Could not duplicate the template.", "testimonial-free"));
			// eslint-disable-next-line no-console
			console.error("Error duplicating template:", duplicateError.message);
		}
		setMutating(false);
	};

	/**
	 * Move templates to Trash through the core entity store (no force delete).
	 *
	 * @param {number[]} ids Template ids.
	 */
	const deleteItemHandler = async (ids) => {
		const list = Array.isArray(ids) ? ids : [ids];
		const message =
			list.length > 1
				? sprintf(
						/* translators: %d: number of templates. */
						__("Delete %d templates? They will be moved to Trash.", "testimonial-free"),
						list.length
					)
				: __("Delete this template? It will be moved to Trash.", "testimonial-free");

		// eslint-disable-next-line no-alert
		if (!window.confirm(message)) {
			return;
		}

		setMutating(true);
		let deleted = 0;
		for (const id of list) {
			try {
				// No force: the row lands in Trash, and DynamicStyle's
				// wp_trash_post hook still drops the generated CSS file.
				const success = await deleteEntityRecord("postType", POST_TYPE, id);
				if (success) {
					deleted += 1;
				}
			} catch (deleteError) {
				// eslint-disable-next-line no-console
				console.error("Error deleting template:", deleteError.message);
			}
		}

		if (deleted > 0) {
			toastSuccessMsg(
				1 === deleted
					? __("Template deleted.", "testimonial-free")
					: sprintf(
							/* translators: %d: number of templates. */
							__("%d templates deleted.", "testimonial-free"),
							deleted
						)
			);
			const removedSet = new Set(list);
			setSelected((prev) => prev.filter((id) => !removedSet.has(id)));
			// Deleting the last row of the last page would leave an empty page.
			const remainingPages = Math.max(1, Math.ceil((totalItems - deleted) / PER_PAGE));
			const nextPage = Math.min(currentPage, remainingPages);
			setCurrentPage(nextPage);
			fetchSavedTemplates(debouncedSearch, nextPage, PER_PAGE);
		} else {
			toastErrorMsg(__("Could not delete the templates.", "testimonial-free"));
		}
		setMutating(false);
	};

	const applyBulk = async () => {
		if ("delete" !== bulkAction || 0 === selected.length) {
			return;
		}
		await deleteItemHandler(selected);
		setBulkAction("");
	};

	/**
	 * @param {Object} row Template row.
	 */
	const copyShortcode = async (row) => {
		const ok = await copyText(row.shortcode);
		if (!ok) {
			return;
		}
		setCopiedId(row.id);
		setTimeout(() => {
			setCopiedId((id) => (id === row.id ? null : id));
		}, 2000);
	};

	const labels = columnLabels();
	const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
	const headerChecked = items.length > 0 && allSelected(items, selected);

	// Library size, not the searched count — an unmatched search must not read
	// as an empty library and bring the hero back.
	const hasTemplates = totalItems > 0 || searchValue !== "";
	const showHero = !loading && !error && 0 === totalItems && "" === searchValue;
	const isFilteredEmpty = !loading && !error && 0 === items.length && "" !== searchValue;

	return (
		<div className="sp-real-saved-templates-page-wrapper">
			{showHero && <SavedTemplatesHero />}

			<div
				className={`sp-real-saved-templates-page-container${
					hasTemplates ? "" : " sp-real-saved-templates-page-container--bare"
				}`}
			>
				{hasTemplates && (
					<div className="sp-real-saved-template-header">
						<div className="sp-real-saved-template-header-left">
							<select
								name="bulk-action"
								className="sp-real-saved-template-select"
								value={bulkAction}
								onChange={(event) => setBulkAction(event.target.value)}
								aria-label={__("Bulk action", "testimonial-free")}
							>
								<option value="">{__("Bulk Action", "testimonial-free")}</option>
								<option value="delete">{__("Delete", "testimonial-free")}</option>
							</select>
							<button
								type="button"
								className="sp-real-saved-template-select-apply"
								onClick={applyBulk}
								disabled={!bulkAction || 0 === selected.length}
							>
								{__("Apply", "testimonial-free")}
							</button>
							<input
								name="search-templates"
								className="sp-real-saved-template-search-field"
								type="text"
								placeholder={__("Search…", "testimonial-free")}
								spellCheck="false"
								value={searchValue}
								onChange={(event) => setSearchValue(event.target.value)}
								aria-label={__("Search templates", "testimonial-free")}
							/>
						</div>
						<div className="sp-real-saved-template-header-right">
							{homeUrl ? (
								<a href={createUrl} className="sp-real-saved-template-add-new" rel="noreferrer">
									<PlusIcon />
									{__("Create a Saved Template", "testimonial-free")}
								</a>
							) : null}
						</div>
					</div>
				)}

				<table className="sp-real-saved-template-content-table">
					<thead className="sp-real-saved-template-table-head">
						<tr>
							<th className="sp-real-saved-template-table-checkBox">
								<input
									type="checkbox"
									checked={headerChecked}
									onChange={() => setSelected(toggleSelectAll(items, selected))}
									disabled={items.length === 0}
									aria-label={__("Select all templates", "testimonial-free")}
								/>
							</th>
							<th className="sp-real-saved-template-table-title">{labels.title}</th>
							<th className="sp-real-saved-template-table-block">{labels.block}</th>
							<th className="sp-real-saved-template-table-shortcode">{labels.shortcode}</th>
							<th className="sp-real-saved-template-table-date">{labels.date}</th>
							<th className="sp-real-saved-template-table-action">{labels.action}</th>
						</tr>
					</thead>
					<tbody className={`sp-real-saved-template-table-body${loading || mutating ? " is-busy" : ""}`}>
						{loading && (
							<tr className="sp-real-saved-template-state-row">
								<td colSpan={COLUMN_COUNT} className="sp-real-saved-template-preloader-no-data">
									<span className="sp-real-saved-template-loading">
										<Spinner />
										{__("Loading templates…", "testimonial-free")}
									</span>
								</td>
							</tr>
						)}

						{!loading && error && (
							<tr className="sp-real-saved-template-state-row">
								<td colSpan={COLUMN_COUNT} className="sp-real-saved-template-no-data">
									<p>{error}</p>
									<button
										type="button"
										className="sp-real-saved-template-select-apply"
										onClick={refreshTemplates}
									>
										{__("Retry", "testimonial-free")}
									</button>
								</td>
							</tr>
						)}

						{!loading && !error && 0 === items.length && (
							<tr className="sp-real-saved-template-state-row sp-real-saved-template-empty-row">
								<td colSpan={COLUMN_COUNT} className="sp-real-saved-template-preloader-no-data">
									<div className="sp-real-saved-template-empty">
										<div className="sp-real-saved-template-empty__message">
											<EmptyStateIcon />
											<p className="sp-real-saved-template-empty__text">
												{isFilteredEmpty
													? __("No saved templates match your search.", "testimonial-free")
													: __("No saved templates yet.", "testimonial-free")}
											</p>
										</div>
										{!isFilteredEmpty && homeUrl ? (
											<a
												href={createUrl}
												rel="noreferrer"
												className="sp-real-saved-template-empty__cta"
											>
												{__("Create a Saved Template", "testimonial-free")}
												<PlusIcon />
											</a>
										) : null}
									</div>
								</td>
							</tr>
						)}

						{!loading &&
							!error &&
							items.map((row) => (
								<tr key={row.id}>
									<td className="sp-real-saved-template-table-checkBox">
										<input
											type="checkbox"
											checked={selected.includes(row.id)}
											onChange={() => setSelected(toggleSelection(selected, row.id))}
											aria-label={sprintf(
												/* translators: %s: template title. */
												__("Select %s", "testimonial-free"),
												row.title
											)}
										/>
									</td>
									<td className="sp-real-saved-template-table-title">
										<a href={row.editUrl}>{row.title}</a>
										{"publish" !== row.status && (
											<span className="sp-real-saved-template-badge">{row.status}</span>
										)}
									</td>
									<td className="sp-real-saved-template-table-block" data-label={labels.block}>
										{row.blockLabel ? (
											<span
												className="sp-real-saved-template-block-badge"
												title={(row.blockTypes || []).join(", ")}
											>
												{row.blockLabel}
											</span>
										) : (
											<span
												className="sp-real-saved-template-block-empty"
												aria-label={__("No testimonial block yet", "testimonial-free")}
											>
												&mdash;
											</span>
										)}
									</td>
									<td
										className="sp-real-saved-template-table-shortcode"
										data-label={labels.shortcode}
									>
										<span
											className="sp-real-saved-template-shortcode-text"
											onClick={() => copyShortcode(row)}
											onKeyDown={(event) => {
												if ("Enter" === event.key || " " === event.key) {
													event.preventDefault();
													copyShortcode(row);
												}
											}}
											role="button"
											tabIndex={0}
											title={__("Click to copy", "testimonial-free")}
										>
											{row.shortcode}
										</span>
										{copiedId === row.id && (
											<span className="sp-real-shortcode-copy-tooltip">
												<CheckIcon />
												{__("Copied!", "testimonial-free")}
											</span>
										)}
									</td>
									<td className="sp-real-saved-template-table-date" data-label={labels.date}>
										<span className="sp-real-saved-template-date-value">
											{row.status}
											<br />
											{row.dateDisplay}
										</span>
									</td>
									<td className="sp-real-saved-template-table-action" data-label={labels.action}>
										<div className="sp-real-saved-template-table-action-btn">
											<a
												className="sp-real-saved-template-action sp-action-edit"
												href={row.editUrl}
												aria-label={__("Edit", "testimonial-free")}
												title={__("Edit", "testimonial-free")}
											>
												<EditPencilIcon />
											</a>
											<button
												type="button"
												className="sp-real-saved-template-action sp-action-copy"
												onClick={() => duplicateShortcodeHandler(row.id)}
												aria-label={__("Duplicate", "testimonial-free")}
												title={__("Duplicate", "testimonial-free")}
											>
												<CopyIcon />
											</button>
											<button
												type="button"
												className="sp-real-saved-template-action sp-action-delete"
												onClick={() => deleteItemHandler([row.id])}
												aria-label={__("Delete", "testimonial-free")}
												title={__("Delete", "testimonial-free")}
											>
												<DeleteBinIcon />
											</button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>

				{hasTemplates && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						isLoading={loading}
						onPageChange={setCurrentPage}
					/>
				)}
			</div>
		</div>
	);
};

export default SavedTemplates;
