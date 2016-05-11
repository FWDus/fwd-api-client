QUnit.module 'FWD.Selfie', ->

  QUnit.test 'FWD.Selfie.index()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Selfie.index,
      jsonCollection: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies.json'
      modelClass: FWD.Selfie

  QUnit.test 'FWD.Selfie.show()', (assert)->
    TestHelpers.testGetModel assert, FWD.Selfie.show,
      jsonField: 'selfie'
      url: (selfie_id) -> "https://app.fwd.us/api/v1/selfies/#{selfie_id}.json"
      modelClass: FWD.Selfie

  QUnit.test 'FWD.Selfie.gallery()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Selfie.gallery,
      jsonCollection: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies/gallery.json'
      modelClass: FWD.Selfie

  QUnit.test 'FWD.Selfie.celebrities()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Selfie.celebrities,
      jsonCollection: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies/celebrities.json'
      modelClass: FWD.Selfie

