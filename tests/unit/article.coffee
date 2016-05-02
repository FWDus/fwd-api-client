QUnit.module 'FWD.Article', ->
  QUnit.test 'FWD.Article.press()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Article.press
      collectionField: 'articles'
      url: 'https://app.fwd.us/api/v1/articles/press.json'
      modelClass: FWD.Article
    }, assert)
