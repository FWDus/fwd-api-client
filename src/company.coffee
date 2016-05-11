class FWD.Company extends FWD.Model

  @loadAll: (getParams = {})=>
    FWD.Api.getAllModels
      url: FWD.URL.for('companies#index')
      jsonCollection: 'companies'
      modelClass: this
      cacheResponse: true
      params: getParams

  @load: (getParams)=>
    FWD.Api.getModelPage
      url: FWD.URL.for('companies#index'),
      jsonCollection: 'companies',
      modelClass: this,
      params: getParams

  @find: (companyId)=>
    $.Deferred((defer)=>
      @loadAll().fail(defer.reject).done (companies)=>
        for company in companies
          if company.get('id') == companyId
            defer.resolve(company)
            return
        defer.reject()
    ).promise()
