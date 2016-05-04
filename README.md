# JavaScript client for FWD.us API (alpha version)
### Initialize
```
  // Include API JavaScript
  <script src="path/to/fwd-api.full.min.js"></script>
  
  // Init API with your developer key.
  <script>
    FWD.init('___your_dev_key___');
  </script>
```


### Usage
All API wrapper methods return [jQuery Promise](https://api.jquery.com/promise/).  
You can chain a promise with [.then(doneCallback, failCallback)](https://api.jquery.com/deferred.then/), 
[.done(callback)](https://api.jquery.com/deferred.done/), 
[.fail(callback)](https://api.jquery.com/deferred.fail/) 
and/or [.always(callback)](https://api.jquery.com/deferred.always/) methods.

doneCallbacks (see .done() and .then()) triggered with two arguments: `(model_or_models, data)`  
`model_or_models` - is either an array or single instance of corresponding model.  
`data` - raw response data.

You may wait to use `data` argument to access pagination details:
```
  FWD.Story.index().done(function(stories, data){
    console.log(data.total_count); // Total number of corresponding items in system
    console.log(data.page); // Received data page number
    console.log(data.total_pages); // Total number of pages available for querying 
  });
```
  
##### General usage example:
```
  FWD.Story.index({page: 3, per_page: 8}).done(function(stories){
    $.each(stories, function(ix, story){
      console.log(story.get('text'));
    });
  }).fail(function(){
    console.log('Unable to load Stories');
  });
  
  // The same code chained with .then()
  FWD.Story.index({page: 3, per_page: 8}).then(function(stories){
    $.each(stories, function(ix, story){
      console.log(story.get('text'));
    });
  }, function(){
    console.log('Unable to load Stories');
  });
  
  FWD.Story.search({company: 1}).done(function(stories){
    var story = stories[0];  
    story.company().done(function(company){
      console.log('Story by ' + story.get('author') + ' from ' + company.get('name'));
    });
  });
```

### Pagination
Most of API methods support pagination.
```
  FWD.Story.index({
    page: 3, // page number
    per_page: 30   // items per page - 100 maximum
  });
```


### FWD.Story
`FWD.Story.index([pagination_params])` - fetch a page of stories  
`FWD.Story.search([pagination_and_filter_params])` - fetch a page of stories filtered by passed criteria  
`FWD.Story.searchAll([pagination_and_filter_params])` - fetch all stories filtered by passed criteria  
`FWD.Story#company()` - fetch Story associated company    

Available Story filter/pagination params:
```
FWD.Story.search({
  company: 123, // company ID - search stories by authors from company with ID=123 
  state: 'CA', // stories by authors from California  
  district: 13, // stories by authors from 13 district 
  country: 'Mexico', // stories by authors from Mexico 
  tags: 'daca,dapa', // stories tagged with "daca" and/or "dapa" tags 
  tags_any: 'yes', // 'no' - each story must be tagged with all :tags, 'yes' - each story must be tagged by at least one of :tags
  order: 'recent', // 'recent' - most recent stories first, 'viewed' - most viewed stories first, default - order stories by advocacy point number.
  featured: 'yes', // search featured-only stories
  page: 4, // fetch 4th page with :per_page stories
  per_page: 10 // fetch a page of at most 10 stories 
});
```

Fetching associated Company (Organization) model 
```
  FWD.Story.index().done(function(stories){
    $.each(stories, function(ix, story){
      var storyTitle = 'Story by ' + story.get('author');
        
      story.company().then(function(company){
        console.log(storyTitle + ' from ' + company.get('name'));
      }, function(){
        console.log(storyTitle);
      });
    });
  });
```

### FWD.Article
`FWD.Article.press([pagination_and_filter_params])` - Fetch a page of Press Articles

```
FWD.Article.press({
  tags: 'daca,dapa', // articles tagged with "daca" and/or "dapa" tags 
  tags_any: 'yes', // 'no' - each article must be tagged with all :tags, 'yes' - each article must be tagged by at least one of :tags
  page: 1, // fetch 1st page with :per_page articles
  per_page: 10 // fetch a page of at most 10 articles 
}).done(function(articles){
  $.each(articles, function(ix, article){
    console.log(article.get('title') + ' by - ' + article.get('source_name'));
  });
});
```
   

### FWD.Company
`FWD.Company.load([pagination_params])` - fetch a page of companies  
`FWD.Company.loadAll()` - fetch all companies  
`FWD.Company.find(company_id)` - fetch company by ID

##### Example:
```
FWD.Company.load({
  page: 1, // fetch 1st page with :per_page articles
  per_page: 10 // fetch a page of at most 10 articles 
}).done(function(companies){
  var $ul = $('body').append('<h3>Companies</h3><ul></ul>').find('ul:last');
  $.each(companies, function(ix, company){
    $ul.append('<li><a href="' + company.get('domain') + '">' + company.get('name') + '</a></li>');    
  });
});
```
