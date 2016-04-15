QUnit.begin(function(){
  FuncBackup = {
    ajax: $.ajax,
    getJSON: $.getJSON
  };
});

QUnit.testStart(function(){
  $.ajax = FuncBackup.ajax;
  $.getJSON = FuncBackup.getJSON;
});

var stub = function(stubName, stubVal) {
  StubStore || StubStore = {};
  StubStore[stubName] = eval(stubName);
  eval(stubName + '= ' + )


};

QUnit.module('FWD init', function(){
  QUnit.test( "FWD.init()", function( assert ) {
    FWD.init('some key');
    assert.ok(FWD.devKey == 'some key');
  });

  QUnit.test( "FWD.getDevKey()", function( assert ) {
    FWD.init('init key');
    assert.ok(FWD.getDevKey() == 'init key');
  });
});

QUnit.module('FWD.URL', function(){
  QUnit.test( "FWD.URL.host", function( assert ) {
    assert.ok(FWD.URL.host == 'https://app.fwd.us/api/v1');
  });

  QUnit.test( "FWD.URL.for()", function( assert ) {
    FWD.URL.urls['users'] = {data: '/people/info'};
    assert.equal(FWD.URL.for('users#data'), 'https://app.fwd.us/api/v1/people/info');
  });
});


QUnit.module('FWD.Model', function(){
  QUnit.test( "FWD.Model#get() returns attribute set via constructor", function( assert ) {
    var model = new FWD.Model({name: 'User Userson'});
    assert.equal(model.get('name'), 'User Userson');
  });

  QUnit.test( "FWD.Model#get() returns attribute set via #set", function( assert ) {
    var model = new FWD.Model();
    model.set('last_name', 'Userson');
    assert.equal(model.get('last_name'), 'Userson');
  });
});

QUnit.module('FWD.Factory', function(){
  var SubModel = (function(superClass) {
    // A Model descendant class
    extend(SubModel, superClass);

    function SubModel() {
      return SubModel.__super__.constructor.apply(this, arguments);
    }

    return SubModel;
  })(FWD.Model);

  //QUnit.test( "FWD.Factory.loadPageFunc", function( assert ) {
  //
  //});

  //QUnit.test( "FWD.Factory.loadAllFunc", function( assert ) {
  //
  //});

  QUnit.test( "FWD.Factory.convertArrayParams", function( assert ) {
    var params = {
      name: 'User Userson',
      tags: ['one', 'two', 'three and four']
    };

    assert.deepEqual(FWD.Factory.convertArrayParams(params, ['tags']), {
      name: 'User Userson',
      tags: 'one,two,three and four'
    });
  });

  QUnit.test( "FWD.Factory.arrayParam", function( assert ) {
    assert.equal(FWD.Factory.arrayParam('Some string'), 'Some string');
    assert.equal(FWD.Factory.arrayParam(['list', 'of', 'different tags']), 'list,of,different tags');
  });

  QUnit.test( "FWD.Factory.attributesToModels", function( assert ) {
    var attrList = [
      {first_name: 'Homer', last_name: 'Simpson'},
      {first_name: 'User', last_name: 'Userson'}
    ];
    var models = FWD.Factory.attributesToModels(attrList, SubModel);

    assert.equal(models[0].get('first_name'), 'Homer');
    assert.equal(models[0].get('last_name'), 'Simpson');
    assert.equal(models[1].get('first_name'), 'User');
    assert.equal(models[1].get('last_name'), 'Userson');
  });
});

QUnit.module('FWD.Api', function(){
  var stubGetJSON = function(assert, expectedUrl, expectedParams, expectedKey) {
    $.getJSON = function(url, params) {
      assert.equal(url, expectedUrl);

      var expectedParamsWithKey = $.extend({key: expectedKey}, expectedParams);
      assert.deepEqual(params, expectedParamsWithKey, 'key appended');

      return $.Deferred().resolve();
    };
  };

  QUnit.test( "FWD.Api.get - returns jqXHR from $.getJSON with params extended by additional key param", function( assert ) {
    var params = {name: 'User Userson', phone: '555-555-5555'};
    stubGetJSON(assert, 'http://example.com', params, 'Test key');

    FWD.init('Test key');
    var jqXHR = FWD.Api.get('http://example.com', {name: 'User Userson', phone: '555-555-5555'});
    jqXHR.then(assert.async()); // checking if promise was returned
  });


  var resolvedPromise = function() {
    var args;
    var slice = [].slice;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];

    return $.Deferred(function(defer){
      defer.resolve.apply(null, args);
    }).promise();
  };

  var stubApiGetSeq = function(options) {
    var assert = options.assert;
    var expectedUrl = options.url;
    var totalPages = options.pageData.length;

    var dataPages = $.map(options.pageData, function(pageData, ix){
      return {
        books: pageData[ix],
        page: ix + 1,
        total_pages: totalPages
      };
    });

    var expectedPage = 1;

    var apiGetFunc = function(url, params) {
      var expectedParams = $.extend({page: expectedPage, per_page: FWD.allPagesPerPage}, options.params);
      var pageStr = 'Page ' + expectedPage + ' - ';

      assert.deepEqual(params, expectedParams, pageStr + 'Params match');
      assert.equal(url, expectedUrl, pageStr + 'URL Matches');

      expectedPage += 1;

      return resolvedPromise(dataPages[params.page - 1]);
    };

    return apiGetFunc;
  };

  QUnit.test( "FWD.Api.getAllPages - on success - makes a sequence of requests over all pages, returns aggregated data", function( assert ) {
    var expectedBooks = [
      {title: 'The Hunger Games', author: 'Suzanne Collins'},
      {title: '1984', author: 'George Orwell'},
      {title: 'The Giver', author: 'Lois Lowry'},
      {title: 'Divergent', author: 'Veronica Roth'},
      {title: 'Brave New World', author: 'Aldous Huxley'},
      {title: 'Fahrenheit 451', author: 'Ray Bradbury'},
      {title: "The Handmaid's Tale", author: 'Margaret Atwood'},
      {title: 'Animal Farm', author: 'George Orwell'}
    ];

    var expectedUrl = 'http://example.com/books';
    var expectedParams = {year: 2016, genre: 'Sci-fi'};

    FWD.Api.get = stubApiGetSeq({
        assert: assert,
        url: expectedUrl,
        params: expectedParams,
        pageData: [
          expectedBooks.slice(0, 3),
          expectedBooks.slice(3, 6),
          expectedBooks.slice(6, 8)
        ]
    });

    var done = assert.async();
    var promise = FWD.Api.getAllPages(expectedUrl, 'books', expectedParams);
    promise.then(function(collection){
      assert.deepEqual(collection, expectedBooks, 'Collections aggregated properly');
      done();
    });
  });
});

//QUnit.module('FWD.Story', function(){
//  QUnit.test( "FWD.Story.index on success", function( assert ) {
//    var done = assert.async();
//
//    FWD.init('___public_api_key___');
//
//    $.ajax = function() {
//
//    };
//
//    FWD.Story.index().then(function(data){
//      assert.ok(1);
//      done();
//    });
//  });
//
//  //QUnit.test( "FWD.Story.index on failure", function( assert ) {
//  //  FWD.Story.index().then(function(data){
//  //
//  //  });
//  //});
//
//  //QUnit.test( "FWD.Story.search", function( assert ) {
//  //
//  //});
//  //
//  //QUnit.test( "FWD.Story.searchAll", function( assert ) {
//  //
//  //});
//  //
//  //QUnit.test( "FWD.Story#company", function( assert ) {
//  //
//  //});
//});