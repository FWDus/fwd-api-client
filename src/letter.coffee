class FWD.Letter extends FWD.Model
  @index: FWD.Factory.loadPageFunc
    url: FWD.URL.for('letters#index'),
    collectionName: 'letters',
    model: this

  @show: FWD.Factory.loadResourceFunc
    url: FWD.URL.for('letters#show'),
    jsonField: 'letter',
    model: this
