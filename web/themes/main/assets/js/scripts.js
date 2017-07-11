/**
 * Here we have a javascript file that made to tailor to Johnny's jQuery needs.
 * Must conform to fan boy rules!
 * This file will inherit drupal settings, behaviors, and all passed variables
 * Will use jQuery onScroll and resize event listener
 * The on load was removed for reason that are magical to the world.
 */



(function (Drupal, $) {

  //inherit drupal behaviors
  Drupal.behaviors.main = {
    attach: function (context, settings) {
    }//end of inherited context and settings from drupal
  }//end of drupal behaviors

}(Drupal, jQuery)); //end of drupal and jQuery closure

