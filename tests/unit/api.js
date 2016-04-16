QUnit.module('FWD.Api', function(){
  var stubGetJSON = function(options) {
    var assert = options.assert;
    var expectedUrl = options.url;
    var expectedParams = options.params;
    var expectedKey = options.key;

    Stubs.stub($, 'getJSON', function(url, params) {
      assert.equal(url, expectedUrl);

      var expectedParamsWithKey = $.extend({key: expectedKey}, expectedParams);
      assert.deepEqual(params, expectedParamsWithKey, 'key appended');

      return Helpers.resolvedPromise();
    });
  };

  var stubApiGetSeq = function(options) {
    var assert = options.assert;
    var expectedUrl = options.url;
    var totalPages = options.pageData.length;

    var dataPages = $.map(options.pageData, function(pageData, ix){
      return {
        books: pageData,
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

      return Helpers.resolvedPromise(dataPages[params.page - 1]);
    };

    Stubs.stub(FWD.Api, 'get', apiGetFunc);
  };

  QUnit.test("FWD.Api.get - returns jqXHR from $.getJSON with params extended by additional key param", function(assert) {
    var params = {name: 'User Userson', phone: '555-555-5555'};

    stubGetJSON({
      url: 'http://example.com',
      params: params,
      key: 'Test key',
      assert: assert
    });

    FWD.init('Test key');
    var jqXHR = FWD.Api.get('http://example.com', {name: 'User Userson', phone: '555-555-5555'});
    jqXHR.then(assert.async()); // checking if promise was returned
  });

  QUnit.test( "FWD.Api.getAllPages - on success - makes a sequence of requests over all pages, returns aggregated data", function( assert ) {
    var expectedUrl = 'http://example.com/books';
    var expectedParams = {year: 2016, genre: 'Sci-fi'};
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

    stubApiGetSeq({
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
    FWD.Api.getAllPages(expectedUrl, 'books', expectedParams).then(function(collection){
      assert.deepEqual(collection, expectedBooks, 'Collections aggregated properly');
      done();
    });
  });
});