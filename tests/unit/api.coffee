QUnit.module 'FWD.Api', ->

  stubGetJSON = (options)->
    {assert} = options

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

    stubGetJSON(
      url: 'http://example.com',
      params: params,
      key: 'Test key',
      assert: assert
    )

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
