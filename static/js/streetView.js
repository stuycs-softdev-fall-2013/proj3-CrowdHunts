var t;
var canvas = $("#main")[0];
//var context = canvas.getContext("2d");
var apiKey = "AIzaSyDP6aoULMAMJg1uSocCFiNg9rhMiUHyui4";

function StreetView(canvas) {

	var gc = new google.maps.Geocoder();

	var ans =  {
		geocoder: gc,
		canvas: canvas,
		pano:null,

		thisTest: function() {
			console.log(this.getLatLng("Eiffel Tower"));
		},
		setPov: function(h,p,z) {
			if(this.pano != null) {
				this.pano.setPov({
					heading: h,
					pitch: p,
					zoom: z,
				})
			}
			return this.pano;
		},

		findStreetView: function(location) {
			var self = this;
			this.getLatLng(location,function(result) {
				self.pano = self.getStreetViewContainer(result.d,result.e);
			})
		},
		getStreetViewContainer: function(lat,lng) {
			var loc = new google.maps.LatLng(lat,lng);
			var panoOptions = {
				position: loc,
				pov: { 
					heading: 0,
					pitch: 0,
				},
				zoom:1
			}

			var pano = new google.maps.StreetViewPanorama(
				this.canvas,
				panoOptions
			);
			pano.setVisible(true);
			return pano;
		},
		getLatLng: function(location,callback) {
			gc.geocode({address: location},function(results,status) {
				callback(results[0].geometry.location,status)
			});
			return 1
		},

		getStreetView: function(location,fov,heading,pitch,apiKey) {
			var img = new Image();
			img.src = "http://maps.googleapis.com/maps/api/streetview?heading=" + heading + "&pitch=" + pitch + "&size=600x400&fov=" + fov + "&location=" + location + "&sensor=false&key=" + apiKey;
			return img;
		}
	}
	return ans;
}

function initImages(location) {
	var h = 0;
	var fov = 120;
	var vov = 90;
	var mult = 60;
	while(h < 360/fov) {
		var p = 0;
		var father = document.createElement('div');
		father.className = "vertical";
		while(mult* p - vov <= vov) {
			var container = document.createElement('div');
			container.className = "container"
			var img = getStreetView(location,fov,h * fov,p * mult - vov,apiKey);
			console.log(apiKey);
			container.appendChild(img);
			father.appendChild(container);
			p++;
		}
		document.body.appendChild(father);
		h++;
	}
}
