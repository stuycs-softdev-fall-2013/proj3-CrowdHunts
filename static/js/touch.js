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
function speed(x1,x2,duration) {
	return (x1-x2)/duration;
}

function TouchManager(tapLength,fingerWidth,swipeSpeed) {
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

	/*var SwipeEvent = function(distance,initTime,touch1,touch2) {
		return new CustomEvent("swipe",
			{
				detail: {
					start:initTime,
					touches: {
						initial:touch1,
						end:touch2
					}
				}
				bubbles:true,
				cancelable:false
			})
	}*/
	var DragEvent = function(distances,duration,touchInit,touchCurrent) {
		return new CustomEvent("drag",
		{
			detail: {
				distances:distances,
				speeds: {
					xv: distances.x / duration,
					yv: distances.y / duration
				},
				time:duration,
				touches: {
					init:touchInit,
					current:touchCurrent
				}
			},
			bubbles:true,
			cancelable:false
		})
	}


	var ans = {
		touches: [],
		tapLength: tapLength,
		tapSize: fingerWidth,
		swipeSpeed: swipeSpeed,
		TapEvent: TapEvent,

		init: function() {
			document.addEventListener("touchstart",this.touchStartHandler(),false)
			document.addEventListener("touchend",this.touchEndHandler(),false)
			document.addEventListener("touchmove",this.touchMoveHandler(),false)
		},

		sendTapEvent: function(touch,duration) {
			var e = new TapEvent(touch,duration);
			console.log(e);
			touch.target.dispatchEvent(e);
			return e;
		},
		sendDragEvent: function(duration,touch1,touch2) {
			var distance = {
				x: 	touch1.screenX - touch2.screenX,
				y: 	touch1.screenY - touch2.screenY 
			}
			var e = new DragEvent(distance,duration,touch1,touch2);

			//console.log(e);
			touch1.target.dispatchEvent(e);
			return e;
		},

		isDrag: function(touch1,touch2,duration) {
			var xSpeed = speed(touch1.screenX,touch2.screenX,duration);
			var ySpeed = speed(touch1.screenY,touch2.screenY,duration);
			console.log(ySpeed);
			return !this.isTap(touch1,touch2,duration) && Math.abs(xSpeed) < this.swipeSpeed && Math.abs(ySpeed) < this.swipeSpeed;
		},
		isTap: function(touch1,touch2,duration) {
			if(touch1.radiusY == undefined) {
				touch1.radiusY = this.tapSize;
			}
			if(touch1.radiusX == undefined) {
				touch1.radiusX = this.tapSize;
			}
			if(Math.abs(touch1.screenX - touch2.screenX) > touch1.radiusX / 2 || Math.abs(touch1.screenY - touch2.screenY) > touch1.radiusY / 2 || duration > this.tapLength) {
				return false;
			}
			return true;
		},
		mapToMatchingTouches: function(touchList,e,func) {
			for(var i = 0; i < touchList.length;i++) {
					var target = touchList[i]
					for(var y = 0; y < this.touches.length;y++) {

						var touch = this.touches[y];
						if(touch.touch.identifier == target.identifier) {
							func(e,i,y);
						}
					}
				}
		},
		touchStartHandler: function() {
			var self = this;
			return function(e) {
				console.log("touch detected");
				event.preventDefault();

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

					//$("#test")[0].innerHTML = this.touches;
					self.touches.push(t);
				}
			}
		},
		touchMoveHandler: function() {
			var self = this;
			return function(e) {
				console.log("checking for drag");

				event.preventDefault();

				var time = new Date().getTime();
				self.mapToMatchingTouches(e.changedTouches,e,function(e,i,y) {
					var moved = self.touches[y];
					var newT = e.changedTouches[i];
					var duration = time - moved.start;
					if(self.isDrag(moved.touch,newT,duration)) {
						self.sendDragEvent(duration,moved.touch,newT);
					}

				})
			}
			//console.log(event);
			//$("#description")[0].style.top = event.changedTouches[0].screenY + "px";
		},
		touchEndHandler: function(e) {
			var self = this;
			return function(e) {
				var time = new Date().getTime();
				self.mapToMatchingTouches(e.changedTouches,e,function(e,i,y) {
							
							var out = self.touches.splice(y,1)[0];

							if(self.isTap(out.touch,e.changedTouches[i],time - out.start)) {

								self.sendTapEvent(out.touch,time-out.start);
							}
							if(self.isDrag(out.touch,e.changedTouches[i],time-out.start)) {
								self.sendDragEvent(time-out.start,out.touch,e.changedTouches[i]);	
							}
							y--;
				})
			}
		}
	}



	return ans;
}
