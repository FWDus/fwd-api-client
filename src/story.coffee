class FWD.Story extends FWD.Model
  @search: (filter) =>
    (new FWD.StorySearch).search(filter)

  @searchAll: (filter = {}) =>
    (new FWD.StorySearch).searchAll(filter)

  company: =>
    $.Deferred((defer)=>
      if @get('company_id')
        FWD.Company.find(@get('company_id')).then(defer.resolve, defer.reject)
      else
        defer.reject()
    ).promise()
