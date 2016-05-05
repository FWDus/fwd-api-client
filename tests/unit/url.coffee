QUnit.module 'FWD.URL', ->

  QUnit.test "FWD.URL.host", (assert)->
    assert.equal FWD.URL.host, 'https://app.fwd.us/api/v1'


  QUnit.test "FWD.URL.for()", (assert)->
    FWD.URL.urls['users'] =
      show: (id)-> "/people/#{id}"
      data: '/people/info'

    assert.equal FWD.URL.for('users#data'), 'https://app.fwd.us/api/v1/people/info', 'Static path'
    assert.equal FWD.URL.for('users#show')(321), 'https://app.fwd.us/api/v1/people/321', 'Dynamic path'
