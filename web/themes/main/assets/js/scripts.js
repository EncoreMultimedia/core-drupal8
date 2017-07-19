import {
  eClick,
  eMultiClick,
  eMobileMenu,
  eMenu,
  animate,
  debounce,
  screenCategory,
  toTop}
  from './Library';

(function (Drupal, $) {
  //Global Project Variables and elements
  const MAIN_MENU = document.querySelector('#block-main-main-menu .menu'); //main menu
  const Burger_Button = document.getElementById('burger-icon'); // burger icon
  //This object is used store settings for mobile menu
  const MOBILE_MENU_SETTINGS = {
    element: Burger_Button,
    menu: MAIN_MENU,
    direction: 'right', //options are left and right
  };
  //The variance in when the function on the scroll listener will fire
  const SCROLL_DEBOUNCE = 5;
  //The variance in when the function on the resize listener will fire
  const RESIZE_DEBOUNCE = 5;

  //Use this to interact with drupal behaviors module
  Drupal.behaviors.main = {
    attach: function (context, settings) {
    }//end of inherited context and settings from drupal
  }//end of drupal behaviors
  /* global Javascript */


  //Create mobile menu
  eMobileMenu(MOBILE_MENU_SETTINGS);

  //create main navigation menu
  eMenu(MAIN_MENU);

  //on scroll event listener comment out if you don't need it.
  window.addEventListener('scroll', debounce(() => {
    //example of calling animation function
    //animate(element,null, 100);
    }
  , SCROLL_DEBOUNCE));


  window.addEventListener('resize', debounce(() => {
    "use strict";
    //check if window is at 1000 pixels or larger
    if(screenCategory() === 'desktop') {
      //check if mobile menu is still open
      if(MAIN_MENU.classList.contains('open')) {
        //check the direction of the animation
        let close = MOBILE_MENU_SETTINGS.direction === 'left' ? 'navFadeOutLeft' : 'navFadeOutRight';
        //create click event to close mobile menu
        MOBILE_MENU_SETTINGS.element.click();
        //remove the closing animation
        MOBILE_MENU_SETTINGS.menu.classList.remove(close);
      }
    }
  },RESIZE_DEBOUNCE))

}(Drupal, jQuery)); //end of drupal and jQuery closure

