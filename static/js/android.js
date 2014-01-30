// env.streetview.setPov(h, p, z)
// env.touchManager.touches.length
if (isMobile.Android()) {
    var movPov = function() {
	if (env.touchManager.touches.length == 2) {
	    var sview = env.streetView
	    var pov = sview.pano.getPov()
	    var heading = pov.heading
	    heading += event.detail.instantaneous.distance.x/5
	    var pitch = pov.pitch
	    pitch -= event.detail.instantaneous.distance.y/5
	    sview.setPov(heading, pitch, 1)
	}
    }
    $(document).on('drag', movPov)
    $(document).on('swipe', movPov)
}
