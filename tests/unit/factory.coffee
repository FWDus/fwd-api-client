QUnit.module 'FWD.Factory', ->
  class SubModel extends FWD.Model

  QUnit.test "FWD.Factory.loadPageFunc", (assert)->
    expectedUrl = 'http://example.com/collection'
    expectedParams = param1: 'some value', tags: ['developer', 'web']

    pageData =
      items: [
        {first_name: 'Yukihiro', last_name: 'Matsumoto'}
        {first_name: 'Yehuda', last_name: 'Katz'}
      ]

    Stubs.stub FWD.Api, 'get', (url, params)->
      assert.equal(url, expectedUrl, 'Url passed properly')
      assert.deepEqual(params, {param1: 'some value', tags: 'developer,web'}, 'Params passed properly')
      TestHelpers.resolvedPromise(pageData)

    func = FWD.Factory.loadPageFunc
      url: expectedUrl
      collectionName: 'items'
      model: SubModel
      arrayParams: ['tags']

    done = assert.async()

    func(expectedParams).then (modelCollection)->
      assert.equal(modelCollection[0].get('first_name'), 'Yukihiro')
      assert.equal(modelCollection[0].get('last_name'), 'Matsumoto')
      assert.equal(modelCollection[1].get('first_name'), 'Yehuda')
      assert.equal(modelCollection[1].get('last_name'), 'Katz')

      done()

  QUnit.test "FWD.Factory.loadAllFunc", (assert)->
    expectedUrl = 'http://example.com/collection'
    expectedParams = param1: 'some value', tags: ['developer', 'web']

    func = FWD.Factory.loadAllFunc
      url: expectedUrl
      collectionName: 'items'
      model: SubModel
      arrayParams: ['tags']

    aggregatedAttrs = [
      {first_name: 'Yukihiro', last_name: 'Matsumoto'},
      {first_name: 'Yehuda', last_name: 'Katz'}
    ]

    Stubs.stub FWD.Api, 'getAllPages', (url, collectionName, params)->
      assert.equal(url, expectedUrl, 'Url passed properly')
      assert.equal(collectionName, 'items', 'Collection Name passed properly')
      assert.deepEqual(params, {param1: 'some value', tags: 'developer,web'}, 'Params passed properly')

      TestHelpers.resolvedPromise(aggregatedAttrs)

    done = assert.async()

    func(expectedParams).then (itemPageCollection)->
      assert.equal(itemPageCollection[0].get('first_name'), 'Yukihiro')
      assert.equal(itemPageCollection[0].get('last_name'), 'Matsumoto')
      assert.equal(itemPageCollection[1].get('first_name'), 'Yehuda')
      assert.equal(itemPageCollection[1].get('last_name'), 'Katz')

      done()

  QUnit.test "FWD.Factory.convertArrayParams", (assert)->
    params =
      name: 'User Userson',
      tags: ['one', 'two', 'three and four']

    assert.deepEqual FWD.Factory.convertArrayParams(params, ['tags']), {
      name: 'User Userson'
      tags: 'one,two,three and four'
    }


  QUnit.test "FWD.Factory.arrayParam", (assert)->
    assert.equal(FWD.Factory.arrayParam('Some string'), 'Some string')
    assert.equal(FWD.Factory.arrayParam(['list', 'of', 'different tags']), 'list,of,different tags')


  QUnit.test "FWD.Factory.attributesToModels", (assert)->
    attrList = [
      {first_name: 'Homer', last_name: 'Simpson'},
      {first_name: 'User', last_name: 'Userson'}
    ]

    models = FWD.Factory.attributesToModels(attrList, SubModel)

    assert.equal(models[0].get('first_name'), 'Homer')
    assert.equal(models[0].get('last_name'), 'Simpson')
    assert.equal(models[1].get('first_name'), 'User')
    assert.equal(models[1].get('last_name'), 'Userson')
