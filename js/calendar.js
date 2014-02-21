(function () {
// Year: 2014
// Author: Sebastian Wicki <gandro@gmx.net>
// Licensed under the MIT license: http://opensource.org/licenses/MIT

// calendar id
var calendar_id = "nd35io00863u4mq5js6eq3cij4%40group.calendar.google.com";

// global function to be called by the Google Calendar Data API
var callback = 'google_calendar_cb';

// maximum number of days to show
var max_days = 5;

var jsonp = ['https://www.google.com/calendar/feeds/', calendar_id,
              '/public/full?',
                '&alt=json-in-script',
                '&callback=', callback,
                '&orderby=starttime',
                '&max-results=15',
                '&singleevents=true',
                '&sortorder=ascending',
                '&futureevents=true']
                .join("");

var months_de =  ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
                  "August", "September", "Oktober", "November", "Dezember"];
var days_de = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function encode_html(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/**
 * This function is called as a JSONP callback from Google Calendar. The
 * 'root' object contains a calendar in the Google Data API format, as specified
 * in https://developers.google.com/gdata/docs/json
 */
window[callback] = function (root) {
    var feed = root.feed;
    var entries = feed.entry || [];
    var recurring = {};
    var html = [];

    if (entries.length == 0) return;

    html.push('<h2>Nächste Termine</h2>');
    html.push('<ul>');

    var prev_date_str = "";

    var remaining_days = max_days;
    for (var i=0; i < entries.length; i++) {
        var entry = entries[i];

        // are we already finished
        if(remaining_days == 0) break;

        // recurring events link to an original event. If a recurring event
        // was already emitted 3 times, it will be skipped.
        if (entry.hasOwnProperty('gd$originalEvent')) {
            var id = entry.gd$originalEvent.id;
            recurring[id] = recurring[id] || 0;
            recurring[id]++;
            if (recurring[id] > 3) continue;
        }

        // title can be either plaintext (which has to be escaped) or HTML
        var title = (entry.title.type == 'html')
                        ? entry.title.$t
                        : encode_html(entry.title.$t);

        // prefer links to html, instead of rss/atom/ical
        var url = "";
        for (var j=0; j < entry.link.length; j++) {
            url = encode_html(entry.link[j].href);
            if (entry.link[j].type == 'text/html') {
                break;
            }
        }

        // start date string can be parsed by js and html5
        var when_str = entry['gd$when'][0].startTime;

        /* The following code could be replace with:
         *
         *   var when = new Date(when_str);
         *
         * IE8 (and older), Safari 5, FFX 3.5 and other browsers which do not
         * support ES5 are not able to parse ISO-8601 formatted strings, thus
         * we use a hacky regular expression instead.
         */
        var s = when_str.split(/\D/);
        var when = new Date(s[0], s[1] - 1, s[2], s[3], s[4], s[5], s[6]);

        // human readable date format
        var day = when.getDate();
        var month = months_de[when.getMonth()];
        var year = when.getFullYear();
        var weekday = days_de[when.getDay()];

        // styling using calendar.css
        html.push('<li>');

        // don't repeat date element
        var date_str = day + ". " + month + " " + year + " (" + weekday + ")";
        if (date_str != prev_date_str) {
            remaining_days--;
            html.push('<time datetime="', when_str,'">', date_str, '</time>');
        }
        prev_date_str = date_str;

        // check if the entry has its own time
        var time_str = "ganztägig";
        if (when_str.indexOf('T') != -1) {
            time_str = ('0' + when.getHours()).slice(-2) +
                        ":" + ('0' + when.getMinutes()).slice(-2);
        }
        html.push(time_str, ' ');

        // add url
        html.push('<a href="', url, '" target="_blank">', title, '</a>');
        html.push('</li>');
    }

    html.push('</ul>');

    html.push('<a target="_blank" class="more" href="',
                'https://www.google.com/calendar/embed?src=', calendar_id,
                '">', 'Alle Termine anzeigen »', '</a>');

    /* The following code could be replaced with:
     *
     *   document.getElementById("calendar").innerHTML = html.join("");
     *
     * But IE8 and older will throw an 'Unknown Runtime Error' because of
     * improper support for the innerHTML attribute:
     *
     *   http://msdn.microsoft.com/en-us/library/ie/ms533897%28v=vs.85%29.aspx
     *
     * The workaround is to replace the element using the DOM API.
     */
     var oldCal = document.getElementById("calendar");
     var newCal = document.createElement(oldCal.nodeName);
     newCal.id = "calendar";
     newCal.innerHTML = html.join("");

     oldCal.parentNode.replaceChild(newCal, oldCal);
};

// inject Google Calendar JSONP
var script = document.createElement("script");
script.setAttribute("src", jsonp);
document.getElementsByTagName("head").item(0).appendChild(script);

})();
