Hi, my name is Anders. I'm a prolific coder and the author of:

* <a href="https://github.com/boxed/mutmut">mutmut</a> - the premier mutation testing tool for python
* <a href="https://github.com/TriOptima/iommi">iommi</a>, with <a href="https://github.com/jlubcke">Johan Lübcke</a> - build webapps in Django faster, and better
* <a href="https://github.com/boxed/instar">instar</a> - powerful advanced transformations of Clojure data structures
* <a href="https://github.com/boxed/hammett">hammett</a> - the fastest test runner for python, and pytest compatible!
* ...and <a href="https://github.com/boxed?tab=repositories&q=&type=source&language=">many many more</a>

Currently working at <a href="https://dryft.se/">Dryft</a>, where we are making the construction business better for customers and workers.


<div id="archive">
<h2>Blog archive</h2>

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tags_list = site_tags | split:',' | sort_natural %}

<ul class="tags">
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
    <li class="tag"><a href="#{{ this_word}}"><span class="tag-name">{{ this_word | replace: "-", " " }}</span> <span class="count">x {{ site.tags[this_word].size }}</span></a></li>
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
