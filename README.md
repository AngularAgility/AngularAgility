#AngularAgility
[![Build Status][2]][1]
[1]: https://travis-ci.org/AngularAgility/AngularAgility
[2]: https://travis-ci.org/AngularAgility/AngularAgility.png (Build Status)

A set of useful Angular extensions to improve productivity

Note all JavaScript/CSS that you might want to use is located in /src/*.*

##[Live demo of this exact source here](http://angularagility.herokuapp.com/)

##Form Extensions
[Blog Posts](http://johnculviner.com/category/form-extensions/) |
[Source](https://github.com/AngularAgility/AngularAgility/blob/master/src/aa.formExtensions.js) |
[API Docs](https://github.com/AngularAgility/AngularAgility/wiki/Form-Extensions-API-Docs)

Angular.js form validation is likely one of the best takes on form validation out there. Unfortunately it can often be a little TOO flexible for many applications where you want basic error message display and generation
witout having to dive into the form object model and manually construct basic messages for each field.

This is where Form Extensions comes in. It **works with built in Angular.js validation** to:
* Drastically reduce the amount of boilerplate, repetitive, error-prone HTML required to produce forms, labels and validation messages.
* Automatically generate Angular.js fields for use in form validation, their error messages AND labels.
* On blur and on invalid submit attempt showing of validation messages.
* Form extensions programatically extends forms at myForm.$aaFormExtensions = {...}
* Code is cleaner and easier to read. Form Extensions is DSL that distills your HTML down to only what is required.
* Feel free to use full blown markup whenever you want complete control.
* Mix and match the directive components of Form Extensions to get exactly what you'd like for each situation.
* It does exactly what you want: Everything is overridable on a global and per-instance basis through a rich provider model.

###Demo
* [Live demo of this exact source](http://angularagility.herokuapp.com/)
* Local demo: Download the source code, go to the demo folder and run "npm install" then "node server.js".
* [Basic demo BEFORE Form Extensions](http://plnkr.co/edit/PS0sNo?p=preview)
* [Basic demo AFTER Form Extensions](http://plnkr.co/edit/e8YiZ0?p=preview)

###In a nutshell
####With Form Extensions:

```html
<div ng-form="exampleForm" class="form-horizontal">
    <input type="number" aa-field-group="person.age" min="0" max="140" required>
</div>
```

####Without Form Extensions:

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


