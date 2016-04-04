var FWD;

FWD = (function() {
  function FWD() {}

  FWD.init = function(devKey) {
    return this.devKey = devKey;
  };

  FWD.getDevKey = function() {
    return this.devKey || (function() {
      throw 'FWD DevKey required.';
    })();
  };

  return FWD;

})();

FWD.URL = (function() {
  function URL() {}

  URL.host = 'https://app.fwd.us/api/v1';

  URL.urls = {
    companies: {
      index: '/companies.json'
    },
    stories: {
      search: '/stories/search.json'
    }
  };

  URL["for"] = function(route) {
    var action, model, path, ref;
    ref = route.split('#'), model = ref[0], action = ref[1];
    path = this.urls[model][action];
    return this.host.concat(path);
  };

  return URL;

})();

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FWD.Model = (function() {
  function Model(attributes) {
    this.attributes = attributes;
    this.set = bind(this.set, this);
    this.get = bind(this.get, this);
  }

  Model.prototype.get = function(attr) {
    return this.attributes[attr];
  };

  Model.prototype.set = function(attr, val) {
    return this.attributes[attr] = val;
  };

  return Model;

})();

FWD.Api = (function() {
  function Api() {}

  Api.get = function(url, params) {
    params = $.extend({
      key: FWD.getDevKey()
    }, params);
    return $.getJSON(url, params);
  };

  Api.getAllPages = function(url, collectionName, params) {
    return $.Deferred(function(defer) {
      var collection, onSuccess;
      params = $.extend({}, params, {
        page: 1,
        per_page: 100
      });
      collection = [];
      onSuccess = function(data) {
        var current_page;
        collection = collection.concat(data[collectionName]);
        current_page = data.page;
        if (current_page < data.total_pages) {
          $.extend(params, {
            page: current_page + 1
          });
          return Api.get(url, params).fail(defer.reject).done(onSuccess);
        } else {
          return defer.resolve(collection);
        }
      };
      return Api.get(url, params).fail(defer.reject).done(onSuccess);
    }).promise();
  };

  return Api;

})();

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Company = (function(superClass) {
  extend(Company, superClass);

  function Company() {
    return Company.__super__.constructor.apply(this, arguments);
  }

  Company.companies = null;

  Company.loadAll = function() {
    Company.loadAllDeferred || (Company.loadAllDeferred = $.Deferred(function(defer) {
      var loader;
      loader = new FWD.CompanyLoader;
      return loader.loadAll().fail(defer.reject).done(function(companies) {
        Company.companies = companies;
        return defer.resolve(Company.companies);
      });
    }).promise());
    return Company.loadAllDeferred;
  };

  Company.find = function(companyId) {
    return $.Deferred(function(defer) {
      return Company.loadAll().fail(defer.reject).done(function() {
        var company, i, len, ref;
        ref = Company.companies;
        for (i = 0, len = ref.length; i < len; i++) {
          company = ref[i];
          if (company.get('id') === companyId) {
            defer.resolve(company);
            return;
          }
        }
        return defer.reject();
      });
    }).promise();
  };

  return Company;

})(FWD.Model);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FWD.CompanyLoader = (function() {
  function CompanyLoader() {
    this._buildCompanies = bind(this._buildCompanies, this);
    this.loadAll = bind(this.loadAll, this);
  }

  CompanyLoader.prototype.url = FWD.URL["for"]('companies#index');

  CompanyLoader.prototype.loadAll = function() {
    return $.Deferred((function(_this) {
      return function(defer) {
        return FWD.Api.getAllPages(_this.url, 'companies', {}).fail(defer.reject).done(function(companiesJson) {
          var companies;
          companies = _this._buildCompanies(companiesJson);
          return defer.resolve(companies);
        });
      };
    })(this)).promise();
  };

  CompanyLoader.prototype._buildCompanies = function(payload) {
    return $.map(payload, function(companyAttrs) {
      return new FWD.Company(companyAttrs);
    });
  };

  return CompanyLoader;

})();

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Story = (function(superClass) {
  extend(Story, superClass);

  function Story() {
    this.company = bind(this.company, this);
    return Story.__super__.constructor.apply(this, arguments);
  }

  Story.search = function(filter) {
    return (new FWD.StorySearch).search(filter);
  };

  Story.searchAll = function(filter) {
    if (filter == null) {
      filter = {};
    }
    return (new FWD.StorySearch).searchAll(filter);
  };

  Story.prototype.company = function() {
    return $.Deferred((function(_this) {
      return function(defer) {
        if (_this.get('company_id')) {
          return FWD.Company.find(_this.get('company_id')).then(defer.resolve, defer.reject);
        } else {
          return defer.reject();
        }
      };
    })(this)).promise();
  };

  return Story;

})(FWD.Model);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FWD.StorySearch = (function() {
  function StorySearch() {
    this._buildStories = bind(this._buildStories, this);
    this.searchAll = bind(this.searchAll, this);
    this.search = bind(this.search, this);
  }

  StorySearch.prototype.url = FWD.URL["for"]('stories#search');

  StorySearch.prototype.search = function(filterParams) {
    return $.Deferred((function(_this) {
      return function(defer) {
        var params;
        params = $.extend({
          per_page: 100
        }, filterParams);
        return FWD.Api.get(_this.url, params).fail(defer.reject).done(function(data) {
          var stories;
          stories = _this._buildStories(data.stories);
          return defer.resolve(stories);
        });
      };
    })(this)).promise();
  };

  StorySearch.prototype.searchAll = function(filterParams) {
    return $.Deferred((function(_this) {
      return function(defer) {
        var allPages;
        allPages = FWD.Api.getAllPages(_this.url, 'stories', filterParams);
        return allPages.fail(defer.reject).done(function(storiesJson) {
          var stories;
          stories = _this._buildStories(storiesJson);
          return defer.resolve(stories);
        });
      };
    })(this)).promise();
  };

  StorySearch.prototype._buildStories = function(storiesJson) {
    return $.map(storiesJson, function(storyAttrs) {
      return new FWD.Story(storyAttrs);
    });
  };

  return StorySearch;

})();
