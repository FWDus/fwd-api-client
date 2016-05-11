class TestHelpers
  @sampleGetParams: ->
    page: 2
    per_page: 7
    some_param: 'Some value'
    another_param: 'Another value'

  @resolvedPromise: (args...)->
    $.Deferred((defer)-> defer.resolve(args...)).promise()

  @testGetModel: (assert, method, options)=>
    expectedPromise = @resolvedPromise({})
    expectedModelId = 123

    Stubs.stub FWD.Api, 'getModel', (getModelOptions)->
      assert.equal(getModelOptions.modelClass, options.modelClass)
      assert.equal(getModelOptions.jsonField, options.jsonField)
      assert.equal(getModelOptions.url, options.url(expectedModelId))
      expectedPromise

    promise = method(expectedModelId)
    assert.equal(promise, expectedPromise)

  @testGetModelPage: (assert, method, options)=>
    expectedPromise = @resolvedPromise({})
    expectedGetParams = @sampleGetParams()

    Stubs.stub FWD.Api, 'getModelPage', (getModelOptions)->
      getParams = getModelOptions.params
      delete getModelOptions.params
      assert.deepEqual(getModelOptions, options)
      assert.deepEqual(getParams, expectedGetParams)
      expectedPromise

    promise = method(expectedGetParams)
    assert.equal(promise, expectedPromise)


  @testGetAllModels: (assert, method, options)=>
    expectedPromise = @resolvedPromise({})
    expectedParams = {}

    Stubs.stub FWD.Api, 'getAllModels', (getAllPagesOptions)->
      getParams = getAllPagesOptions.params
      delete getAllPagesOptions.params
      assert.deepEqual(getAllPagesOptions, options)
      assert.deepEqual(getParams, expectedParams)
      expectedPromise

    promise = method(expectedParams)
    assert.deepEqual(promise, expectedPromise)

  @testGetResource: (options, assert)=>
    {func, modelClass, url, jsonField} = options
    expectedURL = url

    payload = {"#{jsonField}": {id: 123, randomAttr: 'Attribute value', anotherAttr: 'Another attribute value'}}
    apiGetStub = (url, {})->
      assert.equal(url, expectedURL(123))
      @resolvedPromise(payload)

    Stubs.stub(FWD.Api, 'get', apiGetStub)

    done = assert.async()
    func(123).then (model)->
      assert.ok(model instanceof modelClass)

      assert.equal(model.get('id'), 123)
      assert.equal(model.get('randomAttr'), 'Attribute value')
      assert.equal(model.get('anotherAttr'), 'Another attribute value')

      done()


  @testGetModelCollectionPage: (options, assert)=>
    {func, modelClass, url, collectionField, arrayParams = []} = options
    expectedURL = url

    payload = {}
    payload[collectionField] = [
      {id: 123, randomAttr: 'Attribute value'},
      {id: 321, anotherAttr: 'Another attribute value'}
    ]

    apiGetStub = (url, params)->
      assert.equal(params.param1, 'Param1 value')
      assert.equal(params.param2, 'Another value')
      assert.equal(url, expectedURL)

      $.each arrayParams, (ix, arrayParam)->
        assert.equal(params[arrayParam], 'elem1,elem2,elem3');
      @resolvedPromise(payload)

    Stubs.stub(FWD.Api, 'get', apiGetStub)

    done = assert.async()
    params = param1: 'Param1 value', param2: 'Another value'

    $.each arrayParams, (ix, arrayParam)->
      params[arrayParam] = ['elem1', 'elem2', 'elem3'];

    func(params).then (modelCollection)->
      assert.ok(modelCollection[0] instanceof modelClass)
      assert.ok(modelCollection[1] instanceof modelClass)

      assert.equal(modelCollection[0].get('id'), 123)
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value')
      assert.equal(modelCollection[1].get('id'), 321)
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value')

      done()
      

  @testGetModelCollectionAllPages: (options, assert)->
    {func, modelClass, url, collectionField, arrayParams = []} = options
    expectedURL = url

    attrCollection = [
      {id: 123, randomAttr: 'Attribute value'},
      {id: 321, anotherAttr: 'Another attribute value'}
    ]

    apiGetAllPagesStub = (url, collectionName, params)=>
      assert.equal(collectionName, collectionField)

      assert.equal(params.param1, 'Param1 value')
      assert.equal(params.param2, 'Another value')
      assert.equal(url, expectedURL)

      $.each arrayParams, (ix, arrayParam)->
        assert.equal(params[arrayParam], 'elem1,elem2,elem3')
      @resolvedPromise(attrCollection)


    Stubs.stub(FWD.Api, 'getAllPages', apiGetAllPagesStub)

    done = assert.async()
    params = param1: 'Param1 value', param2: 'Another value'

    $.each arrayParams, (ix, arrayParam)->
      params[arrayParam] = ['elem1', 'elem2', 'elem3']

    func(params).then (modelCollection)->
      assert.ok(modelCollection[0] instanceof modelClass)
      assert.ok(modelCollection[1] instanceof modelClass)

      assert.equal(modelCollection[0].get('id'), 123)
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value')
      assert.equal(modelCollection[1].get('id'), 321)
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value')

      done()
