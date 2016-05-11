class FWD.Legislator extends FWD.Model
  @index: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('legislators#index')
      jsonCollection: 'legislators'
      modelClass: this
      params: getParams

  @search: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('legislators#search')
      jsonCollection: 'legislators'
      modelClass: this
      params: getParams

  @show: (legislator_id)=>
    url = FWD.URL.for('legislators#show')
    FWD.Api.getModel
      url: url(legislator_id)
      jsonField: 'legislator'
      modelClass: this

