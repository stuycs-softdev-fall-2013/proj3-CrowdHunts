var goalLon;
var goalLat;
var requests = function() {
    var goal = function() {
	$("#goal").html('<i>Loading location...</i>')
	navigator.geolocation.getCurrentPosition(function (p) {
	    $("#goal").html('<i>Loading image...</i>')
            var req = $.ajax({
		url:'/jax/goal',
                data: {'lat':p.coords.latitude,
		       'lon':p.coords.longitude}
            })
	    req.done(function(ret) {
		if ('error' in ret) {
		    $("#goal").text('Error: '+ ret.error)
		} else {
		    var goalLon = ret.lon
		    var goalLat = ret.lat
		    var goalimage = ret.pic

		    // this doesn't work 
		    $("#goal").html('<img src="data:image/png;base64,'+goalimage+'"/>')
		    console.log(ret)
		}
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
