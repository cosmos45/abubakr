var shop = typeof Shopify !== 'undefined' ? Shopify.shop : ptwShopName;
var ptwShopDomain = document.domain;
var ptwBasePath = 'https://' + ptwShopDomain + '/a/gwrap/';
var $ptwjobject = '';
if (typeof jQuery == 'undefined') {
    var ptwHead = document.getElementsByTagName('head')[0];
    var ptwScript = document.createElement('script');
    ptwScript.src = ptwBasePath + 'js/lib/jquery-3.4.1.min.js';
    ptwScript.type = 'text/javascript';
    console.log(ptwScript.src);
    ptwScript.onreadystatechange = handler;
    ptwScript.onload = handler;
    // Fire the loading
    ptwHead.appendChild(ptwScript);
}else{
    handler();
}

function handler(){
    $ptwjobject = window.jQuery;
    try{
        var ptwPage = $ptwjobject('#ptw-wrapin').attr('data-page');

        var ptwTag = $ptwjobject('#ptw-wrapin').attr('data-tag');

        if(ptwPage == 'product'){

            productname = $ptwjobject('#ptw-wrapin').attr('data-productname');

        }else{
            productname = '';
        }

        if (ptwTag == '' || ptwTag == undefined) {
            ptwTag = '';
        }
        $ptwjobject.ajax({
            type: "GET",
            url: ptwBasePath + "loadWrapin",
            data: {
                'shop': shop,
                'page': ptwPage,
                'productname': productname,
                'tag': ptwTag
            },
            success: function(data) {
                $ptwjobject("#ptw-wrapin").html(data);
                if ($ptwjobject.isFunction(window.ptwAfterWrapinLoadHook)) {
                    ptwAfterWrapinLoadHook();
                }
                if (ptwPage == 'cart') {
                    ptwLoadWrapinCartData($ptwjobject);
                }
            },
            error: function (xhr, status) {
                console.log(status);
            }
        });

    } catch(e) {
        var line_number = e?.stack;
        if(line_number == '' || line_number == undefined){
            var line_number = e?.line;
        }
        $ptwjobject.ajax({
            type: "GET",
            url: 'https://wrapin.prezenapps.com/public/frontendexception',
            async: false,
            data: { shop: ptwShop, message: e.message, line_number:line_number, file_path: 'load-wrapin-app.js' },
            success: function(result) {}
        });
    }
}

function ptwLoadWrapinCartData($ptwjobject){
    $ptwjobject.getJSON( "/cart.js")
        .done(function( response ) {
            var ptwCartData = response.attributes;
            var items = response.items;
            var ptwFlag = 0;
            $ptwjobject.each(items, function(index, item){
                if (item.product_type == 'wrapin') {
                    ptwFlag = 1;
                }
            });

            if(ptwFlag == 0) {
                jQuery.post('/cart/update.js', "attributes[gift-message-note]");
            }
            $ptwjobject.each(ptwCartData, function(index, value) {
                if (ptwFlag) {
                    if(index == 'gift-message-note' && value != '') {
                        $ptwjobject('#ptw-gift-needed').prop("checked", true);
                        $ptwjobject('.ptw-message-note').show();
                        $ptwjobject('#ptw-text-message').val(value);
                        if( $ptwjobject('.ptw-gift-options').length ){$ptwjobject('.ptw-gift-options').show();}
                    }
                }
            })
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
}