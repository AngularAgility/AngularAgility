/*
 * AngularAgility Select2
 *
 * NOTE! In addition to Angular.js this plugin
 * requires jQuery and Select2 http://ivaynberg.github.io/select2/
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2014 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

angular
    .module('aa.select2', [])
    .directive('aaSelect2', function ($q) {

        return {
            require: 'ngModel',
            template: '<input type="hidden" />',
            replace: true,
            link: function (scope, element, attrs, ngModel) {

                //native select2 options directly from the user. always takes prescedence
                var userOpts = scope.$eval(attrs.aaSelect2) || {},

                //possible select2 options derived from user selections on $settings
                    derivedOpts = {},

                //directive settings (aka nice wrapper for select2)
                    settings = userOpts.$settings,
                    inAjaxMode = settings ? angular.isFunction(settings.options) : false,
                    inLocalArrayMode = settings ? angular.isArray(settings.options) : false,
                    inIdMode = settings && settings.mode ? settings.mode.indexOf('id') != -1 : false,
                    inObjectMode = settings && settings.mode ? settings.mode.indexOf('object') != -1 : false,
                    inTagsMode = settings && settings.mode ? settings.mode.indexOf('tags') != -1 : false,
                    inThisMode = settings && settings.id === "@this" && settings.text === "@this";

                delete userOpts.$settings; // no longer needed

                var modelValue = scope.$eval(attrs.ngModel);

                //configure select2's options per passed $settings
                if(settings) {

                    if(inThisMode) {
                        settings.id = 'id';
                        settings.text = 'text';
                    }

                    if(inObjectMode) {
                        settings.id = settings.id || 'id';
                        settings.text = settings.text || 'text';
                    }

                    //allow for flexibility of mapping ajax object back to the bound ng-model
                    settings.ajaxMap = derivedOpts.ajaxMap || function(ajaxResultObject) { return ajaxResultObject;};

                    //have 'options' client side in an array
                    if(inLocalArrayMode) {
                        derivedOpts.data = derivedOpts.data || {};
                        derivedOpts.data.text = settings.text;
                        derivedOpts.data.results = settings.options;
                    }

                    //AJAX MODE
                    //run a query to get options (search)
                    if(inAjaxMode) {
                        derivedOpts.query = function(query) {
                            settings.options(query.term)
                                .success(function (data) {

                                    if(inThisMode) {
                                        var newData = [];
                                        angular.forEach(data, function(str) {
                                            newData.push({id: str, text: str});
                                        });
                                        data = newData;
                                    }

                                    query.callback({
                                        results: data,
                                        text: settings.text
                                    });
                                });
                        };


                        if(modelValue && inIdMode) {
                            derivedOpts.initSelection = function(e, callback) {

                                if(inThisMode) {
                                    callback({id: modelValue, text: modelValue});
                                    return;
                                }

                                //resolves promises and resolved values alike
                                $q.when(settings.textLookup(modelValue))
                                    .then(function(data) {

                                        var result;
                                        if(angular.isUndefined(data.data)) {
                                            result = data;
                                        } else {
                                            result = data.data;
                                        }

                                        if(!angular.isObject(result)) {
                                            //passed back just the text. resolve:
                                            var newResult = {};
                                            newResult[settings.id] = modelValue;
                                            newResult[settings.text] = result;
                                            result = newResult;
                                        }
                                        callback(result);
                                    });
                            };
                        }
                    }

                    if(settings.id) {
                        derivedOpts.id = settings.id;
                    }

                    if(settings.text) {
                        derivedOpts.formatSelection = function(obj) {
                            return obj[settings.text];
                        };
                        derivedOpts.formatResult = function(obj) {
                            return obj[settings.text];
                        };
                    }

                    if(inTagsMode) {
                        derivedOpts.tags = modelValue || [];
                    }

                }

                var staticOpts = {
                    width: 'resolve'
                };

                //order of prescedence
                //static opts loses first
                //then derivedOpts (the facade for select2 API, aka what makes this plugin easy)
                //finally any explicit user opts will always win
                var opts = angular.extend(staticOpts, derivedOpts, userOpts);

                //setup select2 with options
                element.select2(opts);

                //programmatic changes to the model
                ngModel.$render = function () {

                    if(!ngModel.$modelValue) {
                        element.select2('val', "");
                        return;
                    }

                    if(inIdMode) {

                        element.select2('val', ngModel.$modelValue);

                    } else if(inObjectMode) {

                        element.select2('data', ngModel.$modelValue);

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

                        if(inIdMode) {

                            ngModel.$setViewValue(val);

                        } else if (inObjectMode) {

                            var valObj = element.select2('data');
                            ngModel.$setViewValue(valObj);
                        }
                    });
                });



                //other stuff
                element.bind("$destroy", function() {
                    element.select2("destroy");
                });
            }
        };
    });