QUnit.module 'FWD.Story', ->

  QUnit.test "FWD.Story.index()", (assert)->
    TestHelpers.testGetModelPage assert, FWD.Story.index,
      jsonCollection: 'stories'
      url: 'https://app.fwd.us/api/v1/stories.json'
      modelClass: FWD.Story

  QUnit.test "FWD.Story.show()", (assert)->
    TestHelpers.testGetModel assert, FWD.Story.show,
      jsonField: 'story'
      url: (id)-> "https://app.fwd.us/api/v1/stories/#{id}.json"
      modelClass: FWD.Story

  QUnit.test "FWD.Story.search()", (assert)->
    TestHelpers.testGetModelPage assert, FWD.Story.search,
      jsonCollection: 'stories'
      url: 'https://app.fwd.us/api/v1/stories/search.json'
      arrayParams: ['company', 'tags']
      modelClass: FWD.Story

  QUnit.test "FWD.Story.searchAll()", (assert)->
    TestHelpers.testGetAllModels assert, FWD.Story.searchAll,
      url: 'https://app.fwd.us/api/v1/stories/search.json'
      jsonCollection: 'stories'
      modelClass: FWD.Story
      arrayParams: ['company', 'tags']

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
