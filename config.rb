activate :directory_indexes

set :relative_links, true
set :haml, { format: :html5 }

page '/*.xml',    layout: false
page '/*.json',   layout: false
page '/*.txt',    layout: false
page '/404.html', directory_index: false

set :css_dir,    "assets/stylesheets"
set :images_dir, "assets/images"
set :js_dir,     "assets/javascripts"

activate :external_pipeline,
  name:    :gulp,
  command: "./node_modules/gulp/bin/gulp.js",
  source:  ".tmp",
  latency: 1

configure :build do
  ignore "assets/javascripts/app.js"
  ignore "assets/stylesheets/site"

  activate :gzip
  activate :minify_html do |html|
    html.remove_quotes = false
    html.remove_intertag_spaces = true
  end
end
