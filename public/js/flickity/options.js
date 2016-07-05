'use strict';

var flick = document.querySelector('.main-carousel');
var setup = new Flickity( flick, {
    cellSelector: '.carousel-cell',
    cellPosition: 'center',
    prevNextButtons: false,
    setGallerySize: false,
    // wrapAround: true,
    pageDots: false,
    contain: true
});
