var requests = function() {
    var goal = function() {
	
    }
    var streetview = function(lat, lon) {
	$.get({
	    url:'/jax/streetview',
	    data:{lat:lat, lon:lon},
	})
    }
    return {
	goal: goal,
	streetview: streetview
    }
}
