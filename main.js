var request = require('request')
  , crypto = require('crypto')
  , xml = require('xml')
  , xml2js = require('xml')
  , querystring = require('querystring');

var EbayAPI = (function() {
  var init = function( id ) {
    this.app_id = id;
  };

  var verbsAllowed = ['GET', 'POST'];

  switch ( process.env.ENV_VARIABLE ) {
    case 'production':
      var serviceURLs = {
          finding: 'http://svcs.ebay.com/services/search/FindingService/v1'
        , trading: 'https://api.ebay.com/ws/api.dll'
        , product: 'http://svcs.sandbox.ebay.com/services/marketplacecatalog/ProductService/v1'
      };
      break;
    case 'test':
      var serviceURLs = {
          finding: 'http://svcs.sandbox.ebay.com/services/search/FindingService/v1'
        , trading: 'https://api.sandbox.ebay.com/ws/api.dll'
        , product: 'http://svcs.sandbox.ebay.com/services/marketplacecatalog/ProductService/v1'
      };
      break;
    default:
      var serviceURLs = {
          finding: 'http://svcs.sandbox.ebay.com/services/search/FindingService/v1'
        , trading: 'https://api.sandbox.ebay.com/ws/api.dll'
        , product: 'http://svcs.sandbox.ebay.com/services/marketplacecatalog/ProductService/v1'
      };
  };

  function conv(object, key) {
    var collection = []
      , index = 0
      , next
      , item;

    if('object' !== typeof object ) throw new Error( 'Supplied params are not an object' );
    for( item in object ) {
      next = object[item];
      if(typeof next == 'object' && next != null) {
        if( 'object' === typeof item ) var key = Object.keys(item);
        var thisItem = {};
        thisItem[item] = conv(next);
        //Check in __proto__ has snuck in
        if( item != '__proto__' ) collection.push(thisItem);
      } else {
        var thisItem = {};
        thisItem[item] = String(next);
        //Check in __proto__ has snuck in
        if( item != '__proto__' ) collection.push(thisItem);
      }
    }
    return collection;
  };

  function xmlBuilder(opType, params) {
    var data = {}
      , xmlData = {}
      , XML = ''
      , el = {}
      , convert = params.body
      , productKeys = Object.keys(convert);

    data[opType + 'Request'] = [];
    xmlData = data[opType + 'Request'];
    xmlData.push({ '_attr' : { 'xmlns' : "urn:ebay:apis:eBLBaseComponents" } });      

    if (typeof params.authToken !== 'undefined') {
      xmlData.push({ 'RequesterCredentials' : [ { 'eBayAuthToken' : params.authToken } ] });
      delete params.authToken;
    }

    if (productKeys.length > 0) {
      for( key in convert ) {
        if( 'object' != typeof convert[key] ) {
          var ob = {};
          ob[ key ] = convert[key];
          xmlData.push(ob);
        } else {
          el[ key ] = conv( convert[ key], key );
          xmlData.push(el);
        }
      }
    }
    data = [ data ];
    XML = '<?xml version="1.0" encoding="UTF-8"?>' + "\n" + xml( data );

    //replace hack removes any numbered xml tags
    return XML.replace(/(<([?^/\d]+)>)/ig, '');
  };

  var call = function( opts ) {
    var params = {}
      , headers = {}
      , options = {}
      , qs;

    if( verbsAllowed.indexOf( opts.query.method.toUpperCase() ) !== -1 
      && opts.query.method.toUpperCase() === 'GET' ) {
      //GET Action
      params['SECURITY-APPNAME'] = this.app_id;
      params['SERVICE-VERSION'] = '1.0.0';
      params['RESPONSE-DATA-FORMAT'] = 'JSON';

      for(key in opts.query.params.load) {
        if(opts.query.params.load.hasOwnProperty(key)) params[key] = opts.query.params.load[key];
      };
      
      qs = querystring.stringify(params);

      options = {
          uri: serviceURLs[opts.query.service] + "?" + qs
        , method: opts.query.method.toUpperCase()
      };

      request(options, function( error, response ) {
        if( error ) throw new Error( error );
        opts.callback(error, response);
      });
    } else if( verbsAllowed.indexOf( opts.query.method.toUpperCase() ) !== -1 
      && opts.query.method.toUpperCase() === 'POST' ) {
      //POST Action
      var body = xmlBuilder(opts.query.params.headers['X-EBAY-API-CALL-NAME'],  opts.query.params );

      options = {
          uri: serviceURLs[ opts.query.service ]
        , method: opts.query.method.toUpperCase()
        , headers: opts.query.params.headers
        , body: body
      };

      request(options, function( error, response ) {
        if( error ) throw new Error( error );
        opts.callback(error, response);
      });
    } else {
      throw new Error( 'Method not allowed' );
    }
  };

  var Constructor = function( app_id ) {
    init( app_id );
  };

  Constructor.prototype = {
    constructor: EbayAPI,
    query: function(params, callback) {
      call({
        query: { method: params.query.method, service: params.query.service, params: params },
        callback: function( err, data ) {
          if( callback ) callback( err, data.body );
        }
      });
    } 
  }
  return Constructor;
}());

module.exports = EbayAPI;
