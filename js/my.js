// Map Object
var Neighborhood;

// Place Coordinates
var HouseCoordinates =      {lat: 42.480018, lng: -92.363529};
var WorkCoordinates =       {lat: 42.478491, lng: -92.454093};
var GroceriesCoordinates =  {lat: 42.458456, lng: -92.330557};
var ChurchCoordinates =     {lat: 42.515738, lng: -92.413237};
var LibraryCoordinates =    {lat: 42.496388, lng: -92.340966};

// Map initialization
// TODO: parameterize center
function startMap() {
  var Neighborhood = new google.maps.Map(document.getElementById('map'), {
    zoom: 14, center: HouseCoordinates
  });

  var Marker_House = new google.maps.Marker({
    position: HouseCoordinates,
    map: Neighborhood
  });

  var Marker_Work = new google.maps.Marker({
    position: WorkCoordinates,
    map: Neighborhood
  });

  var Marker_Groceries = new google.maps.Marker({
    position: GroceriesCoordinates,
    map: Neighborhood
  });

  var Marker_Church = new google.maps.Marker({
    position: ChurchCoordinates,
    map: Neighborhood
  });

  var Marker_Library = new google.maps.Marker({
    position: LibraryCoordinates,
    map: Neighborhood
  });
}
