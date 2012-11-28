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
            ease3d:'cubic-bezier(.81, 0, .26, 1)',
            onLoadingComplete:function(){},
            onSlideComplete:function(){},
            onListComplete:function(){},
            getSlideIndex:function(){
                return currentSlide;
            }
        };

    var imagesObj = {};
    var currentSlide = 0;
    var currentImage = null;

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

        this.has3d = has3DTransforms();

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
                that.attachImage(list[index], "image"+index , index);
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
        wrapper.css({'opacity':0});

		var img = $("<img />");
		img.attr('src', url);
		img.attr('alt', alt_text);



        wrapper.html(img);

        if(this.has3d) {
            img.css({'-webkit-transform-origin':'left top'});
            img.css({'-webkit-transform':'scale('+that.options.scale+') translate3d(0,0,0)'});
            img.css({'-moz-transform-origin':'left top'});
            img.css({'-moz-transform':'scale('+that.options.scale+') translate3d(0,0,0)'});
        }

        this.doTransition = (this.has3d)?this.transition3d:this.transition;

        img.load(function() {
        	imagesObj["image"+index].element = this;
        	imagesObj["image"+index].loaded  = true;
            imagesObj["image"+index].width  = this.width;//remove
            imagesObj["image"+index].height = this.height;//remove
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
            //console.log("resuming");
            this.startTransition(this.holdup);
        }

        //if the last image in the set has loaded, add the images in order
        //fire the complete event
        if(this.checkLoadProgress() == true){
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
	    currentSlide = start_index; //current slide

        that.doTransition();
		this.interval = setInterval(function(){

            if(currentSlide < that.maxSlides-1){
                currentSlide++;
            }else {
                currentSlide = 0;
            }
 
            if(imagesObj["image"+currentSlide].loaded == false){
                that.holdup = currentSlide;
                currentSlide = 0;
                that.wait();
            }else {
                that.doTransition();
            }

            //Fire the completion action

		},this.options.duration);
	}


    Plugin.prototype.chooseCorner = function() {
        var scale = this.options.scale; 
        //determine scale and difference in width
        var image = imagesObj["image"+currentSlide].element;
        var sw = $(image).width();//imagesObj["image"+currentSlide].width;
        var sh = $(image).height();//imagesObj["image"+currentSlide].height;    
        var dx = Math.round((this.width  - (sw*scale))*100)/100;
        var dy = Math.round((this.height - (sh*scale))*100)/100;

        var corners = [
            {x:0,y:0},
            {x:1,y:0},
            {x:0,y:1},
            {x:1,y:1}
        ];

        //Pick the first corner. Remove it from the array. Pick the second corner from the subset. 
        var choice = Math.floor(Math.random()*4);
        var start = corners[choice];
        corners.splice(choice,1);
        var end = corners[Math.floor(Math.random()*3)];

        //build the coordinates from the chosen coordinates

        var coordinates = {
            startX: start.x * dx,
            startY: start.y * dy,
            endX: end.x * dx * (1+(1-scale)),
            endY: end.y * dy * (1+(1-scale))
        }

        return coordinates;//corners[Math.floor(Math.random()*3)];


    }

    Plugin.prototype.transition3d = function () {
        var that = this;
        var scale = this.options.scale; 
        var image = imagesObj["image"+currentSlide].element;
        var position = this.chooseCorner();

        // if(currentImage != null){
        //     $(currentImage).parent().css({'z-index':'1'});
        //     $(currentImage).parent().animate({'opacity':0},that.options.fadeSpeed);
        // }

        $(image).css({'-webkit-transition':'none'});
        $(image).css({'-webkit-transform':'scale('+scale+') translate3d('+position.startX+'px,'+position.startY+'px,0)'});
        $(image).css({'-moz-transition':'none'});
        $(image).css({'-moz-transform':'scale('+scale+') translate3d('+position.startX+'px,'+position.startY+'px,0)'});

        $(image).parent().css({'opacity':0,'z-index':'3'});
        $(image).parent().animate({'opacity':1},that.options.fadeSpeed);

        $(image).css({'-webkit-transition':'-webkit-transform '+(that.options.duration+that.options.fadeSpeed)+'ms '+that.options.ease3d});
        $(image).css({'-webkit-transform':'scale(1) translate3d('+position.endX+'px,'+position.endY+'px,0)'});
        $(image).css({'-moz-transition':'-moz-transform '+(that.options.duration+that.options.fadeSpeed)+'ms '+that.options.ease3d});
        $(image).css({'-moz-transform':'scale(1) translate3d('+position.endX+'px,'+position.endY+'px,0)'});

        $(image).parent().delay(that.options.duration).animate({'opacity':0},that.options.fadeSpeed, function(){
            $(this).parent().css({'z-index':'1'});
        });

        currentImage = image;
        that.options.onSlideComplete();

    }

    Plugin.prototype.transition = function() {
        var that = this;
        var scale = this.options.scale; 
        var image = imagesObj["image"+currentSlide].element;
        var sw = $(image).width();//imagesObj["image"+currentSlide].width;
        var sh = $(image).height();//imagesObj["image"+currentSlide].height; 
        var position = this.chooseCorner();

        // if(currentImage != null){
        //      $(currentImage).parent().css({'z-index':'1'});
        //      $(currentImage).parent().animate({'opacity':0},that.options.fadeSpeed);
        //  }
        //  $(image).css({'z-index':3});



        $(image).css({'left':position.startX,'top':position.startY,'width':sw*(scale),'height':sh*(scale)});
        $(image).animate({'left':position.endX,'top':position.endY,'width':sw,'height':sh},that.options.duration+that.options.fadeSpeed);
        
        $(image).parent().css({'opacity':0,'z-index':3});
        $(image).parent().animate({'opacity':1},that.options.fadeSpeed);

        $(image).parent().delay(that.options.duration).animate({'opacity':0},that.options.fadeSpeed, function(){
            $(this).css({'z-index':1});
        });

        // $(image).css({left:position.startX,top:position.startY});
        // $(image).animate({left:position.endX,top:position.endY},this.options.duration);

        // $(image).parent().css({'z-index':'3'});
        // $(image).parent().animate({'opacity':1},that.options.fadeSpeed);

        // $(image).parent().delay(that.options.duration).animate({'opacity':0},that.options.fadeSpeed, function(){
        //     $(this).parent().css({'z-index':'1'});
        // });


        // currentImage = image;
         that.options.onSlideComplete();

    }


    function has3DTransforms() {
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
