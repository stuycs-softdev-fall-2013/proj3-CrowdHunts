function main() {
	var canvas = $("#main")
	var sv = new StreetView(canvas[0]);
	var winsize = {
		height: $(window).height(),
		width: $(window).width()
	}
	sv.findStreetView("Eiffel Tower");
	canvas.mousemove(function(e) {
		console.log(e);
		sv.setPov(-1 * e.offsetX / 10,e.offsetY/10,1)
	})
}
$(document).ready(main);