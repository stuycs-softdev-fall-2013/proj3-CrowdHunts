function steady(elem) {
	elem.addEventListener('touchstart', function(event){
	    this.allowUp = (this.scrollTop > 0);
	    this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
	    this.prevTop = null; this.prevBot = null;
	    this.lastY = event.pageY;
	});

	elem.addEventListener('touchmove', function(event){
	    var up = (event.pageY > this.lastY), down = !up;
	    this.lastY = event.pageY;

	    if ((up && this.allowUp) || (down && this.allowDown)) event.stopPropagation();
	    else event.preventDefault();
	});
}
function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
		var allArguments = args.concat(Array.prototype.slice.call(arguments));
		return func.apply(this, allArguments);
	};
 }
function TouchManager(tapLength,fingerWidth) {
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
		tapSize: fingerWidth,
		TapEvent: TapEvent,

		init: function() {
			document.addEventListener("touchstart",this.touchStartHandler(),false)
			document.addEventListener("touchend",this.touchEndHandler(),false)
			document.addEventListener("touchmove",this.touchMoveHandler,false)
		},
		touchMoveHandler: function() {
			//console.log(event);
			//$("#description")[0].style.top = event.changedTouches[0].screenY + "px";
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
					var touchInit = {};
					$.extend(touchInit,e.changedTouches.item(i));
					t.touch = touchInit;
								console.log(event.changedTouches[i].screenY);

					//$("#test")[0].innerHTML = this.touches;
					self.touches.push(t);
				}
			}
		},
		isTap: function(touch1,touch2,duration) {
			if(touch1.radiusY == undefined) {
				touch1.radiusY = this.tapSize;
			}
			if(touch1.radiusX == undefined) {
				touch1.radiusX = this.tapSize;
			}
			console.log(touch1.radiusY);
			if(Math.abs(touch1.screenX - touch2.screenX) > touch1.radiusX / 2 || Math.abs(touch1.screenY - touch2.screenY) > touch1.radiusY / 2 || duration > this.tapLength) {
				return false;
			}
			return true;
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
										console.log(touch.touch.screenY);

							var out = self.touches.splice(y,1)[0];

							if(self.isTap(out.touch,e.changedTouches[i],time - touch.start)) {

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
