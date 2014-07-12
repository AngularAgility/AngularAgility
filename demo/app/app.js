/*globals angular, SyntaxHighlighter */
angular
  .module('angularAgilityDemo', ['ui.router', 'aa.formExtensions', 'aa.select2', 'aa.notify'])
  .config(['$urlRouterProvider', '$stateProvider', 'aaFormExtensionsProvider',
    function ($urlRouterProvider, $stateProvider, aaFormExtensionsProvider) {
      'use strict';
      $urlRouterProvider.otherwise("/home"); //default on unmatched
      $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: 'app/home/home.html'
        })

        .state('formExtensions', {
          abstract: true,
          url: '/formExtensions',
          templateUrl: 'app/formExtensions/index.html'
        })
        .state('formExtensions.basic', {
          url: '/formExtensions/basic',
          templateUrl: 'app/formExtensions/basic.html',
          controller: 'basicFormExtensions'
        })
        .state('formExtensions.advanced', {
          url: '/formExtensions/advanced',
          templateUrl: 'app/formExtensions/advanced.html',
          controller: 'advancedFormExtensions'
        })

        .state('select2', {
          url: '/select2',
          templateUrl: 'app/select2/select2.html'
        })
        .state('notify', {
          url: '/notify',
          templateUrl: 'app/notify/notify.html',
          controller: 'notify'
        });
    }])
  .directive('syntaxHighligherFor', function () {
    'use strict';
    return {
      link: function (scope, element, attrs) {

        var toHighlight = element.children()[0];
        angular.element(toHighlight)
          .addClass("brush: " + attrs.syntaxHighligherFor);

        SyntaxHighlighter.highlight(toHighlight);
      }
    };
  })
  .run(['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';
    $rootScope.$state = $state;
  }]);