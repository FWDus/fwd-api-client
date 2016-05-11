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

FWD.Api = (function() {
  function Api() {}

  Api.promiseCache = {};

  Api.get = function(url, params) {
    params = $.extend({
      key: FWD.getDevKey()
    }, params);
    return $.getJSON(url, params);
  };

  Api.getModel = function(options) {
    var jsonField, modelClass, url;
    url = options.url, modelClass = options.modelClass, jsonField = options.jsonField;
    return $.Deferred((function(_this) {
      return function(defer) {
        return _this.get(url, {}).fail(defer.reject).done(function(data) {
          var instance;
          instance = new modelClass(data[jsonField]);
          return defer.resolve(instance, data);
        });
      };
    })(this)).promise();
  };

  Api.getPage = function(options) {
    var arrayParams, params, ref, url;
    url = options.url, params = options.params, arrayParams = (ref = options.arrayParams) != null ? ref : [];
    params = Api.convertArrayParams(params, arrayParams);
    return Api.get(url, params);
  };

  Api.getModelPage = function(options) {
    var jsonCollection, modelClass;
    modelClass = options.modelClass, jsonCollection = options.jsonCollection;
    return $.Deferred(function(defer) {
      return Api.getPage(options).fail(defer.reject).done(function(data) {
        var modelCollection;
        modelCollection = Api.attributeCollectionToModels(data[jsonCollection], modelClass);
        return defer.resolve(modelCollection, data);
      });
    }).promise();
  };

  Api.getAllPages = function(url, jsonCollection, params) {
    return $.Deferred(function(defer) {
      var collection, onSuccess;
      params = $.extend({}, params, {
        page: 1,
        per_page: FWD.allPagesPerPage
      });
      collection = [];
      onSuccess = function(data) {
        var current_page;
        collection = collection.concat(data[jsonCollection]);
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

  Api.getAllModels = function(options) {
    var arrayParams, cacheResponse, jsonCollection, modelClass, params, promise, ref, ref1, url;
    url = options.url, modelClass = options.modelClass, jsonCollection = options.jsonCollection, params = options.params, arrayParams = (ref = options.arrayParams) != null ? ref : [], cacheResponse = (ref1 = options.cacheResponse) != null ? ref1 : false;
    if (cacheResponse && Api.promiseCache[url]) {
      return Api.promiseCache[url];
    }
    promise = $.Deferred(function(defer) {
      var allPages;
      params = Api.convertArrayParams(params, arrayParams);
      allPages = Api.getAllPages(url, jsonCollection, params);
      return allPages.fail(defer.reject).done(function(attrCollection) {
        var models;
        models = Api.attributeCollectionToModels(attrCollection, modelClass);
        return defer.resolve(models);
      });
    }).promise();
    if (cacheResponse) {
      Api.promiseCache[url] = promise;
    }
    return promise;
  };

  Api.convertArrayParams = function(params, arrayParamNames) {
    if (!$.isArray(arrayParamNames)) {
      return;
    }
    params = $.extend({}, params);
    $.each(arrayParamNames, function(ix, paramName) {
      return params[paramName] = Api.arrayParam(params[paramName]);
    });
    return params;
  };

  Api.arrayParam = function(param) {
    if ($.isArray(param)) {
      return param.join(',');
    } else {
      return param;
    }
  };

  Api.attributeCollectionToModels = function(attrCollection, modelClass) {
    return $.map(attrCollection, function(modelAttrs) {
      return new modelClass(modelAttrs);
    });
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

  Article.press = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('articles#press'),
      jsonCollection: 'articles',
      modelClass: Article,
      arrayParams: ['tags'],
      params: getParams
    });
  };

  return Article;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Company = (function(superClass) {
  extend(Company, superClass);

  function Company() {
    return Company.__super__.constructor.apply(this, arguments);
  }

  Company.loadAll = function(getParams) {
    if (getParams == null) {
      getParams = {};
    }
    return FWD.Api.getAllModels({
      url: FWD.URL["for"]('companies#index'),
      jsonCollection: 'companies',
      modelClass: Company,
      cacheResponse: true,
      params: getParams
    });
  };

  Company.load = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('companies#index'),
      jsonCollection: 'companies',
      modelClass: Company,
      params: getParams
    });
  };

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

  Legislator.index = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('legislators#index'),
      jsonCollection: 'legislators',
      modelClass: Legislator,
      params: getParams
    });
  };

  Legislator.search = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('legislators#search'),
      jsonCollection: 'legislators',
      modelClass: Legislator,
      params: getParams
    });
  };

  Legislator.show = function(legislator_id) {
    var url;
    url = FWD.URL["for"]('legislators#show');
    return FWD.Api.getModel({
      url: url(legislator_id),
      jsonField: 'legislator',
      modelClass: Legislator
    });
  };

  return Legislator;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Letter = (function(superClass) {
  extend(Letter, superClass);

  function Letter() {
    return Letter.__super__.constructor.apply(this, arguments);
  }

  Letter.index = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('letters#index'),
      jsonCollection: 'letters',
      modelClass: Letter,
      params: getParams
    });
  };

  Letter.show = function(letter_id) {
    var url;
    url = FWD.URL["for"]('letters#show');
    return FWD.Api.getModel({
      url: url(letter_id),
      jsonField: 'letter',
      modelClass: Letter
    });
  };

  return Letter;

})(FWD.Model);

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FWD.Selfie = (function(superClass) {
  extend(Selfie, superClass);

  function Selfie() {
    return Selfie.__super__.constructor.apply(this, arguments);
  }

  Selfie.index = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('selfies#index'),
      jsonCollection: 'selfies',
      modelClass: Selfie,
      params: getParams
    });
  };

  Selfie.show = function(selfie_id) {
    var url;
    url = FWD.URL["for"]('selfies#show');
    return FWD.Api.getModel({
      url: url(selfie_id),
      jsonField: 'selfie',
      modelClass: Selfie
    });
  };

  Selfie.gallery = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('selfies#gallery'),
      jsonCollection: 'selfies',
      modelClass: Selfie,
      params: getParams
    });
  };

  Selfie.celebrities = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('selfies#celebrities'),
      jsonCollection: 'selfies',
      modelClass: Selfie,
      params: getParams
    });
  };

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

  Story.index = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('stories#index'),
      jsonCollection: 'stories',
      modelClass: Story,
      params: getParams
    });
  };

  Story.show = function(story_id) {
    var url;
    url = FWD.URL["for"]('stories#show');
    return FWD.Api.getModel({
      url: url(story_id),
      jsonField: 'story',
      modelClass: Story
    });
  };

  Story.search = function(getParams) {
    return FWD.Api.getModelPage({
      url: FWD.URL["for"]('stories#search'),
      jsonCollection: 'stories',
      arrayParams: ['company', 'tags'],
      modelClass: Story,
      params: getParams
    });
  };

  Story.searchAll = function(getParams) {
    return FWD.Api.getAllModels({
      url: FWD.URL["for"]('stories#search'),
      jsonCollection: 'stories',
      modelClass: Story,
      arrayParams: ['company', 'tags'],
      params: getParams
    });
  };

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
