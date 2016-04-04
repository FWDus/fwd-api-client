class FWD.Company extends FWD.Model
  @companies: null

  @loadAll: =>
    @loadAllDeferred ||= $.Deferred((defer)=>
      loader = new FWD.CompanyLoader
      loader.loadAll().fail(defer.reject).done (companies)=>
        @companies = companies
        defer.resolve(@companies)
    ).promise()

    @loadAllDeferred

  @find: (companyId)=>
    $.Deferred((defer)=>
      @loadAll().fail(defer.reject).done =>
        for company in @companies
          if company.get('id') == companyId
            defer.resolve(company)
            return
        defer.reject()
    ).promise()
