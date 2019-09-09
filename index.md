<h1>{{ site.posts[0].title }}</h1>

{{ site.posts[0].content }}

<hr>

## Archive

<ul>
  {% for post in site.posts %}
    <li>      
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%Y-%m-%d" }}
      <br>
      {{ post.excerpt }}
    </li>
  {% endfor %}
</ul>
