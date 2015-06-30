'use strict';

var $ = require('jquery');
var transit = require('jquery.transit');
var Mousetrap = require('mousetrap');

var lightbox = {

    fd:            300,
    isDesktop:     $(window).width() > 767,
    isVisible:     false,
    base_url:      '',
    lastScrollpos: 0,
    localContent:  {},

    /***
     * Performs the transformations as specified in the html content
     * @param {string} html
     */
    do_inline_transforms: function (html) {
        var match;
        var patt = /<!--\s*([a-z\-]+):\s*(.*?)\s*-->/mg;
        while ((match = patt.exec(html)) != null) {
            var key = match[1];
            var value = match[2];
            if (key === 'lightbox-content-width' && this.isDesktop) {
                this.$inner.width(value);
                this.$inner.find('> div').innerWidth(value);
            }
            if (key === 'lightbox-custom-classes') {
                this.$inner.addClass(value);
            }
        }
    },

    /**
     * Desktop-specific function to be executed when new content is to be shown
     */
    show_content_desktop: function () {
        var $window = $(window);
        this.$inner.stop().css({
            'margin-top':  -this.$inner.outerHeight() / 2,
            'margin-left': -this.$inner.outerWidth() / 2,
            'top':         $window.scrollTop() + $window.height() / 2,
            display:       'block',
            opacity:       0,
            transform:     'scale(0.6) translate(0, 40px)'
        }).transition({
            opacity: 1,
            scale:   1,
            y:       0
        }, this.fd);
    },

    /**
     * Mobile-specific function to be executed when new content is to be shown
     */
    show_content_mobile: function () {
        this.lastScrollpos = $(window).scrollTop();
        this.$page.hide();
        this.$inner.show();
    },

    /**
     * Show given HTML content in the lightbox
     * @param {string} html
     */
    show_content: function (html) {
        this.$content.html(html);
        this.do_inline_transforms(html);
        if (this.isDesktop)
            this.show_content_desktop();
        else
            this.show_content_mobile();

        this.fixScroll();
        this.isVisible = true;
        $('body').addClass("lightbox-showing");
        var lb = this;

        Mousetrap.bind(['esc'], function (e) {
            if (e.preventDefault)
                e.preventDefault();
            lb.close();
            Mousetrap.unbind(['esc']);
        });
    },

    /**
     * Fix page scroll position. Experimental.
     */
    fixScroll: function () {
        if (this.isVisible && this.isDesktop) {
            var st = $(window).scrollTop();
            var lt = this.$content.offset().top;
            var lb = lt + this.$content.height();
            var minSt = Math.max(0, Math.min(lt - 50, lb + 50 - $(window).height()));
            var maxSt = Math.max(minSt + 10, lb + 50 - $(window).height(), lt - 50);
            if (st < minSt)
                $(window).scrollTop(minSt);
            else if (st > maxSt)
                $(window).scrollTop(maxSt);
        }
    },

    /**
     * Load the lightbox content based on the href or lightbox content identifier
     * @param {string} target
     * @param {Object} [ajaxOptions] Optional object containing additional objects to be passed to $.ajax
     */
    load_content: function (target, ajaxOptions) {
        this.$over.stop().fadeIn(this.fd);
        var matches = /@(.*)/.exec(target);
        if (matches !== null && this.localContent.hasOwnProperty(matches[1]))
            this.show_content(this.localContent[matches[1]]);
        else
            $.ajax($.extend(true, {}, {
                url:      this.base_url + target,
                headers:  {
                    'is-lightbox-content': 'true'
                },
                dataType: 'html',
                success:  this.show_content.bind(this)
            }, ajaxOptions));
    },

    /**
     * Close the lightbox
     */
    close: function () {
        this.$inner.fadeOut();
        this.$over.fadeOut(this.fd);
        $('body').removeClass("this-showing");
        this.isVisible = false;
        if (!this.isDesktop) {
            this.$page.show();
            $(window).scrollTop(this.lastScrollpos);
        }
    },

    /**
     * Hide the lightbox, without removing the "overlay". Use this in case the page is about to navigate away
     */
    closePending: function () {
        this.$inner.fadeOut();
    }
};

$(function () {

    var $body = $('body');

    var lightboxContentTpl = '<div id="lightbox-over"></div><div id="lightbox-inner"><div id="lightbox-content"></div></div><div id="lightbox-loader">Loading...</div>';

    $body.append(lightboxContentTpl);

    $.extend(lightbox, {
        $over:    $('#lightbox-over'),
        $inner:   $('#lightbox-inner'),
        $loader:  $('#lightbox-loader'),
        $content: $('#lightbox-content'),
        $page:    $body.children()
    });

    $('[data-lightbox-path]').each(function () {
        var $this = $(this);
        lightbox.localContent[$this.data('lightbox-path')] = $this.html();
        $this.remove();
    });

    //$(window).scroll(function() {
    //    fixScroll();
    //});
    // TODO fix scroll thing

    $(window).resize(function () {
        lightbox.isDesktop = $(window).width() > 767;
    });

    $(document).on({
        click: function (e) {
            var $link = $(this);
            var target = $link.attr('href');
            lightbox.load_content(target);

            e.preventDefault();
        }
    }, 'a[target="lightbox"]');

    $(document).on({
        submit: function (e) {
            var $form = $(this);
            var action = $form.attr('action');
            lightbox.load_content(action, {
                url:    action,
                method: $form.attr('method'),
                data:   $form.serialize()
            });

            e.preventDefault();
        }
    }, 'form[target="lightbox"]');

    $(document).on({
        click: function (e) {
            lightbox.close();
            if ($(e.target).attr('href') == '#')
                e.preventDefault();
        }
    }, '.action-lightbox-close');

    $(document).on({
        click: function () {
            lightbox.closePending();
            if ($(e.target).attr('href') == '#')
                e.preventDefault();
        }
    }, '.action-lightbox-close-pending');

});

module.exports = lightbox;