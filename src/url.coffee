class FWD.URL
  @host: 'https://app.fwd.us/api/v1'
  @urls:
    companies:
      index: '/companies.json'
    stories:
      index: '/stories.json'
      show: (id)-> "/stories/#{id}.json"
      search: '/stories/search.json'
    articles:
      press: '/articles/press.json'

  @for: (route)->
    [model, action] = route.split('#')
    path = @urls[model][action]
    if $.isFunction(path)
      (args...)=> @host.concat(path(args...))
    else
      @host.concat(path)
