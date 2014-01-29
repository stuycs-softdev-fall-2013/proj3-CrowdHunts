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
	var recent = [];

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
	var DragEvent = function(distances,inst,duration,touchInit,touchCurrent) {
		return new CustomEvent("drag",
		{
			detail: {
				distances:distances,
				instantaneous: inst,
				speed: {
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
	var SwipeEvent = function(distances,inst,duration,touchInit,touchCurrent) {
		return new CustomEvent("swipe",
		{
			detail: {
				distances:distances,
				instantaneous:inst,
				speed: {
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
		recentTouches: {},
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
		sendDragEvent: function(duration,time,touch1,touchRecent,touch2) {
			var distance = {
				x: 	touch1.screenX - touch2.screenX,
				y: 	touch1.screenY - touch2.screenY 
			}
			var change = {
				x: touchRecent.screenX - touch2.screenX,
				y: touchRecent.screenY - touch2.screenY
			}
			var xD = touchRecent.screenX - touch2.screenX;			
			var yD = touchRecent.screenY - touch2.screenY;

			var vX = (touchRecent.screenX - touch2.screenX)/(time - touchRecent.time);
			var vY = (touchRecent.screenY - touch2.screenY)/(time - touchRecent.time);

			var adjustment = -360 * (Math.abs(yD)/(yD) - 1)/2 + -180 * (Math.abs(xD)/xD - 1)/2
			var inst = {
				angle:180 * Math.atan(yD/xD)/Math.PI + adjustment,
				distance: {
					x: xD,
					y: yD
				},
				duration:time - touchRecent.time,
				speed: {
					vx: vX,
					vy: vY
				}
			}
			var e = new DragEvent(distance,inst,duration,touch1,touch2);
			console.log(e);
			touch1.target.dispatchEvent(e);
			return e;
		},
		sendSwipeEvent: function(duration,time,touch1,touchRecent,touch2) {
			var distance = {
				x: 	touch1.screenX - touch2.screenX,
				y: 	touch1.screenY - touch2.screenY 
			}
			var change = {
				x: touchRecent.screenX - touch2.screenX,
				y: touchRecent.screenY - touch2.screenY
			}
			var xD = touchRecent.screenX - touch2.screenX;			
			var yD = touchRecent.screenY - touch2.screenY;

			var vX = (touchRecent.screenX - touch2.screenX)/(time - touchRecent.time);
			var vY = (touchRecent.screenY - touch2.screenY)/(time - touchRecent.time);

			var inst = {
				angle:180 * Math.atan2(yD,xD)/Math.PI + 180,
				distance: {
					x: xD,
					y: yD
				},
				duration:time - touchRecent.time,
				speed: {
					vx: vX,
					vy: vY
				}
			}
			var e = new SwipeEvent(distance,inst,duration,touch1,touch2);
			//console.log(e);
			touch1.target.dispatchEvent(e);
			return e;
		},
		isSwipe: function(touch1,touch2,duration) {
			var xSpeed = speed(touch1.screenX,touch2.screenX,duration);
			var ySpeed = speed(touch1.screenY,touch2.screenY,duration);

			return Math.abs(xSpeed) >= this.swipeSpeed || Math.abs(ySpeed) >= this.swipeSpeed //|| Math.sqrt(Math.pow(xSpeed,2) + Math.pow(ySpeed,2)) >= this.swipeSpeed;
		},
		isDrag: function(touch1,touch2,duration) {
			var xSpeed = speed(touch1.screenX,touch2.screenX,duration);
			var ySpeed = speed(touch1.screenY,touch2.screenY,duration);
			return !this.isTap(touch1,touch2,duration) && Math.sqrt(Math.pow(xSpeed,2) + Math.pow(ySpeed,2)) < this.swipeSpeed;
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
		findTouch: function(id,touchList) {
			var i =0;
			for(var i = 0; i < touchList.length;i++) {
				if(id == touchList[i].identifier) {
					return i;
				}
			}
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
		touchListMap: function(touchList,func) {
			for(var i = 0; i < touchList.length; i++) {
				func(touchList[i],i,this)
			}
		},
		setRecentTouches: function(touchList,time) {
			this.recentTouches = {};
			this.recentTouches.length = 0;
			this.touchListMap(touchList, function(item,index,self) {
				self.recentTouches.length++;
				self.recentTouches[index] = {
					screenX:item.screenX,
					screenY:item.screenY,
					time:time,
					identifier:item.identifier
				}
			});
		},
		touchStartHandler: function() {
			var self = this;
			return function(e) {
				console.log("touch detected");
				var time = new Date().getTime();
				self.setRecentTouches(e.touches,time);
				//preventDefault();
				for(var i = 0; i < e.changedTouches.length;i++) {
					//$("#test")[0].innerHTML += "Math.random()" + time;
					/*if(isMobile.Android()) {
						if(e.changedTouches[i].target.tagName != "INPUT" && e.changedTouches[i].target.tagName != "TEXTAREA") {
							event.preventDefault();

						}
					}*/

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

				event.preventDefault();

				var time = new Date().getTime();
				self.mapToMatchingTouches(e.changedTouches,e,function(e,i,y) {
					var moved = self.touches[y];
					var newT = e.changedTouches[i];
					var recent = self.recentTouches[self.findTouch(moved.touch.identifier,self.recentTouches)]; 

					var duration = time - moved.start;
					if(self.isDrag(moved.touch,newT,duration)) {
						self.sendDragEvent(duration,time,moved.touch,recent,newT);
					}
					if(self.isSwipe(moved.touch,newT,duration)) {
						self.sendSwipeEvent(duration,time,moved.touch,recent,newT);
					}

				})
				self.setRecentTouches(e.touches,time);

			}
			//console.log(event);
			//$("#description")[0].style.top = event.changedTouches[0].screenY + "px";
		},
		touchEndHandler: function(e) {
			var self = this;
			return function(e) {
				var time = new Date().getTime();
				self.mapToMatchingTouches(e.changedTouches,e,function(e,i,y) {
							self.setRecentTouches(e.touches,time);

							var out = self.touches.splice(y,1)[0];

							if(self.isTap(out.touch,e.changedTouches[i],time - out.start)) {

								self.sendTapEvent(out.touch,time-out.start);
							}
							
							y--;
				})
			}
		}
	}



	return ans;
}
