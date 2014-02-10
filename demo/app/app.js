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
                })

            //a built in label strategy that works with bootstrap
            aaFormExtensionsProvider.setDefaultLabelStrategy('bootstrap3InlineForm')
    }])
    .directive('syntaxTogglerFor', function() {
        return {
            scope: true,
            link: function(scope, element, attrs){

                scope.type = attrs.syntaxTogglerFor;

                var toHighlight = element.children().children().children()[0];
                SyntaxHighlighter.highlight(toHighlight);

            },
            transclude: true,
            template:
                '<div>' +
                    '<a href="" ng-click="isShown = !isShown">' +
                    '<i class="fa fa-code"></i> ' +
                    '{{ isShown ? "Hide" : "Show" }} initial {{ type }}' +
                    '</a>' +
                    '<div ng-show="isShown" ng-transclude=""></div>' +
                '</div>'
        }
    })
    .run(['$rootScope', '$state', function ($rootScope, $state) {
        $rootScope.$state = $state;
    }]);