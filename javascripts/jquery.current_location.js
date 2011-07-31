// jquery current location detector.
(function($) {
    var detectedLocation = null;
    var triedFlag = false;
    $.current_location = function(settings) {
        settings = $.extend({
            google_gears: true,
            w3c_geolocation: true
        }, settings);
        if (detectedLocation) { return detectedLocation; }
        if (triedFlag) { return null; }
        triedFlag = true;
        if(settings.w3c_geolocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              detectedLocation = { latitude: position.coords.latitude,
                  longitude: position.coords.longitude }
          }, function() {
          });
        // Try Google Gears Geolocation
        } else if (settings.google_gears && google.gears) {
            var geo = google.gears.factory.create('beta.geolocation');
            geo.getCurrentPosition(function(position) {
                detectedLocation = {
                    latitude: position.latitude,
                    longitude: position.longitude
                }
            }, function() {
            });
        }
        return detectedLocation;
    }
})(jQuery);
