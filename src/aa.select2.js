/*
 * AngularAgility Select2
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2014 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */
//requires jQuery and Select2 http://ivaynberg.github.io/select2/

angular
    .module('aa.select2', [])
    .directive('aaSelect2', function () {

        return {
            require: 'ngModel',
            template: '<input type="hidden" style="width: 220px;" />', //todo un-hardcode width
            link: function (scope, element, attrs, ngModel) {

                var userOpts = scope.$eval(attrs.aaSelect2) || {},
                    inAjaxMode = angular.isFunction(userOpts.$settings.options),
                    inArrayMode = angular.isArray(userOpts.$settings.options),
                    lastAjaxResult = null;

                //allow for flexibility of mapping ajax object back to the bound ng-model
                userOpts.$settings.ajaxMap = userOpts.ajaxMap || function(ajaxResultObject) { return ajaxResultObject;};

                //configure select2's options per passed $settings
                if(userOpts.$settings && (userOpts.$settings.mode === 'id' || userOpts.$settings.mode === 'object')) {

                    //have 'options' client side in an array
                    if(inArrayMode) {
                        userOpts.data = userOpts.data || {};
                        userOpts.data.text = userOpts.$settings.text;
                        userOpts.data.results = userOpts.$settings.options;
                    }

                    //AJAX MODE
                    //run a query to get options (search)
                    if(inAjaxMode) {
                        userOpts.query = function(query) {
                            userOpts.$settings.options(query.term)
                                .success(function (data) {
                                    lastAjaxResult = data;
                                    query.callback({
                                        results: data,
                                        text: userOpts.$settings.text
                                    });
                                });
                        };

                        var modelValue = scope.$eval(attrs.ngModel);

                        //init with an initial value given our object
                        if(userOpts.$settings.mode === 'object' && modelValue) {

                            userOpts.initSelection = function(e, callback) {
                                callback(modelValue);
                            };
                        }
                    }

                    userOpts.id = userOpts.$settings.id;
                    //song and dance for select2 to display the right text
                    userOpts.formatSelection = function(obj) { return obj[userOpts.$settings.text];};
                    userOpts.formatResult = function(obj) { return obj[userOpts.$settings.text];};
                }

                var staticOpts = {
                    width: 'resolve'
                }

                var opts = angular.extend(userOpts, staticOpts);

                //setup select2 with options
                element.select2(opts);


                //programmatic changes to the model
                ngModel.$render = function () {
                    if(userOpts.$settings.mode === 'id') {
                        element.select2('val', ngModel.$modelValue);

                    } else if(userOpts.$settings.mode === 'object') {
                        if(ngModel.$modelValue) {
                            element.select2('val', ngModel.$modelValue[userOpts.$settings.id] || "");
                        } else {
                            element.select2('val', "");
                        }
                    }
                };

                //when select2 changes
                element.bind("change", function () {
                    scope.$apply(function () {
                        var val = element.select2('val');

                        if (val === "") {
                            ngModel.$setViewValue(null);
                            return;
                        }

                        if(userOpts.$settings.mode === 'id' && inArrayMode) {
                            ngModel.$setViewValue(val);
                            return;
                        }

                        if(userOpts.$settings.mode === 'object' && inArrayMode) {

                            //lookup the object value in the underlying array by the passed 'id'
                            var found;
                            var data = userOpts.data.results;
                            for(var i=0; i < data.length; i++) {
                                if(data[i][userOpts.$settings.id] === val) {
                                    found = data[i];
                                    break;
                                }
                            }
                            ngModel.$setViewValue(found);
                            return;
                        }

                        if(userOpts.$settings.mode === 'object' && inAjaxMode) {

                            //lookup the object value in the last ajax results by the passed 'id'
                            var found;
                            var data = lastAjaxResult;
                            for(var i=0; i < data.length; i++) {
                                if(data[i][userOpts.$settings.id] === val) {
                                    found = data[i];
                                    break;
                                }
                            }
                            ngModel.$setViewValue(userOpts.$settings.ajaxMap(found));
                            return;
                        }

                    });
                });


            }
        };
    });