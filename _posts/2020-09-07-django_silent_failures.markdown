---
title: Django silent failures
date: 2020-09-07
render_with_liquid: false
---
{% raw %}
I'm a big fan of Django but it has too many silent failure modes. This is very bad for beginners, and it's not good for veterans either. I make these types of mistakes on an almost daily basis. 

First:

## Templates

Let's look at an example (this is from the official documentation with some very minor changes):


```html
<h1>Articles</h1>

{{ now }}

<ul>
{% for article in object_list %}
    <li>{{ article.name }}</li>
{% empty %}
    <li>No articles yet.</li>
{% endfor %}
</ul>
```

The first problem here is `{{ now }}`. If you don't have a variable `foo` in the context Django ignores this error silently. This is a bad design decision. If you follow any support forum for Django you see this tripping up beginners endlessly with many saying they've wasted hours on such easy typos. (Install django-fastdev to fix this.)

## Class Based Views

Moving on to CBVs (Class Based Views) which are frequently recommended:

```python
class ArticleListView(ListView):

    model = Article
    paginate_by = 100

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['now'] = timezone.now()
        return context
```

Let's look at how many places we can make a one character spelling error and not get an error:

* `paginate_byX = 100`: silence, but obviously the pagination breaks
* `def get_context_dataX(...)`: you silently don't get the context variable you thought you asked for, which is then silently ignored by the templates. Two silently passing errors!
* `context['nowX'] = ...`: silently fails due to the templates silently ignoring errors like above.

So on these 7 lines we have 3 (arguably 4) ways you can have errors that are silently ignored by Django. We can do better! In iommi the equivalent code is this:

```
Table.div(
    auto__model=Article,
    page_size=100, 
    context__now=lambda **_: timezone.now(),
)
```

If you have django-fastdev installed then there is zero places in this code where you can make a typo and have code just ignored silently.

Let's look at the hook points for CBVs to see how many places we can get silent failures (there are a few more hook points actually, but I think this is enough), method bodies skipped:

```
class ArticleListView(ListView):

    model = Article
    paginate_by = 100
    template_name_suffix = '_foo'
    template_name = 'django_cbvs/article_list.html'
    template_engine = None
    response_class = TemplateResponse
    content_type = None
    allow_empty = True
    queryset = Article.objects.all()
    ordering = ['name']
    paginate_orphans = True
    page_kwarg = 'page'
    paginator_class = Paginator
    context_object_name = 'objects'

    def get_context_data(self, **kwargs):
    def setup(self, request, *args, **kwargs):
    def dispatch(self, request, *args, **kwargs):
    def http_method_not_allowed(self, request, *args, **kwargs):
    def get_template_names(self):
    def get_queryset(self):
    def get_context_object_name(self, object_list):
    def get(self, request, *args, **kwargs):
    def render_to_response(self, context,     def options(self, request, *args, **kwargs):
    def get_ordering(self):
```

There are 25 hook points here. If you make a spelling error on any of them except `model`, `template_name` or `context_object_name` you get no error message. The `template_name` parameter is a bit fuzzier, since if you do have a template at `myapp/article_list.html` you will have a silently passing failure, but if you don't then you will get an error. Let's call this one half an error. 

`context_object_name` is interesting because if you declare it you actually get another name *in addition* to the default. I would argue the docs are rather unclear on this point. At least this reduces errors because if you supply this option and forget to change one place in the template to use the new name it will still work. If you think this is good or bad is pretty subjective, as it can definitely introduce a lot of confusion later.

With Function Based Views pretty much all of these pit falls just don't exist. This is a good reason to recommend FBVs, but CBVs could validate their inputs and we wouldn't have this problem. CBVs could validate all their members except those that start with `_` so you can still declare your own methods. Obviously the error message if you forget the `_` would need to tell you about this!

## Forms

In my opinion forms are slightly better than CBVs, because they take quite a few configuration options as constructor arguments, like `data`, `files`, `auto_id`, `prefix`, `initial`, etc. If you make a spelling error here you will get an error from python because the keyword arguments don't match (assuming you don't use positional arguments, then you have more hard to debug errors but at least you get errors probably!). But let's move on to the problems:

(If you use CBVs with forms you have a new failure point on `form_valid`, same as normal for CBVs.)

A common failure point for new users is that they want a textarea so they do:

```python
class MyForm(Form):
    message = forms.Textarea()
```

The problem here is that Textarea is a `Widget`, not a `Field` and the way forms are designed is that they collect instances of `Field` and ignore anything else. This specific case can be handled by the forms also collecting widgets and producing a good error message.

Forms have the same type of issues with hook points as CBVs, so spelling errors in for example `clean` would mean your clean function now isn't called. If you have a security critical piece of code with this error this can be quite fatal. 

Another failure case is the validation of fields in a form. There are two ways: either declare validators or define `clean_*` methods. The first method has no problem, I like this approach! But this isn't even mentioned in the section of the docs for how to validate. The docs use the `clean_*`-method:

```python
class ContactForm(forms.Form):
    name = forms.CharField()

    def clean_name(self):
        return self.cleaned_data['name']
```

If you rename the `name` field here you also need to rename the `clean_name` method. If you forget you will silently not get your validation code. This is bad! Django forms could validate that all `clean_*` methods correspond to a field, and present an error message saying there's a mismatch (or that you need to name it `_clean_*` if you intended for it to not be called by a field implicitly).

## Summary

You might have noticed that many of the problems here are common to any standard OOP style code base written in Python: there's no `overrides` and no `final` qualifiers to avoid these pit falls. This is all fine in normal casual usage, but you don't have to settle for this type of brittle behavior in your own library. Python is very flexible and we can make libraries robust against user error if we spend the time and effort to do so. 


(When publishing this blog post I accidentally named the file `2020-08-07_django_silent_failures.markdown` instead of the correct `2020-08-07-...`. This was a silent failure and the blog post never appeared. Ironic!)

{% endraw %}
