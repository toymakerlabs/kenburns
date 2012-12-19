Kenburns
========
 Kenburns.js is a lightweight and flexible Jquery gallery plugin that loads a list of images and transitions them using a pan-and-zoom, _[Ken Burns](http://en.wikipedia.org/wiki/Ken_Burns_effect)_ style effect. 
 
Example: <http://www.toymakerlabs.com/kenburns>


Overview & Features
-------------------
Dude, another Jquery gallery? Wait, wait! Before you go, this one actually does a few pretty neat things: 

* Uses super smooth webkit and moz transitions
* Built in feature detection for CSS3 transforms
* Uses Jquery Animations when CSS3 transforms are not available
* Loads images in parallel but maintains the gallery order
* Built-in event callbacks for loading complete, and transition complete


Browser Support
-------
Testing conducted in: ie8 +, Chrome 18.0.1025.165, Safari 5+6, Firefox 11, and iOS 5.


Usage
-------------------
Basic plugin use looks like this:

    $("#wrapper").Kenburns({
        images:["image0.jpg", "image2.jpg"],
        scale:1,
        duration:6000,
        fadeSpeed:800,
        ease3d:ease-out
    })


Example
------------
#####1. HTML
First create a wrapper element. For movement to take place, the wrapper must be smaller than the smallest image multiplied by the scale. See the _**how it works**_ section for info on how to appropriately size your wrapper and images. 

        <div id="kenburns_slideshow"></div>  
    
######2. CSS
Include the the CSS. The plugin wraps images in divs with a class of _.kb-slide_. _**Note**_: Position:relative on the IMG tag is used to defeat an IE8 opacity bug. 

    #kenburns_slideshow {
        position: relative;
        width:600px;
        height: 360px;
        background-color:black;
        border:22px solid #191919;
        overflow: hidden;
    }
    
    .kb-slide{
        position: absolute;
        z-index: 1;
        opacity: 0;
    }
    
    .kb-slide img{
        position: relative;
        -webkit-transform: translate3d(0,0,0)
        -moz-transform: translate3d(0,0,0);
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
    }

######3. SCRIPT
Then initialize the plugin. In the example below, it should log the current slide and a message when loading has completed. 

    $("#wrapper").Kenburns({
        images:[
            "images/image0.jpg", 
            "images/image1.jpg",
            "images/image2.jpg",
            "images/image3.jpg",
            "images/image4.jpg"
            ],
        scale:1,
        duration:6000,
        fadeSpeed:800,
        ease3d:'ease-out',
        onSlideComplete: function(){
            console.log('slide ' + this.getSlideIndex());
        },
        onLoadingComplete: function(){
            console.log('image loading complete');
        }
    });
    



How it Works
-------------------
######Loading
The plugin loads images asynchronously, and in parallel. It uses a manager to maintain the order of the images as they are passed in the _**images**_ parameter. 

The transition starts once the first image has loaded. If it encounters an image that hasn't loaded, the script pauses and shows a loading animation. When the image finishing loading, the transition resumes on its merry way. 


######Image Sizing & Animation
The plugin moves the images by computing the difference between the dimensions of the image and the dimensions of the frame. It aligns the image with a random corner of the frame and animates it to another random corner. The relationship of the image size to the frame size dictates how much the images move.

**Three parameters affect how much movement will happen during the transition:**

1. ######Wrapper Size
The element that you apply the plugin to serves as the "frame" for the images. For movement to occur, the images must be larger than the frame. If images are the same size as the wrapper, they will fade over one-another. 

2. ######Image Size 
The larger the image in relation to the frame, the larger the distance the image has to cover, and the more image will move. 

3. ######Scale
The scale parameter scales the images down first, and increases it until it reaches a value of 1. Keep in mind if you have set the scale parameter, the scaled image size must still be at least as large as the frame. Otherwise gaps may appear.

_Note: The plugin scales images **down** initially. The scaled image size must be at least equal to the size of the frame_ 

**To work out the minimum wrapper size needed:** 
    
    image width * scale
    image height * scale
     

List of Parameters
-------------------
The following parameters are used to control the image loading, movement, and transition time. 

######images: [ ]
Array containing strings of image URLs 

######scale: _(0-1)_
Initial scaling of images. Value Range: 0-1. Produces a zooming effect when animating. Scaling images **down** initially allows us to transition them to their original sizes, therby eliminating any possible fuzziness.
    
######duration: _ms_
Millisecond value representing the transition duration time. 

######fadeSpeed: _ms_
Millisecond value representing how long the transition will last *Note: The plugin adds fadeSpeed to duration to produce a nifty cross-fading effect. 

######ease3d: _'string'_
Optional string value to control the easing of the transition. Accepts CSS3 easing functions like 'ease-out', 'ease-in-out', 'cubic-bezier()'

######onSlideComplete: _function()_
A callback when each slide completes its transition. Used for things like changing the text relating to the image, etc

######getSlideIndex: _function()_
A public function that returns the index of the current slide. 

######onLoadingComplete: _function()_
A callback function when the images have finished loading. 



Dependencies
-----
Jquery 1.8.2.

It will probably work fine in previous versions but it hasn't yet been tested. 


Credits
------
by John the Toymaker<br/>
John @ Toymakerlabs<br/>
<http://www.toymakerlabs.com>

Special thanks to: The [Jquery](http://www.jquery.com/) team and the [Jquery plugin boilerplate](http://jqueryboilerplate.com). And of course, as always, Stackoverflow and Google, and books, and greek-yogurt, and Boddingtons. And Crepevine.  



*Note This plugin only draws stylistic inspiration and is in no way affiliated with or endorsed by filmmaker Ken Burns. 


