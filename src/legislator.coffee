class FWD.Legislator extends FWD.Model
  @index: FWD.Factory.loadPageFunc
    url: FWD.URL.for('legislators#index'),
    collectionName: 'legislators',
    model: this

  @search: FWD.Factory.loadPageFunc
    url: FWD.URL.for('legislators#search'),
    collectionName: 'legislators',
    model: this

  @show: FWD.Factory.loadResourceFunc
    url: FWD.URL.for('legislators#show'),
    jsonField: 'legislator',
    model: this

