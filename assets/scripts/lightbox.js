(function ($, window, document) {

    $(function () {

        var $body = $('body');

        var $page = $body.children();

        var localContent = {};

        $('[data-lightbox-path]').each(function () {
            localContent[$(this).data('lightbox-path')] = $(this).html();
            $(this).remove();
        });

        $body.append('<div id="lightbox-over"></div><div id="lightbox-inner"><div id="lightbox-content"></div></div><div id="lightbox-loader">Een ogenblik...</div>');

        var lightbox = {
            fd:            300,
            isDesktop:     $(window).width() > 767,
            isVisible:     false,
            $over:         $('#lightbox-over'),
            $inner:        $('#lightbox-inner'),
            $page:         $page,
            lastScrollpos: 0,
            $loader:       $('#lightbox-loader'),
            $content:      $('#lightbox-content'),
            base_url:      '',
            show_content:  function (html) {

                this.$content.html(html);

                if (window['wpTheme'] !== undefined)
                    wpTheme.applyPlaceholders();

                if (lightbox.isDesktop) {
                    var match;
                    var patt = /<!--\s*([a-z\-]+):\s*(.*?)\s*-->/mg;
                    while ((match = patt.exec(html)) != null) {
                        var key = match[1];
                        var value = match[2];
                        if (key === 'lightbox-content-width') {
                            this.$inner.width(value);
                            this.$inner.find('> div').innerWidth(value);
                        }
                        if (key === 'lightbox-custom-classes') {
                            this.$inner.addClass(value);
                        }
                    }
                    this.$inner.stop().css({
                        'margin-top':  -this.$inner.outerHeight() / 2,
                        'margin-left': -this.$inner.outerWidth() / 2,
                        'top':         $(window).scrollTop() + $(window).height() / 2,
                        display:       'block',
                        opacity:       0,
                        transform:     'scale(0.6) translate(0, 40px)'
                    }).transition({
                        opacity: 1,
                        scale:   1,
                        y:       0
                    }, lightbox.fd);
                }
                else {
                    lightbox.lastScrollpos = $(window).scrollTop();
                    lightbox.$page.hide();
                    this.$inner.show();
                }

                fixScroll();
                lightbox.isVisible = true;
                $('body').addClass("lightbox-showing");
                var lb = this;

                if (window.hasOwnProperty('Mousetrap')) {
                    Mousetrap.bind(['esc'], function (e) {
                        if (e.preventDefault)
                            e.preventDefault();
                        lb.close();
                        Mousetrap.unbind(['esc']);
                    });
                }
            },
            start_loading: function () {
                this.$inner.fadeOut();
            },
            load_content:  function (target) {
                this.$over.stop().fadeIn(lightbox.fd);
                var matches = /@(.*)/.exec(target);
                if (matches !== null) {
                    var localTarget = matches[1];
                    if (localContent.hasOwnProperty(localTarget))
                        lightbox.show_content(localContent[localTarget]);
                } else {
                    var content_url = this.base_url + target;
                    $.ajax({
                        url:      content_url,
                        dataType: 'html',
                        success:  function (data) {
                            lightbox.show_content(data);
                        }
                    });
                }
            },
            close:         function () {
                this.$inner.fadeOut();
                this.$over.fadeOut(lightbox.fd);
                $('body').removeClass("lightbox-showing");
                lightbox.isVisible = false;
                if (!lightbox.isDesktop) {
                    lightbox.$page.show();
                    $(window).scrollTop(lightbox.lastScrollpos);
                }
            },
            closePending:  function () {
                this.$inner.fadeOut();
            }
        };
        var fixScroll = function () {
            if (lightbox.isVisible && lightbox.isDesktop) {
                var st = $(window).scrollTop();
                var lt = lightbox.$content.offset().top;
                var lb = lt + lightbox.$content.height();
                var minSt = Math.max(0, Math.min(lt - 50, lb + 50 - $(window).height()));
                var maxSt = Math.max(minSt + 10, lb + 50 - $(window).height(), lt - 50);
                if (st < minSt)
                    $(window).scrollTop(minSt);
                else if (st > maxSt)
                    $(window).scrollTop(maxSt);
            }
        };

        //$(window).scroll(function() {
        //    fixScroll();
        //});

        $(window).resize(function () {
            lightbox.isDesktop = $(window).width() > 767;
        });

        $(document).on({
            click: function (e) {
                var $this = $(this);
                var target = $this.attr('href');
                if (target !== '') {
                    e.preventDefault();
                    lightbox.load_content(target);
                }
            }
        }, 'a[target="lightbox"]');

        $(document).on({
            click: function (e) {
                if ($(e.target).attr('href') == '#')
                    e.preventDefault();
                lightbox.close();
            }
        }, '.action-lightbox-close');

        $(document).on({
            click: function () {
                lightbox.closePending();
            }
        }, '.action-lightbox-close-pending');

        window.lightbox = lightbox;

    });

})(jQuery, window, document);
