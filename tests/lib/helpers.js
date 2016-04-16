Helpers = {
  resolvedPromise: function() {
    var args;
    var slice = [].slice;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];

    return $.Deferred(function(defer){
      defer.resolve.apply(null, args);
    }).promise();
  }
};