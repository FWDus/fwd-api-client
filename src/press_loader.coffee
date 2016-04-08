class FWD.PressLoader
  url: FWD.URL.for('articles#press')

  load: (filterParams)=>
    $.Deferred((defer)=>
      params = @_filterParamAdapter(filterParams)

      FWD.Api.get(@url, params).fail(defer.reject).done (data) =>
        articles = @_buildModels(data.articles)
        defer.resolve(articles)
    ).promise()

  _filterParamAdapter: (params) =>
    params = $.extend({}, params)
    params.tags = FWD.Helpers.arrayParam(params.tags)
    params

  _buildModels: (payload)=>
    $.map payload, (articleAttrs) ->
      new FWD.Article(articleAttrs)
