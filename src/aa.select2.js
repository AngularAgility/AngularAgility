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
    .directive('aaSelect2', function () {

        return {
            require: 'ngModel',
            template: '<input type="hidden" />',
            link: function (scope, element, attrs, ngModel) {

                    //native select2 options directly from the user. always takes prescedence
                var userOpts = scope.$eval(attrs.aaSelect2) || {},

                    //possible select2 options derived from user selections on $settings
                    derivedOpts = {},

                    //directive settings (aka nice wrapper for select2)
                    settings = userOpts.$settings,
                    inAjaxMode = settings ? angular.isFunction(settings.options) : false,
                    inArrayMode = settings ? angular.isArray(settings.options) : false,
                    lastAjaxResult = null;

                delete userOpts.$settings; // no longer needed

                var modelValue = scope.$eval(attrs.ngModel);

                //configure select2's options per passed $settings
                if(settings && (settings.mode === 'id' || settings.mode === 'object')) {

                    //allow for flexibility of mapping ajax object back to the bound ng-model
                    settings.ajaxMap = derivedOpts.ajaxMap || function(ajaxResultObject) { return ajaxResultObject;};

                    //have 'options' client side in an array
                    if(inArrayMode) {
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
                                    lastAjaxResult = data;
                                    query.callback({
                                        results: data,
                                        text: settings.text
                                    });
                                });
                        };


                        //init with an initial value given our object
                        if(settings.mode === 'object' && modelValue) {

                            derivedOpts.initSelection = function(e, callback) {
                                callback(modelValue);
                            };

                        } else if (settings.mode === 'id' && modelValue) {

                            derivedOpts.initSelection = function(e, callback) {
                                settings.textLookup(modelValue)
                                    .success(function(data) {
                                        callback(data);
                                    })
                            };
                        }
                    }

                    derivedOpts.id = settings.id;
                    //song and dance for select2 to display the right text
                    derivedOpts.formatSelection = function(obj) { return obj[settings.text];};
                    derivedOpts.formatResult = function(obj) { return obj[settings.text];};

                } else if(settings && settings.mode === 'tags') {
                    derivedOpts.tags = modelValue || [];
                }

                var staticOpts = {
                    width: 'resolve'
                }

                //order of prescedence
                //static opts loses first
                //then derivedOpts (the facade for select2 API, aka what makes this plugin easy)
                //finally any explicit user opts will always win
                var opts = angular.extend(staticOpts, derivedOpts, userOpts);

                //setup select2 with options
                element.select2(opts);


                //programmatic changes to the model
                var firstRun = true;
                ngModel.$render = function () {
                    if(inAjaxMode && firstRun) {
                        //the initial value is set with "initSelection"
                        //this causes multiple textLookup queries in ajax id mode
                        firstRun = false;
                        return;
                    }

                    if(settings && settings.mode === 'id') {
                        element.select2('val', ngModel.$modelValue);

                    } else if(settings && settings.mode === 'object') {
                        if(ngModel.$modelValue) {
                            element.select2('val', ngModel.$modelValue[settings.id] || "");
                        } else {
                            element.select2('val', "");
                        }

                    } else if(settings.mode === 'tags') {
                        element.select2('val', ngModel.$modelValue);
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

                        if(settings) {
                            if(settings.mode === 'id') {
                                ngModel.$setViewValue(val);

                            } else if(settings.mode === 'object' && inArrayMode) {

                                //lookup the object value in the underlying array by the passed 'id'
                                var found;
                                var data = derivedOpts.data.results;
                                for(var i=0; i < data.length; i++) {
                                    if(data[i][settings.id] === val) {
                                        found = data[i];
                                        break;
                                    }
                                }
                                ngModel.$setViewValue(found);

                            } else if(settings.mode === 'object' && inAjaxMode) {

                                //lookup the object value in the last ajax results by the passed 'id'
                                var found;
                                var data = lastAjaxResult;
                                for(var i=0; i < data.length; i++) {
                                    if(data[i][settings.id] === val) {
                                        found = data[i];
                                        break;
                                    }
                                }
                                ngModel.$setViewValue(settings.ajaxMap(found));

                            } else if (settings.mode === 'tags') {
                                ngModel.$setViewValue(val);
                            }
                        }
                    });
                });
            }
        };
    });