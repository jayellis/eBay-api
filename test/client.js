var assert = require('assert')
  , expect = require('chai').expect
  , util = require('util')
  , conf = require('../conf')
  , EbayAPI = require('../main');

//Params {{{1
//List items by kewords {{{2
var listParams = {
  query: {
    method: 'GET'
  , service: 'finding'
  },
  load: {
    'OPERATION-NAME': 'findItemsByKeywords'
  , 'keywords': 'harry potter phoenix'
  }
};

//GetCategories {{{2
var getParams = {
  authToken: conf.development.token
  , query: {
      method: 'POST'
    , service: 'trading'
  }
  , headers: {
    'X-EBAY-API-COMPATIBILITY-LEVEL': '759'
    , 'X-EBAY-API-CALL-NAME': 'GetCategories'
    , 'X-EBAY-API-SITEID': '3'
    , 'X-EBAY-API-DEV-NAME': conf.development.devId
    , 'X-EBAY-API-APP-NAME': conf.development.appId
    , 'X-EBAY-API-CERT-NAME': conf.development.appId
    , 'Content-Type': 'text/xml'
  },
  body: {
      CategorySiteID: '3'
    , DetailLevel: 'ReturnAll'
    , LevelLimit: '1'
  }
};

//VerifyAddItem {{{2
var addParams = {
  authToken: conf.development.token
  , query: {
      method: 'POST'
    , service: 'trading'
    }
  , headers: {
    'X-EBAY-API-COMPATIBILITY-LEVEL': '759'
    , 'X-EBAY-API-CALL-NAME': 'VerifyAddItem'
    , 'X-EBAY-API-SITEID': '3'
    , 'X-EBAY-API-DEV-NAME': conf.development.devId
    , 'X-EBAY-API-APP-NAME': conf.development.appId
    , 'X-EBAY-API-CERT-NAME': conf.development.appId
    , 'Content-Type': 'text/xml'
  },
  body: {
    Item: {
      StartPrice: '500'
    //, ConditionID: '1000'
    , Currency: 'GBP'
    , DispatchTimeMax: '3'
    , ListingDuration: 'Days_7'
    , ListingType: 'FixedPriceItem'
    , Country: 'GB'
    , PostalCode: 'N7 0PU'
    , PaymentMethods: 'PayPal'
    , PayPalEmailAddress: 'megaonlinemerchant@gmail.com'
    , PictureDetails: [        
        { PictureURL: 'http://thumbs.ebaystatic.com/pict/41007087008080_0.jpg' },
        { PictureURL: 'http://thumbs.ebaystatic.com/pict/41007087008080_0.jpg'}
      ]
    , PrimaryCategory: '377'
    //, ProductListingDetails: {
      //UPC: '885909298594'
      //, IncludePrefilledItemInformation: 'true'
      //, IncludeStockPhotoURL: true
      //}
    , Quantity: 1
    //, ReturnPolicy: {
      //ReturnsAcceptedOption: 'ReturnsAccepted'
      //, RefundOption: 'MoneyBack'
      //, ReturnsWithinOption: 'Days_30'
      //, Description: 'If not satisfied, return the item for refund.'
      //}
    , ShippingDetails: {
      ShippingServiceOptions: {
        ShippingServicePriority: '1'
        , ShippingService: 'UK_Parcelforce48'
        , ShippingServiceCost: '0.00'
        , ShippingServiceAdditionalCost: '0.00'
        }
      }
    , Site: 'UK'
    }
  }
};

//Tests {{{1
//Test List Items {{{2
function testListItem(next) {
  var ebay = new EbayAPI(conf.development.appId);
  ebay.query( listParams, function (err, data) {
    if( err ) console.error( 'Error: ', err );
    assert.equal(typeof data, 'string' );
    console.log(util.inspect(data, false, 20, true))
    next(testAddItem);
  });
};

//Test Get Categories {{{2
function testGetCategories(next) {
  var ebay = new EbayAPI(conf.development.appId);
  ebay.query( getParams, function( err, data ) {
    if( err ) console.error( 'Error: ', err );
    assert.equal( typeof data, 'string' );
    console.log(util.inspect(data, false, 20, true))
  });
};

//Test Verify Add Item{{{2
function testAddItem() {
  var ebay = new EbayAPI(conf.development.appId);
  ebay.query( addParams, function( err, data ) {
    if(err) console.error('ERROR', err)
    assert.equal(typeof data, 'string');
    console.log(util.inspect(data, false, 20, true));
  });
};

//Test Calls {{{1
testAddItem();
