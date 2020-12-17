import { SlideNav } from './modules/slide.js';

const slideNav = new SlideNav('.slide', '.slide-wrapper');
slideNav.init();
slideNav.addArrow('.prev', '.next');
slideNav.addControl('.custom-controls');