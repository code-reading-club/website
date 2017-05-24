require "rspec"
require "capybara/rspec"
require "middleman-core"
require "middleman-core/rack"

middleman_app = ::Middleman::Application.new do
  set :root, File.expand_path(File.join(File.dirname(__FILE__), ".."))
  set :environment, :test
  set :show_exceptions, true
end

Capybara.app = ::Middleman::Rack.new(middleman_app).to_app
