class FWD.Article extends FWD.Model
  @press: FWD.Factory.loadPageFunc(
    url: FWD.URL.for('articles#press'),
    collectionName: 'articles',
    model: this,
    arrayParams: ['tags']
  )