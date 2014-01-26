var goalLon;
var goalLat;
var requests = function() {
    var goal = function() {
	navigator.geolocation.getCurrentPosition(function (p) {
            var req = $.get({
		url:'/jax/goal',
                data: {'lat':p.coords.latitude,
		       'lon':p.coords.longitude}
            })
	    console.log(req)
	    req.done(function(p) {
		goalLon = p.lon
		goalLat = p.lat
		console.log(p)
	    })
        });
    }
    var streetview = function(lat, lon) {
	$.get({
	    url:'/jax/streetview',
	    data:{lat:lat, lon:lon}
	})
    }
    return {
	goal: goal,
	streetview: streetview
    }
}()
