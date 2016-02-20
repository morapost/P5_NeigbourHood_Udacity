//Array of major attractions to populate the Google Map
var locations = [{
        name: 'Hard Rock Cafe',
        address: '40 ,St. Marks Road, Bengaluru, Karnataka',
        lat: '12.9761',
        lng: '77.6015'
    },

    {
        name: 'Samarkand',
        address: '66, Gem Plaza,Infantry Road,Bengaluru, Karnataka',
        lat: '12.9801',
        lng: '77.6045'
    },

    {
        name: 'Matteo Coffea',
        address: '2, Church Street, Bengaluru, Karnataka 560001',
        lat: '12.9751',
        lng: '77.6047'
    },

    {
        name: 'UB City',
        address: '24, Vittal Mallya Road, Bengaluru, Karnataka 560001',
        lat: '12.971',
        lng: '77.595'
    },

    {
        name: 'Orion Mall',
        address: '1, Sampige Rd, Malleshwaram, Bengaluru, Karnataka 560003',
        lat: '12.992',
        lng: '77.570'
    },

    {
        name: 'StarBucks',
        address: '100 Ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',
        lat: '12.969',
        lng: '77.6499'
    }
    
];

//Seting up google Maps API


function MapApiLoaded() {
    var infowindow = new google.maps.InfoWindow({});

    function intiMap() {

        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(12.9667, 77.5667), //center point on map
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(mapCanvas, mapOptions);

        var coord;
        var content;
        //Loops through all attractions within Locations Array, placeing a Google Maps marker on attractions Lat and Lng
        for (var i = 0; i < locations.length; i++) {
            coord = new google.maps.LatLng(locations[i].lat, locations[i].lng);
            locations[i].marker = new google.maps.Marker({
                position: coord,
                map: map,
                animation: google.maps.Animation.DROP,
                title: locations[i].name
                    //Enables the click function to each googles maps marker
            });
            locations[i].marker.addListener('click', (function(attraction) {
                return function() {
                    openInfo(attraction);
                };
            })(locations[i]));
        }
    }

    intiMap();
    //Creates the content to be displayed within the infoWindow above the map marker
    function createContent(attraction) {
        var content = '<h4>' + attraction.name + ':' + " " + attraction.address + '</h4>'
        "<div>" + attraction.location + "</div>" +
            "<div class='coord'> Latitude: " + attraction.lat + "</div>" +
            "<div class='coord'> Longitude: " + attraction.lng + "</div>" +
            "<div class='Bar's'> Nearby Bar's (distance < 1000)</div>"
        return content;
    }
    //Intergration of foursquare API to find bars within a radius of 1000 based off of the the Lat and Lng of attractions
    //Sets the bounce animation to each map marker when clicked
    function openInfo(attraction) {
        attraction.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            attraction.marker.setAnimation(null);
        }, 1500); //Time marker animates
        var url = "https://api.foursquare.com/v2/venues/search?client_id=HRRN1RSNSF2DQUS2GH3CIHRIE2HOXM0XCZB2QQX3M55JKH4K&client_secret=AKNFOHZZQUVKNAPO4OM4CR5BJQHGDHQ42YARUJ1FUXTPN2L4&v=20130815" +
            "&ll=" + attraction.lat + "," + attraction.lng +
            "&query=bar" +
            "&limit=5" +
            "&radius=1000";
        var html = "";
        //Sets up content in infowindow if 1. there are no Bars near attration 2. if there is an error pulling the information from foursquare's api
        jQuery.getJSON(url, function(data) {
                for (var i = 0; i < data.response.venues.length; i++) {
                    html += "<div> <a href='https://it.foursquare.com/v/" + data.response.venues[i].id + "'>" + data.response.venues[i].name + "</a></div>";
                }
                if (html === "") html = "There are no Bar's near this attraction";
                infowindow.setContent(createContent(attraction) + html);
                infowindow.open(map, attraction.marker);
            })
            .fail(function(e) {
                html = "<div> Error loading local bar's has failed..</div>";
                infowindow.setContent(createContent(attraction) + html);
                infowindow.open(map, attraction.marker);
            });
    }
    //ViewModel to set up #sidebar and #place-list elements
    var ViewModel = function() {
        var self = this;

        self.storeAttraction = ko.observableArray(locations);
        self.filter = ko.observable("");

        self.search = ko.computed(function() {
            return ko.utils.arrayFilter(self.storeAttraction(), function(storeAttraction) {


                //Setting up attraction search bar filter to connect with Google Maps markers

                if (storeAttraction.name.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
                    if (map !== null) storeAttraction.marker.setMap(map);
                    return true;
                } else {
                    storeAttraction.marker.setMap(null);
                    return false;
                }
            });

        });

        // Select happens when an attraction is clicked
        self.select = function(parent) {
            openInfo(parent);
        };
    };


    ko.applyBindings(new ViewModel());
}