QUnit.module('FWD.URL', function(){
  QUnit.test( "FWD.URL.host", function( assert ) {
    assert.ok(FWD.URL.host == 'https://app.fwd.us/api/v1');
  });

  QUnit.test( "FWD.URL.for()", function( assert ) {
    FWD.URL.urls['users'] = {data: '/people/info'};
    assert.equal(FWD.URL.for('users#data'), 'https://app.fwd.us/api/v1/people/info');
  });
});