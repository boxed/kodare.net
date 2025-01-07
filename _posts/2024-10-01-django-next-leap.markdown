---
title: "The next great leap for Django"
date: 2024-09-30
tags: [programming, python, django, iommi]
author: Anders Hovmöller
---
2025 will be the 20-year anniversary of Django. I've been using it since the 0.9 days, and professionally since 2011. It has improved a lot since the first release, with migrations probably the biggest improvement. 

I believe we can make a leap as big as from 0.9 to 5.0 or even bigger, but with a very small effort. 

Many small things can be more important than big strategic things. While the Django development roadmap has focused on advanced ORM features and async, lower hanging fruit has been left unaddressed. And there's a lot of it!

 Here's a list of things that are small fixes and that would make a massive difference:

{% raw %}
- Silent errors 
    - Template variable lookup gives you empty string when it fails. This has down stream effects like `{% url %}` failing in strange ways because it can't resolve the empty string to a view. (A change here would need to be opt in for backwards compatibility reasons.)
    - `Textarea`/`RadioSelect`/etc. widgets are ignored when put on a `Form`. 
    - A misspelled `clean_*` is silent.
    - `path('blog/', include(‘some_module_without_patterns’))` gives no error.
    - Extending a template and then putting html code outside all the blocks throws away all that code silently. 
    - Extending a template and using the wrong name for a block in a base template (or in other words declaring a new block) is silently going to throw away that block.
- Not helpful errors
    - `DoesNotExist` doesn't give you the model name or what the query was.
    - `TemplateNotFound` could be much more helpful. It could list all possible correct values in alphabetical order, with one item per line.
    - Error messages could contain links to the docs if possible. Elm does this and it's very good! This would be a lot easier if there was a "latest" version of the docs you could link to. 
    - `Foo.objects.filter('1234')` has the terrible error message "Cannot resolve keyword 'i' into field. Choices are: ...". It iterates over what is passed, so it tried "1", "2", "3", "4"!
    - `IntegrityError at / NOT NULL constraint failed: discussion_post.created_by_id`. Tell the user you need to pass `created_by` because it can't be null.
    - `OperationalError at / table discussion_post has no column named text`. Tell the user to run makemigrations/migrate.
- Static file serving
    - When people ask about this, 90% of the time you can just tell them to install whitenoise. Django's docs makes perfect the enemy of good. Most projects are small hobby or school projects, we don't need to force everyone to get nginx configured properly.
- Migration issues
    - `makemigrations` could warn if you have apps with `models.py` but no `migrations/__init__.py`
    - It would be nice if Django checked that migrations are committed.
{% endraw %}

A greater focus on small details like this has outsized effects on how nice it is to use a product. It's the difference between the pain of a thousand cuts from walking through thorns, and a helping hand guiding you on a smooth path.

 Small details matter. They matter even more for beginners, but they still matter for everyone.
