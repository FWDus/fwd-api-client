QUnit.module 'FWD.Company', ->
  
  QUnit.test 'FWD.Company.loadAll()', (assert)->
    TestHelpers.testGetAllModels assert, FWD.Company.loadAll,
      url: 'https://app.fwd.us/api/v1/companies.json'
      jsonCollection: 'companies'
      modelClass: FWD.Company
      cacheResponse: true

  QUnit.test 'FWD.Company.load()', (assert)->
    TestHelpers.testGetModelPage assert, FWD.Company.load,
      url: 'https://app.fwd.us/api/v1/companies.json'
      jsonCollection: 'companies'
      modelClass: FWD.Company

  QUnit.test 'FWD.Company.find()', (assert)->
    companies = [
      new FWD.Company({id: '111'}),
      new FWD.Company({id: '222'}),
      new FWD.Company({id: '333'})
    ]

    Stubs.stub(FWD.Company, 'loadAll', -> TestHelpers.resolvedPromise(companies))
    done = assert.async()

    FWD.Company.find('222').then (company)->
      assert.equal(company, companies[1])
      done()
