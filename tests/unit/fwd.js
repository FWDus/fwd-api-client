QUnit.module('FWD init', function(){
  QUnit.test( "FWD.init()", function( assert ) {
    FWD.init('some key');
    assert.ok(FWD.devKey == 'some key');
  });

  QUnit.test( "FWD.getDevKey()", function( assert ) {
    FWD.init('init key');
    assert.ok(FWD.getDevKey() == 'init key');
  });
});