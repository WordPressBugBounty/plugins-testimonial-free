import { __, sprintf } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../../../store";
import { InfoCircleIcon } from "../Icons";
import { AI_PROVIDER_CONFIG, isProviderConnected, resolvePrimaryProvider } from "./aiProviderConfig";
import AiProviderSettings from "./AiProviderSettings";

/**
 * Settings → AI Configuration: one card per AI provider, and the connection
 * form of the selected one below. The Primary is tried first and every other
 * connected provider is a backup it fails over to (AI::connected_in_order()),
 * so a lone connected provider gets a nudge to add one.
 *
 * @return {JSX.Element} The tab.
 */
const AiConfiguration = () => {
	const settings = useSelect((select) => select(STORE_NAME).getSettings(), []);
	const { aiConnectors, aiProviderOrder } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);

	const isConnected = (slug) => isProviderConnected(settings, aiConnectors, slug);
	const primarySlug = resolvePrimaryProvider(settings, aiConnectors, aiProviderOrder);
	const connectedCount = AI_PROVIDER_CONFIG.filter(({ slug }) => isConnected(slug)).length;
	const primaryProvider = AI_PROVIDER_CONFIG.find(({ slug }) => slug === primarySlug);

	const [activeSlug, setActiveSlug] = useState(() => primarySlug || AI_PROVIDER_CONFIG[0].slug);
	const activeProvider = AI_PROVIDER_CONFIG.find(({ slug }) => slug === activeSlug) || AI_PROVIDER_CONFIG[0];

	return (
		<div className="sp-real-ai-config sp-d-flex sp-flex-col">
			<div className="sp-real-ai-config__head sp-d-flex sp-justify-between sp-align-end sp-gap-12px">
				<div className="sp-d-flex sp-flex-col sp-gap-4px">
					<h3 className="sp-real-ai-config__title">{__("AI Providers", "testimonial-free")}</h3>
					<p className="sp-real-ai-config__desc">{__("Configure your AI providers.", "testimonial-free")}</p>
				</div>
				<span className="sp-real-ai-config__count">
					{sprintf(
						/* translators: 1: number of connected AI providers, 2: number of AI providers */
						__("%1$d of %2$d ready", "testimonial-free"),
						connectedCount,
						AI_PROVIDER_CONFIG.length
					)}
				</span>
			</div>
			<div className="sp-real-ai-config__providers sp-d-grid">
				{AI_PROVIDER_CONFIG.map(({ slug, label, Icon }) => {
					const isActive = slug === activeProvider.slug;
					const connected = isConnected(slug);
					return (
						<button
							key={slug}
							type="button"
							aria-pressed={isActive}
							className={`sp-real-ai-config__provider sp-d-flex sp-flex-col sp-align-start sp-cursor-pointer${isActive ? " is-active" : ""}`}
							onClick={() => setActiveSlug(slug)}
						>
							<span className="sp-real-ai-config__provider-icon sp-d-flex sp-align-center sp-justify-center">
								<Icon />
							</span>
							<span className="sp-real-ai-config__provider-label">{label}</span>
							<span
								className={`sp-real-ai-config__provider-status sp-d-i-flex sp-align-center sp-gap-6px${connected ? " is-connected" : ""}`}
							>
								{connected ? __("Connected", "testimonial-free") : __("Not set up", "testimonial-free")}
							</span>
							{slug === primarySlug && (
								<span className="sp-real-ai-config__provider-badge">
									{__("Primary", "testimonial-free")}
								</span>
							)}
						</button>
					);
				})}
			</div>
			{1 === connectedCount && primaryProvider && (
				<p className="sp-real-ai-config__backup-hint sp-d-flex sp-align-center sp-gap-6px">
					<InfoCircleIcon />
					{sprintf(
						/* translators: %s: AI provider name */
						__(
							"Add a backup provider so building keeps working if %s reaches its limit.",
							"testimonial-free"
						),
						primaryProvider.name
					)}
				</p>
			)}
			<AiProviderSettings
				key={activeProvider.slug}
				provider={activeProvider}
				isConnected={isConnected(activeProvider.slug)}
				isPrimary={activeProvider.slug === primarySlug}
			/>
		</div>
	);
};

export default AiConfiguration;
