QUnit.module 'FWD init', ->
  QUnit.test 'FWD.init()', (assert)->
    FWD.init('some key')
    assert.ok(FWD.devKey == 'some key')

  QUnit.test 'FWD.getDevKey()', (assert)->
    FWD.init('init key')
    assert.ok(FWD.getDevKey() == 'init key')
