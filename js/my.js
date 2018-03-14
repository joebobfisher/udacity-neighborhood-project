// Initial data
var initialPlaces = [
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
};

// View Model
var ViewModel = function() {
  var self = this;

  this.places = ko.observableArray([]);

  for (var i=0; i<initialPlaces.length; i++) {
    self.places().push(new Place(i, initialPlaces[i]));
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

    // doing it this way to get around JSHint W083 (don't make functions in a loop)
    marker.addListener('click', giveInfoWindowFunction(marker.id));

    bounds.extend(marker.position);
  }

  Neighborhood.fitBounds(bounds);
}

function giveInfoWindowFunction(markerId) {
  return function () {
    // add a listener for doInfoWindow() to last marker we pushed
    doInfoWindow(markerId, infoWindow);
  };
}

function doInfoWindow(i, infoWindow) {
  var marker = vm.markers[i];
  var fsqData;
  var content;

  if (infoWindow.marker != marker) {
    // toggle back and forth between bouncing and non-bouncing
    bounce(marker);

    content = "<div id='content'><h1>" + marker.title + "</h1>";

    $.getJSON("https://api.foursquare.com/v2/venues/search",
              { client_id: 'PPLTRCLFQWHDYILXAT3G3B0RLK15VFLQIUT4KT51AXAVFAL2',
                client_secret: 'D2FQPOZDFUQGYURIAGEJZRYN1XG3BFRYNEHWXSR1DPF41HYY',
                v: '20170801',
                ll: vm.places()[i].loc().lat + "," + vm.places()[i].loc().lng,
                limit: 1 })
      .done(function(json) {
        fsqData = json;
        var venue = fsqData.response.venues[0];

        // make sure properties are set to something
        venue.name                    = venue.name                        ? venue.name                    : "<em>property not available</em>";
        venue.location.address        = venue.location.address            ? venue.location.address        : "<em>property not available</em>";
        venue.location.city           = venue.location.city               ? venue.location.city           : "<em>property not available</em>";
        venue.location.state          = venue.location.state              ? venue.location.state          : "<em>property not available</em>";
        venue.location.postalCode     = venue.location.postalCode         ? venue.location.postalCode     : "<em>property not available</em>";
        venue.categories[0].shortName = venue.categories[0].shortName     ? venue.categories[0].shortName : "<em>property not available</em>";
        venue.hereNow.summary         = venue.hereNow.summary             ? venue.hereNow.summary         : "<em>property not available</em>";
        venue.hereNow.count           = venue.hereNow.count !== undefined ? venue.hereNow.count           : "<em>property not available</em>";

        content += "<div id='bodyContent'>" + "<h4>Foursquare Veunue Details</h4>" +
            "<p>" + venue.name + "<br/>" +
            venue.location.address + "<br/>" +
            venue.location.city + ", " +
            venue.location.state + " " +
            venue.location.postalCode + "</p>" +
            "<p><b>Category: </b>" +
            venue.categories[0].shortName + "</p>" +
            "<p><b>People There Now: </b><em>" +
            venue.hereNow.summary + " (" +
            venue.hereNow.count + ")</em></p>" +
            "<p><em>Location details provided by <a href='https://foursquare.com'>Foursquare</a></em></p>" +
            "</div>";
      })
      .fail(function(jqxhr, textStatus, error) {
        content += "<p><em>No Foursquare data could be obtained at this time.</em></p>";
        content += "<p><em>Error '" + textStatus + "' " + error + "</em></p>";
      })
      .always(function() {
        content += "</div>";
        infoWindow.marker = marker;
        infoWindow.addListener('closeclick', function() {
          infoWindow.marker = null;
        });
        infoWindow.setContent(content);
        infoWindow.open(Neighborhood, marker);
      });
  }
}

function bounce(marker) {
    // make marker bounce
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // make it stop
    setTimeout(function() { marker.setAnimation(null); }, 2200);
}

function mapsError() {
  var mapdiv = document.getElementById('map');
  mapdiv.innerHTML = "<h4 class='center error'>Whoa! Can't load Google Maps right now. Sorry!</h4>"
}
