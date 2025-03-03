if (typeof asset_host != "string" || asset_host == 'https://d2j3qa5nc37287.cloudfront.net/') window.asset_host = "https://cdn.jst.ai/";
if (window.asset_host.substring(0, 2) == "//") window.asset_host = "https:" + window.asset_host;
if (window.asset_host.substring(window.asset_host.length - 1) != "/") window.asset_host = window.asset_host + "/";
window.ju_host = window.asset_host.split('.')[1]+'.'+window.asset_host.split('.')[2].replace('/','');
window.ju_domain = 'https://my.'+window.ju_host;

juapp('initFunc',function(){
  try {
    juapp('local','pageType',(window.ShopifyAnalytics && ShopifyAnalytics.meta && ShopifyAnalytics.meta.page && ShopifyAnalytics.meta.page.pageType ? ShopifyAnalytics.meta.page.pageType : ''));
    juapp('local','prodId',(window.ShopifyAnalytics && ShopifyAnalytics.meta && ShopifyAnalytics.meta.product && ShopifyAnalytics.meta.product.id ? ShopifyAnalytics.meta.product.id : ''));
    juapp('local','custId',(window.ShopifyAnalytics && ShopifyAnalytics.meta && ShopifyAnalytics.meta.page && ShopifyAnalytics.meta.page.customerId ? ShopifyAnalytics.meta.page.customerId : ''));
  } catch (e) {
    ju_logerr('shopify obj',e);
  }
  window.ju_init_fired = true;
  window.ju_resyncing = false;
  window.update_shopify_ju_cart = function () {
    try {
      jju.ajax({
        dataType: "json",
        url: "/cart.js",
        async: true,
        cache: false
      }).done(
        function (data) {
          if (!ju_resyncing) {
            window.ju_resyncing = true;
            try {
              var cartTotal = appikon.discounts.discounted_price || data.total_price / 100;
            } catch(e){
              var cartTotal = data.total_price / 100;
            }
            if (cartTotal != ju_data_session.cartTotals.tp || data.item_count != ju_data_session.cartTotals.tq) {
              var ju_cart_obj = [];
              if (Array.isArray(data.items)){
                data.items.forEach(function (item) {
                  var itemId = item.product_id;
                  var itemVariantId = item.variant_id;
                  var itemSku = item.sku;
                  var itemTitle = item.title;
                  var itemPrice = item.discounted_price / 100;
                  var itemQty = item.quantity;
                  var itemColor = item.variant_title;
                  ju_cart_obj.push({ productid: itemId, variationid: itemVariantId, sku: itemSku, quantity: itemQty, price: itemPrice, name: itemTitle, color: itemColor, size: itemColor })
                });
              }
              juapp(
                'cartItems',
                ju_cart_obj
              );
              if (Array.isArray(data.items)){
                juapp('cart',{total:cartTotal,subtotal:data.items_subtotal_price / 100,currency:data.currency});
              }
            }
            window.ju_resyncing = false;
          }
        }
      );
    } catch (e) {
      //ju_logerr('shopify add to cart',e);
      //console.log('justuno couldn\'t add the cart info - cart page')
    }
  }

  // only fire this code in shopify if they are on the thank you page
  if (location.protocol.indexOf("https") === 0 && location.pathname.indexOf("/checkouts/") >= 0 && location.pathname.indexOf("/thank_you") >= 0) {
    try {
      // this code is used to log the order totals
      juapp('order',Shopify.checkout.order_id,{total:Shopify.checkout.total_price,subtotal:Shopify.checkout.subtotal_price,tax:Shopify.checkout.total_tax,shipping:Shopify.checkout.shipping_price,currency:Shopify.checkout.currency});

      // this code is used to loop through and log all ordered items
      for (var i = 0; i < Shopify.checkout.line_items.length; i++) {
        juapp('orderItem',{productid:Shopify.checkout.line_items[i].product_id,variationid:Shopify.checkout.line_items[i].variant_id,sku:Shopify.checkout.line_items[i].sku,quantity:Shopify.checkout.line_items[i].quantity,price:Shopify.checkout.line_items[i].line_price,name:Shopify.checkout.line_items[i].title,color:Shopify.checkout.line_items[i].variant_title});
      }
    } catch (e) {
      ju_logerr('shopify conversion tracking',e);
      console.log('justuno couldn\'t add the order info')
    }
  }
  // only fire this code in shopify if they are on the cart page
  if (location.pathname.indexOf("/cart") >= 0) {
    update_shopify_ju_cart();
  }

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    for (var arg in arguments) {
      try {
        var thisarg = (typeof (arguments[arg]) === 'string' ? arguments[arg].toString() : false);
        if (thisarg) {
          if (thisarg.indexOf('cart/add.js') >= 0) {
            this.addEventListener('load', function (thisT) {
              try {
                var thisT = this.responseText ? this : thisT.currentTarget;
                var responseText = jju.parseJSON(thisT.responseText);
                var itemId = responseText.product_id;
                var itemVariantId = responseText.variant_id;
                var itemSku = responseText.sku;
                var itemTitle = responseText.title;
                var itemPrice = responseText.discounted_price / 100;
                var itemQty = responseText.quantity;
                var itemColor = responseText.variant_title;
                delete ju_data_session.cartItem[itemId];
                delete ju_data_all.cartItem[itemId];
                juapp('cartItemAdd',{productid:itemId, variationid: itemVariantId, sku: itemSku, quantity: itemQty, price: itemPrice, name: itemTitle, color: itemColor, size: itemColor });
              } catch (e) {
                //ju_logerr('shopify add to cart',e);
                //console.log('justuno couldn\'t add the cart info - ' + thisarg)
              }
            });
          }
          if (thisarg.indexOf('cart.js') >= 0 || thisarg.indexOf('cart/update.js') >= 0 || thisarg.indexOf('cart/change.js') >= 0 || thisarg.indexOf('cart/clear.js') >= 0) {
            this.addEventListener('load', function (thisT) {
              if (!ju_resyncing) {
                window.ju_resyncing = true;
                try {
                  var thisT = this.responseText ? this : thisT.currentTarget;
                  var responseText = jju.parseJSON(thisT.responseText);
                  try {
                    var cartTotal = appikon.discounts.discounted_price || responseText.total_price / 100;
                  } catch(e){
                    var cartTotal = responseText.total_price / 100;
                  }
                  if (cartTotal != ju_data_session.cartTotals.tp || responseText.item_count != ju_data_session.cartTotals.tq) {
                    var ju_cart_obj = [];
                    if (Array.isArray(responseText.items)){
                      responseText.items.forEach(function (item) {
                        var itemId = item.product_id;
                        var itemVariantId = item.variant_id;
                        var itemSku = item.sku;
                        var itemTitle = item.title;
                        var itemPrice = item.discounted_price / 100;
                        var itemQty = item.quantity;
                        var itemColor = item.variant_title;
                        ju_cart_obj.push({ productid: itemId, variationid: itemVariantId, sku: itemSku, quantity: itemQty, price: itemPrice, name: itemTitle, color: itemColor, size: itemColor })
                      });
                    }
                    juapp(
                      'cartItems',
                      ju_cart_obj
                    );
                    if (Array.isArray(responseText.items)){
                      juapp('cart',{total:cartTotal,subtotal:responseText.items_subtotal_price / 100,currency:responseText.currency});
                    }
                  }
                } catch (e) {
                  //ju_logerr('shopify add to cart',e);
                  //console.log('justuno couldn\'t add the cart info - ' + thisarg)
                }
                window.ju_resyncing = false;
              }
            });
          }
        }
      } catch (e) {
        ju_logerr('shopify add to cart',e);
        console.log('justuno couldn\'t add the cart info - arg')
      }
    }

    origOpen.apply(this, arguments);
  };

  setTimeout(update_shopify_ju_cart, 8000);
});

