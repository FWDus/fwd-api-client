var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QUnit.module('FWD.Api', function() {
  var TestSubModel, paginatedCollectionPayload, stubApiGetSeq, stubGetJSON, userAttrCollection;
  TestSubModel = (function(superClass) {
    extend(TestSubModel, superClass);

    function TestSubModel() {
      return TestSubModel.__super__.constructor.apply(this, arguments);
    }

    return TestSubModel;

  })(FWD.Model);
  userAttrCollection = function() {
    return [
      {
        id: 123,
        first_name: 'Yukihiro',
        last_name: 'Matsumoto'
      }, {
        id: 124,
        first_name: 'Yehuda',
        last_name: 'Katz'
      }
    ];
  };
  paginatedCollectionPayload = function() {
    return {
      user_collection: userAttrCollection(),
      page: 1,
      total_pages: 1,
      total_count: 2
    };
  };
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
  QUnit.test("FWD.Api.getAllPages() - on success - makes a sequence of requests over all pages, returns aggregated data", function(assert) {
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
  QUnit.test('FWD.Api.getAllModels()', function(assert) {
    var done, expectedModelAttrs, promise;
    expectedModelAttrs = userAttrCollection();
    Stubs.stub(FWD.Api, 'getAllPages', function(url, jsonCollection, params) {
      assert.equal(url, 'http://example.com/users.json');
      assert.equal(jsonCollection, 'users');
      assert.equal(params.param, 'some value');
      assert.equal(params.filter_tags, 'developer,web');
      assert.equal(params.filter_categories, 'js,bash,devOps');
      return TestHelpers.resolvedPromise(expectedModelAttrs);
    });
    promise = FWD.Api.getAllModels({
      url: 'http://example.com/users.json',
      jsonCollection: 'users',
      modelClass: TestSubModel,
      arrayParams: ['filter_tags', 'filter_categories'],
      params: {
        param: 'some value',
        filter_tags: ['developer', 'web'],
        filter_categories: ['js', 'bash', 'devOps']
      }
    });
    done = assert.async();
    return promise.done((function(_this) {
      return function(modelCollection) {
        assert.ok(modelCollection[0] instanceof TestSubModel);
        assert.ok(modelCollection[1] instanceof TestSubModel);
        assert.equal(modelCollection[0].get('id'), 123);
        assert.equal(modelCollection[0].get('first_name'), 'Yukihiro');
        assert.equal(modelCollection[0].get('last_name'), 'Matsumoto');
        assert.equal(modelCollection[1].get('id'), 124);
        assert.equal(modelCollection[1].get('first_name'), 'Yehuda');
        assert.equal(modelCollection[1].get('last_name'), 'Katz');
        return done();
      };
    })(this));
  });
  QUnit.test('FWD.Api.getModel()', function(assert) {
    var done, jsonPayload, promise;
    jsonPayload = {
      user: {
        id: 321,
        first_name: 'User',
        last_name: 'Userson'
      }
    };
    Stubs.stub(FWD.Api, 'get', function(url) {
      assert.equal(url, 'http://example.com/users/123.json');
      return TestHelpers.resolvedPromise(jsonPayload);
    });
    promise = FWD.Api.getModel({
      url: 'http://example.com/users/123.json',
      jsonField: 'user',
      modelClass: TestSubModel
    });
    done = assert.async();
    return promise.done(function(model) {
      assert.ok(model instanceof TestSubModel);
      assert.equal(model.get('id'), '321');
      assert.equal(model.get('first_name'), 'User');
      assert.equal(model.get('last_name'), 'Userson');
      return done();
    });
  });
  QUnit.test('FWD.Api.getPage() - should call FWD.Api.get with converted array params', function(assert) {
    var payload, promise, requestParams, requestPromise;
    requestParams = {
      category: 'users',
      page: 1,
      tags: ['daca', 'dapa']
    };
    payload = paginatedCollectionPayload();
    requestPromise = TestHelpers.resolvedPromise(payload);
    Stubs.stub(FWD.Api, 'get', function(url, params) {
      assert.equal(url, 'http://example.com/collection.json', 'URL passed correctly');
      assert.equal(params.category, 'users');
      assert.equal(params.page, 1);
      assert.equal(params.tags, 'daca,dapa', 'Array params converted');
      return requestPromise;
    });
    promise = FWD.Api.getPage({
      url: 'http://example.com/collection.json',
      arrayParams: ['tags'],
      params: requestParams
    });
    return assert.equal(promise, requestPromise, 'Get request promise returned');
  });
  return QUnit.test('FWD.Api.getModelPage() - returns model collection', function(assert) {
    var done, promise, requestParams;
    requestParams = {
      category: 'users',
      page: 1,
      tags: ['daca', 'dapa']
    };
    Stubs.stub(FWD.Api, 'getPage', function(options) {
      assert.equal(options.url, 'http://example.com/collection.json', 'URL passed correctly');
      assert.deepEqual(options.arrayParams, ['tags'], 'array param names passed correctly');
      assert.equal(options.params, requestParams, 'request params passed correctly');
      return TestHelpers.resolvedPromise(paginatedCollectionPayload());
    });
    promise = FWD.Api.getModelPage({
      url: 'http://example.com/collection.json',
      arrayParams: ['tags'],
      params: requestParams,
      modelClass: TestSubModel,
      jsonCollection: 'user_collection'
    });
    done = assert.async();
    return promise.done(function(modelCollection) {
      assert.equal(modelCollection.length, 2);
      assert.ok(modelCollection[0] instanceof TestSubModel);
      assert.ok(modelCollection[1] instanceof TestSubModel);
      assert.equal(modelCollection[0].get('id'), 123);
      assert.equal(modelCollection[0].get('first_name'), 'Yukihiro');
      assert.equal(modelCollection[0].get('last_name'), 'Matsumoto');
      assert.equal(modelCollection[1].get('id'), 124);
      assert.equal(modelCollection[1].get('first_name'), 'Yehuda');
      assert.equal(modelCollection[1].get('last_name'), 'Katz');
      return done();
    });
  });
});

QUnit.module('FWD.Article', function() {
  return QUnit.test('FWD.Article.press()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Article.press, {
      url: 'https://app.fwd.us/api/v1/articles/press.json',
      jsonCollection: 'articles',
      modelClass: FWD.Article,
      arrayParams: ['tags']
    });
  });
});

