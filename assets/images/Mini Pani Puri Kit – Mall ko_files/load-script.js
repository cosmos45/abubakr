var dtfqfrontendobject = {
  pluginPath:'https://dtapps.vedicthemes.com/fancy-faqv2/wp-content/plugins/dt-faq-shopify-app/',
  wpPath:'https://dtapps.vedicthemes.com/fancy-faqv2/wp-includes/js/jquery/',
  ajaxurl:'https://dtapps.vedicthemes.com/fancy-faqv2/wp-admin/admin-ajax.php'
};

(function () {
  /* Load Script function we may need to load jQuery from the Google's CDN */
  /* That code is world-reknown. */
  /* One source: http://snipplr.com/view/18756/loadscript/ */

  var loadScript = function (url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";

    // If the browser is Internet Explorer.
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
      // For any other browser.
    } else {
      script.onload = function () {
        callback();
      };
    }

    if (url != "") {
      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    }
  };

  /* If jQuery has not yet been loaded or if it has but it's too old for our needs,
  we will load jQuery from the Google CDN, and when it's fully loaded, we will run
  our app's JavaScript. Set your own limits here, the sample's code below uses 1.9.1
  as the minimum version we are ready to use, and if the jQuery is older, we load 1.9.1 */

  if (
    typeof jQuery === "undefined" ||
    (parseFloat(jQuery.fn.jquery.replace(/^1\./, "")) < 9.1)
    ) {

    loadScript(
      dtfqfrontendobject.wpPath + "jquery.min.js",
      function () { jQuery = jQuery.noConflict(true); }
    );
    loadScript(
      dtfqfrontendobject.wpPath + "ui/core.min.js",
      function () { jQuery = jQuery.noConflict(true); }
    );
    loadScript(
      dtfqfrontendobject.wpPath + "ui/tabs.min.js",
      function () { jQuery = jQuery.noConflict(true); }
    );
    loadScript(
      dtfqfrontendobject.wpPath + "ui/accordion.min.js",
      function () { jQuery = jQuery.noConflict(true); }
    );
    loadScript(
      dtfqfrontendobject.pluginPath + "assets/js/frontend.js",
      function () { jQuery = jQuery.noConflict(true); }
    );

  }
})();