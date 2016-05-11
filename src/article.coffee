class FWD.Article extends FWD.Model
  @press: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('articles#press'),
      jsonCollection: 'articles',
      modelClass: this,
      arrayParams: ['tags']
      params: getParams
