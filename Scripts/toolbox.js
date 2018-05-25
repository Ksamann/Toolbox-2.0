console.log("toolbox.js connected");

function readFile(fileName, callbackFunc, outputXml) {
    var req;
    var IE = false;
    if (window.XMLHttpRequest) {
        console.log("Modern xmlhttp detected...");
        req = new XMLHttpRequest();
    } else {
        console.log("ActiveX detected");
        req = new ActiveXObject("Microsoft.XMLHTTP");
        IE = true;
    }
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            console.log("File successfully read...");
            if (req.responseXML == "") {
                console.log("File " + fileName + " is empty");
            }
            else {
                if (outputXml) {
                    if(IE){
                        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async ="false";
                        xmlDoc.loadXML(req.responseText);
                        callbackFunc(xmlDoc);
                    }
                    else{
                        callbackFunc(req.responseXML);
                    }

                    
                } else {
                    callbackFunc(req.responseText);
                }
            }
        } else {
            //console.log("readystate: " + req.readyState + " Satus: " + req.status);
        }
    };
    req.open("GET", fileName, true);
    req.send();
}

function setConfig(xmlDoc) {

    var configData = xmlDoc;

    var settings = configData.getElementsByTagName("settings")[0];
       
    var ver = settings.getElementsByTagName("version")[0].childNodes[0].nodeValue;
    var width = settings.getElementsByTagName("window_width")[0].childNodes[0].nodeValue;
    var style = settings.getElementsByTagName("styleSheet")[0].childNodes[0].nodeValue;
    //  Making the setting object
    var settingObj = {
        version: ver,
        windowWidth: width,
        styleSource: style
    };
    //Making Array for menuItems
    var menuItems = [];
    //  Finding the submenu items
    var subM = configData.getElementsByTagName("sub_menu");
    var l = subM.length;
    // Traversing through submenu items
    for (var i = 0; i < l; i++) {
        var header = subM[i].attributes[0].nodeValue;
        var icon = subM[i].attributes[1].nodeValue;
        //Making Array of pages
        var pagesArray = [];
        //Traversing through pages in submenu
        var pages = subM[i].getElementsByTagName("page");
        var len = pages.length;
        for (var j = 0; j < len; j++) {
            var xsrc = "Undefined";
            if (pages[j].attributes.length > 1) {
                xsrc = pages[j].attributes[1].nodeValue;
            }

            var pageObj = {
                name: pages[j].attributes[0].nodeValue,
                xml_source: xsrc
            };
            //Pushing pageobject into pagesArray
            pagesArray.push(pageObj);
        }

        var menuItemObj = {
            name: header,
            icon_src: icon,
            pages: pagesArray
        };
        //Pushing menuItem into menuItems array
        menuItems.push(menuItemObj);
    }

    //Making the configuration Object
    var configObj = {
        settings: settingObj,
        menu: menuItems
    };

    Config = configObj;

    navigateTo(0,0);
}




function navigateTo(menuItem, pageItem) {

    //updateContent(menuItem, pageItem);

    for (var k = 0; k < Menu.childNodes.length;) {
        Menu.childNodes[k].parentNode.removeChild(Menu.childNodes[k]);
    }

    var pWidth = Config.settings.windowWidth;
    var pw = "width:" + pWidth + "px";
    var mainMenu = document.createElement("div");
    mainMenu.setAttribute("id", "MainMenu");
    mainMenu.setAttribute("style", pw);
    Menu.appendChild(mainMenu);
    Menu.setAttribute("style", pw);

    var btnWidth = Math.ceil(Config.menu.length / 2);
    btnWidth = (pWidth / btnWidth) - 2;

    for (var i = 0; i < Config.menu.length; i++) {

        var mainBtn = document.createElement("button");
        mainBtn.innerHTML = Config.menu[i].name;
        mainBtn.value = i;
        mainBtn.setAttribute("class", "mainBtn");
        if (i == menuItem) {
            mainBtn.setAttribute("class", "mainBtn active");
        }
        mainBtn.setAttribute("style", "width:" + btnWidth + "px");
        mainBtn.onclick = function (e) {
            navigateTo(e.target.value, 0);
        };
        mainMenu.appendChild(mainBtn);
    }

    var subMenu = document.createElement("div");
    subMenu.setAttribute("id", "SubMenu");
    subMenu.setAttribute("style", pw);
    subMenu.setAttribute("section", menuItem);

    var len = Config.menu[menuItem].pages.length;
    for (var j = 0; j < len; j++) {
        var subBtn = document.createElement("button");
        subBtn.innerHTML = Config.menu[menuItem].pages[j].name;
        subBtn.value = j;
        subBtn.setAttribute("class", "subBtn");
        if (j == pageItem) {
            subBtn.setAttribute("class", "subBtn active");
        }
        subBtn.onclick = function (e) {
            navigateTo(e.target.parentNode.getAttribute("section"), e.target.value);
        };
        subMenu.appendChild(subBtn);
    }
    Menu.appendChild(subMenu);

}

function browserVersion(){
    var ver = navigator.appVersion;
    return ver;
}