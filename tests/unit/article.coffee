QUnit.module 'FWD.Article', ->
  QUnit.test 'FWD.Article.press()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Article.press,
      url: 'https://app.fwd.us/api/v1/articles/press.json'
      jsonCollection: 'articles'
      modelClass: FWD.Article
      arrayParams: ['tags']
