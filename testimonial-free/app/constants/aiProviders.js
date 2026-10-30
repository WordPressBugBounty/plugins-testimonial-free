import { __, sprintf } from "@wordpress/i18n";

/**
 * AI provider models, shared by the dashboard AI Configuration tab and the
 * Build with AI modal.
 *
 * Each default must agree with `AI::PROVIDERS[ slug ]['default_model']` and
 * with `defaultDashboardSettings.integrations.<slug>.model`.
 */
export const AI_MODELS = {
	anthropic: [
		{ label: "Claude Haiku 4.5", value: "claude-haiku-4-5" },
		{ label: "Claude Sonnet 5", value: "claude-sonnet-5" },
		{ label: "Claude Opus 5", value: "claude-opus-5" },
	],
	openai: [
		{ label: "GPT-5.6 Sol", value: "gpt-5.6-sol" },
		{ label: "GPT-5.6 Terra", value: "gpt-5.6-terra" },
		{ label: "GPT-5.6 Luna", value: "gpt-5.6-luna" },
	],
	// `gemini-3.1-flash-lite-preview` is shut down and must not be offered;
	// AI::RETIRED_MODELS translates a stored copy of it on read.
	gemini: [
		{ label: "Gemini 3.1 Flash-Lite", value: "gemini-3.1-flash-lite" },
		{ label: "Gemini 3.5 Flash-Lite", value: "gemini-3.5-flash-lite" },
	],
	groq: [
		{ label: "GPT-OSS 120B", value: "openai/gpt-oss-120b" },
		{ label: "GPT-OSS 20B", value: "openai/gpt-oss-20b" },
		{ label: "Qwen3.8 27B", value: "qwen/qwen3.8-27b" },
	],
};

export const AI_DEFAULT_MODELS = {
	anthropic: "claude-haiku-4-5",
	openai: "gpt-5.6-luna",
	gemini: "gemini-3.1-flash-lite",
	groq: "openai/gpt-oss-120b",
};

// Mirror of AI::RETIRED_MODELS — a dead slug the shared option may still hold.
export const RETIRED_MODELS = {
	"gemini-3.1-flash-lite-preview": "gemini-3.1-flash-lite",
};

/**
 * Model options for one connected provider, the plugin default marked as
 * recommended. A saved model the list no longer offers stays selectable.
 *
 * @param {Object} provider `{ slug, model }` row from `sp_real_localize_data.aiProviders`.
 * @return {Array<{label: string, value: string}>} Options.
 */
export const getAiModelOptions = (provider) => {
	if (!provider) {
		return [];
	}
	const options = (AI_MODELS[provider.slug] || []).map(({ label, value }) => ({
		value,
		label:
			AI_DEFAULT_MODELS[provider.slug] === value
				? sprintf(
						/* translators: %s: AI model name */
						__("%s (Recommended)", "testimonial-free"),
						label
					)
				: label,
	}));
	if (provider.model && !options.some(({ value }) => value === provider.model)) {
		options.unshift({ label: provider.model, value: provider.model });
	}
	return options;
};