QUnit.module('FWD.Company', function() {
  QUnit.test('FWD.Company.loadAll()', function(assert) {
    return TestHelpers.testGetAllModels(assert, FWD.Company.loadAll, {
      url: 'https://app.fwd.us/api/v1/companies.json',
      jsonCollection: 'companies',
      modelClass: FWD.Company,
      cacheResponse: true
    });
  });
  QUnit.test('FWD.Company.load()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Company.load, {
      url: 'https://app.fwd.us/api/v1/companies.json',
      jsonCollection: 'companies',
      modelClass: FWD.Company
    });
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

QUnit.module('FWD.Legislator', function() {
  QUnit.test("FWD.Legislator.index()", function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Legislator.index, {
      url: 'https://app.fwd.us/api/v1/legislators.json',
      jsonCollection: 'legislators',
      modelClass: FWD.Legislator
    });
  });
  QUnit.test("FWD.Legislator.search()", function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Legislator.search, {
      url: 'https://app.fwd.us/api/v1/legislators/search.json',
      jsonCollection: 'legislators',
      modelClass: FWD.Legislator
    });
  });
  return QUnit.test("FWD.Legislator.show()", function(assert) {
    return TestHelpers.testGetModel(assert, FWD.Legislator.show, {
      url: function(legislator_id) {
        return "https://app.fwd.us/api/v1/legislators/" + legislator_id + ".json";
      },
      jsonField: 'legislator',
      modelClass: FWD.Legislator
    });
  });
});

QUnit.module('FWD.Letter', function() {
  QUnit.test('FWD.Letter.index()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Letter.index, {
      jsonCollection: 'letters',
      url: 'https://app.fwd.us/api/v1/letters.json',
      modelClass: FWD.Letter
    });
  });
  return QUnit.test('FWD.Letter.show()', function(assert) {
    return TestHelpers.testGetModel(assert, FWD.Letter.show, {
      jsonField: 'letter',
      modelClass: FWD.Letter,
      url: function(letter_id) {
        return "https://app.fwd.us/api/v1/letters/" + letter_id + ".json";
      }
    });
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

QUnit.module('FWD.Selfie', function() {
  QUnit.test('FWD.Selfie.index()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Selfie.index, {
      jsonCollection: 'selfies',
      url: 'https://app.fwd.us/api/v1/selfies.json',
      modelClass: FWD.Selfie
    });
  });
  QUnit.test('FWD.Selfie.show()', function(assert) {
    return TestHelpers.testGetModel(assert, FWD.Selfie.show, {
      jsonField: 'selfie',
      url: function(selfie_id) {
        return "https://app.fwd.us/api/v1/selfies/" + selfie_id + ".json";
      },
      modelClass: FWD.Selfie
    });
  });
  QUnit.test('FWD.Selfie.gallery()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Selfie.gallery, {
      jsonCollection: 'selfies',
      url: 'https://app.fwd.us/api/v1/selfies/gallery.json',
      modelClass: FWD.Selfie
    });
  });
  return QUnit.test('FWD.Selfie.celebrities()', function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Selfie.celebrities, {
      jsonCollection: 'selfies',
      url: 'https://app.fwd.us/api/v1/selfies/celebrities.json',
      modelClass: FWD.Selfie
    });
  });
});

QUnit.module('FWD.Story', function() {
  QUnit.test("FWD.Story.index()", function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Story.index, {
      jsonCollection: 'stories',
      url: 'https://app.fwd.us/api/v1/stories.json',
      modelClass: FWD.Story
    });
  });
  QUnit.test("FWD.Story.show()", function(assert) {
    return TestHelpers.testGetModel(assert, FWD.Story.show, {
      jsonField: 'story',
      url: function(id) {
        return "https://app.fwd.us/api/v1/stories/" + id + ".json";
      },
      modelClass: FWD.Story
    });
  });
  QUnit.test("FWD.Story.search()", function(assert) {
    return TestHelpers.testGetModelPage(assert, FWD.Story.search, {
      jsonCollection: 'stories',
      url: 'https://app.fwd.us/api/v1/stories/search.json',
      arrayParams: ['company', 'tags'],
      modelClass: FWD.Story
    });
  });
  QUnit.test("FWD.Story.searchAll()", function(assert) {
    return TestHelpers.testGetAllModels(assert, FWD.Story.searchAll, {
      url: 'https://app.fwd.us/api/v1/stories/search.json',
      jsonCollection: 'stories',
      modelClass: FWD.Story,
      arrayParams: ['company', 'tags']
    });
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
    assert.equal(FWD.URL["for"]('users#data'), 'https://app.fwd.us/api/v1/people/info.json', 'Static path');
    return assert.equal(FWD.URL["for"]('users#show')(321), 'https://app.fwd.us/api/v1/people/321.json', 'Dynamic path');
  });
});
