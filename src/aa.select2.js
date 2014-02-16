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
                //copy the object before we muck with it incase multiple select2s are sharing settings
                var userOpts = scope.$eval(attrs.aaSelect2);

                if(!angular.isObject(userOpts) || isEmptyObject(userOpts)) {
                    throw 'aa-select2 options must be specified. Ex: <div aa-select2="*options here*"...\r\n';
                }

                //possible select2 options derived from user selections on $settings
                var derivedOpts = {},

                //directive settings (aka nice wrapper for select2)
                    settings = userOpts.$settings,
                    inAjaxMode = settings ? angular.isFunction(settings.options) : false,
                    inLocalArrayMode = settings ? angular.isArray(settings.options) : false,
                    inIdMode = settings && settings.mode ? settings.mode.indexOf('id') !== -1 : false,
                    inObjectMode = settings && settings.mode ? settings.mode.indexOf('object') !== -1 : false,
                    inTagsMode = settings && settings.mode ? settings.mode.indexOf('tags') !== -1 : false,
                    inThisMode = settings && settings.id === "@this" && settings.text === "@this";

                //need a placeholder for allow clear to work
                //fix bug?/weird api odditiy
                if(userOpts.allowClear && !userOpts.placeholder) {
                    userOpts.placeholder = "Select...";
                }

                var modelValue = scope.$eval(attrs.ngModel);

                //configure select2's options per passed $settings
                if(settings) {

                    settings.id = settings.id || 'id';
                    settings.text = settings.text || 'text';

                    if(inThisMode) {
                        settings.id = 'id';
                        settings.text = 'text';
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
                        var select2Data = element.select2('data');

                        var ngValue = null;

                        if (!select2Data) {
                            ngValue = null;
                        } else if(inObjectMode) {
                            ngValue = select2Data;
                        } else if(inIdMode) {

                            if(angular.isArray(select2Data)) {

                                ngValue = [];
                                angular.forEach(select2Data, function(obj) {
                                    ngValue.push(obj[settings.id]);
                                });

                            } else {
                                ngValue = select2Data[settings.id];
                            }
                        }
                        ngModel.$setViewValue(ngValue);
                    });
                });



                //other stuff
                element.bind("$destroy", function() {
                    element.select2("destroy");
                });

                //util
                //assumes object is defined
                function isEmptyObject(obj) {
                    if(!Object.keys) //<=IE 8
                        return JSON.stringify(obj) === "{}";

                    return Object.keys(obj).length === 0;
                }
            }
        };
    });