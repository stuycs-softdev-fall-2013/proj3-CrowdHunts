var glob;
var running = false;
var vx = 0;
var vy = 0;
var vz = 0;
var y = 0;
var x = 0;
var glTM;
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
	tM = new TouchManager(150,20,.8);
	tM.init();
	glTM = tM;

	//steady($("#container")[0]);
	//steady($("#description")[0]);
	//steady(canvas[0]);
	//glTM = tM;
	//$(document).bind("touchmove",false);
	$(document).on('touchmove', function (e) {
         e.preventDefault();
	 });
	$("#description").on("drag", function() {
		$("#body")[0].scrollTop = -event.detail.distances.y + "px";
	})
	document.addEventListener("tap",function() {
		var t = $("#description")[0].style.top;
		if(t == "-30%") {
			t = "0%";
			$("#description")[0].style.top = "0%";			
		} else {
			t = "-30%";
			$("#description")[0].style.top = "-30%";
		}
		console.log($("#description")[0].style.top);
		//$("#test")[0].innerHTML = "tapped" + Math.random();
	},false)
	//navigatorLoop();
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
		main(p);

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













