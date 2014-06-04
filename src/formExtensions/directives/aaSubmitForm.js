(function() {
    'use strict';

    angular.module('aa.formExtensions')
        .directive('aaSubmitForm', ['aaFormExtensions', '$q', function(aaFormExtensions, $q) {
            return {
                scope: {
                    aaSubmitForm: '&'
                },
                restrict: 'A',
                require: '^form',
                link: function(scope, element, attrs, ngForm) {

                    element.on('click', submit);

                    if(attrs.type === 'submit') {
                        //this should be the form's default 'on enter' behavior for submission
                        ngForm.$aaFormExtensions.$onEnterKey = submit;
                    }

                    function submit() {
                        ngForm.$aaFormExtensions.$onSubmitAttempt();

                        if(ngForm.$valid) {

                            var spinnerClickStrategy = aaFormExtensions.spinnerClickStrategies[attrs.spinnerClickStrategy || aaFormExtensions.defaultSpinnerClickStrategy];
                            var eleSpinnerClickStrategy = spinnerClickStrategy(element);
                            eleSpinnerClickStrategy.before();

                            //if this isn't a promise it will resolve immediately
                            $q.when(scope.aaSubmitForm())
                                ["finally"](function(result) {
                                    eleSpinnerClickStrategy.after();
                                    return result;
                                });
                        }

                        scope.$apply();
                    }
                }
            };
        }]);
})();
