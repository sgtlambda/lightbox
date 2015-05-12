<?php

/*
  Plugin Name: JannieLightbox
  Description: WordPress plugin wrapper for the JannieLightbox library
  Version: 0.2
  Author: JM Versteeg
 */

$enqueue_lightbox_assets = function () {
    wp_enqueue_script('jannielightbox', plugins_url('dist/bundle-main.js', __FILE__), ['jquery'], '0.0.0');
    wp_enqueue_style('jannielightbox', plugins_url('dist/bundle-main.css', __FILE__));
};

add_action('wp_enqueue_scripts', $enqueue_lightbox_assets);
add_action('admin_enqueue_scripts', $enqueue_lightbox_assets);

add_shortcode('lightbox_content', function ($atts = [], $content = "") {
    $args      = array_merge([
        'path'          => 'content',
        'add_close_btn' => 'true'
    ], $atts);
    $innerHTML = '';
    if (filter_var($args['add_close_btn'], FILTER_VALIDATE_BOOLEAN)) {
        $innerHTML .= '<a href="#" class="action-lightbox-close lightbox-content-close">X</a>';
    }
    $innerHTML .= do_shortcode($content);
    return "<div data-lightbox-path='{$args['path']}'>" . $innerHTML . "</div>";
});