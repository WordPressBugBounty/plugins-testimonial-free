import { escapeHTML } from "@wordpress/escape-html";
import testimonialEdit from "./testimonials/testimonial";
import testimonialEditForm from "./testimonialForms/form";
import { CategoryIcon, TestimonialFormIcon, TestimonialIcon } from "../assets/testimonialIcons";
import { registerBlockType, updateCategory } from "@wordpress/blocks";

const { __ } = wp.i18n;
/**
 * Register: Gutenberg Blocks.
 */
updateCategory('testimonial-free', { icon: < CategoryIcon /> });

const dynamicBlockGenerator = (name, title, description, icon, edit) => {
  registerBlockType(name, {
    // Block API v3 marks the block as compatible with the iframed editor canvas,
    // which WordPress 7.1 uses for every editor.
    apiVersion: 3,
    title: escapeHTML(title),
    description: escapeHTML(description),
    icon: icon,
    category: escapeHTML("testimonial-free"),
    supports: {
      html: true,
    },
    edit: edit,
    save() {
      // Rendering in PHP
      return null;
    },
  });
};

dynamicBlockGenerator("sp-testimonial-pro/shortcode", __('Real Testimonials', 'testimonial-free'), __('Use Real Testimonials to insert a view shortcode (testimonials) in your page', 'testimonial-free'), TestimonialIcon, testimonialEdit);

dynamicBlockGenerator("sp-testimonial-pro/form", __('Testimonial Form', 'testimonial-free'), __('Use Testimonials Form to insert a view shortcode (testimonial Form) in your page', 'testimonial-free'), TestimonialFormIcon, testimonialEditForm);