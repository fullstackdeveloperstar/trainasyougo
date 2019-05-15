import { Component } from '@angular/core';
import { MatFormFieldControl, MatFormField } from '@angular/material';
import { SearchService } from './search.service';

declare var google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})



export class AppComponent {
  title = 'trainasyougo';
  script = document.createElement("script");
  map;
  input;
  searchBox;
  markers = [];
  places;
  searchText = "";
  myMarker;
  radius = 500;
  searchresults = [];
  selectedNo = -1;
  additionalFilter = "no";
  currentLat;
  currentLng;

  detailService;
  isLoading = false;

  
  directionsService;
  directionsDisplay;
  geocoder;
  myLocationAddress;
  travelMode = "DRIVING";
  currentToDir = "";
  searchFitnessService = "GYM";

  constructor(private searchservice: SearchService) {
  	// this.search()
  }

  ngOnInit() {
  	this.script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDz7iXxtwOMovXzKaaWLzStFo1tDLP5PEg&libraries=places";
  	this.script.onload = () => {
  		
  		this.map = new google.maps.Map(document.getElementById('map'), {
		    center: {lat: -33.8688, lng: 151.2195},
		    zoom: 13,
		    mapTypeId: 'roadmap',
		    gestureHandling: 'greedy'
		});

		this.input = document.getElementById('pac-input');
  		this.searchBox = new google.maps.places.SearchBox(this.input);
  		var me = this;
  		this.map.addListener('bounds_changed', function() {
			me.searchBox.setBounds(me.map.getBounds());
		});

  		var bounds = new google.maps.LatLngBounds();

		if (navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
				bounds = new google.maps.LatLngBounds(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
  				me.map.fitBounds(bounds);
  				me.currentLat = position.coords.latitude;
  				me.currentLng = position.coords.longitude;

  				me.myMarker = new google.maps.Marker({
			        map: me.map,
			        title: "My location",
			        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
			    });

			    var latlng = {lat: me.currentLat, lng: me.currentLng};
		        me.geocoder.geocode({'location': latlng}, function(results, status) {
		          if (status === 'OK') {
		            if (results[0]) {
		              me.myLocationAddress = results[0].formatted_address;
		              
		            } else {
		              window.alert('No results found');
		            }
		          } else {
		            window.alert('Geocoder failed due to: ' + status);
		          }
		        });

		    });
		} else { }


		this.detailService = new google.maps.places.PlacesService(this.map);
		this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(this.map);
        this.geocoder = new google.maps.Geocoder;

		this.searchBox.addListener('places_changed', function() {
	    	me.places = me.searchBox.getPlaces();

		    if (me.places.length == 0) {
		      return;
		    }

		    // Clear out the old markers.
		    me.markers.forEach(function(marker) {
		      marker.setMap(null);
		    });
		    

		    me.markers = [];
		    

		    // For each place, get the icon, name and location.
		   	bounds = new google.maps.LatLngBounds();
		   
		   
		    var place = me.places[0];

		    me.currentLat = place.geometry.location.lat();
		    me.currentLng = place.geometry.location.lng();

		    if (!place.geometry) {
		        console.log("Returned place contains no geometry");
		        return;
		    }

		    if (place.geometry.viewport) {
		        // Only geocodes have viewport.
		        bounds.union(place.geometry.viewport);
		    } else {
		        bounds.extend(place.geometry.location);
		    }
		    
		    me.map.fitBounds(bounds);

		    me.search();
	  });

		
  	}
  	document.body.appendChild(this.script);
  }

  search() {
  	var me = this;
  	var pyrmont = new google.maps.LatLng(this.currentLat, this.currentLng);
  	var request = {
	    location: pyrmont,
	    radius: this.radius,
	    type: ['fitness'],
	    query: this.additionalFilter + ' ' + this.searchFitnessService
	};

	// this.isLoading = true;
	this.searchresults = [];

	var service = new google.maps.places.PlacesService(this.map);


	var i = 0;

	me.markers.forEach(function(marker) {
      marker.setMap(null);
    });

    me.markers = [];
    var bounds = new google.maps.LatLngBounds();


	service.textSearch(request, function(results, status, pagination) {
	  	if (status == google.maps.places.PlacesServiceStatus.OK) {

	  		
		    
		    results.forEach(function(place) {
		    	// console.log(place);
		    	i++;

		    	var icon = {
			        url:"https://cdn.mapmarker.io/api/v1/pin?size=120&background=%230C797D&text=" + i + "&color=%23FFFFFF&voffset=2&hoffset=1&", //"assets/pins/number_" + i + ".png",
			        size: new google.maps.Size(150, 150),
			        origin: new google.maps.Point(0, 0),
			        anchor: new google.maps.Point(17, 75),
			        scaledSize: new google.maps.Size(50, 50)
			    };

			    var newMarker = new google.maps.Marker({
			        map: me.map,
			        icon: icon,
			        title: place.name,
			        position: place.geometry.location
			    });

		    	me.markers.push(newMarker);
		    	

		    	newMarker.addListener('click', async function() {
		    	  var img = './assets/images/service.jpg';
		    	  if( place.photos && place.photos.length > 0) {
		    	  	img = place.photos[0].getUrl();
		    	  }

		    	  
			      let placeDeatil : any = await me.getPlaceDetails(place.place_id);
			      var open_hours = '';
			      if(placeDeatil.opening_hours) {
			      	placeDeatil.opening_hours.weekday_text.forEach(t => {
			      		open_hours += t + "<br>";
			      	})
			      }
			      
			      // debugger;
		    	  var contentString = 
		    	  	`<div class="infowindow">
		    	  	 	<div>
		    	  	 		<img class="thumb" src="` + img + `">
		    	  	 	</div>
		    	  	 	<div class="info-item">
		    	  	 		<img class="info-icon" src="./assets/images/pin.svg">
		    	  	 		<div class="info-text">` + placeDeatil.formatted_address +`</div>
		    	  	 	</div>

		    	  	 	<div class="info-item">
		    	  	 		<img class="info-icon" src="./assets/images/open_in_new.svg">
		    	  	 		<a class="info-text" target="_blank" href="`+placeDeatil.website+`">` + placeDeatil.website +`</a>
		    	  	 	</div>
		    	  	 	
		    	  	 	<div class="info-item">
		    	  	 		<img class="info-icon" src="./assets/images/phone.svg">
		    	  	 		<div class="info-text">` + placeDeatil.formatted_phone_number +`</div>
		    	  	 	</div>

		    	  	 	<div class="info-item">
		    	  	 		<img class="info-icon" src="./assets/images/timeline.svg">
		    	  	 		<div class="info-text">` + open_hours +`</div>
		    	  	 	</div>

		    	  	 	<div class="info-item">
		    	  	 		<img class="info-icon" src="./assets/images/bookmark.svg">
		    	  	 		<div class="info-text">Add to my favorite</div>
		    	  	 	</div>
		    	  	</div>`;
		          var infowindow = new google.maps.InfoWindow({
			          content: contentString
			      });
		          infowindow.open(me.map, newMarker);
		        });

		    	if (place.geometry.viewport) {
			        // Only geocodes have viewport.
			        bounds.union(place.geometry.viewport);
			    } else {
			    	bounds.extend(place.geometry.location);
			    }
			    me.map.fitBounds(bounds);

			    // me.searchresults.push({'general': results, 'detail': null});
		    
		    });

		    me.searchresults = me.searchresults.concat(results);

		    console.log(results)

		    if(pagination.hasNextPage) {
		    	pagination.nextPage();
		    }

		    
		    // me.getPlacesDetails();
		}
	});
  }

  select(i) {
  	this.selectedNo = i;
  }

  onChangeAdditionalFilter(value) {
  	if(value == "no") {return;}
  	// alert(this.additionalFilter);
  	this.search();
  }

  changedRadius(value){
  	if(value == "") {return;}
  	this.search();	
  }

  async getPlacesDetails() {
  	var me = this;
  	var count = 0;
  	this.searchresults.forEach(async function(place) {
  		if(place.detail) return true;
  		count ++;
    	var placeDetail = await me.getPlaceDetails(place.place_id);
    	place.detail = placeDetail;
    });

    if(count != 0) {
    	// console.log(count);
    	var timer = setTimeout(function(){ me.getPlacesDetails(); }, 200);
    } else {
    	// console.log(this.searchresults);
    	this.isLoading = false;
    }

  }

  getPlaceDetails(place_id) {
  	var me = this;
  	var request = {
			        placeId: place_id,
			        fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours', 'place_id']
			      };
  	return new Promise((resolve, reject) => {
			me.detailService.getDetails(request, function(place1, status) {
	      	
		        if (status === google.maps.places.PlacesServiceStatus.OK) {
		            
		            resolve(place1);
		        }
		    });    
		});
  }

  directionToHere(to) {
  	var me = this;
  	this.currentToDir = to;

  	this.directionsService.route({
      origin: me.myLocationAddress,
      destination: me.currentToDir,
      travelMode: me.travelMode
    }, function(response, status) {
      if (status === 'OK') {
        me.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  onChangeTravelMode() {
  	if(this.searchresults.length > 0) {
  		this.directionToHere(this.currentToDir)
  	}
  }

}
