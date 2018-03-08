// Initial data
var initialPlaces = [
  { name: "House",         loc: { lat: 42.480018, lng: -92.363529 }, dist: 0 },
  { name: "Work",          loc: { lat: 42.478491, lng: -92.454093 }, dist: 6.2 },
  { name: "Grocery Store", loc: { lat: 42.458456, lng: -92.330557 }, dist: 3.1 },
  { name: "Church",        loc: { lat: 42.515738, lng: -92.413237 }, dist: 4.6 },
  { name: "Library",       loc: { lat: 42.496388, lng: -92.340966 }, dist: 1.8 },
  { name: "School",        loc: { lat: 42.479395, lng: -92.362301 }, dist: 0.1 }
];

// Map & InfoWindow objects
var Neighborhood;
var infoWindow;

// Model
// Knockout should be used to handle the list, filter, and any other information
// on the page that is subject to changing state.
var Place = function(index, data) {
  this.id = ko.observable(index);
  this.name = ko.observable(data.name);
  this.loc = ko.observable(data.loc);
  this.dist = ko.observable(data.dist);
  this.isVisible = ko.observable(true);
};

var MilesAway = function(data) {
  this.miles = ko.observable(data);
}

// View Model
var ViewModel = function() {
  var self = this;

  this.places = ko.observableArray([]);

  for (var i=0; i<initialPlaces.length; i++) {
    self.places.push(new Place(i, initialPlaces[i]));
  }

  // currently selected place
  this.place = ko.observable();

  // this markers[] array shares the same indexing as places[]
  this.markers = [];

  this.setPlace = function(clickedPlace) {
    self.place(clickedPlace);

    Neighborhood.setCenter(self.place().loc());

    doInfoWindow(self.place().id(), infoWindow);
  };

  this.milesAway = ko.observableArray([1, 2, 5, 10]);
  this.milesFilter = ko.observable(this.milesAway()[this.milesAway().length-1]);
  this.setMiles = function(milesSelected) {
    self.milesFilter = milesSelected;
    for (var i = 0; i < self.places().length; i++) {
      thisplace = self.places()[i];
      // TODO: call google maps distance matrix to get distance between house and this place
      // https://developers.google.com/maps/documentation/javascript/distancematrix

      // For now, hard-coded distances...
      if (thisplace.dist() <= milesSelected) {
        thisplace.isVisible(true);
        self.markers[i].setMap(Neighborhood);
        // TODO: trigger animation when they show back up...
      }
      else {
        thisplace.isVisible(false);
        self.markers[i].setMap(null);
      }
    }
  };
};

var vm = new ViewModel();

ko.applyBindings(vm);

function startMap() {
  // initialize neighborhood map
  Neighborhood = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: vm.places()[0].loc()
  });

  infoWindow = new google.maps.InfoWindow();

  var bounds = new google.maps.LatLngBounds();

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

    marker.addListener('click', function() {
      // add a listener for doInfoWindow() to last marker we pushed
      doInfoWindow(vm.markers.length-1, infoWindow);
    });

    bounds.extend(marker.position);
  }

  Neighborhood.fitBounds(bounds);
}

function doInfoWindow(i, infoWindow) {
  var marker = vm.markers[i];

  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    infoWindow.setContent("<div>" + marker.title + "</div>");
    infoWindow.open(Neighborhood, marker);
  }
}
