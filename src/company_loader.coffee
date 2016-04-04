class FWD.CompanyLoader
  url: FWD.URL.for('companies#index')

  loadAll: =>
    $.Deferred((defer)=>
      FWD.Api.getAllPages(@url, 'companies', {}).fail(defer.reject).done (companiesJson)=>
        companies = @_buildCompanies(companiesJson)
        defer.resolve(companies)
    ).promise()

  _buildCompanies: (payload)=>
    $.map payload, (companyAttrs) ->
      new FWD.Company(companyAttrs)

