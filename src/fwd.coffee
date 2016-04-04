class FWD
  @init: (devKey)->
    @devKey = devKey

  @getDevKey: ->
    @devKey || throw 'FWD DevKey required.'
