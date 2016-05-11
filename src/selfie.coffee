class FWD.Selfie extends FWD.Model

  @index: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('selfies#index')
      jsonCollection: 'selfies'
      modelClass: this
      params: getParams

  @show: (selfie_id)=>
    url = FWD.URL.for('selfies#show')
    FWD.Api.getModel
      url: url(selfie_id)
      jsonField: 'selfie'
      modelClass: this

  @gallery: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('selfies#gallery')
      jsonCollection: 'selfies'
      modelClass: this
      params: getParams

  @celebrities: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('selfies#celebrities')
      jsonCollection: 'selfies'
      modelClass: this
      params: getParams

  