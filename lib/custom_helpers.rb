module CustomHelpers
  def html_title(current_article, current_resource)
    if current_article
      return "#{current_article.title} - #{data.site.name}"
    end

    if current_resource
      url = current_resource.url

      if url == '/'
        return data.site.name
      elsif url =~ /\/page\/[0-9]+\//
        page_number = url.split('/')[2]
        return "#{data.site.name} – Blog – Page #{page_number}"
      end

      page_title = current_resource.metadata[:page][:title]
      return page_title + ' – ' + data.site.name unless page_title.nil?
    end

    data.site.name
  end

  def og_title(current_article, current_resource)
    if current_resource
      title = current_resource.metadata[:page][:title]
      return title unless title.nil?
    elsif current_article
      return current_article.title
    end

    data.site.name
  end

  def og_image_or_default(current_article, current_resource)

    image = current_resource.metadata[:page][:og_image]

    if current_article
      doc = Nokogiri::HTML(current_article.body)
      image ||= doc.xpath("//img").map { |img| img["src"] }.first
    end

    image ||= current_resource.metadata[:page][:background_image]

    # Default image
    image ||= data.site.dark_image

    if image[0] == '/'
      image = "https://codereading.club#{image}"
    end

    image
  end

  def og_image_or_background(current_resource)
    image = current_resource.metadata[:page][:og_image]
    image ||= current_resource.metadata[:page][:background_image]

    if image && image[0] == '/'
      image = "https://codereading.club#{image}"
    end

    image
  end

  def page_description
    description = current_resource.metadata[:page][:description]

    if current_article
      summary = (current_article.metadata[:page][:summary] or current_article.summary)
      description ||= Nokogiri::HTML(summary).xpath('//p').collect.first(2).map { |paragraph|
        "#{paragraph.to_str} "
      }.reduce('', :+).strip
    end

    if current_resource
      url = current_resource.url

      if url =~ /\/page\/[0-9]+\//
        page_number = url.split('/')[2]
        description = "#{data.site.name}'s Blog – Page #{page_number}."
      end
    end

    description or data.site.description
  end

  def prepare_feed_content(body)
    body.gsub!('src="/img/', 'src="https://codereading.club/img/') unless body.nil?

    require 'lib/embed'
    body.embed_items!

    body
  end
end
