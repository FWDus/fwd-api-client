class FWD.Helpers
  @arrayParam: (param)=>
    if $.isArray(param) then param.join(',') else param
