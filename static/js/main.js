var glob;
var running = false;
var vx = 0;
var vy = 0;
var vz = 0;
var y = 0;
var x = 0;
var glTM;
var env;
function main(p) {
	var canvas = $("#main")
	running = true;
	var sv = new StreetView(canvas[0]);
	var winsize = {
		height: $(window).height(),
		width: $(window).width()
	}
	sv.loadStreetView(p.coords.latitude,p.coords.longitude);
	sv.setPov(0,0,0);
	sv.enableOrientationControls();
	glob = sv;
	tM = new TouchManager(150,20,.75);
	tM.init();
	glTM = tM;
	enableBasicUI();
	var ans = {
		streetView:sv,
		touchManager:tM,
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
					self.navigatorLoop();
				}
			}
			navigator.geolocation.getCurrentPosition(partial());
		},

	}
	return ans;
}
function enableBasicUI() {
    $('.scrollable').on("drag",function() {
    	var e = event
    	var top = jQuery(this).scrollTop();
    	jQuery(this).scrollTop(top + e.detail.instantaneous.distance.y);
    })
    $('input,textarea').on("tap",function() {
    	this.focus();
    	this.select();
    })
    $('.swipe-left').on("swipe",function() {
    	var e = event;
    	var max = true;
    	if(!this.style.left) {
    		this.style.left = "0";
    	}
    	if(this.getAttribute('max')) {
    		max = (-1 * parseInt(this.style.left) / 100 < parseInt(this.getAttribute('max')));
    	}
    	console.log(this.getAttribute('max'));
    	console.log(max);
    	if(max && (this.swipeLeft == undefined|| this.swipeLeft != true)) {
	    	if(Math.abs(e.detail.instantaneous.angle - 175) < 10) {
	    		if(this.swipeLeft == undefined || this.swipeLeft != true) {
	    			this.swipeLeft = true
	    		} 
	    		var left = parseInt(this.style.left);
	    		left -= 100;

	    		this.style.left = left + "%";
	    	}
	    }
	    console.log(this.swipeLeft);
    	console.log(e.detail.instantaneous.angle)
    	/*if(e.detail.instantaneous.direction.x < 0) {
    		this.style.left = "-100%";
    	}*/
    })
    $('.swipe-left').on("touchend",function() {
    	if(this.swipeLeft && this.swipeLeft != undefined) {
    		this.swipeLeft = false;
    	}
    })
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
		//env.navigatorLoop();
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







