QUnit.module 'FWD.Letter', ->

  QUnit.test 'FWD.Letter.index()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Letter.index,
      jsonCollection: 'letters'
      url: 'https://app.fwd.us/api/v1/letters.json'
      modelClass: FWD.Letter

  QUnit.test 'FWD.Letter.show()', (assert)->
    TestHelpers.testGetModel assert, FWD.Letter.show,
      jsonField: 'letter'
      modelClass: FWD.Letter
      url: (letter_id) -> "https://app.fwd.us/api/v1/letters/#{letter_id}.json"
