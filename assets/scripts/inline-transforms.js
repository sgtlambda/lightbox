'use strict';

module.exports = {
    'lightbox-content-width':  function (lightbox, value) {
        if (lightbox.isDesktop) {
            lightbox.$inner
                .width(value)
                .find('> div').innerWidth(value);
        }
    },
    'lightbox-custom-classes': function (lightbox, value) {
        lightbox.$inner.addClass(value);
    }
};