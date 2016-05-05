class FWD.Story extends FWD.Model
  @index: FWD.Factory.loadPageFunc(
    url: FWD.URL.for('stories#index'),
    collectionName: 'stories',
    model: this
  )

  @show: FWD.Factory.loadResourceFunc(
    url: FWD.URL.for('stories#show'),
    jsonField: 'story',
    model: this
  )

  @search: FWD.Factory.loadPageFunc(
    url: FWD.URL.for('stories#search'),
    collectionName: 'stories',
    model: this,
    arrayParams: ['company', 'tags']
  )

  @searchAll: FWD.Factory.loadAllFunc(
    url: FWD.URL.for('stories#search'),
    collectionName: 'stories',
    model: this,
    arrayParams: ['company', 'tags']
  )

  company: =>
    if @get('company_id')
      FWD.Company.find(@get('company_id'))
    else
      $.Deferred((defer)-> defer.reject()).promise()
