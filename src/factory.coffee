class FWD.Factory
  @loadPageFunc: (options)=>
    {url, model, collectionName, arrayParams} = options
    arrayParams ||= []

    (filterParams) =>
      $.Deferred((defer)=>
        params = @convertArrayParams(filterParams, arrayParams)

        FWD.Api.get(url, params).fail(defer.reject).done (data) =>
          models = @attributesToModels(data[collectionName], model)
          defer.resolve(models)
      ).promise()

  @loadAllFunc: (options)=>
    {url, model, collectionName, arrayParams, cache} = options
    arrayParams ||= []
    cachedPromise = null

    (filterParams) =>
      if cache && cachedPromise
        cachedPromise
      else
        cachedPromise = $.Deferred((defer)=>
          params = @convertArrayParams(filterParams, arrayParams)
          allPages = FWD.Api.getAllPages(url, collectionName, params)
          allPages.fail(defer.reject).done (attrCollection) =>
            models = @attributesToModels(attrCollection, model)
            defer.resolve(models)
        ).promise()

  @convertArrayParams: (params, arrayParamNames) =>
    params = $.extend({}, params)
    $.each arrayParamNames, (ix, paramName) =>
      params[paramName] = @arrayParam(params[paramName])
    params

  @arrayParam: (param)=>
    if $.isArray(param) then param.join(',') else param

  @attributesToModels: (attrCollection, model)->
    $.map attrCollection, (modelAttrs) ->
      new model(modelAttrs)
