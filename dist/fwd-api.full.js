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

  FWD.allPagesPerPage = 100;

  return FWD;

})();

var slice = [].slice;

FWD.URL = (function() {
  function URL() {}

  URL.host = 'https://app.fwd.us/api/v1';

  URL.urls = {
    legislators: {
      index: '/legislators',
      search: '/legislators/search',
      show: function(bioguide_id) {
        return "/legislators/" + bioguide_id;
      }
    },
    letters: {
      index: '/letters',
      show: function(id) {
        return "/letters/" + id;
      }
    },
    selfies: {
      index: '/selfies',
      show: function(id) {
        return "/selfies/" + id;
      },
      gallery: '/selfies/gallery',
      celebrities: '/selfies/celebrities'
    },
    companies: {
      index: '/companies'
    },
    stories: {
      index: '/stories',
      show: function(id) {
        return "/stories/" + id;
      },
      search: '/stories/search'
    },
    articles: {
      press: '/articles/press'
    }
  };

  URL["for"] = function(route) {
    var action, model, path, ref;
    ref = route.split('#'), model = ref[0], action = ref[1];
    path = this.urls[model][action];
    if ($.isFunction(path)) {
      return (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.host.concat(path.apply(null, args), '.json');
        };
      })(this);
    } else {
      return this.host.concat(path, '.json');
    }
  };

  return URL;

})();

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FWD.Model = (function() {
  function Model(attributes) {
    if (attributes == null) {
      attributes = {};
    }
    this.set = bind(this.set, this);
    this.get = bind(this.get, this);
    this.attributes = $.extend({}, attributes);
  }

  Model.prototype.get = function(attr) {
    return this.attributes[attr];
  };

  Model.prototype.set = function(attr, val) {
    return this.attributes[attr] = val;
  };

  return Model;

})();

var slice = [].slice;

