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


#  QUnit.test 'FWD.Company.find()', (assert)->

