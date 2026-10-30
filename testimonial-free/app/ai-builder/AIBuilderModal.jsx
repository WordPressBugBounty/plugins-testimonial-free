/**
 * Build with AI modal — prompt in, configured testimonial block out.
 */
import { __, sprintf } from "@wordpress/i18n";
import { useState, useEffect, createInterpolateElement } from "@wordpress/element";
import { Modal, Button, Notice } from "@wordpress/components";
import { dispatch, useDispatch, useSelect } from "@wordpress/data";
import { createBlock, getBlockType } from "@wordpress/blocks";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { buildAttributePatch, getDefaultAttributes } from "./applyGenerated";
import { BLOCK_PREFIX, DEFAULT_BLOCK_NAME, isConfiguredBlock, isInsertableBlock } from "./constants";
import { AI_DEFAULT_MODELS, getAiModelOptions } from "@testimonial/constants";
import { GenerateWithAIModuleIcon } from "./icons";
import StarterPillsRail from "./StarterPillsRail";
import useAIGenerator from "./useAIGenerator";
import "./editor.scss";

// Cycled for perceived progress only — the request reports no real steps, so
// the label holds on the last one instead of claiming completion.
const PROGRESS_STEP_LABELS = [
	__("Reading your prompt", "testimonial-free"),
	__("Choosing a layout", "testimonial-free"),
	__("Designing the cards", "testimonial-free"),
	__("Applying styles", "testimonial-free"),
];
const PROGRESS_STEP_INTERVAL_MS = 1400;