function ju_loadversionscript(v,vr){
  if (window.ju_alreadyloaded) return
	(function() {var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src=asset_host+'mwgt_'+v+'.js?v='+vr;if (document.querySelector('script[nonce]') && document.querySelector('script[nonce]')?.nonce!="null" && document.querySelector('script[nonce]')?.nonce!="") s.nonce=document.querySelector('script[nonce]')?.nonce;var x=document.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);})();
}

function jju_setCookie(name, value, days, path, secure) {
  // set time, it's in milliseconds
  var today = new Date();
  today.setTime(today.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = name + "=" + escape(value) + ";expires=" + (days == -1 ? "Thu, 01 Jan 1970 00:00:01 GMT" : today.toGMTString()) + (path ? ";path=" + path : "") + (secure ? ";secure" : "" );
}

function jju_getCookie(c_name){
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name) {
    return unescape(y);
    }
  }
  return '';
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


var $jujsonp = (function(){
  var that = {};

  that.send = function(src, options) {
    var callback_name = options.callbackName || 'callback',
      on_success = options.onSuccess || function(){},
      on_timeout = options.onTimeout || function(){},
      timeout = options.timeout || 10; // sec

    var timeout_trigger = window.setTimeout(function(){
      window[callback_name] = function(){};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function(data){
      window.clearTimeout(timeout_trigger);
      on_success(data);
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;

    document.getElementsByTagName('head')[0].appendChild(script);
  }

  return that;
})();

var ju_v = jju_getCookie("_ju_v");
var ju_vr = '';
if (ju_v && ju_v.indexOf('_') != -1) {
  var ju_v_arr = ju_v.split('_');
  ju_v = ju_v_arr[0];
  ju_vr = ju_v_arr[1];
  ju_loadversionscript(ju_v, ju_vr);
} else {
  if (ju_num.match(/^[{]?[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}[}]?$/)) {

    $jujsonp.send(ju_domain+'/ajax/account_version_check.html?id='+ju_num, {
        callbackName: 'ju_vcheck',
        onSuccess: function(json){
            //console.log('success!', json);
            ju_v = json.v;
            ju_vr = json.vr;
            jju_setCookie("_ju_v", ju_v+'_'+ju_vr,.0208,"/",true);
            ju_loadversionscript(ju_v,ju_vr);
        }
    });

  }
}