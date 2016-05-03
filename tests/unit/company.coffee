QUnit.module 'FWD.Company', ->

  QUnit.test 'FWD.Company.loadAll()', (assert)->
    TestHelpers.testGetModelCollectionAllPages({
      func: FWD.Company.loadAll
      collectionField: 'companies'
      url: 'https://app.fwd.us/api/v1/companies.json'
      modelClass: FWD.Company
    }, assert)


  QUnit.test 'FWD.Company.load()', (assert)->
    TestHelpers.testGetModelCollectionPage({
      func: FWD.Company.load
      collectionField: 'companies'
      url: 'https://app.fwd.us/api/v1/companies.json'
      modelClass: FWD.Company
    }, assert)


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
