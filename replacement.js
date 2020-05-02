var unknownImages = [];

function findAndReplace(){
    var elementsInsideBody = [...document.body.getElementsByTagName('span')];
    elementsInsideBody.forEach(element =>{
        replace(element);
     });
}

function replace(element) {
    if (element.dataset.text == "true" || element.dataset.offsetKey) {
        return;
    }

    if (element.childNodes.length > 1) {
        elements = element.getElementsByTagName('span');
        [].forEach.call(elements, element => {
            replace(element);
        })
        return;
    }

    var str = element.innerHTML;
    var patt = /:([^\s\/]+):/gim;

    var res;
    var lastIndex = 0;
    var index = 0;
    while ((res = patt.exec(str)) != null) {
        lastIndex = performReplacement(element, str, res, lastIndex, index);
        index += 2;
    }
}

function performReplacement(element, str, res, start, index) {
    var image_url = chrome.extension.getURL("emojis/" + res[1] + ".png");
    if (!image_exists(image_url)) {
        image_url = chrome.extension.getURL("emojis/" + res[1] + ".jpg");
    }
    if (!image_exists(image_url)) {
        image_url = chrome.extension.getURL("emojis/" + res[1] + ".gif");
    }
    if (!image_exists(image_url)) {
        return;
    }

    element.childNodes[index].nodeValue = str.slice(start, res.index);

    var image = document.createElement("img");
    image.src = image_url;
    image.height = "16";
    image.title = res[1];

    element.appendChild(image);

    var afterText = document.createTextNode(str.slice(res.index + res[0].length, str.length));
    element.appendChild(afterText);

    return res.index + res[0].length;
}

function image_exists(url) {
    if (unknownImages.indexOf(url) !== -1) {
        return false;
    }
    var http = new XMLHttpRequest();
    try {
        http.open('HEAD', url, false); 
    } catch {
        unknownImages.push(url);
        return false;
    }
    try {
        http.send();
    } catch {
        unknownImages.push(url);
        return false;
    }
    var exists = http.status != 404;
    if (!exists) {
        unknownImages.push(url);
    }
    return exists;
}

function init() {
    findAndReplace();
    setInterval(findAndReplace, 1000);
}

window.onload = init;