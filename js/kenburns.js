/*
KenBurns Image Rotator
by Toymakerlabs
john@toymakerlabs.com
*/


/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {
    
    // undefined is used here as the undefined global 
    // variable in ECMAScript 3 and is mutable (i.e. it can 
    // be changed by someone else). undefined isn't really 
    // being passed in so we can ensure that its value is 
    // truly undefined. In ES5, undefined can no longer be 
    // modified.
    
    // window and document are passed through as local 
    // variables rather than as globals, because this (slightly) 
    // quickens the resolution process and can be more 
    // efficiently minified (especially when both are 
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'Kenburns',
        defaults = {
            images:[],
            duration:400,
            fadeSpeed:500,
            scale:1,
            onLoadingComplete:function(){},
            onSlideComplete:function(){},
            onListComplete:function(){}
        };

    var imagesObj = {};

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method that merges the 
        // contents of two or more objects, storing the 
        // result in the first object. The first object 
        // is generally empty because we don't want to alter 
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.started = false;
        this.imgLoadTime = 0;
        this.ease3d = 'cubic-bezier(.81, 0, .26, 1)';
        this.maxSlides = this.options.images.length;
        
        this.init();
    }


    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element 
        // and this.options
       // var container = $(this.element);
        var list = this.options.images;
        var that = this;

        this.width = $(this.element).width();
        this.height = $(this.element).height();

        for (i in list) {
        	this.attachImage(list[i], "image"+i , i);
        	imagesObj["image"+i] = {};
        	imagesObj["image"+i].loaded = false;
        }
        //var that = this;
        // imagesObj["image"+0] = {};
        // imagesObj["image"+0].loaded = true;
        // imagesObj["image"+1] = {};
        // imagesObj["image"+1].loaded = false;
        // imagesObj["image"+2] = {};
        // imagesObj["image"+2].loaded = false;
        // imagesObj["image"+3] = {};
        // imagesObj["image"+3].loaded = false;
        // imagesObj["image"+4] = {};
        // imagesObj["image"+4].loaded = false;




        $(document).find('button').each(function(index){
            $(this).click(function(e){
                that.attachImage(list[index], "image"+index , index)
               // imagesObj["image"+index].loaded = true;
               // imagesObj["image"+index].element = true;
                //that.resume(index);
            })
        })

    };
    //Load Images in parallell but keep track of the order. 
    Plugin.prototype.attachImage = function(url,alt_text,index) {
    	var that = this;

        //put the image in an empty div to separate the animation effects of fading and moving
        var wrapper = $('<div/>');
        wrapper.attr('class','kb-slide');

		var img = $("<img />");
		img.attr('src', url);
		img.attr('alt', alt_text);
                //set up 3d transitions
        //-webkit-transition: -webkit-transform 800ms cubic-bezier(.81, 0, .26, 1);
        if(has3d()){
            img.css({'-webkit-transition':'-webkit-transform '+that.options.duration+'ms '+that.ease3d});
            img.css({'-moz-transition':'-moz-transform '+that.options.duration+'ms '+that.ease3d});
        }

        wrapper.html(img);

        img.load(function() {
        	imagesObj["image"+index].element = this;
        	imagesObj["image"+index].loaded  = true;
            imagesObj["image"+index].width = this.width;
            imagesObj["image"+index].height = this.height;
            that.insertAt(index,wrapper);
            that.resume(index);
		});
	}


    Plugin.prototype.resume = function(index){
        //first image has loaded
        if(index == 0) {
            this.startTransition(0);
        }

        //if the next image hasnt loaded yet, but the transition has started, 
        // this will match the image index to the image holding the transition.
        // it will then resume the transition.
        if(index == this.holdup) {
            console.log("resuming");
            this.startTransition(this.holdup);
        }

        //if the last image in the set has loaded, add the images in order
        //fire the complete event
        if(this.checkLoadProgress() == true){
            //attach image jquery objects to the dom
            // for(i=0;i<this.maxSlides;i++){
            //     $(this.element).append(imagesObj["image"+i].element);
            // }
            //fire the complete method
            this.options.onLoadingComplete();
        }
    }

    //if any of the slides are not loaded, the set has not finished loading. 
    Plugin.prototype.checkLoadProgress = function() {
        var loaded = true;
         for(i=0;i<this.maxSlides;i++){
            if (imagesObj["image"+i].loaded == false){
                loaded = false;
            }
        }
        return loaded;
    }

    //test comment
	Plugin.prototype.startTransition = function(start_index) {
	    var that = this;
	    var slide = start_index; //current slide

        that.transition(slide);
		this.interval = setInterval(function(){
            //revise to a wait function. 
		 	//checkLoaded(this.imagesObj);
			//slide = that.getNextLoadedImage(slide);
            
           // console.log(slide);


            if(slide < that.maxSlides-1){
                slide++;
            }else {
                slide = 0;
            }
 
            if(imagesObj["image"+slide].loaded == false){
                that.holdup = slide;
                slide = 0;
                that.wait();
            }else {
                that.transition(slide);
            }

            
		},this.options.duration);
	}
    var currentImage = null;

    /*SIMPLE FADE TRANSITION*/
    // Plugin.prototype.transition = function(slide_index) {
    //     var that = this;
    //     var t = this.options.duration;

    //     console.log(slide_index);

    //     if(currentImage != null){
    //         $(currentImage).css({'z-index':'1'});
    //         $(currentImage).stop().animate({opacity:0},400);
    //     }
        
    //     var image = imagesObj["image"+slide_index].element
    //     $(image).css({'z-index':'3'});
    //     $(image).stop().animate({opacity:1},400);
    //     currentImage = image;
    // }

    Plugin.prototype.transition = function(slide_index) {
        var that = this;
        var t = this.options.duration;

        console.log(slide_index);

        //Set the image to a random corner. 
        // $(image).css({
        //     'left':0,
        //     'bottom':0
        // });



        if(currentImage != null){
            $(currentImage).parent().css({'z-index':'1'});
            $(currentImage).parent().animate({'opacity':0},that.options.fadeSpeed,function(){
               
            });
        }
        
        var image = imagesObj["image"+slide_index].element;
        var sw = imagesObj["image"+slide_index].width;
        var sh = imagesObj["image"+slide_index].height;


        // var vert = getCorner('vertical');
        // var side = getCorner('horizontal');

        var scale = 0.75;//this.options.scale;        
        var dx = that.width  - (sw*scale);
        var dy = that.height - (sh*scale);


        var corners = [
            {x:0,y:0},
            {x:dx,y:0},
            {x:0,y:dy},
            {x:dx,y:dy}
        ];

        var choice = Math.floor(Math.random()*4);
        var start = corners[choice];

        corners.splice(choice,1);
        var end = corners[Math.floor(Math.random()*3)];


        //set the div to a corner
        //fade in the image
        //animate the wrapper for the duration of the slide
        
        //set the scale
         if(has3d()) {
                }
        //use hardware transitions if available. otherwise animate with Jquery
        console.log(has3d());
        if(has3d()) {
            $(image).css({'-webkit-transform':'scale('+scale+')'});
            $(image).css({'-webkit-transform':'translate3d('+start.x+'px,'+start.y+'px,0) '+'scale(1)'});
            $(image).css({'-moz-transform':'translate3d('+start.x+'px,'+start.y+'px,0) '+'scale(1)'});
        }else {
            $(image).css({'left':start.x,'top':start.y,'width':sw*(scale),'height':sh*(scale)});
            $(image).animate({'left':end.x*(1+(1-scale)),'top':end.y*(1+(1-scale)),'width':sw,'height':sh},t);
        }



        //set image wrapper to random corner
        //$(image).parent().css({'width':sw*(scale), 'height':sh*(scale)});
        //$(image).parent().css({'opacity':0,'z-index':'3'});

        //animate it to another random corner, except the initial corner
        $(image).parent().animate({'opacity':1},that.options.fadeSpeed);
         // .delay(t-that.options.fadeSpeed)
         // .animate({'opacity':0},that.options.fadeSpeed);
        currentImage = image;
    }

    /*
    X: 0 , diff_x , -diff_x
    Y: 0, diff_y, -diff_y

    */
    /*

    start at:
    top,left
    0,0
    0,diff_x
    diff_y,0
    diff_y,diff_x

    go to:
    any choice but the last picked
    */

    /* Returns a random css property to start the corner tween */
    function getCorner(num) {
        var corner = {};
        switch(num) {
            case 0:
                //top left
                corner = {'top':0,'left':0}
                break;
            case 1:
                //top right
                corner = {'top':0,'left':'auto','right':0}
                break;
            break;
            case 2:
                //bottom left
                corner = {'top':'auto','bottom':0,'left':0 }
                break;
            break;
            case 3:
                //bottom right
                corner = {'top':'auto','bottom':0,'left':'auto','right':0}
                break;
            break;
            default:
                corner = {'top':0,'left':0}
                break;
            break;
        }
        return corner;
        
    }

    function has3d() {
        var el = document.createElement('p'), 
            has3d,
            transforms = {
                'WebkitTransform':'-webkit-transform',
                'MozTransform':'-moz-transform',
            };

        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);

        for (var t in transforms) {
            if (el.style[t] !== undefined) {
                el.style[t] = "translate3d(1px,1px,1px)";
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }

        document.body.removeChild(el);

        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
    }

    Plugin.prototype.wait = function() {
        clearInterval(this.interval);
        console.log("paused");
    }

    Plugin.prototype.insertAt = function (index, element) {
        var lastIndex = $(this.element).children().size();
        if (index < 0) {
            index = Math.max(0, lastIndex + 1 + index);
        }
        var imgWrapper = $(this.element).append(element);
        if (index < lastIndex) {
            $(this.element).children().eq(index).before($(this.element).children().last());
        }
    }


	//image 0  must be loaded first
	//move through the object and find the next loaded image
	//transition it
	//move through the objec tand find the next loaded image
	//transittion it
	Plugin.prototype.getNextLoadedImage = function(start_index) {
		//loop through the next set of images
		//find the first one that's loaded
		//return it's index
		//if no loaded images are found in the next set
		//go back to zero. 
		// var found = false;
		// for(i=start_index+1; i<this.maxSlides; i++){
		// 	if(imagesObj["image"+i].loaded == true) {
		// 		break;
		// 	}
		// 	//console.log(i);
		// 	return i;//imagesObj["image"+i].element;
		// 	found = true;
		// }
		// if(found != true){
		// 	return 0;//imagesObj["image0"].element; 
		// }
		var next = start_index + 1;
		// if(next == this.maxSlides){
		// 	next = 0;
		// }
		// if(imagesObj["image"+next].loaded != true){
		//  	this.getNextLoadedImage(next);
		// }else {
		// 	console.log(next);
		//  	return next;
		// }
        var found = false;
        for(i=next;i<this.maxSlides;i++){
            if(imagesObj["image"+i].loaded == true){
                found = true;
                return i;
                break;
            }
        }
        if(found== false) {
            return 0;
        }


	}


	//animation moves from top left to right
	//fade in 1 sec



 	// var duration = Math.round((endTime - startTime) / 1000) ;
	// var bitsLoaded = downloadSize * 8 ;
	// var speedBps = Math.round(bitsLoaded / duration) ;
	// var speedKbps = (speedBps / 1024).toFixed(2) ;
	// var speedMbps = (speedKbps / 1024).toFixed(2) ;
	// alert ("Your connection speed is: \n" +
	// speedBps + " bps\n" +
	// speedKbps + " kbps\n" +
	// speedMbps + " Mbps\n") ;
	// }


    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );
