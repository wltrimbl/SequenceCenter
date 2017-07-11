function initWebApp () {

    var user = jQuery.cookie('SeqWebSession');
    if (user) {
	stm.user = JSON.parse(user);
	stm.authHeader = { "AUTH": stm.user.token };
    } else {
	window.location = '/cgi-bin/client.cgi';
    }

    // check if the browser is compatible
    var features = { "addEventListener": feature.addEventListener,
		     "classList": feature.classList,
		     "cors": feature.cors,
		     "defer": feature.defer,
		     "matchMedia": feature.matchMedia,
		     "querySelectorAll": feature.querySelectorAll
		   };
    var allFeaturesAvailable = true;
    for (var i in features) {
	if (features.hasOwnProperty(i)) {
	    if (! features[i]) {
		console.log(i);
		allFeaturesAvailable = false;
	    }
	}
    }
    if (! allFeaturesAvailable) {
	var html = "<b>Warning</b><p>Your browser does not support all functionality used by this site. Please consider upgrading to a current version.</p><p style='text-align: center;'><a href='http://www.mozilla.org/firefox' target=_blank>Firefox</a> | <a href='http://www.google.com/chrome' target=_blank>Chrome</a> | <a href='http://www.apple.com/safari' target=_blank>Safari</a></p>";
	document.getElementById('warning').innerHTML = html;
	document.getElementById('warning').style.display = '';
    }
    
    // webapp initialization
    stm.init({});
    Retina.init({});

    var page = Retina.cgiParam('page') || 'home';
    Retina.load_widget(page).then( function() {
	var pageWidget = Retina.Widget.create(page, { "main": document.getElementById("content") }, true);
	pageWidget.display();
	
    });

    
    // tell the user we are using cookies
    window.cookiebar = new jQuery.peekABar();
    setTimeout(function () {
	cookiebar.show({
	    html: 'This site uses cookies to improve the user experience. By continuing to use the site you consent to the use of cookies.<button class="btn btn-mini pull-right" onclick="cookiebar.hide();" style="float: right; margin-right: 50px;">OK</button>'
	});
    }, 3000);

};

function logout () {
    jQuery.removeCookie('SeqWebSession', { path: '/' });
    window.location.reload();
};
