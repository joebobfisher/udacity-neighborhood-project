// Initial data
var initialPlaces = [
  { name: "My House",      loc: { lat: 42.480018, lng: -92.363529 } },
  { name: "Work",          loc: { lat: 42.478491, lng: -92.454093 } },
  { name: "Grocery Store", loc: { lat: 42.458456, lng: -92.330557 } },
  { name: "Church",        loc: { lat: 42.515738, lng: -92.413237 } },
  { name: "Library",       loc: { lat: 42.496388, lng: -92.340966 } }
];

// Map object
var Neighborhood;

// Model
// Knockout should be used to handle the list, filter, and any other information
// on the page that is subject to changing state.
var Place = function(data) {
  this.name = ko.observable(data.name);
  this.loc = ko.observable(data.loc);
};

// View Model
var ViewModel = function() {
  var self = this;

  this.places = ko.observableArray([]);

  initialPlaces.forEach(function(place) {
    self.places.push(new Place(place));
  });

  this.place = ko.observable(this.places()[0]);

  this.markers = [];
};

var vm = new ViewModel();

ko.applyBindings(vm);

function startMap() {
  // initialize neighborhood map
  Neighborhood = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: vm.place().loc()
  });

  // initialize markers
  for (var i = 0; i < vm.places().length; i++) {
    var marker = new google.maps.Marker({
      id: i,
      map: Neighborhood,
      position: vm.places()[i].loc(),
      title: vm.places()[i].name(),
      animation: google.maps.Animation.DROP
    });

    vm.markers.push(marker);
  }
}
