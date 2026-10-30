/**
 * Request state for the Build with AI modal.
 */
import { useState, useCallback, useRef } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

/**
 * Strip a value down to what JSON.stringify can serialize, so one stray
 * non-plain leaf in a block's attributes cannot stop a Refine request.
 *
 * @param {*}       value Value to clean.
 * @param {WeakSet} seen  Objects already visited, for cycle detection.
 * @return {*} A serializable value, or undefined when it had to be dropped.
 */
export function toSerializable(value, seen = new WeakSet()) {
	if (null === value || "object" !== typeof value) {
		return "function" === typeof value ? undefined : value;
	}
	if (("undefined" !== typeof window && value === window) || value?.window === value) {
		return undefined;
	}
	if ("undefined" !== typeof Node && value instanceof Node) {
		return undefined;
	}
	if (seen.has(value)) {
		return undefined;
	}
	seen.add(value);

	if (Array.isArray(value)) {
		return value.map((item) => toSerializable(item, seen));
	}

	const proto = Object.getPrototypeOf(value);
	if (null !== proto && Object.prototype !== proto) {
		return undefined;
	}

	const cleaned = {};
	Object.entries(value).forEach(([key, child]) => {
		const childCleaned = toSerializable(child, seen);
		if (undefined !== childCleaned) {
			cleaned[key] = childCleaned;
		}
	});
	return cleaned;
}

/**
 * Ask the server to turn a prompt into block attributes.
 *
 * A provider failure is remembered per slug (`failures`, slug → reason key)
 * until `reset()`, and the latest one is `failure` — `{ provider, label,
 * reason }` — so the modal can offer the next provider that has not failed.
 *
 * @return {Object} `{ generate, cancel, reset, loading, error, setError, failure, clearFailure, failures }`.
 */
export default function useAIGenerator() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [failure, setFailure] = useState(null);
	const [failures, setFailures] = useState({});
	const controllerRef = useRef(null);

	const generate = useCallback(async ({ prompt, blockName, existingAttributes = {}, provider = "", model = "" }) => {
		const controller = new AbortController();
		controllerRef.current = controller;

		setLoading(true);
		setError(null);
		setFailure(null);

		try {
			const response = await apiFetch({
				path: "/sp-rtp/v2/ai-generate",
				method: "POST",
				data: {
					prompt,
					blockName: blockName.replace("sp-testimonial-pro/", ""),
					existingAttributes: toSerializable(existingAttributes) || {},
					provider,
					model,
				},
				signal: controller.signal,
			});

			if (response?.success && response.attributes) {
				return response;
			}

			throw new Error(__("The AI could not build a block from this prompt.", "testimonial-free"));
		} catch (err) {
			if ("AbortError" === err.name) {
				return null;
			}
			const failedProvider = err?.data?.provider || "";
			if (failedProvider) {
				const reason = err.data.reason || "error";
				setFailures((current) => ({ ...current, [failedProvider]: reason }));
				setFailure({ provider: failedProvider, label: err.data.label || "", reason });
			}
			setError(err.message || __("Something went wrong while talking to the AI provider.", "testimonial-free"));
			return null;
		} finally {
			setLoading(false);
			if (controllerRef.current === controller) {
				controllerRef.current = null;
			}
		}
	}, []);

	const cancel = useCallback(() => {
		controllerRef.current?.abort();
	}, []);

	const clearFailure = useCallback(() => {
		setFailure(null);
		setError(null);
	}, []);

	const reset = useCallback(() => {
		setError(null);
		setFailure(null);
		setFailures({});
	}, []);

	return { generate, cancel, reset, loading, error, setError, failure, clearFailure, failures };
}
