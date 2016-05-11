class FWD.Api

  @promiseCache = {}

  @get: (url, params)->
    params = $.extend({key: FWD.getDevKey()}, params)
    $.getJSON(url, params)

  @getModel: (options)->
    {url, modelClass, jsonField} = options

    $.Deferred((defer)=>
      @get(url, {}).fail(defer.reject).done (data)->
        instance = new modelClass(data[jsonField])
        defer.resolve(instance, data)
    ).promise()

  @getPage: (options)=>
    {url, params, arrayParams = []} = options
    params = @convertArrayParams(params, arrayParams)
    @get(url, params)

  @getModelPage: (options)=>
    {modelClass, jsonCollection} = options

    $.Deferred((defer)=>
      @getPage(options).fail(defer.reject).done (data)=>
        modelCollection = @attributeCollectionToModels(data[jsonCollection], modelClass)
        defer.resolve(modelCollection, data)
    ).promise()

  @getAllPages: (url, jsonCollection, params)=>
    $.Deferred((defer)=>
      params = $.extend({}, params, {page: 1, per_page: FWD.allPagesPerPage})
      collection = []

      onSuccess = (data)=>
        collection = collection.concat(data[jsonCollection])
        current_page = data.page

        if current_page < data.total_pages
          params.page = current_page + 1
          @get(url, params).fail(defer.reject).done(onSuccess)
        else
          defer.resolve(collection)

      @get(url, params).fail(defer.reject).done(onSuccess)
    ).promise()

  @getAllModels: (options)=>
    {url, modelClass, jsonCollection, params, arrayParams = [], cacheResponse = false} = options
    return @promiseCache[url] if cacheResponse && @promiseCache[url]

    promise = $.Deferred((defer)=>
      params = @convertArrayParams(params, arrayParams)
      allPages = @getAllPages(url, jsonCollection, params)
      allPages.fail(defer.reject).done (attrCollection) =>
        models = @attributeCollectionToModels(attrCollection, modelClass)
        defer.resolve(models)
    ).promise()

    @promiseCache[url] = promise if cacheResponse
    promise

  @convertArrayParams: (params, arrayParamNames) =>
    return unless $.isArray(arrayParamNames)
    params = $.extend({}, params)
    $.each arrayParamNames, (ix, paramName) =>
      params[paramName] = @arrayParam(params[paramName])
    params

  @arrayParam: (param)=>
    if $.isArray(param) then param.join(',') else param

  @attributeCollectionToModels: (attrCollection, modelClass)->
    $.map attrCollection, (modelAttrs) ->
      new modelClass(modelAttrs)