// Keyed by AI::failure_reason(); shown when another connected provider can take over.
const FAILURE_NOTICES = {
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	limit: __(
		"<strong>%1$s</strong> reached its limit before finishing. Continue with <strong>%2$s</strong> to get your result.",
		"testimonial-free"
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	incomplete: __(
		"<strong>%1$s</strong> returned an incomplete answer. Continue with <strong>%2$s</strong> to get your result.",
		"testimonial-free"
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	timeout: __(
		"<strong>%1$s</strong> took too long to respond. Continue with <strong>%2$s</strong> to get your result.",
		"testimonial-free"
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	auth: __(
		"<strong>%1$s</strong> rejected the saved API key. Continue with <strong>%2$s</strong> to get your result.",
		"testimonial-free"
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	error: __(
		"<strong>%1$s</strong> couldn't finish this request. Continue with <strong>%2$s</strong> to get your result.",
		"testimonial-free"
	),
};

// Suffix on a failed provider's option in the footer select.
const FAILURE_TAGS = {
	limit: __("Limit reached", "testimonial-free"),
	incomplete: __("Incomplete answer", "testimonial-free"),
	timeout: __("Timed out", "testimonial-free"),
	auth: __("Key rejected", "testimonial-free"),
	error: __("Failed", "testimonial-free"),
};

const savedModelOf = (row) => row?.model || AI_DEFAULT_MODELS[row?.slug] || "";

const AIBuilderModal = ({ isOpen, onClose, targetClientId = null, requestedBlockName = null, isRefining = false }) => {
	const [prompt, setPrompt] = useState("");
	const [blockName, setBlockName] = useState(requestedBlockName || DEFAULT_BLOCK_NAME);
	const [provider, setProvider] = useState("");
	const [model, setModel] = useState("");
	const [applying, setApplying] = useState(false);
	const [progressStep, setProgressStep] = useState(0);
	const { generate, cancel, reset, loading, error, setError, failure, clearFailure, failures } = useAIGenerator();

	const { insertBlock, replaceBlock, updateBlockAttributes, selectBlock } = useDispatch(blockEditorStore);
	const getBlock = useSelect((select) => select(blockEditorStore).getBlock, []);
	const getBlockInsertionPoint = useSelect((select) => select(blockEditorStore).getBlockInsertionPoint, []);

	useEffect(() => {
		if (!loading) {
			setProgressStep(0);
			return undefined;
		}
		const timer = setInterval(() => {
			setProgressStep((step) => Math.min(step + 1, PROGRESS_STEP_LABELS.length - 1));
		}, PROGRESS_STEP_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [loading]);

	useEffect(() => {
		if (!isOpen) {
			setPrompt("");
			reset();
			return;
		}
		setBlockName(requestedBlockName || DEFAULT_BLOCK_NAME);
		const firstProvider = window.sp_real_localize_data?.aiProviders?.[0];
		setProvider(firstProvider?.slug || "");
		setModel(savedModelOf(firstProvider));
	}, [isOpen, requestedBlockName, reset]);

	if (!isOpen) {
		return null;
	}

	const providers = window.sp_real_localize_data?.aiProviders || [];
	const aiConfigUrl = window.sp_real_localize_data?.aiBuilder?.aiConfigUrl || "";
	// Empty on a WordPress without the Connectors screen (before 7.0).
	const connectorsUrl = window.sp_real_localize_data?.aiBuilder?.connectorsUrl || "";
	const hasProvider = providers.length > 0;
	const isBusy = loading || applying;
	const activeProvider = providers.find(({ slug }) => slug === provider);
	const modelOptions = getAiModelOptions(activeProvider);
	// The next connected provider, in failover order, that has not failed yet.
	const fallbackProvider = failure ? providers.find(({ slug }) => !failures[slug]) : null;
	const failedLabel = providers.find(({ slug }) => slug === failure?.provider)?.label || failure?.label || "";
	const fallbackNotice = FAILURE_NOTICES[failure?.reason] || FAILURE_NOTICES.error;

	const handleSelectProvider = (slug) => {
		setProvider(slug);
		setModel(savedModelOf(providers.find((item) => item.slug === slug)));
		clearFailure();
	};

	const handleSelectPrompt = (item) => {
		setPrompt(item.prompt);
		if (item.blockName && isInsertableBlock(item.blockName)) {
			setBlockName(item.blockName);
		}
	};

	/**
	 * Put the generated attributes on the canvas.
	 *
	 * @param {Object} response `{ blockName, attributes }` from the server.
	 */
	const applyResponse = (response) => {
		const target = targetClientId ? getBlock(targetClientId) : null;
		const routedName = `${BLOCK_PREFIX}${response.blockName}`;
		const resolvedName = isInsertableBlock(routedName) && getBlockType(routedName) ? routedName : blockName;

		// A configured block, or a placeholder of the same type, is updated in
		// place so its clientId — and anything wrapping it — survives.
		if (target && (target.name === resolvedName || isConfiguredBlock(target.name, target.attributes))) {
			const patch = buildAttributePatch({
				generated: response.attributes,
				base: target.attributes,
				prompt,
			});
			updateBlockAttributes(targetClientId, patch);
			selectBlock(targetClientId);
			return;
		}

		const defaults = getDefaultAttributes(resolvedName);
		const patch = buildAttributePatch({
			generated: response.attributes,
			base: defaults,
			prompt,
		});
		const newBlock = createBlock(resolvedName, {
			...patch,
			blockName: resolvedName.replace(BLOCK_PREFIX, ""),
			align: patch.align || defaults.align || "wide",
		});

		if (target) {
			replaceBlock(targetClientId, newBlock);
		} else {
			const { index, rootClientId } = getBlockInsertionPoint() || {};
			insertBlock(newBlock, index, rootClientId);
		}
		selectBlock(newBlock.clientId);
	};

	/**
	 * Send the prompt, to the footer's provider unless another is named.
	 *
	 * @param {Object} [override]          Provider to use instead of the footer's.
	 * @param {string} [override.provider] Provider slug.
	 * @param {string} [override.model]    Model of that provider.
	 */
	const handleGenerate = async (override = {}) => {
		if (!prompt.trim()) {
			setError(__("Describe the testimonial block you want to create.", "testimonial-free"));
			return;
		}

		const target = targetClientId ? getBlock(targetClientId) : null;
		const isConfiguredTarget = target && isConfiguredBlock(target.name, target.attributes);
		const existingAttributes = isConfiguredTarget ? target.attributes : {};
		const requestBlockName = isConfiguredTarget ? target.name : blockName;

		const response = await generate({
			prompt,
			blockName: requestBlockName,
			existingAttributes,
			provider: override.provider ?? provider,
			model: override.model ?? model,
		});
		if (!response) {
			return;
		}

		setApplying(true);
		try {
			applyResponse(response);
			dispatch("core/notices").createSuccessNotice(
				isRefining
					? __("Block updated with AI.", "testimonial-free")
					: __("Block created with AI.", "testimonial-free"),
				{ type: "snackbar" }
			);
			onClose();
		} finally {
			setApplying(false);
		}
	};

	const handleContinue = () => {
		const nextModel = savedModelOf(fallbackProvider);
		setProvider(fallbackProvider.slug);
		setModel(nextModel);
		handleGenerate({ provider: fallbackProvider.slug, model: nextModel });
	};

	const handleClose = () => {
		cancel();
		onClose();
	};

	let generateButtonLabel = __("Build Testimonial Showcase", "testimonial-free");
	if (loading) {
		generateButtonLabel = `${PROGRESS_STEP_LABELS[progressStep]}…`;
	} else if (applying) {
		generateButtonLabel = __("Applying…", "testimonial-free");
	} else if (isRefining) {
		generateButtonLabel = __("Update Showcase", "testimonial-free");
	}

	let progressPct = 0;
	if (loading) {
		progressPct = Math.round((progressStep / PROGRESS_STEP_LABELS.length) * 100);
	} else if (applying) {
		progressPct = 100;
	}

	const blockTitle = getBlockType(blockName)?.title || "";
	const modalTitle = isRefining
		? sprintf(
				/* translators: %s: block title */
				__("Refine %s with AI", "testimonial-free"),
				blockTitle
			)
		: __("Build Your Testimonial Showcase with AI", "testimonial-free");

	return (
		<Modal
			title={modalTitle}
			icon={<GenerateWithAIModuleIcon width={36} height={36} />}
			onRequestClose={handleClose}
			className="sp-real-ai-builder-modal"
		>
			<div className="sp-real-ai-builder-modal__body">
				{!hasProvider && (
					<div className="sp-real-ai-builder-modal__connect">
						{createInterpolateElement(
							connectorsUrl
								? __(
										"Connect an AI provider to start building. Set it up in <strong>Real Testimonials > Settings ></strong> <link>AI Configuration</link> or use <connectors>WordPress Connectors</connectors>.",
										"testimonial-free"
									)
								: __(
										"Connect an AI provider to start building. Set it up in <strong>Real Testimonials > Settings ></strong> <link>AI Configuration</link>.",
										"testimonial-free"
									),
							{
								strong: <strong />,
								/* eslint-disable jsx-a11y/anchor-has-content -- content supplied by createInterpolateElement */
								connectors: <a href={connectorsUrl} target="_blank" rel="noopener noreferrer" />,
								link: <a href={aiConfigUrl} target="_blank" rel="noopener noreferrer" />,
								/* eslint-enable jsx-a11y/anchor-has-content */
							}
						)}
					</div>
				)}

				{fallbackProvider && (
					<div
						className="sp-real-ai-builder-modal__fallback sp-d-flex sp-align-center sp-justify-between sp-gap-20px"
						role="alert"
					>
						<p className="sp-real-ai-builder-modal__fallback-text">
							{createInterpolateElement(sprintf(fallbackNotice, failedLabel, fallbackProvider.label), {
								strong: <strong />,
							})}
						</p>
						<Button
							variant="primary"
							className="sp-real-ai-builder-modal__fallback-btn"
							onClick={handleContinue}
						>
							{__("Continue", "testimonial-free")}
						</Button>
					</div>
				)}

				{error && !fallbackProvider && (
					<Notice
						status="error"
						isDismissible
						onRemove={() => setError(null)}
						className="sp-real-ai-builder-modal__notice"
					>
						{error}
					</Notice>
				)}

				<label htmlFor="sp-real-ai-prompt" className="sp-real-ai-heading sp-d-block">
					{isRefining
						? __("What should change?", "testimonial-free")
						: __("What do you want to create?", "testimonial-free")}
				</label>

				<div className="sp-real-ai-textarea-card">
					<textarea
						id="sp-real-ai-prompt"
						className="sp-real-ai-textarea sp-d-block sp-w-full"
						value={prompt}
						maxLength={1000}
						onChange={(event) => setPrompt(event.target.value)}
						placeholder={
							isRefining
								? __("Make the cards dark with light text and show 4 per row", "testimonial-free")
								: __(
										"A testimonial carousel with 3 columns, white rounded cards, amber stars and autoplay every 5 seconds.",
										"testimonial-free"
									)
						}
					/>
					<div className="sp-real-ai-textarea-hint">
						{__("Mention layout, content, motion and styling.", "testimonial-free")}
					</div>
				</div>

				{!isRefining && <StarterPillsRail onSelectPrompt={handleSelectPrompt} />}

				<div className="sp-real-ai-builder-modal__footer sp-d-flex sp-align-center sp-justify-between sp-gap-8px">
					<div className="sp-real-ai-builder-modal__provider sp-d-flex sp-align-center sp-gap-8px">
						{hasProvider && (
							<>
								<select
									className="sp-real-ai-inline-select"
									aria-label={__("AI provider", "testimonial-free")}
									value={provider}
									onChange={(event) => handleSelectProvider(event.target.value)}
									disabled={isBusy}
								>
									{providers.map(({ slug, label }) => (
										<option key={slug} value={slug}>
											{failures[slug]
												? sprintf(
														/* translators: 1: AI provider label, 2: why its last request failed. */
														__("%1$s (%2$s)", "testimonial-free"),
														label,
														FAILURE_TAGS[failures[slug]] || FAILURE_TAGS.error
													)
												: label}
										</option>
									))}
								</select>
								{modelOptions.length > 0 && (
									<>
										<span className="sp-real-ai-builder-modal__provider-sep" aria-hidden="true">
											·
										</span>
										<select
											className="sp-real-ai-inline-select"
											aria-label={__("AI model", "testimonial-free")}
											value={model}
											onChange={(event) => setModel(event.target.value)}
											disabled={isBusy}
										>
											{modelOptions.map(({ label, value }) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
									</>
								)}
							</>
						)}
					</div>
					<div className="sp-d-flex sp-align-center sp-gap-8px">
						{loading && (
							<button
								type="button"
								aria-label={__("Stop generating", "testimonial-free")}
								onClick={cancel}
								className="sp-real-ai-stop-btn sp-d-flex sp-align-center sp-justify-center"
							>
								<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
									<rect
										x="2"
										y="2"
										width="8"
										height="8"
										rx="1.5"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									/>
								</svg>
							</button>
						)}
						<Button
							variant="primary"
							className="sp-real-ai-generate-btn"
							onClick={() => handleGenerate()}
							aria-busy={isBusy}
							disabled={isBusy || !hasProvider || !prompt.trim()}
						>
							<span className="sp-real-ai-generate-btn__fill" style={{ width: `${progressPct}%` }} />
							<span className="sp-real-ai-generate-btn__label sp-d-flex sp-align-center sp-gap-8px">
								{loading && (
									<span className="sp-real-ai-generate-btn__dots sp-d-i-flex sp-align-center">
										<span />
										<span />
										<span />
									</span>
								)}
								{generateButtonLabel}
							</span>
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default AIBuilderModal;
