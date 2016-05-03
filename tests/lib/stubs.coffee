class Stubs
  @init: (qunit)->
    return if (Stubs.instance)

    Stubs.instance = new Stubs(qunit);
    Stubs.stub = Stubs.instance.stub;
    Stubs.restoreStubs = Stubs.instance.restoreStubs;


  stubStore: {}

  constructor: (@qunit)->
    QUnit.testStart(@restoreStubs)

  restoreStubs: =>
    $.each @stubStore, (owner, stubs) ->
      $.each stubs, (propName, value) ->
        owner[propName] = value

    @stubStore = {}

  stub: (owner, propertyName, value)=>
    @stubStore[owner] = @stubStore[owner] || {}
    @stubStore[owner][propertyName] = value
    owner[propertyName] = value
