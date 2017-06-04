require 'lib/custom_helpers'
require 'lib/embed'
require 'ansi/code'
require 'slim'

set :markdown_engine, :redcarpet
set :markdown, fenced_code_blocks: true, disable_indented_code_blocks: true, strikethrough: true, smartypants: true, with_toc_data: true
set :relative_links, true
set :slim, layout_engine: :slim

activate :blog do |blog|
  blog.prefix = "blog"
  blog.permalink = "{title}.html"

  blog.summary_separator = /\(READMORE\)/
  blog.new_article_template = File.expand_path('new_article.markdown.erb', File.dirname(__FILE__))
  blog.layout = "partials/_blog_post"
end

activate :search do |search|
  search.resources = ['blog/']
  search.fields = {
    title:   { boost: 100, store: true, required: true },
    date:    { index: false, store: true },
    content: { boost: 50 },
    url:     { index: false, store: true}
  }
end

helpers CustomHelpers

activate :syntax
activate :directory_indexes
activate :embed

page '/*.xml',  layout: false
page '/*.json', layout: false
page '/*.txt',  layout: false
