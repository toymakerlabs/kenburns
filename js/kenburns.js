/*
KenBurns Image Rotator
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
*/

;(function ( $, window, document, undefined ) {

    /*  Plugin Parameters, Default, and Constructor
    ------------------------------------------------------------------------------------------------- */
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


    /*  Initialization
    ------------------------------------------------------------------------------------------------- */
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

        var loader = $('<div/>');
        loader.addClass('loader');
        loader.css({'position':'absolute','left':this.width-40,'top':6,'z-index':10000});
        $(this.element).prepend(loader);

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


    /*  Loading and Setup
    ------------------------------------------------------------------------------------------------- */

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
            img.css({'-moz-transform-origin':'left top'});
            img.css({'-webkit-transform':'scale('+that.options.scale+') translate3d(0,0,0)'});
            img.css({'-moz-transform':'scale('+that.options.scale+') translate3d(0,0,0)'});
        }

        this.doTransition = (this.has3d)?this.transition3d:this.transition;

        img.load(function() {
        	imagesObj["image"+index].element = this;
        	imagesObj["image"+index].loaded  = true;
            imagesObj["image"+index].width = $(this).width();
            imagesObj["image"+index].width = $(this).height();
            that.insertAt(index,wrapper);
            that.resume(index);
		});

	}


    Plugin.prototype.resume = function(index){

        //first image has loaded
        if(index == 0) {
            this.startTransition(0);
            $(this.element).find('.loader').hide();

        }

        //if the next image hasnt loaded yet, but the transition has started, 
        // this will match the image index to the image holding the transition.
        // it will then resume the transition.
        if(index == this.holdup) {
            //console.log("resuming");
            $('#status').html("");
            $(this.element).find('.loader').hide();
            this.startTransition(this.holdup);
        }

        //if the last image in the set has loaded, add the images in order
        //fire the complete event
        if(this.checkLoadProgress() == true) {
            
            //reset the opacities and z indexes except the last and first
            $(this.element).find('.stalled').each(function(){
                $(this).css({'opacity':1,'z-index':1});
                $(this).removeClass('stalled');
            });

            //fire the complete thing
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


    Plugin.prototype.wait = function() {
        clearInterval(this.interval);
        $('#status').html("loading");
        $(this.element).find('.loader').show();
        //pause animation in the middle.
        //imagesObj["image"+currentSlide].stop(); 
         var image = imagesObj["image"+(currentSlide-1)].element;
         $(image).parent().stop(true,true);
         $(image).parent().addClass('stalled');
    }




    /*  Transitions and Movement
    ------------------------------------------------------------------------------------------------- */

    //test comment
	Plugin.prototype.startTransition = function(start_index) {
	    var that = this;
	    currentSlide = start_index; //current slide

        that.doTransition();
		this.interval = setInterval(function(){

            //Advance the current slide
            if(currentSlide < that.maxSlides-1){
                currentSlide++;
            }else {
                currentSlide = 0;
            }
            
            //Check if the next slide is loaded. If not, wait.
            if(imagesObj["image"+currentSlide].loaded == false){
                that.holdup = currentSlide;
                that.wait();

            //if the next slide is loaded, go ahead and do the transition. 
            }else {
                that.doTransition();
            }

            //Fire the completion action
            //that.options.onSlideComplete();

		},this.options.duration);
	}


    /** 
    * chooseCorner
    * This function chooses a random start corner and a random end corner
    * that is different from the start. This gives a random direction effect
    * it returns coordinates used by the transition functions. 
    */
   
    Plugin.prototype.chooseCorner = function() {
        var scale = this.options.scale; 
        var image = imagesObj["image"+currentSlide].element;
        var sw = image.width;
        var sh = image.height;
        //alert(this.width);

        var corners = [
            {x:0,y:0},
            {x:1,y:0},
            {x:0,y:1},
            {x:1,y:1}
        ];

        //Pick the first corner. Remove it from the array 
        var choice = Math.floor(Math.random()*4);
        var start = corners[choice];

        //Pick the second corner from the subset
        corners.splice(choice,1);
        var end = corners[Math.floor(Math.random()*3)];

        //build the new coordinates from the chosen coordinates
        var coordinates = {
            startX: start.x * (this.width - sw*scale) ,
            startY: start.y * (this.height - sh*scale),
            endX: end.x * (this.width - sw),
            endY: end.y * (this.height - sh)
        }

       //console.log(coordinates.startX + " , "+coordinates.startY + " , " +coordinates.endX + " , " +coordinates.endY);

        return coordinates;
    }



    /** 
    *  Transiton3D
    *  Transition3d Function works by setting the webkit and moz translate3d properties. These
    *  are hardware accellerated and give a very smooth animation. Since only one animation
    *  can be applied at a time, I wrapped the images in a div. The shorter fade is applied to
    *  the parent, while the translation and scaling is applied to the image.
    */

    Plugin.prototype.transition3d = function () {
        var that  = this;
        var scale = this.options.scale; 
        var image = imagesObj["image"+currentSlide].element;
        var position = this.chooseCorner();


        //First clear any existing transition
        $(image).css({'-webkit-transition':'none'});
        $(image).css({'-moz-transition':'none'});
        $(image).css({'-webkit-transform':'scale('+scale+') translate3d('+position.startX+'px,'+position.startY+'px,0)'});
        $(image).css({'-moz-transform':'scale('+scale+') translate3d('+position.startX+'px,'+position.startY+'px,0)'});

        //Set the wrapper to fully transparent and start it's animation
        $(image).parent().css({'opacity':0,'z-index':'3'});
        $(image).parent().animate({'opacity':1},that.options.fadeSpeed);

        //Add the transition back in
        $(image).css({'-webkit-transition':'-webkit-transform '+(that.options.duration+that.options.fadeSpeed)+'ms '+that.options.ease3d});
        $(image).css({'-moz-transition':'-moz-transform '+(that.options.duration+that.options.fadeSpeed)+'ms '+that.options.ease3d});

        //set the end position and scale, which fires the transition
        $(image).css({'-webkit-transform':'scale(1) translate3d('+position.endX+'px,'+position.endY+'px,0)'});
        $(image).css({'-moz-transform':'scale(1) translate3d('+position.endX+'px,'+position.endY+'px,0)'});

        this.transitionOut();
        this.options.onSlideComplete();
    }



    /**
     *  Transition
     *  The regular JQuery animation function. Sets the currentSlide initial scale and position to 
     *  the value from chooseCorner before triggering the animation. It starts the image moving to
     *  the new position, starts the fade on the wrapper, and delays the fade out animation. Adding
     *  fadeSpeed to duration gave me a nice crossfade so the image continues to move as it fades out
     *  rather than just stopping.  
     */

    Plugin.prototype.transition = function() {
        var that  = this;
        var scale = this.options.scale; 
        var image = imagesObj["image"+currentSlide].element;
        var sw = $(image).width();
        var sh = $(image).height();
        var position = this.chooseCorner();

        $(image).css({'left':position.startX,'top':position.startY,'width':sw*(scale),'height':sh*(scale)});
        $(image).animate({'left':position.endX,'top':position.endY,'width':sw,'height':sh}, that.options.duration + that.options.fadeSpeed);
        
        $(image).parent().css({'opacity':0,'z-index':3});
        $(image).parent().animate({'opacity':1},that.options.fadeSpeed);

        this.transitionOut();
        this.options.onSlideComplete();
    }

    Plugin.prototype.transitionOut = function() {
        var that = this;
        var image = imagesObj["image"+currentSlide].element;

       //  if(currentSlide < this.maxSlides-1){
       //      nextSlide = currentSlide + 1;
       //  }else {
       //      nextSlide = 0;
       //  }

       //  //
       // if(imagesObj["image"+nextSlide].loaded) {
            $(image).parent().delay(that.options.duration).animate({'opacity':0},that.options.fadeSpeed, function(){
                $(this).css({'z-index':1});
            });
       //}
    }



    /*  Utility Functions
    ------------------------------------------------------------------------------------------------- */

    /** 
     *  has3DTransforms
     *  Tests the browser to determine support for Webkit and Moz Transforms
     *  Creates an element, translates the element, and tests the values. If the
     *  values return true, the browser supports 3D transformations. 
     */
    function has3DTransforms() {
        var el = document.createElement('p'), 
            has3d,
            transforms = {
                'WebkitTransform':'-webkit-transform',
                'MozTransform':'-moz-transform',
            };

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

    /** 
     *  insertAt
     *  Utility function that inserts objects at a specific index
     *  Used to maintain the order of images as they are loaded and
     *  added to the DOM
     */
    
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

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );
