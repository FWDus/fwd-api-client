QUnit.module 'FWD.Story', ->
  QUnit.test "FWD.Story.index", (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Story.index
      collectionField: 'stories'
      url: 'https://app.fwd.us/api/v1/stories.json'
      modelClass: FWD.Story
    }, assert)


  QUnit.test "FWD.Story.search", (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Story.search
      collectionField: 'stories'
      url: 'https://app.fwd.us/api/v1/stories/search.json'
      modelClass: FWD.Story
      arrayParams: ['company', 'tags']
    }, assert)


  QUnit.test "FWD.Story.searchAll", (assert)->
    TestHelpers.testGetModelCollectionAllPages({
      func: FWD.Story.search
      collectionField: 'stories'
      url: 'https://app.fwd.us/api/v1/stories/search.json'
      modelClass: FWD.Story
      arrayParams: ['company', 'tags']
    }, assert)


  QUnit.test "FWD.Story#company() when #company_id is present", (assert)->
    story = new FWD.Story(company_id: 123)
    expectedCompany = new FWD.Company(id: 123)

    Stubs.stub FWD.Company, 'find', (company_id)->
      if (company_id == 123)
        TestHelpers.resolvedPromise(expectedCompany)
      else
        throw 'Unexpected company_id';

    done = assert.async()
    story.company().then (company)->
      assert.equal(company, expectedCompany)
      done()

  QUnit.test 'FWD.Story#company() when #company_id is blank', (assert)->
    done = assert.async()

    story = new FWD.Story()
    story.company().fail ->
      assert.ok(true)
      done()

    null
