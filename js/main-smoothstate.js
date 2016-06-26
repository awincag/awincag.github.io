$(function(){
  'use strict';
  var $page = $('#main'),
      $site = $('html, body'),
      options = {
        debug: true,
        prefetch: true,
        blacklist: '.no-smoothState',
        onStart: {
          duration: 250, // Duration of our animation
          render: function ($container) {
            // Add your CSS animation reversing class
            $container.addClass('page-close');
            // Restart your animation
            smoothState.restartCSSAnimations();
          }
        },
        onReady: {
          duration: 0,
          render: function ($container, $newContent) {
            // Remove your CSS animation reversing class
            $container.removeClass('page-close');
            // Inject the new content
            $container.html($newContent);
          }
        },
        onAfter: {
          duration: 0,
          render: function ($container, $newContent) {
            #container.html($site);
          }
        }
      },
      smoothState = $page.smoothState(options).data('smoothState');
});
