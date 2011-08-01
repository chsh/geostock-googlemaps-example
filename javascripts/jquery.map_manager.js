// map management plugin for GeoStock.
(function($){
    var settings_with_default = function(settings) {
        return $.extend({
            categories: ['station'],
            center: null,
            scale: 15,
            api_token: null,
            request_host: 'api.geostock.jp',
            request_url: null,
            max: 9, c: 1,
            meters: 2000,
            ids: { list: '#list', categories: '#categories' },
            cat_colors: ['g', 'b', 'p', 'y', 's'],
            category_names: [], initial_index: 0,
            icons: {}
        }, settings);
    };
    var fix_settings = {
        all: function(settings) {
            fix_settings.list_html(settings);
            fix_settings.request_url(settings);
            fix_settings.center_latlng(settings);
        },
        list_html: function(settings) {
            if (settings.list_html == null) { settings.list_html = settings.ids.list }
            var jq_list_html = $(settings.list_html);
            settings.list_html = decodeURI(jq_list_html.html());
            jq_list_html.html('');
        },
        request_url: function(settings) {
            var request_url_base = "http://" + settings.request_host + "/";
            if (settings.api_token != null) {
                settings.request_url = request_url_base + settings.api_token + "/neighbors";
            }
        },
        center_latlng: function(settings) {
            if (settings.center) {
                settings.center_latlng = new google.maps.LatLng(settings.center[0], settings.center[1]);
            } else if ($.current_location) {
                var cl = $.current_location();
                if (cl) {
                    settings.center_latlng = new google.maps.LatLng(cl.latitude, cl.longitude);
                }
            }
            if (settings.center_latlng == null) {
                settings.center_latlng = new google.maps.LatLng(35.685326, 139.753003);
            }
        }
    };
    var clear_overlays = function(overlays) {
        $.each(overlays, function(index, it) {
            it.setMap(null);
            it = null;
        });
    };
    var marker_images_cache = {};
    var point_image_path = function(catcol, index) {
        return 'images/markers/point' + index + '_' + catcol + '.png';
    };
    var shadow_image_path = function() {
        return 'images/markers/shadow.png';
    };
    var marker_image = function(catcol, index) {
        var key = catcol + index;
        var mi = marker_images_cache[key];
        if (mi == null) {
            mi = {
                icon: new google.maps.MarkerImage(point_image_path(catcol, index),
                        new google.maps.Size(24, 37),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(12, 36)),
                shadow: new google.maps.MarkerImage(shadow_image_path(),
                        new google.maps.Size(36, 37),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(16, 37))
            };
            marker_images_cache[key] = mi;
        }
        return mi;
    };


    $.fn.manage_map = function(settings) {
        settings = settings_with_default(settings);
        fix_settings.all(settings);
        var elem = $(this).get(0);
        var map = new google.maps.Map(elem, {
            zoom: settings.scale,
            center: settings.center_latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var center_marker = new google.maps.Marker({position: settings.center_latlng});
        center_marker.setMap(map);

        $(elem).data("manage_map", {
            "settings": settings,
            "index": settings.initial_index,
            "pois": null,
            "overlays": []
        });

        var arrange_items = function(map) {
            var ll = map.getCenter();
            var d = $(elem).data("manage_map");
            var ds = d.settings;
            var url = ds.request_url + "?col=" + ds.categories.join(',') + "&max=" + ds.max + "&c=" + ds.c + "&d=" + ds.meters + "&ll=" + ll.lat() + "," + ll.lng();
            var cat = ds.categories[d.index];
            var catcol = ds.cat_colors[d.index];
            var bounds = map.getBounds();
            console.log(url);
            $.getJSON(url, function(data) {
                clear_overlays(d.overlays); d.overlays = [];
                d.shops = data;
                $.each(data[cat], function(j, item) {
                    var nj = j + 1;
                    var ll = new google.maps.LatLng(item.location.lat, item.location.lng);
                    var mi = marker_image(catcol, nj);
                    var marker_params = $.extend({
                        position: ll,
                        map: map
                    }, mi);
                    var marker = new google.maps.Marker(marker_params);
                    d.overlays.push(marker);
                });
                $.dispatcher.fire('show_items.map', {items: data[cat]});
            });
        };
        google.maps.event.addListener(map, 'idle', function() {
            arrange_items(map);
        });

        $(settings.ids.categories).build_radio_list({
            name: 'category-menu-name',
            keys: settings.categories,
            values: settings.category_names,
            index: settings.initial_index
        });

        $(settings.ids.categories + ' > input[name="category-menu-name"]').click(function() {
            $.dispatcher.fire('menu_changed.map', {index: $(this).val()});
        });

        $(settings.ids.list).register_event_handlers({
            namespace: 'map',
            on_show_items: function(e, data) {
                var d = $(elem).data("manage_map");
                var ds = d.settings;
                var dc = ds.cat_colors[d.index];
                var i = 0;
                var listhtml = d.settings.list_html;
                var list = $.map(data.items, function(item) {
                    i++;
                    return listhtml.replace(/{(.+?)}/g, function(word, keyname) {
                        if (keyname == '#') return i;
                        if (keyname == '@') return dc;
                        return item.attrs[keyname]
                    }).replace(/_([A-Z]+)_/g, function(word, keyname) {
                                if (keyname == 'LISTINDEX') return i;
                                if (keyname == 'CATCOLOR') return dc;
                                return '';
                            });
                });
                $(this).build_list('ul', list);
            }
        });

        $(this).register_event_handlers({
            namespace: 'map',
            on_menu_changed: function(e, data) {
                var d = $(this).data("manage_map");
                d.index = data.index;
                arrange_items(map);
            }
        });

        return $(this);
    }
})(jQuery);
