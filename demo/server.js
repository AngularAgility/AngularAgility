/*globals require, process, console */
//Instruction to run the demo
//1. Install Node http://nodejs.org/
// from the console/terminal in this folder run:
//2. npm install
//3. node server.js
var express = require('express');
var lowdash = require('lodash');

var app = express();
app.use(express.json());
app.use("/", express.static(__dirname));
app.use("/dist", express.static(__dirname + "/../dist"));
app.use("/src", express.static(__dirname + "/../src"));


var port = process.env.PORT || 1337;
app.listen(port, function () {
  'use strict';
  console.log("Serving files on locahost:1337 from " + __dirname);
});


app.get('/twosecondwait', function (req, resp) {
  'use strict';
  setTimeout(function () {
    resp.send({ data: "waited 2 seconds before returning this response!"});
  }, 2000);
});

app.get('/loadTestPerson', function (req, resp) {
  'use strict';
  setTimeout(function () {
    //pretend node isn't so fast...
    resp.send({
      firstName: 'John',
      lastName: 'Culviner',
      friends: [
        {firstName: 'Angular', lastName: 'Agility'}
      ]
    });
  }, 1000);
});

app.post('/savePerson', function (req, resp) {
  'use strict';
  setTimeout(function () {
    console.log(req);

    if (req.body.firstName === 'John' && req.body.lastName === 'Culviner') {
      //simulate a server side error when the user name already exists
      resp
        .status(400)
        .send({
          errors: [
            {
              fieldNames: ['firstName', 'lastName'],
              errorMessage: 'John Culviner already exists!'
            }
          ]
        });
    } else {
      resp.send({});
    }
  }, 2000);//pretend node isn't so fast...

});

//for select2 demo
var usStates = [
  {        "name": "Alabama", "abbreviation": "AL"    },
  {        "name": "Alaska", "abbreviation": "AK"    },
  {        "name": "American Samoa", "abbreviation": "AS"    },
  {        "name": "Arizona", "abbreviation": "AZ"    },
  {        "name": "Arkansas", "abbreviation": "AR"    },
  {        "name": "California", "abbreviation": "CA"    },
  {        "name": "Colorado", "abbreviation": "CO"    },
  {        "name": "Connecticut", "abbreviation": "CT"    },
  {        "name": "Delaware", "abbreviation": "DE"    },
  {        "name": "District Of Columbia", "abbreviation": "DC"    },
  {        "name": "Federated States Of Micronesia", "abbreviation": "FM"    },
  {        "name": "Florida", "abbreviation": "FL"    },
  {        "name": "Georgia", "abbreviation": "GA"    },
  {        "name": "Guam", "abbreviation": "GU"    },
  {        "name": "Hawaii", "abbreviation": "HI"    },
  {        "name": "Idaho", "abbreviation": "ID"    },
  {        "name": "Illinois", "abbreviation": "IL"    },
  {        "name": "Indiana", "abbreviation": "IN"    },
  {        "name": "Iowa", "abbreviation": "IA"    },
  {        "name": "Kansas", "abbreviation": "KS"    },
  {        "name": "Kentucky", "abbreviation": "KY"    },
  {        "name": "Louisiana", "abbreviation": "LA"    },
  {        "name": "Maine", "abbreviation": "ME"    },
  {        "name": "Marshall Islands", "abbreviation": "MH"    },
  {        "name": "Maryland", "abbreviation": "MD"    },
  {        "name": "Massachusetts", "abbreviation": "MA"    },
  {        "name": "Michigan", "abbreviation": "MI"    },
  {        "name": "Minnesota", "abbreviation": "MN"    },
  {        "name": "Mississippi", "abbreviation": "MS"    },
  {        "name": "Missouri", "abbreviation": "MO"    },
  {        "name": "Montana", "abbreviation": "MT"    },
  {        "name": "Nebraska", "abbreviation": "NE"    },
  {        "name": "Nevada", "abbreviation": "NV"    },
  {        "name": "New Hampshire", "abbreviation": "NH"    },
  {        "name": "New Jersey", "abbreviation": "NJ"    },
  {        "name": "New Mexico", "abbreviation": "NM"    },
  {        "name": "New York", "abbreviation": "NY"    },
  {        "name": "North Carolina", "abbreviation": "NC"    },
  {        "name": "North Dakota", "abbreviation": "ND"    },
  {        "name": "Northern Mariana Islands", "abbreviation": "MP"    },
  {        "name": "Ohio", "abbreviation": "OH"    },
  {        "name": "Oklahoma", "abbreviation": "OK"    },
  {        "name": "Oregon", "abbreviation": "OR"    },
  {        "name": "Palau", "abbreviation": "PW"    },
  {        "name": "Pennsylvania", "abbreviation": "PA"    },
  {        "name": "Puerto Rico", "abbreviation": "PR"    },
  {        "name": "Rhode Island", "abbreviation": "RI"    },
  {        "name": "South Carolina", "abbreviation": "SC"    },
  {        "name": "South Dakota", "abbreviation": "SD"    },
  {        "name": "Tennessee", "abbreviation": "TN"    },
  {        "name": "Texas", "abbreviation": "TX"    },
  {        "name": "Utah", "abbreviation": "UT"    },
  {        "name": "Vermont", "abbreviation": "VT"    },
  {        "name": "Virgin Islands", "abbreviation": "VI"    },
  {        "name": "Virginia", "abbreviation": "VA"    },
  {        "name": "Washington", "abbreviation": "WA"    },
  {        "name": "West Virginia", "abbreviation": "WV"    },
  {        "name": "Wisconsin", "abbreviation": "WI"    },
  {        "name": "Wyoming", "abbreviation": "WY"    }
];
app.get('/searchStates/:nameStartsWith', function (req, res) {
  'use strict';
  return res.send(lowdash.filter(usStates, function (state) {
    return state.name.toUpperCase().indexOf(req.params.nameStartsWith.toUpperCase()) === 0;
  }));
});
app.get('/states/:id', function (req, res) {
  'use strict';
  return res.send(lowdash.find(usStates, {abbreviation: req.params.id}));
});
app.get('/searchStatesJustName/:nameStartsWith', function (req, res) {
  'use strict';
  return res.send(
    lowdash(usStates)
      .filter(function (state) {
        return state.name.toUpperCase().indexOf(req.params.nameStartsWith.toUpperCase()) === 0;
      })
      .map(function (state) {
        return state.name;
      })
      .value()
  );
});