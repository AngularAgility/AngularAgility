angular
    .module('angularAgilityDemo', ['ui.router', 'aa.formExtensions', 'aa.select2'])
    .config(['$urlRouterProvider', '$stateProvider', 'aaFormExtensionsProvider',
        function($urlRouterProvider, $stateProvider, aaFormExtensionsProvider) {

            $urlRouterProvider.otherwise("/home"); //default on unmatched
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'app/home/home.html'
                })
                .state('formExtensions', {
                    url: '/formExtensions',
                    templateUrl: 'app/formExtensions/formExtensions.html',
                    controller: 'formExtensions'
                })
                .state('select2', {
                    url: '/select2',
                    templateUrl: 'app/select2/select2.html'
                });

            //a built in label strategy that works with bootstrap
            aaFormExtensionsProvider.setDefaultLabelStrategy('bootstrap3InlineForm');
    }])
    .directive('syntaxHighligherFor', function() {
        return {
            link: function(scope, element, attrs){

                var toHighlight = element.children()[0];
                angular.element(toHighlight)
                    .addClass("brush: " + attrs.syntaxHighligherFor);

                SyntaxHighlighter.highlight(toHighlight);
            }
        };
    })
    .run(['$rootScope', '$state', function ($rootScope, $state) {
        $rootScope.$state = $state;
    }]);