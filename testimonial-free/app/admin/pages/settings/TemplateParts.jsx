import { __ } from "@wordpress/i18n";

export const SaveAndReset = ({
	onSave,
	onReset,
	isChanged,
	isBusy = false,
	busyLabel = "",
	saveLabel = __("Save Change", "testimonial-free"),
	resetLabel = __("Reset", "testimonial-free"),
}) => {
	const canSave = isChanged && !isBusy;
	return (
		<div className="sp-real-settings-save-wrapper sp-d-flex sp-align-center sp-gap-12px">
			<button
				className={`sp-real-settings-save-btn sp-d-flex sp-align-center sp-justify-center${canSave ? " sp-cursor-pointer active" : ""}`}
				disabled={!canSave}
				onClick={onSave}
			>
				{isBusy && busyLabel ? busyLabel : saveLabel}
			</button>
			<button
				className="sp-real-settings-reset-btn sp-d-flex sp-align-center sp-justify-center sp-cursor-pointer"
				onClick={() => {
					// eslint-disable-next-line no-alert
					const confirmReset = window.confirm(__("Are you sure you want to reset?", "testimonial-free"));
					if (confirmReset) {
						onReset();
					}
				}}
			>
				{resetLabel}
			</button>
		</div>
	);
};
