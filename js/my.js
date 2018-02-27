// Map object
var Neighborhood;

// House coordinates
var MyHouseCoordinates = {lat: 42.480018, lng:-92.363529};



// Map initialization
// TODO: parameterize center
function startMap() {
  Neighborhood = new google.maps.Map(document.getElementById('map'), {
    zoom: 14, center: MyHouseCoordinates
  });

  Marker_MyHouse = new google.maps.Marker({
    position: MyHouseCoordinates,
    map: Neighborhood
  });
}