FWD.Factory = (function() {
  function Factory() {}

  Factory.loadResourceFunc = function(options) {
    var jsonField, model, url;
    url = options.url, model = options.model, jsonField = options.jsonField;
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return $.Deferred(function(defer) {
        if ($.isFunction(url)) {
          url = url(args[0]);
        }
        return FWD.Api.get(url, {}).fail(defer.reject).done(function(data) {
          var instance;
          instance = new model(data[jsonField]);
          return defer.resolve(instance, data);
        });
      }).promise();
    };
  };

  Factory.loadPageFunc = function(options) {
    var arrayParams, collectionName, model, url;
    url = options.url, model = options.model, collectionName = options.collectionName, arrayParams = options.arrayParams;
    arrayParams || (arrayParams = []);
    return function(filterParams) {
      return $.Deferred(function(defer) {
        var params;
        params = Factory.convertArrayParams(filterParams, arrayParams);
        return FWD.Api.get(url, params).fail(defer.reject).done(function(data) {
          var models;
          models = Factory.attributesToModels(data[collectionName], model);
          return defer.resolve(models, data);
        });
      }).promise();
    };
  };

  Factory.loadAllFunc = function(options) {
    var arrayParams, cache, cachedPromise, collectionName, model, url;
    url = options.url, model = options.model, collectionName = options.collectionName, arrayParams = options.arrayParams, cache = options.cache;
    arrayParams || (arrayParams = []);
    cachedPromise = null;
    return function(filterParams) {
      if (cache && cachedPromise) {
        return cachedPromise;
      } else {
        return cachedPromise = $.Deferred(function(defer) {
          var allPages, params;
          params = Factory.convertArrayParams(filterParams, arrayParams);
          allPages = FWD.Api.getAllPages(url, collectionName, params);
          return allPages.fail(defer.reject).done(function(attrCollection) {
            var models;
            models = Factory.attributesToModels(attrCollection, model);
            return defer.resolve(models);
          });
        }).promise();
      }
    };
  };

  Factory.convertArrayParams = function(params, arrayParamNames) {
    params = $.extend({}, params);
    $.each(arrayParamNames, function(ix, paramName) {
      return params[paramName] = Factory.arrayParam(params[paramName]);
    });
    return params;
  };

  Factory.arrayParam = function(param) {
    if ($.isArray(param)) {
      return param.join(',');
    } else {
      return param;
    }
  };

  Factory.attributesToModels = function(attrCollection, model) {
    return $.map(attrCollection, function(modelAttrs) {
      return new model(modelAttrs);
    });
  };

  return Factory;

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
        per_page: FWD.allPagesPerPage
      });
      collection = [];
      onSuccess = function(data) {
        var current_page;
        collection = collection.concat(data[collectionName]);
        current_page = data.page;
        if (current_page < data.total_pages) {
          params.page = current_page + 1;
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

FWD.Article = (function(superClass) {
  extend(Article, superClass);

  function Article() {
    return Article.__super__.constructor.apply(this, arguments);
  }

  Article.press = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('articles#press'),
    collectionName: 'articles',
    model: Article,
    arrayParams: ['tags']
  });

  return Article;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Company = (function(superClass) {
  extend(Company, superClass);

  function Company() {
    return Company.__super__.constructor.apply(this, arguments);
  }

  Company.loadAll = FWD.Factory.loadAllFunc({
    url: FWD.URL["for"]('companies#index'),
    collectionName: 'companies',
    model: Company,
    cache: true
  });

  Company.load = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('companies#index'),
    collectionName: 'companies',
    model: Company
  });

  Company.find = function(companyId) {
    return $.Deferred(function(defer) {
      return Company.loadAll().fail(defer.reject).done(function(companies) {
        var company, i, len;
        for (i = 0, len = companies.length; i < len; i++) {
          company = companies[i];
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

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Legislator = (function(superClass) {
  extend(Legislator, superClass);

  function Legislator() {
    return Legislator.__super__.constructor.apply(this, arguments);
  }

  Legislator.index = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('legislators#index'),
    collectionName: 'legislators',
    model: Legislator
  });

  Legislator.search = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('legislators#search'),
    collectionName: 'legislators',
    model: Legislator
  });

  Legislator.show = FWD.Factory.loadResourceFunc({
    url: FWD.URL["for"]('legislators#show'),
    jsonField: 'legislator',
    model: Legislator
  });

  return Legislator;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Letter = (function(superClass) {
  extend(Letter, superClass);

  function Letter() {
    return Letter.__super__.constructor.apply(this, arguments);
  }

  Letter.index = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('letters#index'),
    collectionName: 'letters',
    model: Letter
  });

  Letter.show = FWD.Factory.loadResourceFunc({
    url: FWD.URL["for"]('letters#show'),
    jsonField: 'letter',
    model: Letter
  });

  return Letter;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Selfie = (function(superClass) {
  extend(Selfie, superClass);

  function Selfie() {
    return Selfie.__super__.constructor.apply(this, arguments);
  }

  Selfie.index = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('selfies#index'),
    collectionName: 'selfies',
    model: Selfie
  });

  Selfie.show = FWD.Factory.loadResourceFunc({
    url: FWD.URL["for"]('selfies#show'),
    jsonField: 'selfie',
    model: Selfie
  });

  Selfie.gallery = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('selfies#gallery'),
    collectionName: 'selfies',
    model: Selfie
  });

  Selfie.celebrities = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('selfies#celebrities'),
    collectionName: 'selfies',
    model: Selfie
  });

  return Selfie;

})(FWD.Model);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Story = (function(superClass) {
  extend(Story, superClass);

  function Story() {
    this.company = bind(this.company, this);
    return Story.__super__.constructor.apply(this, arguments);
  }

  Story.index = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('stories#index'),
    collectionName: 'stories',
    model: Story
  });

  Story.show = FWD.Factory.loadResourceFunc({
    url: FWD.URL["for"]('stories#show'),
    jsonField: 'story',
    model: Story
  });

  Story.search = FWD.Factory.loadPageFunc({
    url: FWD.URL["for"]('stories#search'),
    collectionName: 'stories',
    model: Story,
    arrayParams: ['company', 'tags']
  });

  Story.searchAll = FWD.Factory.loadAllFunc({
    url: FWD.URL["for"]('stories#search'),
    collectionName: 'stories',
    model: Story,
    arrayParams: ['company', 'tags']
  });

  Story.prototype.company = function() {
    if (this.get('company_id')) {
      return FWD.Company.find(this.get('company_id'));
    } else {
      return $.Deferred(function(defer) {
        return defer.reject();
      }).promise();
    }
  };

  return Story;

})(FWD.Model);
