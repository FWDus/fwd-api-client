QUnit.module('FWD.Api', function() {
  var stubApiGetSeq, stubGetJSON;
  stubGetJSON = function(options) {
    var assert;
    assert = options.assert;
    return Stubs.stub($, 'getJSON', function(url, params) {
      var expectedParamsWithKey;
      assert.equal(url, options.url);
      expectedParamsWithKey = $.extend({
        key: options.key
      }, options.params);
      assert.deepEqual(params, expectedParamsWithKey, 'key appended');
      return TestHelpers.resolvedPromise();
    });
  };
  stubApiGetSeq = function(options) {
    var apiGetFunc, assert, dataPages, expectedPage, expectedUrl, totalPages;
    assert = options.assert;
    expectedUrl = options.url;
    totalPages = options.pageData.length;
    dataPages = $.map(options.pageData, function(pageData, ix) {
      return {
        books: pageData,
        page: ix + 1,
        total_pages: totalPages
      };
    });
    expectedPage = 1;
    apiGetFunc = function(url, params) {
      var expectedParams, pageStr;
      expectedParams = $.extend({
        page: expectedPage,
        per_page: FWD.allPagesPerPage
      }, options.params);
      pageStr = "Page " + expectedPage + " -";
      assert.deepEqual(params, expectedParams, pageStr + " Params match");
      assert.equal(url, expectedUrl, pageStr + " URL Matches");
      expectedPage += 1;
      return TestHelpers.resolvedPromise(dataPages[params.page - 1]);
    };
    return Stubs.stub(FWD.Api, 'get', apiGetFunc);
  };
  QUnit.test("FWD.Api.get() - returns jqXHR from $.getJSON with params extended by additional key param", function(assert) {
    var jqXHR, params;
    params = {
      name: 'User Userson',
      phone: '555-555-5555'
    };
    stubGetJSON({
      url: 'http://example.com',
      params: params,
      key: 'Test key',
      assert: assert
    });
    FWD.init('Test key');
    jqXHR = FWD.Api.get('http://example.com', {
      name: 'User Userson',
      phone: '555-555-5555'
    });
    return jqXHR.then(assert.async());
  });
  return QUnit.test("FWD.Api.getAllPages() - on success - makes a sequence of requests over all pages, returns aggregated data", function(assert) {
    var done, expectedBooks, expectedParams, expectedUrl;
    expectedUrl = 'http://example.com/books';
    expectedParams = {
      year: 2016,
      genre: 'Sci-fi'
    };
    expectedBooks = [
      {
        title: 'The Hunger Games',
        author: 'Suzanne Collins'
      }, {
        title: '1984',
        author: 'George Orwell'
      }, {
        title: 'The Giver',
        author: 'Lois Lowry'
      }, {
        title: 'Divergent',
        author: 'Veronica Roth'
      }, {
        title: 'Brave New World',
        author: 'Aldous Huxley'
      }, {
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury'
      }, {
        title: "The Handmaid's Tale",
        author: 'Margaret Atwood'
      }, {
        title: 'Animal Farm',
        author: 'George Orwell'
      }
    ];
    stubApiGetSeq({
      assert: assert,
      url: expectedUrl,
      params: expectedParams,
      pageData: [expectedBooks.slice(0, 3), expectedBooks.slice(3, 6), expectedBooks.slice(6, 8)]
    });
    done = assert.async();
    return FWD.Api.getAllPages(expectedUrl, 'books', expectedParams).then(function(collection) {
      assert.deepEqual(collection, expectedBooks, 'Collections aggregated properly');
      return done();
    });
  });
});

QUnit.module('FWD.Article', function() {
  return QUnit.test('FWD.Article.press()', function(assert) {
    return TestHelpers.testGetModelCollectionPage({
      func: FWD.Article.press,
      collectionField: 'articles',
      url: 'https://app.fwd.us/api/v1/articles/press.json',
      modelClass: FWD.Article
    }, assert);
  });
});

