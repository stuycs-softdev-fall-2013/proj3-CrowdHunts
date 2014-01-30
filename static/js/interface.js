function TouchUI() {
	var FrameView = function(source) {
		return new CustomEvent("viewframe",{
			detail:{
				sourceFrame:source
			},
			bubbles:true,
			cancelable:false
		})
	}
	var UI = {
		angleError:10,
		setFrame: function(context,frameNum) {
			var oldFrame = this.getFrame(context);
			context.setAttribute("xFrame",frameNum.x);
			context.setAttribute("yFrame",frameNum.y);
			context.style.left = -100 * frameNum.x + "%";
			context.style.top = -100 * frameNum.y + "%";

			this.openFrame(context,oldFrame,frameNum);
			return oldFrame;
		},
		setView: function(view,x,y) {
			var source = getFrame(context);

		},
		getFrame: function(context) {
			var x = parseInt(context.getAttribute("xFrame"));
			var y = parseInt(context.getAttribute("yFrame"));
			if(isNaN(x)) x = 0;
			if(isNaN(y)) y = 0;
			var ans = {x:x,y:y}
			return ans;
		},
		openFrame: function(context,frameSource,frameNum) {
			var frames = $(context).children('.frame[x='+frameNum.x+'][y='+frameNum.y+']');
			frames.map(function(i,elem) {
				var e = new FrameView(frameSource);
				frames[i].dispatchEvent(e);
				console.log(e);
			})
		},
		getDir: function(angle,error) {
			ans = {};
			if(angle < error || angle > 360 - error) {
				ans.dir = "right";
				ans.mod =  {
					x:-1,
					y:0
				};
				return ans;
			}
			if(Math.abs(angle-90) < error) {
				ans.dir = "up";
				ans.mod = {
					x:0,
					y:1
				};
				return ans;
			}
			if(Math.abs(angle-180) < error) {
				ans.dir =  "left";
				ans.mod = {
					x:1,
					y:0
				};
				return ans;
			}
			if(Math.abs(angle-270) < error) {
				ans.dir = "down";
				ans.mod = {
					x:0,
					y:-1
				};
				return ans;
			}
		},
		swipeView: function(view,dir) {
	    	if(view.getAttribute(dir.dir + "Swipe") != "true") {
	    		var pos = this.getFrame(view);
		    	var lim = true;
		    	if(view.hasAttribute(dir.dir + "Bound")) {
		    		lim = dir.mod.x ? dir.mod.x * pos.x < dir.mod.x * parseInt(view.getAttribute(dir.dir + "Bound")) : dir.mod.y * pos.y < dir.mod.y * parseInt(view.getAttribute(dir.dir + "Bound"));
		    	}
		    	if(lim) {
		    		view.setAttribute(dir.dir + "Swipe",true);
		    		var frame = {
		    			x:pos.x + dir.mod.x,
		    			y:pos.y + dir.mod.y
		    		}
		    		this.setFrame(view,frame);
		    	}

		    }
	    },
	    killSwipes: function(view) {
    		view.setAttribute("downSwipe",false)
    		view.setAttribute("upSwipe",false)
    		view.setAttribute("leftSwipe",false)
    		view.setAttribute("rightSwipe",false)
	    },
		init: function() {
			var self = this;
			$('.scrollable, textarea').on("drag",function() {
		    	var e = event
		    	var top = jQuery(this).scrollTop();
		    	jQuery(this).scrollTop(top + e.detail.instantaneous.distance.y);
		    })
		    $('input,textarea').on("tap",function() {
		    	this.focus();
		    	this.select();
		    })
		    $('.vCentered').map(function(i,elem) {
		    	var lineHeight = $(elem).parent().height();
		    	elem.style.lineHeight = lineHeight + "px";
		    })
		    
		    $('.swipeable.left').on("swipe",function() {
		    	var angle = event.detail.instantaneous.angle;
		    	dir = self.getDir(angle,self.angleError);
		    	if(dir && dir.dir == "left") {
			    	console.log("view left swiped");
		    		self.swipeView(this,dir);
		    	}
		    })
		    $('.swipeable.right').on("swipe",function() {
		    	var angle = event.detail.instantaneous.angle;
		    	dir = self.getDir(angle,self.angleError);
		    	if(dir && dir.dir == "right") {
		    		self.swipeView(this,dir);
		    	}
		    })
		    $('.swipeable.up').on("swipe",function() {
		    	var angle = event.detail.instantaneous.angle;
		    	dir = self.getDir(angle,self.angleError);
		    	if(dir && dir.dir == "up") {
		    		console.log(angle);
		    		console.log("up swipe");
		    		self.swipeView(this,dir);
		    	}
		    })
		    $('.swipeable.down').on("swipe",function() {
		    	var angle = event.detail.instantaneous.angle;
		    	dir = self.getDir(angle,self.angleError);
		    	if(dir && dir.dir == "down") {
		    		console.log(angle)
		    		self.swipeView(this,dir);
		    	}
		    })
		    $('.frame').map(function(i,elem) {
		    	if(elem.hasAttribute("x")) {
		    		elem.style.left = parseInt(elem.getAttribute("x")) * 100 + "%";
		    	}
		    	if(elem.hasAttribute("y")) {
		    		elem.style.top = parseInt(elem.getAttribute("y")) * 100 + "%";
		    	}

		    });
		    $('.swipeable').on("touchend",function() {
	    		self.killSwipes(this)
		    })
		}
	}
	return UI;
}


