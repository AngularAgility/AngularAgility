#AngularAgility

A set of useful Angular extensions to improve productivity

Note all JavaScript/CSS that you might want to use is located in /angularAgility/*.* The remainder of the application is for the demo.

##Form Extensions
Angular.js form validation is likely the best take on form validation I've seen. Unfortuantely I have often found
it a little TOO flexible for many applications where you want basic error message display and generation
witout having to dive into the form object model and manually construct basic messages for each field.

This is where Form Extensions comes in. It will:
* Automatically generate validation messages from applied validation rules and display them on screen when appropriate
(they are also available in myForm.$aaFormExtensions for programmatic use)
* Automatically generate labels and place them in the DOM using a customizable global default or specific strategy. Names
can be automatically generated based on the ng-model objects bound.
* Create all the above in 1 line using aa-auto-field="myField"
* Keeps track of invalid submit attempts and display errors appropriately
* Keeps track of field blurs and display errors appropriately
* Block invalid save attempts using aa-save-form to prevent invalid data submissions and also serving as a validation message display trigger.
* A rich overridable strategy approach to configuration of everything above using aaFormExtensionsProvider. You can customize almost anything but comes with resonable defaults out of the box. No assembly (necessarily) required!
* A bunch more stuff I'm probably forgetting. Download the source and try it out, you'll like it!


