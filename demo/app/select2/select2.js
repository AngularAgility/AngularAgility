/*globals angular */
angular
  .module('angularAgilityDemo')
  .factory('select2States', function () {
    'use strict';
    return [
      {
        "name": "Alabama",
        "abbreviation": "AL"
      },
      {
        "name": "Alaska",
        "abbreviation": "AK"
      },
      {
        "name": "American Samoa",
        "abbreviation": "AS"
      },
      {
        "name": "Arizona",
        "abbreviation": "AZ"
      },
      {
        "name": "Arkansas",
        "abbreviation": "AR"
      },
      {
        "name": "California",
        "abbreviation": "CA"
      },
      {
        "name": "Colorado",
        "abbreviation": "CO"
      },
      {
        "name": "Connecticut",
        "abbreviation": "CT"
      },
      {
        "name": "Delaware",
        "abbreviation": "DE"
      },
      {
        "name": "District Of Columbia",
        "abbreviation": "DC"
      },
      {
        "name": "Federated States Of Micronesia",
        "abbreviation": "FM"
      },
      {
        "name": "Florida",
        "abbreviation": "FL"
      },
      {
        "name": "Georgia",
        "abbreviation": "GA"
      },
      {
        "name": "Guam",
        "abbreviation": "GU"
      },
      {
        "name": "Hawaii",
        "abbreviation": "HI"
      },
      {
        "name": "Idaho",
        "abbreviation": "ID"
      },
      {
        "name": "Illinois",
        "abbreviation": "IL"
      },
      {
        "name": "Indiana",
        "abbreviation": "IN"
      },
      {
        "name": "Iowa",
        "abbreviation": "IA"
      },
      {
        "name": "Kansas",
        "abbreviation": "KS"
      },
      {
        "name": "Kentucky",
        "abbreviation": "KY"
      },
      {
        "name": "Louisiana",
        "abbreviation": "LA"
      },
      {
        "name": "Maine",
        "abbreviation": "ME"
      },
      {
        "name": "Marshall Islands",
        "abbreviation": "MH"
      },
      {
        "name": "Maryland",
        "abbreviation": "MD"
      },
      {
        "name": "Massachusetts",
        "abbreviation": "MA"
      },
      {
        "name": "Michigan",
        "abbreviation": "MI"
      },
      {
        "name": "Minnesota",
        "abbreviation": "MN"
      },
      {
        "name": "Mississippi",
        "abbreviation": "MS"
      },
      {
        "name": "Missouri",
        "abbreviation": "MO"
      },
      {
        "name": "Montana",
        "abbreviation": "MT"
      },
      {
        "name": "Nebraska",
        "abbreviation": "NE"
      },
      {
        "name": "Nevada",
        "abbreviation": "NV"
      },
      {
        "name": "New Hampshire",
        "abbreviation": "NH"
      },
      {
        "name": "New Jersey",
        "abbreviation": "NJ"
      },
      {
        "name": "New Mexico",
        "abbreviation": "NM"
      },
      {
        "name": "New York",
        "abbreviation": "NY"
      },
      {
        "name": "North Carolina",
        "abbreviation": "NC"
      },
      {
        "name": "North Dakota",
        "abbreviation": "ND"
      },
      {
        "name": "Northern Mariana Islands",
        "abbreviation": "MP"
      },
      {
        "name": "Ohio",
        "abbreviation": "OH"
      },
      {
        "name": "Oklahoma",
        "abbreviation": "OK"
      },
      {
        "name": "Oregon",
        "abbreviation": "OR"
      },
      {
        "name": "Palau",
        "abbreviation": "PW"
      },
      {
        "name": "Pennsylvania",
        "abbreviation": "PA"
      },
      {
        "name": "Puerto Rico",
        "abbreviation": "PR"
      },
      {
        "name": "Rhode Island",
        "abbreviation": "RI"
      },
      {
        "name": "South Carolina",
        "abbreviation": "SC"
      },
      {
        "name": "South Dakota",
        "abbreviation": "SD"
      },
      {
        "name": "Tennessee",
        "abbreviation": "TN"
      },
      {
        "name": "Texas",
        "abbreviation": "TX"
      },
      {
        "name": "Utah",
        "abbreviation": "UT"
      },
      {
        "name": "Vermont",
        "abbreviation": "VT"
      },
      {
        "name": "Virgin Islands",
        "abbreviation": "VI"
      },
      {
        "name": "Virginia",
        "abbreviation": "VA"
      },
      {
        "name": "Washington",
        "abbreviation": "WA"
      },
      {
        "name": "West Virginia",
        "abbreviation": "WV"
      },
      {
        "name": "Wisconsin",
        "abbreviation": "WI"
      },
      {
        "name": "Wyoming",
        "abbreviation": "WY"
      }
    ];
  })

  .controller('select2basicId', function ($scope, select2States) {
    'use strict';
    $scope.selectedStateAbbreviation = "MN";

    $scope.select2Config = {
      mode: 'id',
      id: 'abbreviation',
      text: 'name',
      options: select2States
    };
  })

  .controller('select2basicObject', function ($scope, select2States) {
    'use strict';
    $scope.selectedStateObject = { name: "Minnesota", abbreviation: "MN" };

    $scope.select2Config = {
      mode: 'object',
      id: 'abbreviation',
      text: 'name',
      options: select2States
    };
  })

  .controller('select2ajaxId', function ($scope, $http) {
    'use strict';
    $scope.selectedStateAbbreviation = "MN";

    $scope.select2Config = {
      mode: 'id',
      id: 'abbreviation',
      text: 'name',
      textLookup: function (id) {
        //find the text for the selected id
        //looks at 'text' field above (name)
        return $http.get('/states/' + id);
      },
      options: function (searchText) {
        //search for options with AJAX
        return $http.get('/searchStates/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  })

  .controller('select2ajaxNameAndIdSame', function ($scope, $http) {
    'use strict';
    $scope.selectedStateName = "Minnesota";

    $scope.select2Config = {
      mode: 'id',
      id: '@this',
      text: '@this',
      options: function (searchText) {
        //search for options with AJAX
        return $http.get('/searchStatesJustName/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  })

  .controller('select2ajaxObject', function ($scope, $http) {
    'use strict';
    $scope.selectedStateObject = { name: "Minnesota", abbreviation: "MN" };

    $scope.select2Config = {
      mode: 'object',
      id: 'abbreviation',
      text: 'name',
      options: function (searchText) {
        return $http.get('/searchStates/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  })

  .controller('select2tagsBasic', function ($scope) {
    'use strict';
    $scope.favoriteFoods = ['Lasagna', 'Chicken Curry', 'Pizza'];

    $scope.select2Config = {
      mode: 'tags-id'
    };
  })

  .controller('select2tagsIdConstrained', function ($scope, select2States) {
    'use strict';
    $scope.favoriteStates = ["MN", "WI"];

    $scope.select2Config = {
      mode: 'tags-id',
      id: 'abbreviation',
      text: 'name',
      options: select2States
    };
  })

  .controller('select2tagObjectsConstrained', function ($scope, select2States) {
    'use strict';
    $scope.favoriteStates = [
      { name: "Minnesota", abbreviation: "MN" },
      { name: "Wisconsin", abbreviation: "WI" }
    ];

    $scope.select2Config = {
      mode: 'tags-object',
      id: 'abbreviation',
      text: 'name',
      options: select2States
    };
  })

  .controller('select2tagsIdTextSameConstrained', function ($scope, select2States) {
    'use strict';
    var select2StatesJustName = select2States.map(function (state) {
      return state.name;
    });

    $scope.favoriteStates = ["Minnesota", "Wisconsin"];

    $scope.select2Config = {
      mode: 'tags-id',
      id: '@this',
      text: '@this',
      options: select2StatesJustName
    };
  })

  .controller('select2tagsIdTextSameConstrainedAjax', function ($scope, $http) {
    'use strict';
    $scope.favoriteStates = ["Minnesota", "Wisconsin"];

    $scope.select2Config = {
      mode: 'tags-id',
      id: '@this',
      text: '@this',
      options: function (searchText) {
        //search for options with AJAX
        return $http.get('/searchStatesJustName/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  })

  .controller('select2tagIdAjaxConstrained', function ($scope, $http) {
    'use strict';
    $scope.favoriteStates = [ "MN", "WI" ];

    $scope.select2Config = {
      mode: 'tags-id',
      id: 'abbreviation',
      text: 'name',
      textLookup: function (id) {
        //find the text for each 'abbreviation' (the 'id') stored in $scope.favoriteStates
        return $http.get('/states/' + id);
      },
      options: function (searchText) {
        //search for options with AJAX
        return $http.get('/searchStates/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  })

  .controller('select2tagObjectsAjaxConstrained', function ($scope, $http) {
    'use strict';
    $scope.favoriteStates = [
      { name: "Minnesota", abbreviation: "MN" },
      { name: "Wisconsin", abbreviation: "WI" }
    ];

    $scope.select2Config = {
      mode: 'tags-object',
      id: 'abbreviation',
      text: 'name',
      options: function (searchText) {
        return $http.get('/searchStates/' + searchText);
      },
      select2: {
        minimumInputLength: 2
      }
    };
  });