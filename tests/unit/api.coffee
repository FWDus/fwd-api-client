QUnit.module 'FWD.Api', ->
  class TestSubModel extends FWD.Model

  userAttrCollection = ->
    [
      {id: 123, first_name: 'Yukihiro', last_name: 'Matsumoto'}
      {id: 124, first_name: 'Yehuda', last_name: 'Katz'}
    ]

  paginatedCollectionPayload = ->
    user_collection: userAttrCollection()
    page: 1,
    total_pages: 1
    total_count: 2

  stubGetJSON = (options)->
    assert = options.assert

    Stubs.stub $, 'getJSON', (url, params)->
      assert.equal url, options.url

      expectedParamsWithKey = $.extend key: options.key, options.params
      assert.deepEqual params, expectedParamsWithKey, 'key appended'

      TestHelpers.resolvedPromise()


  stubApiGetSeq = (options)->
    assert = options.assert;
    expectedUrl = options.url;
    totalPages = options.pageData.length;

    dataPages = $.map options.pageData, (pageData, ix)->
      books: pageData,
      page: ix + 1,
      total_pages: totalPages

    expectedPage = 1

    apiGetFunc = (url, params)->
      expectedParams = $.extend(page: expectedPage, per_page: FWD.allPagesPerPage, options.params)
      pageStr = "Page #{expectedPage} -"

      assert.deepEqual(params, expectedParams, "#{pageStr} Params match")
      assert.equal(url, expectedUrl, "#{pageStr} URL Matches")

      expectedPage += 1
      TestHelpers.resolvedPromise(dataPages[params.page - 1])

    Stubs.stub(FWD.Api, 'get', apiGetFunc)

  QUnit.test "FWD.Api.get() - returns jqXHR from $.getJSON with params extended by additional key param", (assert)->
    params = name: 'User Userson', phone: '555-555-5555'

    stubGetJSON
      url: 'http://example.com',
      params: params,
      key: 'Test key',
      assert: assert

    FWD.init 'Test key'
    jqXHR = FWD.Api.get 'http://example.com', name: 'User Userson', phone: '555-555-5555'
    jqXHR.then assert.async() # checking if promise was returned


  QUnit.test "FWD.Api.getAllPages() - on success - makes a sequence of requests over all pages, returns aggregated data", (assert)->
    expectedUrl = 'http://example.com/books'
    expectedParams = year: 2016, genre: 'Sci-fi'
    expectedBooks = [
      {title: 'The Hunger Games', author: 'Suzanne Collins'},
      {title: '1984', author: 'George Orwell'},
      {title: 'The Giver', author: 'Lois Lowry'},
      {title: 'Divergent', author: 'Veronica Roth'},
      {title: 'Brave New World', author: 'Aldous Huxley'},
      {title: 'Fahrenheit 451', author: 'Ray Bradbury'},
      {title: "The Handmaid's Tale", author: 'Margaret Atwood'},
      {title: 'Animal Farm', author: 'George Orwell'}
    ]

    stubApiGetSeq
      assert: assert
      url: expectedUrl
      params: expectedParams
      pageData: [
        expectedBooks.slice(0, 3)
        expectedBooks.slice(3, 6)
        expectedBooks.slice(6, 8)
      ]

    done = assert.async()
    FWD.Api.getAllPages(expectedUrl, 'books', expectedParams).then (collection)->
      assert.deepEqual collection, expectedBooks, 'Collections aggregated properly'
      done()

  QUnit.test 'FWD.Api.getAllModels()', (assert)->
    expectedModelAttrs = userAttrCollection()

    Stubs.stub FWD.Api, 'getAllPages', (url, jsonCollection, params)->
      assert.equal(url, 'http://example.com/users.json')
      assert.equal(jsonCollection, 'users')
      assert.equal(params.param, 'some value')
      assert.equal(params.filter_tags, 'developer,web')
      assert.equal(params.filter_categories, 'js,bash,devOps')
      TestHelpers.resolvedPromise(expectedModelAttrs)

    promise = FWD.Api.getAllModels
      url: 'http://example.com/users.json'
      jsonCollection: 'users'
      modelClass: TestSubModel
      arrayParams: ['filter_tags', 'filter_categories']
      params:
        param: 'some value'
        filter_tags: ['developer', 'web']
        filter_categories: ['js', 'bash', 'devOps']

    done = assert.async()
    promise.done (modelCollection)=>
      assert.ok(modelCollection[0] instanceof TestSubModel);
      assert.ok(modelCollection[1] instanceof TestSubModel);

      assert.equal(modelCollection[0].get('id'), 123)
      assert.equal(modelCollection[0].get('first_name'), 'Yukihiro')
      assert.equal(modelCollection[0].get('last_name'), 'Matsumoto')

      assert.equal(modelCollection[1].get('id'), 124)
      assert.equal(modelCollection[1].get('first_name'), 'Yehuda')
      assert.equal(modelCollection[1].get('last_name'), 'Katz')
      done()

  QUnit.test 'FWD.Api.getModel()', (assert)->
    jsonPayload =
      user:
        id: 321
        first_name: 'User'
        last_name: 'Userson'

    Stubs.stub FWD.Api, 'get', (url)->
      assert.equal(url, 'http://example.com/users/123.json')
      TestHelpers.resolvedPromise(jsonPayload)

    promise = FWD.Api.getModel
      url: 'http://example.com/users/123.json'
      jsonField: 'user'
      modelClass: TestSubModel

    done = assert.async()
    promise.done (model)->
      assert.ok(model instanceof TestSubModel)
      assert.equal(model.get('id'), '321')
      assert.equal(model.get('first_name'), 'User')
      assert.equal(model.get('last_name'), 'Userson')
      done()

  QUnit.test 'FWD.Api.getPage() - should call FWD.Api.get with converted array params', (assert) ->
    requestParams =
      category: 'users'
      page: 1
      tags: ['daca', 'dapa']

    payload = paginatedCollectionPayload()

    requestPromise = TestHelpers.resolvedPromise(payload)
    Stubs.stub FWD.Api, 'get', (url, params)->
      assert.equal(url, 'http://example.com/collection.json', 'URL passed correctly')
      assert.equal(params.category, 'users')
      assert.equal(params.page, 1)
      assert.equal(params.tags, 'daca,dapa', 'Array params converted')
      requestPromise

    promise = FWD.Api.getPage
      url: 'http://example.com/collection.json'
      arrayParams: ['tags']
      params: requestParams

    assert.equal(promise, requestPromise, 'Get request promise returned')


  QUnit.test 'FWD.Api.getModelPage() - returns model collection', (assert) ->
    requestParams =
      category: 'users'
      page: 1
      tags: ['daca', 'dapa']

    Stubs.stub FWD.Api, 'getPage', (options)->
      assert.equal(options.url, 'http://example.com/collection.json', 'URL passed correctly')
      assert.deepEqual(options.arrayParams, ['tags'], 'array param names passed correctly')
      assert.equal(options.params, requestParams, 'request params passed correctly')
      TestHelpers.resolvedPromise(paginatedCollectionPayload())

    promise = FWD.Api.getModelPage(
      url: 'http://example.com/collection.json'
      arrayParams: ['tags']
      params: requestParams
      modelClass: TestSubModel
      jsonCollection: 'user_collection'
    )

    done = assert.async()
    promise.done (modelCollection)->
      assert.equal(modelCollection.length, 2)

      assert.ok(modelCollection[0] instanceof TestSubModel);
      assert.ok(modelCollection[1] instanceof TestSubModel);

      assert.equal(modelCollection[0].get('id'), 123)
      assert.equal(modelCollection[0].get('first_name'), 'Yukihiro')
      assert.equal(modelCollection[0].get('last_name'), 'Matsumoto')

      assert.equal(modelCollection[1].get('id'), 124)
      assert.equal(modelCollection[1].get('first_name'), 'Yehuda')
      assert.equal(modelCollection[1].get('last_name'), 'Katz')

      done()

