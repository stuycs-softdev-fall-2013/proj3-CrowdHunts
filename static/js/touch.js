function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
		var allArguments = args.concat(Array.prototype.slice.call(arguments));
		return func.apply(this, allArguments);
	};
 }
function TouchManager(tapLength) {
	var touches = [];

	var TapEvent = function(touch,duration) {
		return new CustomEvent("tap",
			{
				detail: {
					Touch:touch,
					duration:duration
				},
				bubbles: true,
				cancelable: false
			}
		)
	}

	var ans = {
		touches: [],
		tapLength: tapLength,
		TapEvent: TapEvent,

		init: function() {
			document.addEventListener("touchstart",this.touchStartHandler(),false)
			document.addEventListener("touchend",this.touchEndHandler(),false)
		},
		sendTapEvent: function(touch,duration) {
			var e = new TapEvent(touch,duration);
			console.log(e);
			document.dispatchEvent(e);
			return e;
		},
		touchStartHandler: function() {
			var self = this;
			return function(e) {
				var time = new Date().getTime();
				for(var i = 0; i < e.changedTouches.length;i++) {
					//$("#test")[0].innerHTML += "Math.random()" + time;

					var t = {
						start:time,
						touch:null
					};
					t.touch = e.changedTouches.item(i);
					//$("#test")[0].innerHTML = this.touches;
					self.touches.push(t);
				}
			}
		},
		touchEndHandler: function(e) {
			var self = this;
			return function(e) {
				var time = new Date().getTime();

				for(var i = 0; i < e.changedTouches.length;i++) {
					var destroyed = e.changedTouches[i]
					for(var y = 0; y < self.touches.length;y++) {

						var touch = self.touches[y];
						if(touch.touch.identifier == destroyed.identifier) {
							var out = self.touches.splice(y,1)[0];
							if(time - touch.start < tapLength) {
								self.sendTapEvent(out.touch,time-out.start);
							}
							y--;
						}
					}
				}
			}
		}
	}



	return ans;
}
