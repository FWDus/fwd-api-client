QUnit.module 'FWD.URL', ->

  QUnit.test "FWD.URL.host", (assert)->
    assert.equal FWD.URL.host, 'https://app.fwd.us/api/v1'


  QUnit.test "FWD.URL.for()", (assert)->
    FWD.URL.urls['users'] = data: '/people/info'
    assert.equal FWD.URL.for('users#data'), 'https://app.fwd.us/api/v1/people/info'
