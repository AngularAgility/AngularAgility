/*globals angular */

/**
 * @object
 * @name aaFormExtensions
 *
 * @description
 * Anything in here can be customized by injecting in aaFormExtensionsProvider during config
 *
 * EXAMPLE
 * angular.module('myApp', ['aa.formExtensions'])
 *  .config(function(aaFormExtensionsProvider) {
 *     aaFormExtensionsProvider.defaultLblCol = 'xs-3'
 *  })
 **/

(function () {
  'use strict';

  angular.module('aa.formExtensions')
    .provider('aaFormExtensions', function () {

      var self = this;

      //LABEL STRATEGIES
      this.requiredLabelClass = 'label-required';
      this.defaultLblCol = 'sm-2';
      this.defaultLabelStrategy = 'bootstrap3InlineForm';
      this.labelStrategies = {

        //create a bootstrap3 style label
        bootstrap3InlineForm: function (element, labelText, isRequired, $injector) {

          //this will resolve aa-lbl-... from the current element or the closest parent element
          var col = findClosestEleWithAttr(element, 'aa-lbl-col') || self.defaultLblCol;
          var class_ = findClosestEleWithAttr(element, 'aa-lbl-class') || '';

          var label = angular.element('<label>')
            .attr('for', element[0].id)
            .addClass('col-' + col + ' control-label ' + class_)
            .addClass(isRequired ? self.requiredLabelClass : '')
            .html(labelText + (isRequired ? '&nbsp;*' : ''));


          var unsupported = [
            'button',
            'submit'
          ];

          if (unsupported.indexOf(element[0].type) !== -1) {
            throw new Error("Generating a label for and input type " + element[0].type + " is unsupported.");
          }

          element.parent().parent().prepend(label);
        },

        //create a no-frills label directly before the element
        simple: function (ele, labelText, isRequired, $injector) {
          ele[0].parentNode.insertBefore(
            angular.element('<label>')
              .attr('for', ele[0].id)
              .addClass(isRequired ? self.requiredLabelClass : '')
              .html(labelText + (isRequired ? '&nbsp;*' : ''))[0],
            ele[0]);
        }

        //add you own here using registerLabelStrategy
      };


      //AUTO FIELD GROUP STRATEGIES
      this.defaultCol = 'sm-3';
      this.defaultFieldGroupStrategy = "bootstrap3InlineForm";
      this.fieldGroupStrategies = {
        bootstrap3InlineForm: function (element, $injector) {

          //add form-control if it is missing
          if (!element.prop('class')) {
            element.addClass('form-control');
          }

          var col = findClosestEleWithAttr(element, 'aa-col') || self.defaultCol;

          wrap(element, '<div class="form-group"><div class="col-' + col + '"></div></div>');
        },
        bootstrap3BasicFormWithSize: function (element, $injector) {

          //add form-control if it is missing
          if (!element.prop('class')) {
            element.addClass('form-control');
          }

          var col = findClosestEleWithAttr(element, 'aa-col') || self.defaultCol;

          wrap(element, '<div class="form-group col-' + col + '"></div>');
        }
      };


      //VALIDATION MESSAGE PLACEMENT STRATEGIES
      this.defaultValMsgPlacementStrategy = 'below-field';
      this.valMsgPlacementStrategies = {

        'below-field': function (formFieldElement, formName, formFieldName, scope, $injector) {

          var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}"></div>', formName, formFieldName));
          var fieldType = formFieldElement[0].type;
          fieldType = fieldType ? fieldType.toLowerCase() : 'text';

          if (fieldType === 'radio') {
            //radios tend to be wrapped, go up a few levels (of course you can customize this with your own strategy)
            formFieldElement.parent().parent().append(msgElement);

          } else if (formFieldElement.parent().hasClass("input-group")) {
            //if we have element inside input-group, then messages should be placed bellow it
            formFieldElement.parent().after(msgElement);
          } else {
            formFieldElement.after(msgElement);
          }

          return msgElement;
        },

        'hover': function (formFieldElement, formName, formFieldName, scope, $injector) {
          var msgElement = angular.element(stringFormat('<div aa-val-msg-for="{0}.{1}" ng-show="showMessages && isHovered && errorMessages.length > 0"></div>', formName, formFieldName));

          formFieldElement.on('mouseenter', function () {
            scope.isHovered = true;
            scope.$apply();
          });

          formFieldElement.on('mouseleave', function () {
            scope.isHovered = false;
            scope.$apply();
          });

          formFieldElement.after(msgElement);

          return msgElement;
        }
      };


      //VALID ICON STRATEGIES
      this.validIconStrategy = {
        validIcon: '<i class="fa fa-check fa-lg"></i>',
        invalidIcon: '<i class="fa fa-exclamation-circle fa-lg"></i>',
        getContainer: function (element) {
          var ele = angular.element('<div class="col-xs-1 validation-icons"></div>');
          element.parent().after(ele);
          return ele;
        }
      };

      //aaSpinnerClick strategies
      this.defaultSpinnerClickStrategy = "fontAwesomeInsideButton";
      this.spinnerClickStrategies = {
        fontAwesomeInsideButton: function (buttonElement, $injector) {

          var loading = angular.element('<i style="margin-left: 5px;" class="fa fa-spinner fa-spin"></i>');

          return {
            before: function () {
              buttonElement.prop("disabled", true);
              buttonElement.append(loading);
            },
            after: function () {
              buttonElement.prop("disabled", false);
              loading.remove();
            }
          };
        }
      };


      //NOTIFY TARGET
      //set to false to disable notifications for all forms unless explicitly overridden on the form
      this.defaultNotifyTarget = "default";

      //ON NAVIGATE AWAY STRATEGIES
      //detect navigate away and handle it. UI Router / native DOM is handled by default
      this.defaultOnNavigateAwayStrategy = 'confirmUiRouterAndDom';
      this.onNavigateAwayStrategies = {

        //VERY basic. For the love of everything holy please do something better with UI Bootstrap modal or something!
        //requires >= v0.2.10!
        confirmUiRouterAndDom: function (rootFormScope, rootForm, $injector) {
          var confirmationMessage = 'You have unsaved changes are you sure you want to navigate away?';

          //ANGULAR UI ROUTER
          rootFormScope.$on('$stateChangeStart', function (event) {

            if (rootForm.$aaFormExtensions.$changed) {
              if (!window.confirm(confirmationMessage)) {
                // stop ui-router's transitioning
                // Per ui-router documentation, this will cause ui-router to reject the transition promise
                event.preventDefault();
              }
            }
          });

          //NATIVE DOM IE9+
          function beforeUnload(e) {
            if (rootForm.$aaFormExtensions.$changed) {
              (e || window.event).returnValue = confirmationMessage;
              return confirmationMessage;
            }
          }

          angular.element(window).on('beforeunload', beforeUnload);

          rootFormScope.$on('$destroy', function () {
            angular.element(window).off('beforeunload', beforeUnload);
          });

        },
        none: angular.noop
      };


      this.defaultFieldName = "This field";


      //VALIDATION MESSAGES
      this.validationMessages = {
        required: "{0} is required.",
        email: "The field {0} must be an email.",
        minlength: "{0} must be at least {1} character(s).",
        maxlength: "{0} must be less than {1} characters.",
        min: "{0} must be at least {1}.",
        max: "{0} must be at most {1}.",
        pattern: "{0} is invalid.",
        url: "{0} must be a valid URL.",
        number: "{0} must be a number.",
        unknown: "{0} is invalid.",
        validationTitle: 'There are some validation errors'
      };

      this.valMsgForTemplate = '<div class="validation-errors">' +
        '<div class="validation-error" ng-show="showMessages" ng-repeat="msg in errorMessages">{{msg}}</div>' +
        '<div class="notch notch-border"></div>' +
        '<div class="notch"></div>' +
        '</div>';

      //hook for localization, if needed
      this.fieldNameCustomizer = function(fieldName, $injector) {
        return fieldName;
      };

      this.confirmResetStrategy = function () {
        //this can be a promise or immediate like below
        return window.confirm('Are you sure you want to reset any unsaved changes?');
      };

      this.ajaxValidationErrorMappingStrategy = function (response, availableForms) {
        //The below is a example of how to map server side validation errors back to client form fields. That
        //fully supports multiple fields with the same validation error. As most server stuff is done differently
        //you will probably need to define your own mapping strategy. Null this out to disable it.
        //example server resp
        //{
        //    errors:[
        //        {
        //            fieldNames: ['firstName', 'lastName'],
        //            errorMessage: 'John Culviner already exists!'
        //        }
        //    ]
        //}

        if (response.status !== 400 || !response.data.errors) {
          return; //NOT bad request, a validation error or there aren't any errors to push
        }

        //for each of the error(s) indicated find the form with the correct fields and push the validation
        //error to it
        angular.forEach(response.data.errors, function (error) {
          angular.forEach(availableForms, function (form) {
            var containsAllFields = true;
            angular.forEach(error.fieldNames, function (fieldName) {
              if (!form[fieldName]) {
                containsAllFields = false;
              }
            });

            if (containsAllFields) {
              form.$aaFormExtensions.$addValidationError(error.errorMessage, error.fieldNames);
            }
          });
        });
      };

      //todo wire up
      this.globalSettings = {
        messageOnBlur: true
      };

      this.aaIsLoadingDoneDebounceMS = 500; //wait Xms before considered done loading to avoid avoid flickering
      this.aaIsLoadingIgnoreTemplate = false; //should a template load trigger an aa loading

      this.$get = function () {
        return {

          defaultLabelStrategy: self.defaultLabelStrategy,
          labelStrategies: self.labelStrategies,

          defaultFieldGroupStrategy: self.defaultFieldGroupStrategy,
          fieldGroupStrategies: self.fieldGroupStrategies,

          validIconStrategy: self.validIconStrategy,
          validationMessages: self.validationMessages,
          fieldNameCustomizer: self.fieldNameCustomizer,

          defaultFieldName: self.defaultFieldName,

          valMsgForTemplate: self.valMsgForTemplate,

          valMsgPlacementStrategies: self.valMsgPlacementStrategies,

          defaultValMsgPlacementStrategy: self.defaultValMsgPlacementStrategy,

          defaultSpinnerClickStrategy: self.defaultSpinnerClickStrategy,
          spinnerClickStrategies: self.spinnerClickStrategies,

          defaultOnNavigateAwayStrategy: self.defaultOnNavigateAwayStrategy,
          onNavigateAwayStrategies: self.onNavigateAwayStrategies,

          defaultNotifyTarget: self.defaultNotifyTarget,

          confirmResetStrategy: self.confirmResetStrategy,

          ajaxValidationErrorMappingStrategy: self.ajaxValidationErrorMappingStrategy,
          availableForms: [], //all available ngForms in the application that could have errors *right now*

          //todo wire up
          globalSettings: self.globalSettings,

          aaIsLoadingDoneDebounceMS: self.aaIsLoadingDoneDebounceMS,
          aaIsLoadingIgnoreTemplate: self.aaIsLoadingIgnoreTemplate

        };
      };
    });

  //recurse up document tree starting with the current element to try to find
  //and element with a given attribute. if found return it.
  function findClosestEleWithAttr(ele, attr) {

    var attrVal;

    attrVal = ele.attr(attr);
    if(attrVal) {
      return attrVal;
    }

    var parent = ele.parent();

    if(!parent.length) {
      return;
    }

    attrVal = parent.attr(attr);
    if(attrVal) {
      return attrVal;
    }

    return findClosestEleWithAttr(parent, attr);
  }


  function wrap(elms, wrapper) {
    var wrapperDiv = document.createElement('div');
    wrapperDiv.innerHTML = wrapper;

    if (!elms.length) {
      elms = [elms];
    }

    for (var i = elms.length - 1; i >= 0; i--) {
      var el = elms[i];

      var child = wrapperDiv.firstChild.cloneNode(true);
      var appendNode = child;
      while (appendNode.firstChild) {
        appendNode = appendNode.firstChild;
      }

      var parent = el.parentNode;
      var sibling = el.nextSibling;

      appendNode.appendChild(el);

      if (sibling) {
        parent.insertBefore(child, sibling);
      } else {
        parent.appendChild(child);
      }
    }
  }

  function stringFormat(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  }
})();
