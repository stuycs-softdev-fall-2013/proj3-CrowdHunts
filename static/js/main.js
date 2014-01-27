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
	$('#test')[0].innerHTML = window.orientation;
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

var ax = 0;
var ay = 0;
var az = 0;
 window.addEventListener('devicemotion', function () {
        //$('#test')[0].innerHTML = " " + event.acceleration.x * 2 + " " + event.acceleration.y * 2;
		var landscapeOrientation = window.innerWidth/window.innerHeight > 1;

		e = event.accelerationIncludingGravity;
		var weight = 2;
		ax = e.x//process(ax,e.x * 5);
		ay = process(ay,e.y * 5);
		az =  process(az,e.z * 5);
		az = parseInt(az* 100) / 100;
		$("#test")[0].innerHTML = az + "   " + ay + "   " + ax;
		vx += ax;
		vy += ay;
		vz += az;
		vx *= .98;
		vy *= .98;
		vz *= .98;

		y += vy/50;
		x += vx/50;
		ax *= 10000;
		ax = parseInt(ax);
		ax /= 2000;
		if(landscapeOrientation){
			glob.setPov(2 * ay,az,1);
		}
		else {
			glob.setPov(az,2 * ay,1);
		}
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
