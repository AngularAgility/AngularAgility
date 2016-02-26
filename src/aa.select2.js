/**
 * @ngdoc directive
 * @name aaSelect2
 *
 * @description
 * Description place holder.
 **/

angular
    .module('aa.select2', [])
    .directive('aaSelect2', ['$q', function ($q) {
      'use strict';
      return {
        require: 'ngModel',
        template: '<input type="text" />',
        replace: true,
        link: function (scope, element, attrs, ngModel) {

          //util
          //assumes object is defined
          function isEmptyObject(obj) {
            if (!Object.keys) {  //<=IE 8
              return JSON.stringify(obj) === "{}";
            }

            return Object.keys(obj).length === 0;
          }

          //native select2 options directly from the user. always takes precedence
          //copy the object before we muck with it in case multiple select2s are sharing settings
          var settings = angular.copy(scope.$eval(attrs.aaSelect2));

          if (!angular.isObject(settings) || isEmptyObject(settings)) {
            throw 'aa-select2 options must be specified. Ex: <div aa-select2="*options here*"...\r\n';
          }

          //possible select2 options derived from user selections on settings
          var derivedOpts = {},

          //directive settings (aka nice wrapper for select2)
              inAjaxMode = settings ? angular.isFunction(settings.options) : false,
              inLocalArrayMode = settings ? angular.isArray(settings.options) : false,
              inIdMode = settings && settings.mode ? settings.mode.indexOf('id') !== -1 : false,
              inObjectMode = settings && settings.mode ? settings.mode.indexOf('object') !== -1 : false,
              inTagsMode = settings && settings.mode ? settings.mode.indexOf('tags') !== -1 : false,
              inThisMode = settings && settings.id === "@this" && settings.text === "@this";

          //need a placeholder for allow clear to work
          //fix bug?/weird api odditiy
          if (settings.select2 && settings.select2.allowClear) {
            derivedOpts.placeholder = "Select...";
          }

          if (attrs.placeholder) {
            derivedOpts.placeholder = attrs.placeholder;
          }

          //configure select2's options per passed settings
          if (settings) {


            if (inThisMode) {
              settings.id = 'id';
              settings.text = 'text';
            } else {
              settings.id = settings.id || 'id';
              settings.text = settings.text || 'text';
            }

            //have 'options' client side in an array
            if (inLocalArrayMode) {
              derivedOpts.data = derivedOpts.data || {};
              derivedOpts.data.text = settings.text;

              if (inThisMode) {
                var newData = [];
                angular.forEach(settings.options, function (obj) {
                  newData.push({id: obj, text: obj});
                });
                derivedOpts.data.results = newData;
              } else {
                derivedOpts.data.results = settings.options;
              }
            }

            //AJAX MODE
            //run a query to get options (search)
            if (inAjaxMode) {
              derivedOpts.query = function (query) {
                // TODO: Ought to handle the failure case, instead of spinning forever
                var queryResult = settings.options(query.term);
                // Assume if it's not a promise and is an array, it's data
                if (!queryResult.then && !queryResult.$promise && Array.isArray(queryResult)) {
                  query.callback({
                    results: queryResult,
                    text: settings.text
                  });
                } else {
                  var queryPromise = queryResult.then ? queryResult: queryResult.$promise;
                  queryPromise.then(function (response) {
                    // $http responses put the data in .data
                    var data = queryResult.then ? response.data: response;
                    if (inThisMode) {
                      var newData = [];
                      angular.forEach(data, function (str) {
                        newData.push({id: str, text: str});
                      });
                      data = newData;
                    }
                    query.callback({
                      results: data,
                      text: settings.text
                    });
                  });
                }
              };

              if (inIdMode) {
                derivedOpts.initSelection = function (e, callback) {

                  if (!ngModel.$modelValue) {
                    return;
                  }

                  if (inThisMode && inTagsMode) {
                    var newData = [];
                    angular.forEach(ngModel.$modelValue, function (str) {
                      newData.push({id: str, text: str});
                    });
                    callback(newData);
                    return;

                  }

                  if (inThisMode) {
                    callback({id: ngModel.$modelValue, text: ngModel.$modelValue});
                    return;
                  }

                  //allow for multiple lookups in tags mode (or just one in other modes)
                  var modelValueIsArray = angular.isArray(ngModel.$modelValue),
                      lookups = [];

                  if (modelValueIsArray) {
                    angular.forEach(ngModel.$modelValue, function (val) {
                      lookups.push(settings.textLookup(val));
                    });
                  } else {
                    lookups.push(settings.textLookup(ngModel.$modelValue));
                  }

                  //resolves promises and resolved values alike
                  $q.all(lookups)
                      .then(function (results) {
                        function resultMapper(data) {
                          var result;
                          if (angular.isUndefined(data.data)) {
                            result = data;
                          } else {
                            result = data.data;
                          }

                          if (!angular.isObject(result)) {
                            //passed back just the text. resolve:
                            var newResult = {};
                            newResult[settings.id] = ngModel.$modelValue;
                            newResult[settings.text] = result;
                            result = newResult;
                          }
                          return result;
                        }

                        if (modelValueIsArray) {
                          var mappedResults = [];

                          angular.forEach(results, function (result) {
                            mappedResults.push(resultMapper(result));
                          });

                          callback(mappedResults);
                        } else {
                          callback(resultMapper(results[0]));
                        }

                      });
                };
              }
            }

            derivedOpts.id = settings.id;

            derivedOpts.formatSelection = function (obj) {
              return obj[settings.text];
            };
            derivedOpts.formatResult = function (obj) {
              return obj[settings.text];
            };

            if (inTagsMode) {
              derivedOpts.tags = ngModel.$modelValue || [];
            }

          }

          var staticOpts = {
            width: 'resolve'
          };

          //order of prescedence for passing into select2 native api:
          //static opts loses first
          //then derivedOpts (the facade for select2 API that was created above aka what makes this plugin easy)
          //finally any explicit user opts passed into settings as 'select2' will always win
          var opts = angular.extend(staticOpts, derivedOpts, settings.select2);

          //setup select2 with options
          element.select2(opts);

          //programmatic changes to the model
          ngModel.$render = function () {

            if (!ngModel.$modelValue) {
              element.select2('val', "");
              return;
            }

            if (inIdMode) {
              element.select2('val', ngModel.$modelValue);
            } else if (inObjectMode) {
              element.select2('data', ngModel.$modelValue);
            }
          };

          //when select2 changes
          element.bind("change", function () {
            // Copy the passed in arguments
            var args = Array.prototype.slice.call(arguments);
            scope.$apply(function () {
              var select2Data = element.select2('data');

              var ngValue = null;

              if (!select2Data) {
                ngValue = null;
              } else if (inObjectMode) {
                ngValue = select2Data;
              } else if (inIdMode) {

                if (angular.isArray(select2Data)) {

                  ngValue = [];
                  angular.forEach(select2Data, function (obj) {
                    ngValue.push(obj[settings.id]);
                  });

                } else {
                  ngValue = select2Data[settings.id];
                }
              }
              ngModel.$setViewValue(ngValue);
              // If user has requested notification, call function
              if (typeof settings.onChange === "function") {
                args.unshift(element);
                settings.onChange.apply(element, args);
              }
            });
          });

          //other stuff
          element.bind("$destroy", function () {
            element.select2("destroy");
          });

          // Expose the select2 element, for further customization
          if (typeof settings.onInitialized === "function") {
            settings.onInitialized.call(this, [element]);
          }
        }
      };
    }]);
