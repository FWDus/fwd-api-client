QUnit.module('FWD.Story', function(){
  QUnit.test( "FWD.Story.index on success", function( assert ) {

    var done = assert.async();
    FWD.Story.index().then(function(){

    });

  });
//
//  //QUnit.test( "FWD.Story.index on failure", function( assert ) {
//  //  FWD.Story.index().then(function(data){
//  //
//  //  });
//  //});
//
//  //QUnit.test( "FWD.Story.search", function( assert ) {
//  //
//  //});
//  //
//  //QUnit.test( "FWD.Story.searchAll", function( assert ) {
//  //
//  //});
//  //
//  //QUnit.test( "FWD.Story#company", function( assert ) {
//  //
//  //});
});