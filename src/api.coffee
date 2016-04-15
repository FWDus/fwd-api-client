class FWD.Api
  @get: (url, params)=>
    params = $.extend({key: FWD.getDevKey()}, params)
    $.getJSON(url, params)

  @getAllPages: (url, collectionName, params)=>
    $.Deferred((defer)=>
      params = $.extend({}, params, {page: 1, per_page: FWD.allPagesPerPage})
      collection = []

      onSuccess = (data)=>
        collection = collection.concat(data[collectionName])
        current_page = data.page

        if current_page < data.total_pages
          params.page = current_page + 1
          @get(url, params).fail(defer.reject).done(onSuccess)
        else
          defer.resolve(collection)

      @get(url, params).fail(defer.reject).done(onSuccess)
    ).promise()
