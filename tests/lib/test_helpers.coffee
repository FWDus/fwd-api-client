TestHelpers =
  resolvedPromise: (args...)->
    $.Deferred((defer)-> defer.resolve(args...)).promise()

  testGetModelCollectionPage: (options, assert)->
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
      TestHelpers.resolvedPromise(payload)

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

  testGetModelCollectionAllPages: (options, assert)->
    {func, modelClass, url, collectionField, arrayParams = []} = options
    expectedURL = url

    attrCollection = [
      {id: 123, randomAttr: 'Attribute value'},
      {id: 321, anotherAttr: 'Another attribute value'}
    ]

    apiGetAllPagesStub = (url, collectionName, params)->
      assert.equal(collectionName, collectionField)

      assert.equal(params.param1, 'Param1 value')
      assert.equal(params.param2, 'Another value')
      assert.equal(url, expectedURL)

      $.each arrayParams, (ix, arrayParam)->
        assert.equal(params[arrayParam], 'elem1,elem2,elem3')
      TestHelpers.resolvedPromise(attrCollection)


    Stubs.stub(FWD.Api, 'getAllPages', apiGetAllPagesStub)

    done = assert.async()
    params = param1: 'Param1 value', param2: 'Another value'

    $.each arrayParams, (ix, arrayParam)->
      params[arrayParam] = ['elem1', 'elem2', 'elem3']

    func(params).then (modelCollection)->
      console.log(arguments)

      assert.ok(modelCollection[0] instanceof modelClass)
      assert.ok(modelCollection[1] instanceof modelClass)

      assert.equal(modelCollection[0].get('id'), 123)
      assert.equal(modelCollection[0].get('randomAttr'), 'Attribute value')
      assert.equal(modelCollection[1].get('id'), 321)
      assert.equal(modelCollection[1].get('anotherAttr'), 'Another attribute value')

      done()
