TestHelpers =
  resolvedPromise: (args...)->
    $.Deferred((defer)-> defer.resolve(args...)).promise()

  testGetModelCollectionPage: function(options, assert) {
    var func = options.func;
    var modelClass = options.modelClass;
    var expectedURL = options.url;
    var collectionField = options.collectionField;
    var arrayParams = options.arrayParams || [];

    var payload = {};
    payload[collectionField] = [
      {id: 123, randomAttr: 'Attribute value'},
      {id: 321, anotherAttr: 'Another attribute value'}
    ];

    var apiGetStub = function(url, params){
      assert.equal(params.param1, 'Param1 value');
      assert.equal(params.param2, 'Another value');
      assert.equal(url, expectedURL);

      $.each(arrayParams, function(ix, arrayParam){
        assert.equal(params[arrayParam], 'elem1,elem2,elem3');
      });

      return TestHelpers.resolvedPromise(payload);
    };

    Stubs.stub(FWD.Api, 'get', apiGetStub);

    var done = assert.async();
    var params = {param1: 'Param1 value', param2: 'Another value'};

    $.each(arrayParams, function(ix, arrayParam){
      params[arrayParam] = ['elem1', 'elem2', 'elem3'];
    });

    func(params).then(function(modelCollection){
      assert.ok(modelCollection[0] instanceof modelClass);
      assert.ok(modelCollection[1] instanceof modelClass);

      assert.equal(modelCollection[0].get('id'), 123);
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value');
      assert.equal(modelCollection[1].get('id'), 321);
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value');

      done();
    });
  },
  testGetModelCollectionAllPages: function(options, assert) {
    var func = options.func;
    var modelClass = options.modelClass;
    var expectedURL = options.url;
    var collectionField = options.collectionField;
    var arrayParams = options.arrayParams || [];

    var payload = {};
    payload[collectionField] = [
      {id: 123, randomAttr: 'Attribute value'},
      {id: 321, anotherAttr: 'Another attribute value'}
    ];

    var apiGetAllPagesStub = function(url, params){
      assert.equal(params.param1, 'Param1 value');
      assert.equal(params.param2, 'Another value');
      assert.equal(url, expectedURL);

      $.each(arrayParams, function(ix, arrayParam){
        assert.equal(params[arrayParam], 'elem1,elem2,elem3');
      });

      return TestHelpers.resolvedPromise(payload);
    };

    Stubs.stub(FWD.Api, 'getAllPages', apiGetAllPagesStub);

    var done = assert.async();
    var params = {param1: 'Param1 value', param2: 'Another value'};

    $.each(arrayParams, function(ix, arrayParam){
      params[arrayParam] = ['elem1', 'elem2', 'elem3'];
    });

    func(params).then(function(modelCollection){
      assert.ok(modelCollection[0] instanceof modelClass);
      assert.ok(modelCollection[1] instanceof modelClass);

      assert.equal(modelCollection[0].get('id'), 123);
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value');
      assert.equal(modelCollection[1].get('id'), 321);
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value');

      done();
    });
  }
};