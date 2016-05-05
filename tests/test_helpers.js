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

TestHelpers = {
  resolvedPromise: function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return $.Deferred(function(defer) {
      return defer.resolve.apply(defer, args);
    }).promise();
  },
  testGetResource: function(options, assert) {
    var apiGetStub, done, expectedURL, func, jsonField, modelClass, obj, payload, url;
    func = options.func, modelClass = options.modelClass, url = options.url, jsonField = options.jsonField;
    expectedURL = url;
    payload = (
      obj = {},
      obj["" + jsonField] = {
        id: 123,
        randomAttr: 'Attribute value',
        anotherAttr: 'Another attribute value'
      },
      obj
    );
    apiGetStub = function(url, arg) {
      arg;
      assert.equal(url, expectedURL(123));
      return TestHelpers.resolvedPromise(payload);
    };
    Stubs.stub(FWD.Api, 'get', apiGetStub);
    done = assert.async();
    return func(123).then(function(model) {
      assert.ok(model instanceof modelClass);
      assert.equal(model.get('id'), 123);
      assert.equal(model.get('randomAttr'), 'Attribute value');
      assert.equal(model.get('anotherAttr'), 'Another attribute value');
      return done();
    });
  },
  testGetModelCollectionPage: function(options, assert) {
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
      return TestHelpers.resolvedPromise(payload);
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
  },
  testGetModelCollectionAllPages: function(options, assert) {
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
    apiGetAllPagesStub = function(url, collectionName, params) {
      assert.equal(collectionName, collectionField);
      assert.equal(params.param1, 'Param1 value');
      assert.equal(params.param2, 'Another value');
      assert.equal(url, expectedURL);
      $.each(arrayParams, function(ix, arrayParam) {
        return assert.equal(params[arrayParam], 'elem1,elem2,elem3');
      });
      return TestHelpers.resolvedPromise(attrCollection);
    };
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
  }
};
