class FWD.Selfie extends FWD.Model
  @index: FWD.Factory.loadPageFunc
    url: FWD.URL.for('selfies#index'),
    collectionName: 'selfies',
    model: this

  @show: FWD.Factory.loadResourceFunc
    url: FWD.URL.for('selfies#show'),
    jsonField: 'selfie',
    model: this

  @gallery: FWD.Factory.loadPageFunc
    url: FWD.URL.for('selfies#gallery'),
    collectionName: 'selfies',
    model: this

  @celebrities: FWD.Factory.loadPageFunc
    url: FWD.URL.for('selfies#celebrities'),
    collectionName: 'selfies',
    model: this

  