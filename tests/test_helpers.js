var Stubs,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Stubs = (function() {
  Stubs.init = function(qunit) {
    if (Stubs.instance) {
      return;
    }
    Stubs.instance = new Stubs(qunit);
    Stubs.stub = Stubs.instance.stub;
    return Stubs.restoreStubs = Stubs.instance.restoreStubs;
  };

  Stubs.prototype.stubStore = {};

  function Stubs(qunit1) {
    this.qunit = qunit1;
    this.stub = bind(this.stub, this);
    this.restoreStubs = bind(this.restoreStubs, this);
    QUnit.testStart(this.restoreStubs);
  }

  Stubs.prototype.restoreStubs = function() {
    $.each(this.stubStore, function(owner, stubs) {
      return $.each(stubs, function(propName, value) {
        return owner[propName] = value;
      });
    });
    return this.stubStore = {};
  };

  Stubs.prototype.stub = function(owner, propertyName, value) {
    this.stubStore[owner] = this.stubStore[owner] || {};
    this.stubStore[owner][propertyName] = value;
    return owner[propertyName] = value;
  };

  return Stubs;

})();

var TestHelpers,
  slice = [].slice;

TestHelpers = (function() {
  function TestHelpers() {}

  TestHelpers.sampleGetParams = function() {
    return {
      page: 2,
      per_page: 7,
      some_param: 'Some value',
      another_param: 'Another value'
    };
  };

  TestHelpers.resolvedPromise = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return $.Deferred(function(defer) {
      return defer.resolve.apply(defer, args);
    }).promise();
  };

  TestHelpers.testGetModel = function(assert, method, options) {
    var expectedModelId, expectedPromise, promise;
    expectedPromise = TestHelpers.resolvedPromise({});
    expectedModelId = 123;
    Stubs.stub(FWD.Api, 'getModel', function(getModelOptions) {
      assert.equal(getModelOptions.modelClass, options.modelClass);
      assert.equal(getModelOptions.jsonField, options.jsonField);
      assert.equal(getModelOptions.url, options.url(expectedModelId));
      return expectedPromise;
    });
    promise = method(expectedModelId);
    return assert.equal(promise, expectedPromise);
  };

  TestHelpers.testGetModelPage = function(assert, method, options) {
    var expectedGetParams, expectedPromise, promise;
    expectedPromise = TestHelpers.resolvedPromise({});
    expectedGetParams = TestHelpers.sampleGetParams();
    Stubs.stub(FWD.Api, 'getModelPage', function(getModelOptions) {
      var getParams;
      getParams = getModelOptions.params;
      delete getModelOptions.params;
      assert.deepEqual(getModelOptions, options);
      assert.deepEqual(getParams, expectedGetParams);
      return expectedPromise;
    });
    promise = method(expectedGetParams);
    return assert.equal(promise, expectedPromise);
  };

  TestHelpers.testGetAllModels = function(assert, method, options) {
    var expectedParams, expectedPromise, promise;
    expectedPromise = TestHelpers.resolvedPromise({});
    expectedParams = {};
    Stubs.stub(FWD.Api, 'getAllModels', function(getAllPagesOptions) {
      var getParams;
      getParams = getAllPagesOptions.params;
      delete getAllPagesOptions.params;
      assert.deepEqual(getAllPagesOptions, options);
      assert.deepEqual(getParams, expectedParams);
      return expectedPromise;
    });
    promise = method(expectedParams);
    return assert.deepEqual(promise, expectedPromise);
  };

  TestHelpers.testGetModelCollectionPage = function(options, assert) {
    var apiGetStub, arrayParams, collectionField, done, expectedURL, func, modelClass, params, payload, ref, url;
    func = options.func, modelClass = options.modelClass, url = options.url, collectionField = options.collectionField, arrayParams = (ref = options.arrayParams) != null ? ref : [];
    expectedURL = url;
    payload = {};
    payload[collectionField] = [
      {
        id: 123,
        randomAttr: 'Attribute value'
      }, {
        id: 321,
        anotherAttr: 'Another attribute value'
      }
    ];
    apiGetStub = function(url, params) {
      assert.equal(params.param1, 'Param1 value');
      assert.equal(params.param2, 'Another value');
      assert.equal(url, expectedURL);
      $.each(arrayParams, function(ix, arrayParam) {
        return assert.equal(params[arrayParam], 'elem1,elem2,elem3');
      });
      return this.resolvedPromise(payload);
    };
    Stubs.stub(FWD.Api, 'get', apiGetStub);
    done = assert.async();
    params = {
      param1: 'Param1 value',
      param2: 'Another value'
    };
    $.each(arrayParams, function(ix, arrayParam) {
      return params[arrayParam] = ['elem1', 'elem2', 'elem3'];
    });
    return func(params).then(function(modelCollection) {
      assert.ok(modelCollection[0] instanceof modelClass);
      assert.ok(modelCollection[1] instanceof modelClass);
      assert.equal(modelCollection[0].get('id'), 123);
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value');
      assert.equal(modelCollection[1].get('id'), 321);
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value');
      return done();
    });
  };

  TestHelpers.testGetModelCollectionAllPages = function(options, assert) {
    var apiGetAllPagesStub, arrayParams, attrCollection, collectionField, done, expectedURL, func, modelClass, params, ref, url;
    func = options.func, modelClass = options.modelClass, url = options.url, collectionField = options.collectionField, arrayParams = (ref = options.arrayParams) != null ? ref : [];
    expectedURL = url;
    attrCollection = [
      {
        id: 123,
        randomAttr: 'Attribute value'
      }, {
        id: 321,
        anotherAttr: 'Another attribute value'
      }
    ];
    apiGetAllPagesStub = (function(_this) {
      return function(url, collectionName, params) {
        assert.equal(collectionName, collectionField);
        assert.equal(params.param1, 'Param1 value');
        assert.equal(params.param2, 'Another value');
        assert.equal(url, expectedURL);
        $.each(arrayParams, function(ix, arrayParam) {
          return assert.equal(params[arrayParam], 'elem1,elem2,elem3');
        });
        return _this.resolvedPromise(attrCollection);
      };
    })(this);
    Stubs.stub(FWD.Api, 'getAllPages', apiGetAllPagesStub);
    done = assert.async();
    params = {
      param1: 'Param1 value',
      param2: 'Another value'
    };
    $.each(arrayParams, function(ix, arrayParam) {
      return params[arrayParam] = ['elem1', 'elem2', 'elem3'];
    });
    return func(params).then(function(modelCollection) {
      assert.ok(modelCollection[0] instanceof modelClass);
      assert.ok(modelCollection[1] instanceof modelClass);
      assert.equal(modelCollection[0].get('id'), 123);
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value');
      assert.equal(modelCollection[1].get('id'), 321);
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value');
      return done();
    });
  };

  return TestHelpers;

})();
