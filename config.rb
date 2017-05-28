require 'slim'

page '/*.xml',  layout: false
page '/*.json', layout: false
page '/*.txt',  layout: false

activate :external_pipeline,
  name: :gulp,
  command: build? ? 'gulp build --production' : './node_modules/gulp/bin/gulp.js',
  source: "dist",
  latency: 1

activate :blog do |blog|
  blog.prefix = "blog"
end

activate :directory_indexes

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
