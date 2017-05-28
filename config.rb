require 'slim'

page '/*.xml',  layout: false
page '/*.json', layout: false
page '/*.txt',  layout: false

# # Assets
# set :css_dir,    "dist/stylesheets"
# set :images_dir, "dist/images"
# set :js_dir,     "dist/javascripts"

activate :external_pipeline,
  name: :gulp,
  command: build? ? 'gulp build --production' : './node_modules/gulp/bin/gulp.js',
  source: "dist",
  latency: 1

configure :build do
  ignore 'assets/*'
  activate :gzip
  activate :asset_hash
  activate :relative_assets

  helpers do
    def markdown(text)
      Tilt['markdown'].new { text }.render(scope=self)
    end
  end
end
