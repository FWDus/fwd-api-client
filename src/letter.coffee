class FWD.Letter extends FWD.Model

  @index: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('letters#index'),
      jsonCollection: 'letters',
      modelClass: this,
      params: getParams

  @show: (letter_id)=>
    url = FWD.URL.for('letters#show')
    FWD.Api.getModel
      url: url(letter_id)
      jsonField: 'letter'
      modelClass: this
