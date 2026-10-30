// admin dashboard constants.
export const defaultDashboardSettings = {
	modules: {
		testimonial_form: {
			is_active: true,
		},
		saved_templates: {
			is_active: true,
		},
		import_export: {
			is_active: true,
		},
		pattern_library: {
			is_active: true,
		},
		seo_schema_markup: {
			is_active: true,
		},
		ai_block_builder: {
			is_active: true,
		},
	},
	integrations: {
		elementor: {
			is_active: true,
		},
		divi: {
			is_active: true,
		},
		wpbakery: {
			is_active: true,
		},
		oxygen: {
			is_active: true,
		},
		beaver: {
			is_active: true,
		},
		bricks: {
			is_active: true,
		},
		site_origin: {
			is_active: true,
		},
		avada: {
			is_active: true,
		},
		// AI providers for Build with AI. `is_active` matches the PHP default
		// (AI::get_credentials()), and each model default must match
		// AI::PROVIDERS and AI_DEFAULT_MODELS (constants/aiProviders.js).
		gemini: {
			is_active: true,
			api_key: "",
			model: "gemini-3.1-flash-lite",
		},
		openai: {
			is_active: true,
			api_key: "",
			model: "gpt-5.6-luna",
		},
		anthropic: {
			is_active: true,
			api_key: "",
			model: "claude-haiku-4-5",
			workspace_id: "",
		},
		groq: {
			is_active: true,
			api_key: "",
			model: "openai/gpt-oss-120b",
		},
	},
	ai_primary_provider: "",
	ai_connector_notice_dismissed: false,
};
