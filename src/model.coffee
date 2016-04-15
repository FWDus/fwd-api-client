class FWD.Model
  constructor: (attributes = {})->
    @attributes = $.extend({}, attributes)

  get: (attr)=>
    @attributes[attr]

  set: (attr, val)=>
    @attributes[attr] = val
