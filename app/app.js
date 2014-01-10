angular
    .module('angularAgilityDemo', ['ui.router', 'aa.formExtensions'])
    .config(['$urlRouterProvider', '$stateProvider', 'aaFormExtensionsProvider',
        function($urlRouterProvider, $stateProvider, aaFormExtensionsProvider) {

            $urlRouterProvider.otherwise("/home"); //default on unmatched
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'app/home/home.tpl.html'
                })
                .state('formExtensions', {
                    url: '/formExtensions',
                    templateUrl: 'app/formExtensions/formExtensions.tpl.html',
                    controller: 'formExtensions'
                })

            //a built in label strategy that works with bootstrap
            aaFormExtensionsProvider.setDefaultLabelStrategy('bootstrap3InlineForm')
    }])

//    .directive('htmlViewer', fun)

    .run(['$rootScope', '$state', function ($rootScope, $state) {
        $rootScope.$state = $state;
    }]);
