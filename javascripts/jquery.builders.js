// simple list html builder.
(function($) {
    $.fn.build_list = function(tag, list) {
        var htmls = [];
        htmls.push('<' + tag + '>');
        htmls.push($.map(list, function(item) {
            return "<li>" + item + "</li>";
        }).join("\n"));
        htmls.push('</' + tag + '>');
        return $(this).html(htmls.join("\n"));
    }
    $.fn.build_radio_list = function(data) {
        var htmls = [];
        var rname = data.name;
        $.each(data.keys, function(i) {
            var key = this;
            var value = data.values[i];
            htmls.push("<input type='radio' name='" + rname + "' value='" + i + "'");
            if (i == data.index) {
                htmls.push(" checked='checked'");
            }
            htmls.push("/>");
            htmls.push(value)
        });
        return $(this).html(htmls.join(''));
    }
})(jQuery);
