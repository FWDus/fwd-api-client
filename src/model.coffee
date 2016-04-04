class FWD.Model
  constructor: (@attributes)->

  get: (attr)=>
    @attributes[attr]

  set: (attr, val)=>
    @attributes[attr] = val
