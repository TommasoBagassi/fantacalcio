;(function fixPNGsPlugin($){
   var $blankImg = 'resources/img/transparent.gif'
     , $sizingMethod = 'crop';
   
   $.fn.fixPNGs = function()
   {
      if (!$.browser.msie || $.browser.version >= 9) return this;
      
      this.each(function forEachElement(){
         if (typeof DD_belatedPNG != undefined && $.browser.version < 8) {
            DD_belatedPNG.fixPng(this);
            return;
         }
         
         var isImg = $.nodeName(this, 'img')
           , path  = (isImg) ? this.src : this.currentStyle.backgroundImage;
         
         // If the path is surrounded by `url(` and `)`...
         if (path.search(/^url\(/i) !== -1) {
            // ...extract the path
            path = path.match(/^url\(['"]?([^'"]+)['"]?\)\s*$/i)[1];
         }
         
         // Make sure this is a PNG image
         if (path.search(/\.png$/i) === -1) return;
         
         // Apply the filter
         this.style.filter = 
           "progid:DXImageTransform.Microsoft.AlphaImageLoader" +
           "(src='" + path + "', sizingMethod='" + $sizingMethod + "')";
         // Replace the background image with a transparent 1x1 image.
         if (isImg) this.src = $blankImg;
         else {
            this.style.backgroundImage = 'url(' + $blankImg + ')';
            this.style.backgroundRepeat = 'repeat';
         }
      });
      
      return this;
   }; // $.fn.donutSlider()
})(jQuery); // (fixPNGsPlugin)()