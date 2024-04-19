<div id="archive">
<h2>Blog</h2>

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
