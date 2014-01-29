var t;
var canvas = $("#main")[0];
//var context = canvas.getContext("2d");
var apiKey = "AIzaSyDP6aoULMAMJg1uSocCFiNg9rhMiUHyui4";

function closestVal(heading,headingList) {
	var i = 0;
	var ans = 360;
	var index = 0;
	for(i = 0; i < headingList.length;i++) {
		console.log(headingList[i]);
		var t = headingList[i]
		if(t > 180) {
			t -= 180
		}
		if(Math.abs(heading - t) < ans) {
			ans = t;
			index = i;
		}
	}
	return {index:index,val:ans};
}

function StreetView(canvas,radius) {

	var gc = new google.maps.Geocoder();
	var service = new google.maps.StreetViewService();

	var ChangeLocationEvent = function(oldPid,cPid) {
		return new CustomEvent("locationchange",{
			detail: {
				pano: {
					old:oldPid,
					current:cPid
				}
			},
			bubbles:true
		})
	}

	var ans =  {
		geocoder: gc,
		canvas: canvas,
		
		pano:null,
		data:null,
		radius:radius,
		service: service,
		locationEvent: function(oldId,newId) {
			var e = new ChangeLocationEvent(oldId,newId);
			document.dispatchEvent(e);
			console.log(e);
		},
		initStreetView: function(lat,lng) {
			this.pano = this.getStreetViewContainer(lat,lng);
			console.log("pano initialized");
			this.locationEvent(null,this.pano.getPano());
		},
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
				self.loadStreetView(result.d,result.e);
			})
		},
		select: function(link) {
			var oldId = this.pano.getPano()
			var cId = link.pano;
			if(oldId != cId) {
				this.locationEvent(oldId,cId);
			}
			this.pano.setPano(cId);
		},
		transitionTarget: function(lat,lng) { //requires pano data for current pano
			var links = this.pano.getLinks();
			if(links != undefined) {
				var i = 0;
				var dir = this.direction(lat,lng);
				console.log(dir);
				var headings = [];

				for(i =0; i < links.length;i++) {
					headings.push(links[i].heading);
				}

				var res = closestVal(dir.heading,headings)

				return links[res.index];
			}
			return null;
		},
		direction: function(lat,lng) {
			var loc = this.pano.getPosition();
			var cLat = loc.lat();
			var cLng = loc.lng();

			var w = cLat - lat;
			var h = cLng - lng;

			var out = Math.sqrt(Math.pow(w,2) + Math.pow(h,2));
			var heading = Math.acos(-w/out);
			heading = heading * 180 / Math.PI
			return {distance:out,heading:heading};
		},
		closestHeading: function(headingList) {
			return closestVal(this.pano.getPov().heading,headingList);
		},
		getData: function(lat,lng,rad,callback) {
			var loc = new google.maps.LatLng(lat,lng);
			var self = this;
			this.service.getPanoramaByLocation(loc,rad,function(p) {
				self.data = p;
				callback(p);
			})
		},
		loadStreetView: function(lat,lng) {
			this.getData(lat,lng,this.radius,function(p) {
				this.select(p.location.pano);
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
				zoom:0,

				addressControl:false,
				disableDefaultUI:true,
				disableDoubleClickZoom:true,
				scrollwheel:false,
				zoomControl:false,
				linksControl:false,

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
		},
		enableOrientationControls: function() {
			if(window.DeviceOrientationEvent) {
				window.addEventListener("deviceorientation", this.compassChange(),true)
			}
			window.addEventListener("devicemotion",this.gyroChange(),true);

		},
		compassChange: function() {
			var self = this;
			return function(e) {
				if(self.pano != undefined) {
					var pitch = self.pano.getPov().pitch;
					var heading = process(self.pano.getPov().heading,event.webkitCompassHeading);
				    if (heading == undefined)
					heading = self.pano.getPov().heading;
					self.setPov(heading,pitch,1);
				}
			}
		},
		gyroChange: function() {
			var self = this;
			return function(e) {
				if(self.pano != undefined) {
					var modifier = 1;
					if(isMobile.Android()) {
						modifier = -1;
					}

					var e = event.accelerationIncludingGravity;
					var pitch = 180 * Math.atan(e.z / Math.sqrt(Math.pow(e.y,2) + Math.pow(e.x,2))) / Math.PI;
					var oP = self.pano.getPov().pitch;
					oP += (pitch - oP) / 10
					var heading = self.pano.getPov().heading;
					self.setPov(heading,modifier * oP,1);
				}
			}
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
