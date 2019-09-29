Latest post:

<h1>{{ site.posts[0].title }}</h1>
<div id="post_time">{{ site.posts[0].date | date:"%Y-%m-%d" }}</div>

{{ site.posts[0].content }}

<div id="archive">
## Archive

<ul style="list-style: none; padding-left: 0">
  {% for post in site.posts %}
    <li>      
      {{ post.date | date: "%Y-%m-%d" }} - <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
</div>
