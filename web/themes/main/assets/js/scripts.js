import {cube} from './Library'


(function (Drupal, $) {
  console.log(cube(10));
  console.log('hello jeff');
  //inherit drupal behaviors
  Drupal.behaviors.main = {
    attach: function (context, settings) {
    }//end of inherited context and settings from drupal
  }//end of drupal behaviors

}(Drupal, jQuery)); //end of drupal and jQuery closure

