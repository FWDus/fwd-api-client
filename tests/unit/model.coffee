QUnit.module 'FWD.Model', ->
  QUnit.test "FWD.Model#get() returns attribute set via constructor", (assert)->
    model = new FWD.Model(name: 'User Userson')
    assert.equal(model.get('name'), 'User Userson')

  QUnit.test "FWD.Model#get() returns attribute set via #set", (assert)->
    model = new FWD.Model()
    model.set('last_name', 'Userson')
    assert.equal(model.get('last_name'), 'Userson')
