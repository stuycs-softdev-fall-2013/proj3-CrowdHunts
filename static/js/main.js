var glob;
var running = true;
var vx = 0;
var vy = 0;
var vz = 0;
var y = 0;
var x = 0;
function main() {
	var canvas = $("#main")
	var sv = new StreetView(canvas[0]);
	var winsize = {
		height: $(window).height(),
		width: $(window).width()
	}
	sv.findStreetView("Eiffel Tower");
	sv.setPov(0,0,0);
	glob = sv;

	navigatorLoop();
	//$('#test')[0].innerHTML = window.orientation;
	/*canvas.mousemove(function(e) {
		console.log(e);
		sv.setPov(-1 * e.offsetX / 10,e.offsetY/10,1)
	})*/
}

function navigatorLoop() {

	navigator.geolocation.getCurrentPosition(function (p) {
		if(glob.direction(p).distance > 5) {
			glob.select(glob.transitionTarget(p.coords.latitude,p.coords.longitude))
		}
		if(running) {
			navigatorLoop();
		}
	})
}
$(document).ready(main);
$(document).on("tap", function() {
	$('#test')[0].innerHTML = window.orientation + "ko";
})

function process(oldV,newV) {
	var weight = 2;
	var out = (oldV * weight + newV)/(1 + weight);
	out = parseInt(out * 100) / 100;
	return out;
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

var ax = 1;
var ay = 1;
var az = 1;
window.addEventListener("deviceorientation", function() {
	$("#test")[0].innerHTML = "zebra" + event.beta + "<br /> " + event.alpha + "<br />" + event.gamma
	var mode = -2 * (event.gamma < -90) + 1
	glob.setPov(event.webkitCompassHeading,mode*(event.beta - 90),1);
},true);

window.addEventListener("devicemotion", function() {
	var e = event.accelerationIncludingGravity
	//$("#test")[0].innerHTML = "ax: " + e.x + "<br /> ay: " + e.y + "<br /> az: " + e.z
},true);
/*
 window.addEventListener('devicemotion', function () {
        //$('#test')[0].innerHTML = " " + event.acceleration.x * 2 + " " + event.acceleration.y * 2;
		var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
	var e = event.accelerationIncludingGravity




		e = event.accelerationIncludingGravity;
		b = event.acceleration;
		r = event.rotationRate;
		var weight = 2;
		/*ax = e.x//process(ax,e.x * 5);
		ay =  180 * Math.asin(b.y/(e.y)) / Math.PI;
		pitch = 180 * Math.atan(e.y/Math.sqrt(Math.pow(e.x,2) + Math.pow(e.z,2))) / Math.PI
		heading = 180 * Math.atan(e.z/Math.sqrt(Math.pow(e.x,2) + Math.pow(e.y,2))) / Math.PI
		roll = 180 * Math.atan(e.x/Math.sqrt(Math.pow(e.z,2) + Math.pow(e.y,2))) / Math.PI
		*//*
		var res = rotation({roll:ay,pitch:ax,yaw:az},{alpha:b.y,beta:b.x,gamma:b.z}) / Math.PI;
		ay = res.roll;
		ax = res.pitch;
		az = res.yaw;

		$("#test")[0].innerHTML =  ax;
		glob.setPov(1 ,e.y,1);
    }, true);
 /*window.addEventListener("deviceorientation", function () {
 	if(iBeta == null && !isNaN(event.beta)) {
 		iBeta = event.beta;
 	}
 	if(iGamma == null && !isNaN(event.gamma)) {
 		iGamma = event.gamma;
 	}
 	//iBeta += event.beta;
 	//iGamma += event.gamma;
    $("#test")[0].innerHTML = event.alpha + "cvv<br />" + (iBeta - event.beta) +"<br />"+ (iGamma - event.gamma);
     
    //glob.setPov(iGamma - event.gamma,event.beta - iBeta,1);
}, true);*/
