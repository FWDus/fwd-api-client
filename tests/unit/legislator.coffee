QUnit.module 'FWD.Legislator', ->
  QUnit.test "FWD.Legislator.index()", (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Legislator.index
      collectionField: 'legislators'
      url: 'https://app.fwd.us/api/v1/legislators.json'
      modelClass: FWD.Legislator
    }, assert)

  QUnit.test "FWD.Legislator.search()", (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Legislator.search
      collectionField: 'legislators'
      url: 'https://app.fwd.us/api/v1/legislators/search.json'
      modelClass: FWD.Legislator
    }, assert)

  QUnit.test "FWD.Legislator.show()", (assert)->
    TestHelpers.testGetResource({
      func: FWD.Legislator.show
      jsonField: 'legislator'
      url: (bioguide_id)-> "https://app.fwd.us/api/v1/legislators/#{bioguide_id}.json"
      modelClass: FWD.Legislator
    }, assert)
