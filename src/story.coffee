class FWD.Story extends FWD.Model

  @index: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('stories#index')
      jsonCollection: 'stories'
      modelClass: this
      params: getParams

  @show: (story_id)=>
    url = FWD.URL.for('stories#show')
    FWD.Api.getModel
      url: url(story_id)
      jsonField: 'story'
      modelClass: this

  @search: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('stories#search')
      jsonCollection: 'stories'
      arrayParams: ['company', 'tags']
      modelClass: this
      params: getParams

  @searchAll: (getParams)=>
    FWD.Api.getAllModels
      url: FWD.URL.for('stories#search')
      jsonCollection: 'stories'
      modelClass: this
      arrayParams: ['company', 'tags']
      params: getParams

  company: =>
    if @get('company_id')
      FWD.Company.find(@get('company_id'))
    else
      $.Deferred((defer)-> defer.reject()).promise()
