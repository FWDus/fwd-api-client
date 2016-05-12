$.fn.toggleShorten = function(){
  this.each(function(){
    var $self = $(this);
    var fullContent = $self.html();
    var previewLength = 600;
    if (fullContent.length < previewLength) { return ; }

    var previewContent = $self.text().substr(0, previewLength);
    var showPreview = false;

    var onBtnClick = function(e){
      e.preventDefault();

      showPreview = !showPreview;
      if (showPreview) {
        $self.html(previewContent).append('... <a href="#">Expand &gt;&gt;</a>');
      } else {
        $self.html(fullContent).append(' <a href="#">&lt;&lt; Collapse</a>');
      }
      $self.find('a').click(onBtnClick);
    };
    $('<a></a>').click(onBtnClick).click();
  });
};

var imageUrl = function(url) {
  return url.startsWith('//') ? 'http:' + url : url;
};

var chunkArray = function(array, chunkSize) {
  var chunkedArray = [];
  for (var i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i+chunkSize));
    // do whatever
  }
  return chunkedArray;
};

var renderPress = function(articles) {
  var source = $('#pressTemplate').html();
  var template = Handlebars.compile(source);

  var html = $.map(articles, function(article) {
    return template(article.attributes);
  }).join('<hr />');

  $('.press').html(html)
};

var renderStories = function(stories) {
  var source = $('#storyTemplate').html();
  var template = Handlebars.compile(source);

  var $stories = $.map(stories, function(story) {
    var decoratedAttributes = $.extend(
        {photo_large_url: imageUrl(story.attributes.photo_large)},
        story.attributes
    );
    var storyHTML = template(decoratedAttributes);
    var $story = $('<div class="media-object story"></div>');

    $story.html(storyHTML).find('.story-text').toggleShorten();

    story.company().done(function(company) {
      var $title = $story.find('.title');
      var html = $title.html();
      html += ' <small>'+ company.get('name') +'</small>';
      $title.html(html);
    });

    return $story;
  });

  var $container = $('.stories').html('');
  $.each($stories, function(ix, $story){
    $container.append($story);
    if (ix != $stories.length - 1) {
      $container.append('<hr />');
    }
  });
};

var renderCompanies = function(companies) {
  var source = $('#companyTemplate').html();
  var template = Handlebars.compile(source);
  var $companies = $('.table-companies');

  var html = $.map(companies, function(company){
    return template(company.attributes);
  }).join('');

  $companies.find('tbody').html(html);

  $companies.removeClass('hide');
};

var renderLegislators = function(legislators) {
  var source = $('#legislatorTemplate').html();
  var template = Handlebars.compile(source);

  var legislatorCells = $.map(legislators, function(legislator) {
    return template(legislator.attributes);
  });

  var html = $.map(chunkArray(legislatorCells, 6), function(legislatorRow){
    return '<div class="row">' + legislatorRow.join('') + '</div>';
  }).join('');

  $('#legislators').html(html);
};

FWD.init('___public_api_key___');
$(document).foundation();

$(function(){
  $('.companies-load-btn').click(function(e){
    e.preventDefault();
    FWD.Company.load().then(renderCompanies);
  });

  $('.stories-load-btn').click(function(e){
    e.preventDefault();
    FWD.Story.index().then(renderStories);
  });

  $('.press-load-btn').click(function(e){
    e.preventDefault();
    FWD.Article.press().then(renderPress);
  });

  $('.legislators-load-btn').click(function(e){
    e.preventDefault();
    FWD.Legislator.search({
      state: 'CA',
      per_page: 12
    }).then(renderLegislators);
  });
});