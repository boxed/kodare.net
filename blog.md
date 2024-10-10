<div id="archive">
<h2>Blog</h2>

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tags_list = site_tags | split:',' | sort_natural %}

<ul class="tags">
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
    <li class="tag"><a href="/tags.html#{{ this_word}}"><span class="tag-name">{{ this_word | replace: "-", " " }}</span> <span class="count">x {{ site.tags[this_word].size }}</span></a></li>
  {% endunless %}{% endfor %}
</ul>

<ul style="list-style: none; padding-left: 0">
  {% for post in site.posts %}
    {% unless post.draft %}
      <li>
        {{ post.date | date: "%Y-%m-%d" }} - <a href="{{ post.url }}">{{ post.title }}</a>
      </li>
    {% endunless %}
  {% endfor %}
</ul>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('claps').remove();
});
</script>
