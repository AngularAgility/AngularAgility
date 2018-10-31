# AngularAgility

[![Build Status][2]][1]
[1]: https://travis-ci.org/AngularAgility/AngularAgility
[2]: https://travis-ci.org/AngularAgility/AngularAgility.png (Build Status)

A set of useful Angular extensions to improve productivity.

### [Live demo of this exact source here](http://angularagility.herokuapp.com/)
### [API Docs](https://github.com/AngularAgility/AngularAgility/wiki/)

## Installation

Note all JavaScript/CSS that you might want to use is located in `/src/**/*`.

Or install with:

```
npm install -S angular-agility
```

or:

```
bower install -S angular-agility
```

For TypeScript 2.0+ type definitions, use:
```
npm install -D @types/angular-agility
```

AngularJS is the only dependency.

For example for FormExtensions add the following dependencies to your Angular module definition. (aaNotify is baked in and allows for notifications. Disableable, see provider.js)

```javascript
angular.module('myModule', ['aa.formExtensions', 'aa.notify']);
```

# Form Extensions
[Blog Posts](http://johnculviner.com/category/form-extensions/) |
[Source](https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.formExtensions.js) |
[API Docs](https://github.com/AngularAgility/AngularAgility/wiki/Form-Extensions-API-Docs) |
[Live Demo](http://angularagility.herokuapp.com/#/formExtensions/formExtensions/basic)

AngularJS form validation is likely one of the best takes on form validation out there. Unfortunately it can often be a little TOO flexible for many applications where you want basic error message display and generation
without having to dive into the form object model and manually construct basic messages for each field.

This is where Form Extensions comes in. It **works with built in AngularJS validation and TBS3 (by default)** to:
* Drastically reduce the amount of boilerplate, repetitive, error-prone HTML required to produce forms, labels and validation messages. Comes with support for Twitter Bootstrap 3 baked in but free to do whatever you want (see last bullet).
* Automatically generate AngularJS fields for use in form validation, their error messages AND labels.
* On blur and on invalid submit attempt showing of validation messages.
* Form extensions programatically extends forms at `myForm.$aaFormExtensions = {...}`.
* Code is cleaner and easier to read. Form Extensions is DSL that distills your HTML down to only what is required.
* Feel free to use full blown markup whenever you want complete control.
* Mix and match the directive components of Form Extensions to get exactly what you'd like for each situation.
* It does exactly what you want: *EVERYTHING* is overridable on a global and per-instance basis through a rich provider model. AKA if you don't like how it looks right now you can change it. Heck you don't even need to use Twitter Bootstrap even.
    * Any of the [strategies in provider.js](https://github.com/AngularAgility/AngularAgility/blob/master/src/formExtensions/provider.js) can be readily customized doing something like this:
```
myApp.config(function(aaFormExtensionsProvider) {
    aaFormExtensionsProvider.onNavigateAwayStrategies.myCustomStrategy = function(rootFormScope, rootForm, $injector){/*...*/};
    aaFormExtensionsProvider.defaultOnNavigateAwayStrategy = 'myCustomStrategy';
    //etc, look at provider.js to see what is available
})
```

Note all of the strategies include an `$injector` as the last argument so that you can bring in your own Angular dependencies (or perhaps even do a `$compile` if you wanted inside).

### Demo
* [Live demo of this exact source](http://angularagility.herokuapp.com/)
* Local demo: Download the source code, go to the demo folder and run `npm install` then `node server.js`.
* [Basic demo BEFORE Form Extensions](http://plnkr.co/edit/PS0sNo?p=preview)
* [Basic demo AFTER Form Extensions](http://plnkr.co/edit/e8YiZ0?p=preview)

### In a nutshell
#### With Form Extensions:

```html
<div ng-form="exampleForm" class="form-horizontal">
    <input type="number" aa-field-group="person.age" min="0" max="140" required>
</div>
```

#### Without Form Extensions:

```html
<div ng-form="exampleForm" class="form-horizontal">
    <div class="form-group">
        <label for="age" class="col-sm-2 control-label">
            Age *
        </label>
        <div class="col-sm-3">
            <input type="number" class="form-control" ng-model="person.age"
            name="age" id="age" min="0" max="140" required />

            <div class="validation-error" ng-show="(exampleForm.age.$dirty || invalidSubmitAttempt) && exampleForm.age.$error.number">
                Age must be a number
            </div>
            <div class="validation-error" ng-show="(exampleForm.age.$dirty || invalidSubmitAttempt) && exampleForm.age.$error.min">
                Age must be at least 0.
            </div>
            <div class="validation-error" ng-show="(exampleForm.age.$dirty || invalidSubmitAttempt) && exampleForm.age.$error.max">
                Age must be at most 140.
            </div>
            <div class="validation-error" ng-show="(exampleForm.age.$dirty || invalidSubmitAttempt) && exampleForm.age.$error.required">
                Age is required.
            </div>
        </div>
    </div>
</div>
```

### Or configure it from your code:
```javascript
var app = angular.module('app', ['aa.formExternalConfiguration', 'aa.notify'])
    .controller('main', ['$scope', function(scope) {
       scope.user = {
           name:'Test1',
       };
       scope.formconfig = {
           validations: {
               user:{
                   name: {
                       'ng-minlength':8,
                       required:true
                   },
               }
           }
       };
    }]);
```
```html
<div ng-controller="main">
    <div aa-configured-form validation-config="formconfig" ng-form="exampleForm">
        <input type="text" ng-model="user.name" />
    </div>
</div>
```


# Advanced Form Extensions
[Blog Posts](http://johnculviner.com/category/form-extensions/) |
[Source](https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.formExtensions.js) |
[API Docs](https://github.com/AngularAgility/AngularAgility/wiki/Form-Extensions-API-Docs) |
[Live Demo](http://angularagility.herokuapp.com/#/formExtensions/formExtensions/advanced)
### Form changed tracking
Form changed tracking means deviation from the initial state of the form† indicates that a form changed. You can change a field and set it back to it's initial state and aaFormExtensions considers the field AND the form no longer changed (all values are equal to their init state†).

Angular considers the field/form dirty still since it was touched (yet changed back to initial state).

### Form reset
Sets the state of the form back to it's original state†:
```javascript
personForm.$aaFormExtensions.$reset(/*optional shouldNotConfirmReset*/);
```
†AFTER AJAX. All native Angular AJAX requests are counted by aaLoadingWatcher and a form isn't considered loaded until pending AJAX requests have completed. If you have other types of loading to account for simply use aaLoadingWatcher.increment()/.decrement() API to count them.

### Reset initial form state
The current state of the form will be considered it's initial state (any changes from here are now `$changed`):

```javascript
personForm.$aaFormExtensions.$resetChanged();
```

### Loading indicators
isLoading boolean is available from aaLoadingWatcher.isLoading factory or:
$rootScope.aaIsLoading = false

### On-navigate away handling
Includes (by default, overridable) detection of AngularUI Router `$stateChangeStart`. If the root form in the view is `myForm.$aaFormExtensions.$changed` it will block with a JavaScript confirm. Please customize this with however you are doing modals. I would recommend AngularUI Modal. Then register your own custom strategy:

```js
myApp.config(function(aaFormExtensionsProvider) {
    aaFormExtensionsProvider.onNavigateAwayStrategies.myCustomStrategy = function(rootFormScope, rootForm, $injector){/*...*/};
    aaFormExtensionsProvider.defaultOnNavigateAwayStrategy = 'myCustomStrategy';
    //etc, look at provider.js to see what is available
})
```
Use to ignore on a per form basis (if you registered a global default):

```html
<div ng-form="myForm" on-navigate-away-strategy="none">...</div>
```

# Notify
### Fully customizable/configurable growl, toastr style notifications done right
[Blog Posts](http://johnculviner.com/) |
[Source](https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.notify.js) |
[API Docs](https://github.com/AngularAgility/AngularAgility/wiki/Notify-API-Docs) |
[Live Demo](http://angularagility.herokuapp.com/#/notify)

### 1. Put a notification directive somewhere in the DOM with the markup for how you want it positioned
```html
<!-- probably use a CSS class IRL but you get the point-->
<div aa-notify style="position: fixed; bottom: 25px; right: 25px;"></div>
```

### 2. Call it from your code!
```javascript
angular.module('myApp')
.controller('myController', function($scope, aaNotify, $timeout) {

    $scope.trySuccess = function() {
        //the default notifyConfig sets the life to 4 seconds
        //you can tweak this globally or add your own default notifyConfig
        aaNotify.success('Example success message!');
    };

    $scope.tryInfo = function() {
        //configure to 1 second life here only
        aaNotify.info('Example info message!', { ttl: 1000 });
    };

    $scope.tryWarning = function() {
        var handle = aaNotify.warning('Example warning message!', { ttl: 999999999 });

        //whoops that message is going to be around a little *too* long with that ttl.
        //use the handle to remove it after only 4 seconds
        $timeout(function() { aaNotify.remove(handle); }, 4000);

    };

    $scope.tryDanger = function() {
        aaNotify.danger('Example danger message!<br/><br/><br/>This text after some <br/>s',
            {
                //You can register many different templates and
                //*do whatever you want* for a notification, wherever/however you want!
                //(you aren't bound by this dev's idea of what a notification should look like)
                //if you like the sound of this keep scrolling to Advanced Mode below...

                //the default template has these options
                //*if you don't like them *easily* make your own template!*
                showClose: true,                            //close button
                iconClass: 'fa fa-exclamation-triangle',    //iconClass for a <i></i> style icon to use
                allowHtml: true,                            //allows HTML in the message to render as HTML

                //common to the framework as a whole
                ttl: 0  //time to live in ms
            });
})
```

#### It does much more than this, advanced demos coming soon!

# Select 2
[Blog Posts](http://johnculviner.com/) |
[Source](https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.select2.js) |
[API Docs](https://github.com/AngularAgility/AngularAgility/wiki/Select2-Docs) |
[Live Demo](http://angularagility.herokuapp.com/#/select2)
### Headache free use of Select2 with Angular for most common tasks
First off, there are a few other Select2 directives out there. This one is different in that it is specifically designed to easily work with binding ids, objects, arrays, AJAX queries, etc. for some pretty common use cases (see examples!).

It abstracts away the complicated Select2 API (lots of examples below!) and should make it pretty easy to do a lot of things without writing a bunch of hacks. You can still always call the select2 API directly if you want. See examples below!

It offers no support for the basic 'replace a `<select>` list and `<option>`' functionality: This is designed for working with JavaScript object data (as you generally do with Angular). Not what you want? Take a look at the AngularUI one.

Interactive demos here:
[Demos](http://angularagility.herokuapp.com/#/select2)  
