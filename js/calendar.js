(function () {

var url = "http://calendar.luxeria.ch/events.php?jsonp=calendar"

var days_de = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
var months_de = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
                 "August", "September", "Oktober", "November", "Dezember"];

var entity_map = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': '&quot;', "'": '&#39;', "/": '&#x2F;'
};

function escape_html(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entity_map[s];
    });
}

window.calendar = function (entries) {
    if (!entries || entries.length == 0) return;
    var html = [];
    var prev_date = "";

    html.push('<h2>Nächste Termine</h2>');
    html.push('<ul class="vcalendar">');
    for (var i=0; i < entries.length; i++) {
        var entry = entries[i];

        var date = escape_html(entry.start);
        var when = new Date(entry.start);

        // convert date to German format
        var day = when.getDate();
        var month = months_de[when.getMonth()];
        var year = when.getFullYear();
        var weekday = days_de[when.getDay()];
        var date_de = day + ". " + month + " " + year + " (" + weekday + ")";

        // print date header only once per date
        if (date_de != prev_date) {
            html.push('<li><h3>', date_de, '</h3></li>');
            prev_date = date_de;
        }

        // microformat hcalendar event
        html.push('<li class="vevent">');

        // check if we had an actual starting time
        html.push('<time class="dtstart" datetime="', date,'">');
        if (entry.start.indexOf('T') != -1) {
            var time = ('0' + when.getHours()).slice(-2) + ":" +
                       ('0' + when.getMinutes()).slice(-2) + " ";
            html.push(time);
        }
        html.push('</time>');

        var title = escape_html(entry.title);
        if (entry.url) {
            var url = escape_html(entry.url);
            html.push('<a href="', url, '" class="url" target="_blank">');
            html.push('<span class="summary">', title, '</span>');
            html.push('</a>');
        } else {
            html.push('<span class="summary">', title, '</span>');
        }

        if (entry.desc) {
            var desc = escape_html(entry.desc);
            html.push('<div class="description">', desc, '</div>');
        }

        html.push('</li>');
    }

    html.push('</ul>');

    html.push('<a target="_blank" class="more" href="http://calendar.luxeria.ch">',
        'Alle Termine anzeigen »',
    '</a>');

    document.getElementById("calendar").innerHTML = html.join("");
}

var script = document.createElement("script");
script.setAttribute("src", url);
document.getElementsByTagName("head").item(0).appendChild(script);

})();
