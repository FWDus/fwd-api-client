Stubs = function(qunit) {
  var self = this;
  var QUnit = qunit;

  self.stubStore = {};

  self.initHooks = function() {
    QUnit.testStart(self.restoreStubs);
  };

  self.restoreStubs = function() {
    $.each(self.stubStore, function(owner, stubs) {
      $.each(stubs, function(propName, value) {
        owner[propName] = value;
      });
    });

    self.stubStore = {};
  };

  self.stub = function(owner, propertyName, value) {
    self.stubStore[owner] = self.stubStore[owner] || {};
    self.stubStore[owner][propertyName] = value;
    owner[propertyName] = value;
  };

  self.initHooks();
};

$.extend(Stubs, {
  init: function(qunit) {
    if (Stubs.instance) { return; }
    Stubs.instance = new Stubs(qunit);
    Stubs.stub = Stubs.instance.stub;
    Stubs.restoreStubs = Stubs.instance.restoreStubs;
  }
});
