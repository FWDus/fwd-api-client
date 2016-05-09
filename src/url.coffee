class FWD.URL
  @host: 'https://app.fwd.us/api/v1'
  @urls:
    legislators:
      index: '/legislators'
      search: '/legislators/search'
      show: (bioguide_id)-> "/legislators/#{bioguide_id}"
    letters:
      index: '/letters'
      show: (id)-> "/letters/#{id}"
    selfies:
      index: '/selfies'
      show: (id)-> "/selfies/#{id}"
      gallery: '/selfies/gallery'
      celebrities: '/selfies/celebrities'
    companies:
      index: '/companies'
    stories:
      index: '/stories'
      show: (id)-> "/stories/#{id}"
      search: '/stories/search'
    articles:
      press: '/articles/press'

  @for: (route)->
    [model, action] = route.split('#')
    path = @urls[model][action]
    if $.isFunction(path)
      (args...)=> @host.concat(path(args...), '.json')
    else
      @host.concat(path, '.json')
