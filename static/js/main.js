var env;
function main(p) {
	var canvas = $("#main")
	running = true;
	var sv = new StreetView(canvas[0]);
	var winsize = {
		height: $(window).height(),
		width: $(window).width()
	}
	sv.initStreetView(p.coords.latitude,p.coords.longitude);
	sv.setPov(0,0,0);
    if (!isMobile.Android())
	sv.enableOrientationControls();
	tM = new TouchManager(150,20,.75);
	tM.init();
	var ui = new TouchUI();
	ui.init();
	var ans = {
		streetView:sv,
		touchManager:tM,
		UI: ui,
		running:true,

		navigatorLoop: function() {
			var self = this;
			function partial() {
				return function(p){
					console.log(p)
					if(self.streetView.pano != undefined && self.streetView.direction(p.coords.latitude,p.coords.longitude).distance > .000005) {
						var nextView = self.streetView.transitionTarget(p.coords.latitude,p.coords.longitude);
						if(nextView != undefined) {
							self.streetView.select(nextView);
						}
					}
					console.log(self);
					console.log("new loop:");
					self.navigatorLoop();
				}
			}
			navigator.geolocation.getCurrentPosition(partial());
		},

	}
	return ans;
}


function navigatorLoop() {
	navigator.geolocation.getCurrentPosition(function (p) {
		console.log(p)
		if(glob.direction(p.coords.latitude,p.coords.longitude).distance > .005) {
			glob.select(glob.transitionTarget(p.coords.latitude,p.coords.longitude))
		}
		navigatorLoop();
	})
}
$(document).ready(function() {
	navigator.geolocation.getCurrentPosition(function (p) {
		env = main(p);

		env.navigatorLoop();
		$(document).on("locationchange",function() {
			console.log(event);

		})
		var e = new CustomEvent("envready");
		document.dispatchEvent(e);

	})

});



/*$(window).on("touchstart", function() {
	$('#test')[0].innerHTML = "bowk";
},true)
*/
function process(oldV,newV) {
	var out = newV;
	return out 
}

function rotation(oldAngles,gyro) {
	var a = gyro.alpha
	var b = gyro.beta
	var g = gyro.gamma

	var r = oldAngles.roll
	var p = oldAngles.pitch
	var y = oldAngles.yaw

	var newR = r *Math.cos(a) * Math.cos(b) + p * (Math.cos(a) * Math.sin(b) * Math.sin(g) - Math.sin(a) * Math.cos(g)) + y *(Math.cos(a) * Math.sin(b) * Math.cos(g) + Math.sin(a) * Math.sin(g))
	var newP = r *Math.sin(a) * Math.cos(b) + p * (Math.sin(a) * Math.sin(b) * Math.sin(g) + Math.cos(a) * Math.cos(g)) + y *(Math.sin(a) * Math.sin(b) * Math.cos(g) - Math.cos(a) * Math.sin(g))
	var newY = r * -Math.sin(b) + p * (Math.cos(b) * Math.sin(g) ) + y *(Math.cos(b) * Math.cos(g));
	return {roll:newR,pitch:newP,yaw:newY}
}





//steady($("#container")[0]);
	//steady($("#description")[0]);
	//steady(canvas[0]);
	//glTM = tM;
	//$(document).bind("touchmove",false);
//	$(document).on('touchmove', function (e) {
  //       e.preventDefault();
//	 });
	//example code
	/*
	var desc = $("#description");
	desc.on("drag", function() {
		console.log("received")
		var elem = $("#body")
		console.log(event.detail.speeds);
		elem.scrollTop(elem.scrollTop() + event.detail.instantaneous.distance.y);
	})
	$("#body").on("tap",function() {
	})
	$(document).on("swipe",function() {
		var t = $("#description")[0].style.top;
		var e = event;
		if(- e.detail.instantaneous.speed.vy > 0) {
			t = "0%";
			$("#description")[0].style.top = "0%";			
		} else {
			t = "-30%";
			$("#description")[0].style.top = "-30%";
		}
		//$("#test")[0].innerHTML = "tapped" + Math.random();
	})
*/
	//navigatorLoop();