/*
$('.swipe-left').on("swipe",function() {
		    	var e = event;
		    	var max = true;
	    		var num = -1 * parseInt(this.style.left) / 100

		    	if(!this.style.left) {
		    		this.style.left = "0";
		    	}
		    	if(this.getAttribute('max')) {
		    		max = (num < parseInt(this.getAttribute('max')));
		    	}
		    	if(max && (this.swipeLeft == undefined|| this.swipeLeft != true)) {
			    	if(Math.abs(e.detail.instantaneous.angle - 175) < 10) {
			    		if(this.swipeLeft == undefined || this.swipeLeft != true) {
			    			this.swipeLeft = true
			    		} 
			    		self.openFrame(this,num,num+1);
			    		var left = parseInt(this.style.left);
			    		left -= 100;

			    		this.style.left = left + "%";
			    	}
			    }
		    	/*if(e.detail.instantaneous.direction.x < 0) {
		    		this.style.left = "-100%";
		    	}endComment
		    })
		    $('.swipe-right').on("swipe",function() {
		    	var e = event;
		    	var min = true;
	    		var num = -1 * parseInt(this.style.left) / 100

		    	if(!this.style.left) {
		    		this.style.left = "0";
		    	}
		    	if(this.getAttribute('min')) {
		    		min = (num > parseInt(this.getAttribute('min')));
		    	}
		    	if(min && (this.swipeRight == undefined|| this.swipeRight != true)) {
		    		var angle = e.detail.instantaneous.angle 
			    	if(angle < 10 || angle > 350) {
			    		if(this.swipeRight == undefined || this.swipeRight != true) {
			    			this.swipeRight = true
			    		} 
			    		self.openFrame(this,num,num-1);

			    		var left = parseInt(this.style.left);
			    		left += 100;

			    		this.style.left = left + "%";
			    	}
			    }
		    	/*if(e.detail.instantaneous.direction.x < 0) {
		    		this.style.left = "-100%";
		    	}endComment
		    })
		    $('.swipe-down').on("swipe",function() {
		    	var e = event;
		    	var min = true;
	    		var num = -1 * parseInt(this.style.left) / 100

		    	if(!this.style.left) {
		    		this.style.left = "0";
		    	}
		    	if(this.getAttribute('min')) {
		    		min = (num > parseInt(this.getAttribute('min')));
		    	}
		    	if(min && (this.swipeRight == undefined|| this.swipeRight != true)) {
		    		var angle = e.detail.instantaneous.angle 
			    	if(angle < 10 || angle > 350) {
			    		if(this.swipeRight == undefined || this.swipeRight != true) {
			    			this.swipeRight = true
			    		} 
			    		self.openFrame(this,num,num-1);

			    		var left = parseInt(this.style.left);
			    		left += 100;

			    		this.style.left = left + "%";
			    	}
			    }
		    	/*if(e.detail.instantaneous.direction.x < 0) {
		    		this.style.left = "-100%";
		    	}endComment
		    })
		    */