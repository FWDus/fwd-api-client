class FWD.Company extends FWD.Model
  @loadAll: FWD.Factory.loadAllFunc(
    url: FWD.URL.for('companies#index'),
    collectionName: 'companies',
    model: this,
    cache: true
  )

  @load: FWD.Factory.loadPageFunc(
    url: FWD.URL.for('companies#index'),
    collectionName: 'companies',
    model: this
  )

  @find: (companyId)=>
    $.Deferred((defer)=>
      @loadAll().fail(defer.reject).done (companies)=>
        for company in companies
          if company.get('id') == companyId
            defer.resolve(company)
            return
        defer.reject()
    ).promise()
