QUnit.module('FWD.Model', function(){
  QUnit.test( "FWD.Model#get() returns attribute set via constructor", function( assert ) {
    var model = new FWD.Model({name: 'User Userson'});
    assert.equal(model.get('name'), 'User Userson');
  });

  QUnit.test( "FWD.Model#get() returns attribute set via #set", function( assert ) {
    var model = new FWD.Model();
    model.set('last_name', 'Userson');
    assert.equal(model.get('last_name'), 'Userson');
  });
});
