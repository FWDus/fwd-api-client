class FWD.StorySearch
  url: FWD.URL.for('stories#search')

  search: (filterParams)=>
    $.Deferred((defer)=>
      params = $.extend({per_page: 100}, filterParams)
      FWD.Api.get(@url, params).fail(defer.reject).done (data) =>
        stories = @_buildStories(data.stories)
        defer.resolve(stories)
    ).promise()

  searchAll: (filterParams)=>
    $.Deferred((defer)=>
      allPages = FWD.Api.getAllPages(@url, 'stories', filterParams)
      allPages.fail(defer.reject).done (storiesJson) =>
        stories = @_buildStories(storiesJson)
        defer.resolve(stories)
    ).promise()

  _buildStories: (storiesJson)=>
    $.map storiesJson, (storyAttrs) ->
      new FWD.Story(storyAttrs)
