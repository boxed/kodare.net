---
title: Transparent APIs
date: 2020-09-14
render_with_liquid: false
---
{% raw %}


Transparent APIs is a pattern/philosophy me and my colleague Johan Lübcke have developed. It's especially nice for building GUIs but is also generally useful in some other cases.

The example I'll use is a simple program that reads some RSS feeds:

```python
import feedparser
import requests


def get_feed(url):
   response = requests.get(url=url)
   return feedparser.parse(response.data)
```

Pretty trivial. But how to we handle edge cases? Maybe the first thing we'd hit is password protected RSS feeds. We could solve this by adding an auth parameter that we send to requests:

```python
def get_feed(url, auth=None):
   response = requests.get(
       url=url,
       auth=auth,
   )
   return feedparser.parse(response.data)
```


Seems pretty ok. Now we hit an RSS feed that generates the data in latin-1 encoding but the webserver is misconfigured so it says it's UTF-8. We could handle this by another parameter `encoding`:


```python
def get_feed(url, auth=None, encoding=None):
   response = requests.get(
       url=url,
       auth=auth,
   )
   if encoding is not None:
       response.encoding = encoding
   return feedparser.parse(response.data)
```

Then there's a feed that generates corrupt XML that feedparser chokes on. So we'll have to add something for that:

````python
def get_feed(url, auth=None, encoding=None,
             replacement=None):
   response = requests.get(
       url=url,
       auth=auth,
   )
   if encoding is not None:
       response.encoding = encoding
   d = response.data
   if replacement is not None:
       d = d.replace(
          replacement[0],
          replacement[1])
   return feedparser.parse(d)
````

Then we find a feed that has *two* errors, so replacement has to be changed to replacementS and a for loop introduced.
 
 
```python
def get_feed(url, auth=None, encoding=None,
             replacements=None):
   response = requests.get(
       url=url,
       auth=auth,
   )
   if encoding is not None:
       response.encoding = encoding
   d = response.data
   if replacements is not None:
       for replacement in replacements:
           d = d.replace(
              replacement[0],
              replacement[1])
   return feedparser.parse(d)
```
 
Then we find some other feed where we need to give it a special user agent string and we introduce an argument for that...

I think you see where I'm going with this: every little small edge case causes lots of code to be added in the implementation of `get_feed`. We'd prefer the edge cases to be isolated to the *calls* of `get_feed` and not pollute the function with their single use special cases.

Let's look at how we'd solve this with transparent APIs.


```python
@dispatch(
    fetch__call_target=requests.request,
    fetch__method='get',
    decode=lambda response: response.data,
)
def get_feed(url, fetch, decode):
    response = fetch(url=url)
    data = decode(response)
    return feedparser.parse(data)
```


This is an implementation of `get_feed` with a transparent API. You'll first notice that the body of the function is the same trivial code we started with plus a call to `decode()`. The `@dispatch` decorator is where the action is. You can think of it as setting up a partial application for `requests.request`, but the function being called and the arguments are just defaults, not hard coded. So the first argument to `@dispatch` is `fetch__call_target=requests.request` meaning requests.request is the function to call, and `fetch` is the name of the partial. The second argument is `fetch__method='get'` which means that the keyword argument `method` of the `fetch` partial is set to the value `'get'`. Then the last argument is just a callback with a default value.

Now if we look at some calls of `get_feed`:

```python

get_feed('https://foo.com')

get_feed(
    'https://bad-encoding.foo.com',
    fetch__encoding='latin-1')

get_feed(
    'https://private.foo.com',
    fetch__auth=('username', 'password'))

get_feed(
    'https://broken.foo.com',
    decode=lambda response: \
        response.data.replace('foo"', 'foo'))
```

You can see that the simple case is just as simple as before, but the complex edge cases are very easy to handle and they don't pollute the code of `get_feed`.

This would be even cleaner if the request function of requests had been written with transparent APIs in mind and we could pass it the decode parameter as a lambda. 

We use this style of API to great effect in our library [iommi](http://iommi.rocks) where we have much more complex and deeply nested dispatching. It greatly simplifies the API while making it more powerful and requires less code to use and customize.

{% endraw %}
