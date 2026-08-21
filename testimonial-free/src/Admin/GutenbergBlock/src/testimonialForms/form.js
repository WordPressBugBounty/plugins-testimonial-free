import { escapeAttribute, escapeHTML } from "@wordpress/escape-html";
import { __ } from "@wordpress/i18n";
import { PanelBody, PanelRow } from "@wordpress/components";
import { createElement } from "@wordpress/element";
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from "@wordpress/server-side-render";
import DynamicShortcodeInput from "../shortcode/dynamicShortcode";
import { TestimonialFormPreviewImage } from "../../assets/testimonialIcons";
const el = createElement;

/**
 * `useBlockProps` came with Block API v2 in WordPress 5.6. The plugin still
 * supports 5.0, where the editor wraps the block itself, so fall back to empty
 * props there.
 */
const useBlockPropsCompat = 'function' === typeof useBlockProps ? useBlockProps : () => ({});

const testimonialEditForm = ({ attributes, setAttributes }) => {
    var shortCodeList = sp_testimonial_form_free.shortCodeList;
    const blockProps = useBlockPropsCompat();

    let updateShortcode = (updateShortcode) => {
        setAttributes({ shortcode: escapeAttribute(updateShortcode.target.value) });
    };

    if (attributes.preview) {
        return el('div', blockProps, <TestimonialFormPreviewImage />);
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
                            src: escapeAttribute(sp_testimonial_free.url + 'Admin/GutenbergBlock/assets/testimonial-form.svg'),
                        }),
                        el("h4", {}, escapeHTML(__("Testimonial Form", "testimonial-free")))
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

    if (!attributes.shortcode || attributes.shortcode == 0) {
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
                        el('img', { className: 'block-editor-block-icon', src: escapeAttribute(sp_testimonial_free.url + 'Admin/GutenbergBlock/assets/testimonial-form.svg') }),
                        escapeHTML(__("Testimonial Form", "testimonial-free"))
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
                <PanelBody title="Testimonials Form Block Settings">
                    <PanelRow>
                        <DynamicShortcodeInput
                            attributes={attributes}
                            shortCodeList={shortCodeList}
                            shortcodeUpdate={updateShortcode}
                        />
                    </PanelRow>
                </PanelBody>
            </InspectorControls>,
            <ServerSideRender
                block="sp-testimonial-pro/form"
                attributes={attributes}
            />
        )
    );
};

export default testimonialEditForm;