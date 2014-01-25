// ==UserScript==
// @name Generations Funk Clean
// @namespace hap
// @include http://generations.fr/radio/webradio/generations-funk
// @version 1
// @grant none
// ==/UserScript==

var getChildByTag = function (elem, tag) {
    tag = tag.toUpperCase();

    for (var i = 0, len = elem.childNodes.length; i < len; i++) {
        if (elem.childNodes[i].tagName === tag) {
            return elem.childNodes[i];
        }
    }
};

var empty = function (elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
};

var blockAjax = function () {
    var orig = XMLHttpRequest;

    var nope = function () {};
    unsafeWindow.XMLHttpRequest = nope;
    unsafeWindow.XMLHttpRequest.prototype = {};

    for (var i in XMLHttpRequest.prototype) {
        unsafeWindow.XMLHttpRequest.prototype[i] = nope;
    }

    XMLHttpRequest = orig;
};

var appendAudio = function (src) {
    var audio = document.createElement('audio');
    audio.controls = true;
    audio.src = src;
    document.body.appendChild(audio);
};

var appendInfo = function () {
    var info = document.createElement('ul');
    document.body.appendChild(info);
    return info;
};

var getNoCache = function (fn) {
    return function (url) {
        arguments[0] += arguments[0].indexOf('?') < 0 ? '?' : '&';
        arguments[0] += 'time=' + Date.now();
        return fn.apply(this, arguments);
    };
};

var getXml = function (url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'document';
    xhr.addEventListener('load', function () {cb(this.response);});
    xhr.send();
};

var getXmlNoCache = getNoCache(getXml);

var getTrackInfo = function (track) {
    var artist = track.getElementsByTagName('chanteur')[0].firstChild.nodeValue;
    var title = track.getElementsByTagName('chanson')[0].firstChild.nodeValue;
    var time = track.getElementsByTagName('date_prog')[0].firstChild.nodeValue;
    return {time: time, artist: artist, title: title};
};

var formatTrackInfoTime = function (info) {
    return info.time + ': ';
};

var formatTrackInfo = function (info) {
    return info.artist + ' - ' + info.title;
};

var getYoutubeInfoSearch = function (info) {
    var search = info.artist + ' ' + info.title;
    var safeSearch = encodeURIComponent(search);
    return '//www.youtube.com/results?search_query=' + safeSearch;
};

var getTrackInfoYoutubeLink = function (info) {
    var a = document.createElement('a');
    a.href = getYoutubeInfoSearch(info);
    a.target = '_blank';
    a.appendChild(document.createTextNode(formatTrackInfo(info)));
    return a;
};

var getTrackInfoElement = function (info) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(formatTrackInfoTime(info)));
    li.appendChild(getTrackInfoYoutubeLink(info));
    return li;
};

var replaceTrackInfo = function (li, info) {
    li.firstChild.nodeValue = formatTrackInfoTime(info);
    li.childNodes[1].firstChild.nodeValue = formatTrackInfo(info);
    li.childNodes[1].href = getYoutubeInfoSearch(info);
};

var displayTracks = function (parent, doc) {
    var tracks = doc.getElementsByTagName('morceau');
    var nodesLen = parent.childNodes.length;

    for (var i = 0, len = tracks.length; i < len; i++) {
        var info = getTrackInfo(tracks[i]);

        if (i < nodesLen) {
            replaceTrackInfo(parent.childNodes[i], info);
        } else {
            parent.appendChild(getTrackInfoElement(info));
        }
    }
};

var main = function () {
    var mp3 = '//gene-wr05.ice.infomaniak.ch/gene-wr05.mp3';
    var xml = '/winradio/prog5.xml';

    blockAjax();
    empty(document.head);
    empty(document.body);

    var audio = appendAudio(mp3);
    var info = appendInfo();

    var onLoad = function (doc) {displayTracks(info, doc);};
    var refresh = function () {getXmlNoCache(xml, onLoad);};

    setInterval(refresh, 10000);
    refresh();
};

main();
