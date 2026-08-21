import DynamicShortcodeInput from "../shortcode/dynamicShortcode";
import { escapeAttribute, escapeHTML } from "@wordpress/escape-html";
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from "@wordpress/server-side-render";
import { TestimonialPreviewImage } from "../../assets/testimonialIcons";

const { __ } = wp.i18n;
const { PanelBody, PanelRow } = wp.components;
const { useEffect, useRef } = wp.element;
const el = wp.element.createElement;

/**
 * `useBlockProps` came with Block API v2 in WordPress 5.6. The plugin still
 * supports 5.0, where the editor wraps the block itself, so fall back to empty
 * props there.
 */
const useBlockPropsCompat = 'function' === typeof useBlockProps ? useBlockProps : () => ({});

const testimonialEdit = ({ attributes, setAttributes }) => {
    var shortCodeList = sp_testimonial_free.shortCodeList;
    const isPreview = !!attributes.preview;
    const hasSelection = !!attributes.shortcode && 0 != attributes.shortcode;
    const previewRef = useRef(null);
    const blockProps = useBlockPropsCompat();

    /**
     * Initialize the testimonial that `ServerSideRender` just rendered.
     *
     * Since WordPress 6.3 the block canvas is an iframe, so the rendered markup,
     * jQuery and Swiper live in `ownerDocument.defaultView` and not in the editor
     * window. The markup arrives after this component mounts, so watch the preview
     * container for it instead of polling, then hand over to the front-end
     * initializer that the canvas already loaded.
     */
    useEffect(() => {
        const node = previewRef.current;
        if (isPreview || !hasSelection || !node) {
            return;
        }

        const view = node.ownerDocument ? node.ownerDocument.defaultView : null;
        if (!view || !view.MutationObserver) {
            return;
        }

        // Only the section currently on screen is initialized. That leaves the stale
        // markup ServerSideRender keeps during a reload alone and makes sure no
        // section is ever bound twice.
        let initialized = null;
        let attempts = 0;
        let timer = null;

        const initialize = () => {
            const section = node.querySelector('.sp-testimonial-free-section');
            if (!section || section === initialized) {
                return;
            }

            // The canvas scripts are parsed while the blocks mount, so give them a
            // bounded amount of time to show up rather than waiting forever.
            if ('function' !== typeof view.spTestimonialFreeInit) {
                if (attempts++ < 20) {
                    view.clearTimeout(timer);
                    timer = view.setTimeout(initialize, 100);
                }
                return;
            }

            initialized = section;
            attempts = 0;
            view.spTestimonialFreeInit();
        };

        const observer = new view.MutationObserver(initialize);
        observer.observe(node, { childList: true, subtree: true });
        initialize();

        return () => {
            observer.disconnect();
            view.clearTimeout(timer);
        };
    }, [isPreview, hasSelection, attributes.shortcode]);

    let updateShortcode = (updateShortcode) => {
        setAttributes({ shortcode: escapeAttribute(updateShortcode.target.value) });
    };

    if (isPreview) {
        return el('div', blockProps, <TestimonialPreviewImage />);
    };

    if (shortCodeList.length === 0) {
        return (
            el('div', blockProps,
                el(
                    "div",
                    { className: "components-placeholder components-placeholder is-large sprtf_block_shortcode" },
                    el(
                        "div",
                        { className: "components-placeholder__label" },
                        el("img", {
                            className: 'block-editor-block-icon',
                            src: escapeAttribute(sp_testimonial_free.url + 'Admin/GutenbergBlock/assets/real-testimonials-logo.svg'),
                        }),
                        el("h4", {}, escapeHTML(__("Real Testimonials", "testimonial-free")))
                    ),
                    el(
                        "div",
                        { className: "sprtf_block_shortcode_text" },
                        escapeHTML(__("No view shortcode found. ", "testimonial-free")),
                        el(
                            "a",
                            { href: escapeAttribute(sp_testimonial_free.link) },
                            escapeHTML(__("Create a view now!", "testimonial-free"))
                        )
                    )
                )
            )
        );
    }

    if (!hasSelection) {
        return (
            el('div', blockProps,
                <InspectorControls>
                    <PanelBody title="Select a view (shortcode)">
                        <PanelRow>
                            <DynamicShortcodeInput
                                attributes={attributes}
                                shortCodeList={shortCodeList}
                                shortcodeUpdate={updateShortcode}
                            />
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>,
                el('div', { className: 'components-placeholder components-placeholder is-large sprtf_block_shortcode' },
                    el('div', { className: 'components-placeholder__label' },
                        el('img', { className: 'block-editor-block-icon', src: escapeAttribute(sp_testimonial_free.url + 'Admin/GutenbergBlock/assets/real-testimonials-logo.svg') }),
                        escapeHTML(__("Real Testimonial", "testimonial-free"))
                    ),
                    el('div', { className: 'components-placeholder__instructions' }, escapeHTML(__("Select a view (shortcode)", "testimonial-free"))),
                    <DynamicShortcodeInput
                        attributes={attributes}
                        shortCodeList={shortCodeList}
                        shortcodeUpdate={updateShortcode}
                    />
                )
            )
        );
    }

    return (
        el('div', blockProps,
            <InspectorControls>
                <PanelBody title="Real Testimonials Block Settings">
                    <PanelRow>
                        <DynamicShortcodeInput
                            attributes={attributes}
                            shortCodeList={shortCodeList}
                            shortcodeUpdate={updateShortcode}
                        />
                    </PanelRow>
                </PanelBody>
            </InspectorControls>,
            el('div', { ref: previewRef, className: 'sprtf-block-preview' },
                <ServerSideRender
                    block="sp-testimonial-pro/shortcode"
                    attributes={attributes}
                />
            )
        )
    );
}

export default testimonialEdit;