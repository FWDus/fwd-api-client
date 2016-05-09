QUnit.module 'FWD.Selfie', ->
  QUnit.test 'FWD.Selfie.index()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Selfie.index
      collectionField: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies.json'
      modelClass: FWD.Selfie
    }, assert)

  QUnit.test 'FWD.Selfie.show()', (assert)->
    TestHelpers.testGetResource({
      func: FWD.Selfie.show
      jsonField: 'selfie'
      url: (selfie_id) -> "https://app.fwd.us/api/v1/selfies/#{selfie_id}.json"
      modelClass: FWD.Selfie
    }, assert)

  QUnit.test 'FWD.Selfie.gallery()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Selfie.gallery
      collectionField: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies/gallery.json'
      modelClass: FWD.Selfie
    }, assert)

  QUnit.test 'FWD.Selfie.celebrities()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Selfie.celebrities
      collectionField: 'selfies'
      url: 'https://app.fwd.us/api/v1/selfies/celebrities.json'
      modelClass: FWD.Selfie
    }, assert)

