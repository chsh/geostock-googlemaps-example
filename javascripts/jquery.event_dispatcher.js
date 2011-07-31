// jquery event dispatcher plugin.
(function($) {
    $.dispatcher = {
        callbacks_: {},
        shared_data_: {},
        register: function(jq, settings) {
            var cbs = this.callbacks_;
            // 1. Extract on_* keys from settings.
            // 2. Stock each value with key to callbacks_

            // Add support for namespace of jQuery#bind
            var ns = '';
            if (settings.namespace != null) {
                ns = '.' + settings.namespace;
            }
            $.each(settings, function(key, value) {
                if (key.indexOf('on_') == 0) {
                    var msg = key.substr(3) + ns;
                    var stock = cbs[msg];
                    if (stock == null) {
                        stock = [];
                        cbs[msg] = stock;
                    }
                    cbs[msg].push(jq);
                    jq.bind(msg, value);
                }
            });
        },
        // call each value with key(msg).
        fire: function(msg, data) {
            var cbs = this.callbacks_;
            var stock = cbs[msg];
            if (stock != null) {
                $.each(stock, function(i, jq) {
                    jq.trigger(msg, data);
                });
            }
        },
        shared: function() {
            var ns = arguments[0];
            if (arguments.length > 1) {
                shared_data_[ns] = arguments[1];
            }
            return shared_data_[ns];
        }
    };
    $.fn.register_event_handlers = function(settings) {
        $.dispatcher.register(this, settings);
        return this;
    };
})(jQuery);
