---
title: Introducing iommi
date: 2020-04-02 
render_with_liquid: false
---

I am very excited to reveal something me and my colleague Johan Lübcke have
been working on for quite some time now: [iommi](http://iommi.rocks). This
is a high level framework built on top of [Django](https://djangoproject.com).

This library is a union of our previous libraries tri.form, tri.query and
tri.table but we've collected all our grievances and architectural problems
and dealt with them the way you can only do if you are free to let go of
backwards compatibility. We've also added some new features built on this
new foundation that we've been thinking about for a few years.

This is primarily a library for developing traditional web apps, but we believe
it's also a solid foundation to build SPAs and APIs going forward. Watch this
space. But for now, let's get started!

I will build a discography app (you can find the code on [github](https://github.com/boxed/Supernaut) with separate 
commits for each stage of the apps evolution). To make this simpler for demo
purposes I will put all my views inside `urls.py` so we don't need to jump
around between different files too much.

This is where we will end up at the end of this blog series:

![](/img/introducing_iommi_1.png)

4 pages (plus the admin), with custom table, row, cell rendering, filtering,
pagination, the advanced query language, and a menu.

TODO: links to the other parts in the series

Contents of this episode:

* Do not remove this line (it will not be displayed)
{:toc}

## Django setup

Let's create the venv:

```bash
mkdir Supernaut
cd Supernaut
virtualenv -p $(which python3) venv
source venv/bin/activate
```

Then create a Django project, and the main app:

```bash
django-admin startproject Supernaut
cd Supernaut
django-admin startapp Supernaut
cd ..
```

## Django models

We create these models:

```python
from django.db import models


class Artist(models.Model):
    name = models.CharField(max_length=255, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)


class Album(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    artist = models.ForeignKey(
        Artist, 
        on_delete=models.CASCADE, 
        related_name='albums'
    )
    year = models.IntegerField()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name',)


class Track(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    index = models.IntegerField()
    album = models.ForeignKey(
        Album, 
        on_delete=models.CASCADE, 
        related_name='tracks'
    )
    duration = models.CharField(
        max_length=255,
        db_index=False, 
        null=True, 
        blank=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('index',)
```

Create migrations and run them to create our database tables:

```bash
./manage.py makemigrations
./manage.py migrate
```

The real project also has a little database that it creates [with prefilled data](https://github.com/boxed/Supernaut/commit/2b8df08877375c0285c86fe0108116aec8f5122a#diff-8c129e9d099a80d052bb28ffefcdef14R1).

## The most basic app

We'll start with the simplest app we can think of, creating a `base.html`, `index.html` and a very simple `index` view:

`base.html`: 
```html
{% raw %}<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}{{ title }}{% endblock %}</title>

    {# jQuery #}
    <script src="https://code.jquery.com/jquery-3.4.1.js" integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="   crossorigin="anonymous"></script>

    {# Bootstrap #}
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

    {# jQuery first, then Popper.js, then Bootstrap JS #}
    {# Note that bootstrap tells you to use the slim version of jQuery but this does NOT work with select2! #}
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

    {# Select2 #}
    <link href="https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.0.12/dist/js/select2.min.js"></script>
</head>
<body>
    <div class="container">
        {% block content %}{% endblock %}
    </div>
</body>
</html>{% endraw %}
```

`index.html`:

```html
{% raw %}{% extends "base.html" %}

{% block content %}
    <h1>{{ title }}</h1>

    {{ content }}
{% endblock %}{% endraw %}
```

`urls.py`:

```python
from django.shortcuts import render
from django.urls import path

# Views ----------------------------

def index(request):
    return render(
        request,
        template_name='index.html',
        context=dict(
            content='hello',
            title='Title here!',
        )
    )


# URLs -----------------------------

urlpatterns = [
    path('', index),
]
```

So now that we have a foundation to stand on we will build out the app step by step. 


## Install iommi

```bash
pip install iommi
```

In `Supernaut/settings.py`, we add `iommi` to `INSTALLED_APPS` and `iommi.middleware` to `MIDDLEWARE`:

```python
INSTALLED_APPS = [
    # [...snip...]
    'iommi',
    'Supernaut',
]

MIDDLEWARE = [
    # [...snip...]
    'iommi.middleware',
]
```

## Declarative table

We'll start with using iommi declarative tables to create a list of albums:

```python
# [... snip ... ]

from iommi import (
    Table,
    Column,
)

# [... snip ... ]

# Tables ---------------------------

class AlbumsTable(Table):
    name = Column()
    artist = Column()
    year = Column()


# Views ----------------------------

def index(request):
    return render(
        request,
        template_name='index.html',
        context=dict(
            content='hello',
            content=AlbumsTable(
                rows=Album.objects.all(),
            ).bind(request=request),
            title='Title here!',
        )
    )
``` 

### What is bind()?
`Table()` creates a table definition, and `bind()` couples it to the request,
 this is when it can do the sorting defined by http parameters for example.
 `bind()` returns a new `Table` that is "bound" and can be rendered.


## Simplify!

We can simplify the above quite a bit due to iommis middleware and built in
templates. First we'll delete our `base.html` because iommi has one. Next up
is simplifying the `index` view:

```python
def index(request):
    return AlbumsTable(
        title='Albums',
        rows=Album.objects.all(),
    )
```

The iommi middleware will handle if you return an iommi type and render it
properly. 

## Using as_view

The two parameters `title` and `rows` we passed to `AlbumsTable` can also be
set on the `Meta` class like this:

```python
class AlbumsTable(Table):
    name = Column()
    artist = Column()
    year = Column()

    class Meta:
        title = 'Albums'
        rows = Album.objects.all()
```

(These are defaults so we can still create an `AlbumsTable(title='Something else')` if we want.) 

Now that we have the above we can delete the `index` view altogether and
replace the url definition with this:

```python
urlpatterns = [
    path('', AlbumsTable().as_view()),
]
```

(We could have also passed the `title` and `rows` parameters here, but that's
not as nice I think.)


## auto__model

The next step in the simplification is to realize that this table is trivially
derived from the model definition. iommi has features to do this for you so we
can simplify even further! We delete the entire `AlbumsTable` class and replace
the url definition with this single line:

```python
urlpatterns = [
    path('', Table(auto__model=Album).as_view()),
]
``` 

The title of this table is the plural verbose name of the `Album` model. Again
as stated above, these are all defaults, not hard values, so you can pass 
`title` to the `Table` constructor here to override the title for example. 

## Pages

So for we've just created a table, but often you want something a little more
complex, especially for your index page. iommi has a concept of a `Page` that
is used to build up a bigger page from smaller building blocks. Let's build
out our simple web app to have separate pages for albums, artists and tracks:

```python
path('albums/', Table(auto__model=Album).as_view()),
path('artists/', Table(auto__model=Artist).as_view()),
path('tracks/', Table(auto__model=Track).as_view()),
``` 

and an index page:

```python
class IndexPage(Page):
    title = html.h1('Supernaut')
    welcome_text = 'This is a discography of the best acts in music!'

    artists = Table(auto__model=Artist, page_size=5)
    albums = Table(auto__model=Album, page_size=5)
    tracks = Table(auto__model=Track, page_size=5)
```

with a url definition like this:

```python
path('', IndexPage().as_view()),
```

`html` is a little fragment builder to make it easier and faster to build
small html parts. `html.div('foo')` is just a more convenient way to write
`Fragment(tag='div', children__text='foo')`. Fragments are used internally
throughout iommi, because they allow you to define a small bit of html that
can be customized later. Let's look at an example:

```python
>>> class MyPage(Page):
...    title = html.h1('Supernaut')

>>> MyPage().bind().__html__()
'<h1>Supernaut</h1>'

>>> MyPage(parts__title__attrs__class__foo=True).bind().__html__()
'<h1 class="foo">Supernaut</h1>'
```

This is used throughout iommi to provide good defaults that can be customized
easily when needed.

A `Page` can contain any `Part` (like `Fragment`, `Table`, `Form`, `Menu`, 
etc), or plain strings. Escaping is handled like you'd expect from Django
where strings are escaped, and you can use `mark_safe` to send your raw
html straight through. 

For our demo we'll also introduce a page for an artist:

```python
def artist_page(request, artist):
    artist = get_object_or_404(Artist, name=artist)

    class ArtistPage(Page):
        title = html.h1(artist.name)

        albums = Table(auto__rows=Album.objects.filter(artist=artist))
        tracks = Table(auto__rows=Track.objects.filter(album__artist=artist))

    return ArtistPage()

urlpatterns = [
    # [...snip...]
    path('artist/<artist>/', artist_page),
]
```

Note here how we specify `auto__rows` to supply a `QuerySet` instead of a
model. This is very convenient in many cases, but is otherwise the same as
specifying `auto__model` and `rows`.


## cell__format

In iommi you can customize the rendering on many different levels, depending
on what the situation requires. The last layer of customization is
`format` which is used to convert the value of a cell to a string that
is inserted into the html (or CSV or whatever output format you are targeting):

```python
class IndexPage(Page):
    # [...snip...]
    albums = Table(
        # [...snip...]
        columns__artist__cell__format=lambda value, **_: 
            format_html('<a href="/artist/{}/">{}</a>', value, value)
    )
    # [...snip...]
```

`columns__artist__cell__format` should be read as something similar to
`columns.artist.cell.format`. This way of jumping namespace with `__` instead
of `.` (because `.` is syntactically invalid!) is something Django started 
doing for query sets and we really like it so we've taken this concept further
and it is now everywhere in iommi.

The other levels of customization are `value` which is how the value is 
extracted from the row, `attr` which is the attribute that is read (if
you don't customize `value`), and lastly `template` which you use to override
the entire rendering of the cell (including the `td` tag!). 

You can also override `template` on the row to customize the row rendering.
Again this includes the `tr` tag.


## cell__url

A very common case of tables is to show a link in the cell. You can do that
with `cell_format` and `cell__template` like above, but it's such a common
case that we supply a special convenience method `cell__url` for this. Let's
make the artist column link to the artist page in our table. First we add
a `get_absolute_url` on the model, then replace the 
`columns__artist__cell__format` we had above with:

```python
class IndexPage(Page):
    # [...snip...]
    albums = Table(
        # [...snip...]
        columns__artist__cell__url=lambda value, **_: value.get_absolute_url(),
    )
    # [...snip...]
```

Much better!

But actually, this is such a common case that we do this by default for you
for `ForeignKey` columns if the target model has `get_absolute_url`. So we
can just remove the `columns__artist__cell__url` specification entirely. But 
we do want the *name* column to link to the album page so the total definition
becomes:

```python
    albums = Table(
        auto__model=Album,
        page_size=5,
        columns__name__cell__url=lambda row, **_: row.get_absolute_url(),
    )
``` 


## Table filters

It's very often we want the ability to filter lists, which is why iommi also
provides this. To enable a filter make sure `include` is `True` for the `filter`
of a column. We enable filtering for `name`, `year`, and `artist`:

```python
    albums = Table(
        # [...snip...]
        columns__name__filter__include=True,
        columns__year__filter__include=True,
        columns__year__filter__field__include=False,
        columns__artist__filter__include=True,
    )
```

`columns__year__filter__field__include=False` means we turn off the `Field` in
the form that is created, but we can still search for the year in the
advanced search language. 

To handle selecting from a choice field that is backed by a `QuerySet` that
can contain thousands or millions of rows, iommi by default uses a select2
filter control with an automatic ajax endpoint. You can read more about this 
in the full documentation. An advantage to this approach is that we only need
to be sure our view has the correct permission checks and then we also know
the select box (or ajax endpoint) has the same checks. This makes it easy to
reason about the security of the product. 


## Forms

iommi also comes with a library for forms. This can look very much like the
forms library built into Django, but is different in some crucial ways. Let's
look at the most basic example from the Django documentation:

```python
from django import forms

class NameForm(forms.Form):
    your_name = forms.CharField(label='Your name')
``` 

```html
{% raw %}<form action="/your-name/" method="post">
    {% csrf_token %}
    {{ form }}
    <input type="submit" value="Submit">
</form>{% endraw %}
```

In iommi the same is written as:

```python
from iommi import Form, Field

class NameForm(Form):
    your_name = Field.text()
```

```html
{{ form }}
```

In iommi you always get a form encoding specified on the form, so they all work
with file uploads. This is a very common stumbling block for beginners. You also
get a submit action by default which you can configure via `actions__submit`:


```python
from iommi import Form, Field

class NameForm(Form):
    your_name = Field.text()

    class Meta:
        actions__submit__display_name = 'Save'
```

In iommi we use `class Meta` a lot, similar to Django, but in iommi it's not
just a bucket of values that someone might or might not read, it has a precise
definition: values in `Meta` are passed into the constructor. So the example
above is roughly the same as:

```python
NameForm(actions__submit__display_name='Save')
```

Worth pointing out is that values of `Meta` are defaults, so you can still
override at the constructor call.

An advantage to this strict definition is that we don't have silent failures
in iommi. If you make a spelling mistake in a value in `Meta`, you will get
an error message.


## Automatic forms

iommi can also derive forms from Django model definitions: 
`Form(auto__model=Artist)`. You can specify which fields to include or exclude
via `auto__include` or `auto__exclude`. The fields can still be customized
fully. An example of this could be to insert a CSS class `foo` on the label
tag of a field `name`: 

```python
form = Form(
    auto__model=Artist,
    fields__name__label__attrs__class__foo=True,
)
```

There are many many more customizations options available, you can find more
in the [HOWTO](https://docs.iommi.rocks/en/latest/howto.html) and the docs
for [`Field`](https://docs.iommi.rocks/en/latest/Field.html).


## Automatic views

iommi goes a step further than this though, by supplying full views that can
be used from either a declarative form or an auto generated form. An example
is to have a create view for an `Artist`:

```python
urlpatterns = [
    path('create/', Form.create(auto__model=Artist).as_view()),
] 
``` 

There are three built in forms/views like this: `create`, `edit`, and `delete`.
The `delete` view is a read only form with some styling for the submit button
and a submit handler that delete the object. We find this to be really nice as
a confirmation page because you can see what you are about to delete.


# Admin

With these high level abstractions we've seen so far (pages, tables, queries, 
forms, fragments) we can easily build more powerful components. Which is what
we've done with the administration interface built into iommi. Installing it
is as simple as:

```python
class MyAdmin(Admin):
    class Meta:
        pass


urlpatterns = [
    path('iommi-admin/', include(MyAdmin.urls())),
]
```


Customization is easy with `IOMMI_DEBUG` on (default on if `DEBUG` is on), 
here's how to use the pick tool:

<video controls><source src="/img/iommi-admin-customization.mp4"></video>


You can override an entire field rendering with `template`, the template 
of the label with `label__template`, the name of a field with `display_name`,
add a CSS class to the label tag with `label__attrs__class__foo=True`, and 
much more. Customization is at all levels, and in all these cases you can
supply a callable for even more flexibility.


More about the [admin in the iommi docs](https://docs.iommi.rocks/en/latest/admin.html).
