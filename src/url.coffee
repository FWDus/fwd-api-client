class FWD.URL
  @host: 'https://app.fwd.us/api/v1'
  @urls:
    companies:
      index: '/companies.json'
    stories:
      index: '/stories.json'
      search: '/stories/search.json'
    articles:
      press: '/articles/press.json'

  @for: (route)->
    [model, action] = route.split('#')
    path = @urls[model][action]
    @host.concat(path)
