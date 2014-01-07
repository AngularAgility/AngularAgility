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


            //register an example label generation strategy
            //that's for bootstrap but required fields are red
            aaFormExtensionsProvider.registerLabelStrategy("bootstrapRedRequired",

            function (ele, labelText, isRequired) {

                var label = angular.element('<label>')
                    .attr('for', ele.id)
                    .addClass('col-sm-2 control-label')
                    .html(labelText)

                if(isRequired) {
                    label.css('color', 'red')
                }

                ele.parent().parent().prepend(label);
            })

            //a built in label strategy that works with bootstrap
            aaFormExtensionsProvider.setDefaultLabelStrategy('bootstrap3InlineForm')
    }])
    .run(['$rootScope', '$state', function ($rootScope, $state) {
        $rootScope.$state = $state;
    }]);
