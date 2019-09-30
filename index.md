<div id="archive">
<h2>Archive</h2>

<ul style="list-style: none; padding-left: 0">
  {% for post in site.posts %}
    <li>      
      {{ post.date | date: "%Y-%m-%d" }} - <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
</div>

<script>
document.getElementById('claps').remove();
</script>