QUnit.module('FWD.Company', function() {
  QUnit.test('FWD.Company.loadAll()', function(assert) {
    return TestHelpers.testGetModelCollectionAllPages({
      func: FWD.Company.loadAll,
      collectionField: 'companies',
      url: 'https://app.fwd.us/api/v1/companies.json',
      modelClass: FWD.Company
    }, assert);
  });
  QUnit.test('FWD.Company.load()', function(assert) {
    return TestHelpers.testGetModelCollectionPage({
      func: FWD.Company.load,
      collectionField: 'companies',
      url: 'https://app.fwd.us/api/v1/companies.json',
      modelClass: FWD.Company
    }, assert);
  });
  return QUnit.test('FWD.Company.find()', function(assert) {
    var companies, done;
    companies = [
      new FWD.Company({
        id: '111'
      }), new FWD.Company({
        id: '222'
      }), new FWD.Company({
        id: '333'
      })
    ];
    Stubs.stub(FWD.Company, 'loadAll', function() {
      return TestHelpers.resolvedPromise(companies);
    });
    done = assert.async();
    return FWD.Company.find('222').then(function(company) {
      assert.equal(company, companies[1]);
      return done();
    });
  });
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QUnit.module('FWD.Factory', function() {
  var SubModel;
  SubModel = (function(superClass) {
    extend(SubModel, superClass);

    function SubModel() {
      return SubModel.__super__.constructor.apply(this, arguments);
    }

    return SubModel;

  })(FWD.Model);
  QUnit.test("FWD.Factory.loadPageFunc()", function(assert) {
    var done, expectedParams, expectedUrl, func, pageData;
    expectedUrl = 'http://example.com/collection';
    expectedParams = {
      param1: 'some value',
      tags: ['developer', 'web']
    };
    pageData = {
      items: [
        {
          first_name: 'Yukihiro',
          last_name: 'Matsumoto'
        }, {
          first_name: 'Yehuda',
          last_name: 'Katz'
        }
      ]
    };
    Stubs.stub(FWD.Api, 'get', function(url, params) {
      assert.equal(url, expectedUrl, 'Url passed properly');
      assert.deepEqual(params, {
        param1: 'some value',
        tags: 'developer,web'
      }, 'Params passed properly');
      return TestHelpers.resolvedPromise(pageData);
    });
    func = FWD.Factory.loadPageFunc({
      url: expectedUrl,
      collectionName: 'items',
      model: SubModel,
      arrayParams: ['tags']
    });
    done = assert.async();
    return func(expectedParams).then(function(modelCollection) {
      assert.equal(modelCollection[0].get('first_name'), 'Yukihiro');
      assert.equal(modelCollection[0].get('last_name'), 'Matsumoto');
      assert.equal(modelCollection[1].get('first_name'), 'Yehuda');
      assert.equal(modelCollection[1].get('last_name'), 'Katz');
      return done();
    });
  });
  QUnit.test("FWD.Factory.loadAllFunc()", function(assert) {
    var aggregatedAttrs, done, expectedParams, expectedUrl, func;
    expectedUrl = 'http://example.com/collection';
    expectedParams = {
      param1: 'some value',
      tags: ['developer', 'web']
    };
    func = FWD.Factory.loadAllFunc({
      url: expectedUrl,
      collectionName: 'items',
      model: SubModel,
      arrayParams: ['tags']
    });
    aggregatedAttrs = [
      {
        first_name: 'Yukihiro',
        last_name: 'Matsumoto'
      }, {
        first_name: 'Yehuda',
        last_name: 'Katz'
      }
    ];
    Stubs.stub(FWD.Api, 'getAllPages', function(url, collectionName, params) {
      assert.equal(url, expectedUrl, 'Url passed properly');
      assert.equal(collectionName, 'items', 'Collection Name passed properly');
      assert.deepEqual(params, {
        param1: 'some value',
        tags: 'developer,web'
      }, 'Params passed properly');
      return TestHelpers.resolvedPromise(aggregatedAttrs);
    });
    done = assert.async();
    return func(expectedParams).then(function(itemPageCollection) {
      assert.equal(itemPageCollection[0].get('first_name'), 'Yukihiro');
      assert.equal(itemPageCollection[0].get('last_name'), 'Matsumoto');
      assert.equal(itemPageCollection[1].get('first_name'), 'Yehuda');
      assert.equal(itemPageCollection[1].get('last_name'), 'Katz');
      return done();
    });
  });
  QUnit.test("FWD.Factory.convertArrayParams()", function(assert) {
    var params;
    params = {
      name: 'User Userson',
      tags: ['one', 'two', 'three and four']
    };
    return assert.deepEqual(FWD.Factory.convertArrayParams(params, ['tags']), {
      name: 'User Userson',
      tags: 'one,two,three and four'
    });
  });
  QUnit.test("FWD.Factory.arrayParam()", function(assert) {
    assert.equal(FWD.Factory.arrayParam('Some string'), 'Some string');
    return assert.equal(FWD.Factory.arrayParam(['list', 'of', 'different tags']), 'list,of,different tags');
  });
  return QUnit.test("FWD.Factory.attributesToModels()", function(assert) {
    var attrList, models;
    attrList = [
      {
        first_name: 'Homer',
        last_name: 'Simpson'
      }, {
        first_name: 'User',
        last_name: 'Userson'
      }
    ];
    models = FWD.Factory.attributesToModels(attrList, SubModel);
    assert.equal(models[0].get('first_name'), 'Homer');
    assert.equal(models[0].get('last_name'), 'Simpson');
    assert.equal(models[1].get('first_name'), 'User');
    return assert.equal(models[1].get('last_name'), 'Userson');
  });
});

QUnit.module('FWD init', function() {
  QUnit.test('FWD.init()', function(assert) {
    FWD.init('some key');
    return assert.ok(FWD.devKey === 'some key');
  });
  return QUnit.test('FWD.getDevKey()', function(assert) {
    FWD.init('init key');
    return assert.ok(FWD.getDevKey() === 'init key');
  });
});

QUnit.module('FWD.Model', function() {
  QUnit.test("FWD.Model#get() returns attribute set via constructor", function(assert) {
    var model;
    model = new FWD.Model({
      name: 'User Userson'
    });
    return assert.equal(model.get('name'), 'User Userson');
  });
  return QUnit.test("FWD.Model#get() returns attribute set via #set", function(assert) {
    var model;
    model = new FWD.Model();
    model.set('last_name', 'Userson');
    return assert.equal(model.get('last_name'), 'Userson');
  });
});

QUnit.module('FWD.Story', function() {
  QUnit.test("FWD.Story.index()", function(assert) {
    return TestHelpers.testGetModelCollectionPage({
      func: FWD.Story.index,
      collectionField: 'stories',
      url: 'https://app.fwd.us/api/v1/stories.json',
      modelClass: FWD.Story
    }, assert);
  });
  QUnit.test("FWD.Story.show()", function(assert) {
    return TestHelpers.testGetResource({
      func: FWD.Story.show,
      jsonField: 'story',
      url: function(id) {
        return "https://app.fwd.us/api/v1/stories/" + id + ".json";
      },
      modelClass: FWD.Story
    }, assert);
  });
  QUnit.test("FWD.Story.search()", function(assert) {
    return TestHelpers.testGetModelCollectionPage({
      func: FWD.Story.search,
      collectionField: 'stories',
      url: 'https://app.fwd.us/api/v1/stories/search.json',
      modelClass: FWD.Story,
      arrayParams: ['company', 'tags']
    }, assert);
  });
  QUnit.test("FWD.Story.searchAll()", function(assert) {
    return TestHelpers.testGetModelCollectionAllPages({
      func: FWD.Story.search,
      collectionField: 'stories',
      url: 'https://app.fwd.us/api/v1/stories/search.json',
      modelClass: FWD.Story,
      arrayParams: ['company', 'tags']
    }, assert);
  });
  QUnit.test("FWD.Story#company() when #company_id is present", function(assert) {
    var done, expectedCompany, story;
    story = new FWD.Story({
      company_id: 123
    });
    expectedCompany = new FWD.Company({
      id: 123
    });
    Stubs.stub(FWD.Company, 'find', function(company_id) {
      if (company_id === 123) {
        return TestHelpers.resolvedPromise(expectedCompany);
      } else {
        throw 'Unexpected company_id';
      }
    });
    done = assert.async();
    return story.company().then(function(company) {
      assert.equal(company, expectedCompany);
      return done();
    });
  });
  return QUnit.test('FWD.Story#company() when #company_id is blank', function(assert) {
    var done, story;
    done = assert.async();
    story = new FWD.Story();
    story.company().fail(function() {
      assert.ok(true);
      return done();
    });
    return null;
  });
});

QUnit.module('FWD.URL', function() {
  QUnit.test("FWD.URL.host", function(assert) {
    return assert.equal(FWD.URL.host, 'https://app.fwd.us/api/v1');
  });
  return QUnit.test("FWD.URL.for()", function(assert) {
    FWD.URL.urls['users'] = {
      show: function(id) {
        return "/people/" + id;
      },
      data: '/people/info'
    };
    assert.equal(FWD.URL["for"]('users#data'), 'https://app.fwd.us/api/v1/people/info', 'Static path');
    return assert.equal(FWD.URL["for"]('users#show')(321), 'https://app.fwd.us/api/v1/people/321', 'Dynamic path');
  });
});
