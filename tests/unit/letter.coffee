QUnit.module 'FWD.Letter', ->
  QUnit.test 'FWD.Letter.index()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Letter.index
      collectionField: 'letters'
      url: 'https://app.fwd.us/api/v1/letters.json'
      modelClass: FWD.Letter
    }, assert)

  QUnit.test 'FWD.Letter.show()', (assert)->
    TestHelpers.testGetResource({
      func: FWD.Letter.show
      jsonField: 'letter'
      url: (letter_id) -> "https://app.fwd.us/api/v1/letters/#{letter_id}.json"
      modelClass: FWD.Letter
    }, assert)
