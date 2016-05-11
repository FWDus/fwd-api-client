QUnit.module 'FWD.Legislator', ->

  QUnit.test "FWD.Legislator.index()", (assert)->
    TestHelpers.testGetModelPage assert, FWD.Legislator.index,
      url: 'https://app.fwd.us/api/v1/legislators.json'
      jsonCollection: 'legislators'
      modelClass: FWD.Legislator

  QUnit.test "FWD.Legislator.search()", (assert)->
    TestHelpers.testGetModelPage assert, FWD.Legislator.search,
      url: 'https://app.fwd.us/api/v1/legislators/search.json'
      jsonCollection: 'legislators'
      modelClass: FWD.Legislator

  QUnit.test "FWD.Legislator.show()", (assert)->
    TestHelpers.testGetModel assert, FWD.Legislator.show,
      url: (legislator_id)-> "https://app.fwd.us/api/v1/legislators/#{legislator_id}.json"
      jsonField: 'legislator'
      modelClass: FWD.Legislator
