import { __ } from "@wordpress/i18n";
import { Tooltip } from "@wordpress/components";
import { ProCornerBadge } from "../proControls";

const PresetPicker = ({
	label = __("Select Preset", "testimonial-free"),
	items = [],
	attributes,
	attributesKey,
	setAttributes,
	cols = 3,
	onClick = false,
}) => {
	const getTitle = () => {
		return items?.find((i) => i.value === attributes)?.label;
	};

	return (
		<div className="sp-real-toggle-icon-picker sp-real-component-mb">
			<span className="sp-real-component-title sp-real-preset-piker-label sp-justify-between sp-align-center sp-mb-8px">
				{label}
				<span className="sp-real-active-layout">{getTitle()}</span>
			</span>
			<div className={`sp-real-toggle-icon-sets sp-d-grid sp-grid-cols-${cols} sp-gap-8px`}>
				{items?.map(({ Icon, label: title, value, pro }) => {
					// Pro items are locked in the free plugin: inert, with a crown
					// in the corner and "(Pro)" in the tooltip.
					const tooltip = pro ? `${title} (${__("Pro", "testimonial-free")})` : title;
					const isActive = value === attributes;
					return (
						<Tooltip key={value} text={tooltip} placement="top">
							<div
								className={`sp-real-icon-set sp-cursor-pointer sp-d-flex sp-align-center sp-justify-center${isActive ? " active" : ""}${pro ? " sp-real-pro-locked" : ""}`}
								onClick={() => {
									if (pro) {
										return;
									}
									if (onClick) {
										onClick(value);
										return;
									}
									setAttributes({ [attributesKey]: value });
								}}
								title={tooltip}
							>
								<Icon isActive={isActive} />
								{pro && <ProCornerBadge />}
							</div>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
};

export default PresetPicker;
