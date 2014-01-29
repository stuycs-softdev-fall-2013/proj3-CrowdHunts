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
		setFrame: function(context,frameNum) {
			var oldFrame = -parseInt(context.style.left)/100
			context.style.left = -100 * frameNum + "%";
			this.openFrame(context,oldFrame,frameNum);
			return oldFrame;
		},
		openFrame: function(context,frameSource,frameNum) {
			var frames = $(context).children('.frame[number='+frameNum+']');

			for(var i =0;i<frames.length;i++) {
				var e = new FrameView(frameSource);
				frames[i].dispatchEvent(e);
				console.log(e);
			}
		},
		init: function() {
			var self = this;
			$('.scrollable').on("drag",function() {
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
		    	}*/
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
		    	}*/
		    })
		    $('.frame').map(function(i,elem) {
		    	if(elem.hasAttribute("number")) {
		    		elem.style.left = parseInt(elem.getAttribute("number")) * 100 + "%";
		    	}
		    });

		    $('.swipe-left').on("touchend",function() {
		    	if(this.swipeLeft && this.swipeLeft != undefined) {
		    		this.swipeLeft = false;
		    	}
		    })    
		    $('.swipe-right').on("touchend",function() {
		    	if(this.swipeRight && this.swipeRight != undefined) {
		    		this.swipeRight = false;
		    	}
		    })
		}
	}
	return UI;
}