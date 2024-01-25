---

title:	"My web dev stack 2024"
date:	2024-01-25
---

I work as the only developer at [Dryft](https://dryft.se), a consumer facing construction company startup here in Sweden. We are trying to build a consumer brand you can trust when you need something done with your house, and being a great place to work.  The product I build is primarily an internal tool for estimating the size of jobs, pricing those jobs, and finally presenting that as an offer to customers. In addition to this part there are automations of third party integrations, various minor internal tools, and tools to keep track of scheduling the work.  Being the only developer I keep the stack lean and automated as much as possible. These are the highlights:

- [Django](#django)
- [iommi](#iommi)
- [PostgreSQL](#postgresql)
- [Elm](#elm)
- [Urd](#urd)
- [Dokku](#dokku)
- [pytest](#pytest)
- [GitHub Actions](#github-actions)
- [Sentry + DevBar](#sentry--devbar)


# Django

[Django](https://www.djangoproject.com/) is the big name in Python web development for good reason. It's stable, versatile and basically nailed the basic DX in the first release in 2005 (when I started using it!). In my mind, only three major things needed fixing since that initial release: 

- schema migrations (fixed in Django 1.7)
- forms (see iommi below)
- silent failures in templates

The silent failures is fixed by my package [django-fastdev](https://github.com/boxed/django-fastdev) which I consider essential to development and production use. It has some other fixes, but the template fixes are by far the most impactful.

The rest of the Django stack is rounded out with [gunicorn](https://gunicorn.org/) for the web server, [whitenoise](https://whitenoise.readthedocs.io/en/latest/) for static files, [django-ninja](https://django-ninja.dev/) for JSON APIs, and my own library [Okrand](https://github.com/boxed/okrand) for i18n.


# iommi

At my previous job we had some quite messy html table code where developing a new page was done by copy-pasting an existing view and a bunch of related templates. This was error-prone and took a lot of development time, and there were *many* such pages needed. Me and my colleague Johan Lübcke refactored out all this code on and off for several years, eventually creating [iommi](https://docs.iommi.rocks/). On the way I got angry enough at the limitations of the built-in Django forms that I wrote a replacement forms system over a weekend.
 iommi makes it possible for me to build tables with filtering, pagination, and reporting; complex forms; and composed pages with a mix of tables, forms, and template parts. iommi takes care of making sure the namespaces of those parts are unique so that you don't POST two forms and one field ends up in multiple forms for example.

iommi also comes with a replacement for the Django Admin. It's much more flexible in the customizations you can make, but the best part is that all those configurations speak the standard iommi language, meaning that you can copy-paste out the conf into your own view if that becomes needed. It also means you have one system to learn to build your own pages and configure the admin, not two very different systems that are mostly unrelated. This has been a vital component to be able to create a lot of features and experiments really fast. You can write big complex pages that you delete after a week. It's that fast.


# PostgreSQL

People have been saying how great [PostgreSQL](https://www.postgresql.org/) is for decades, and how many cool features it has compared to MariaDB. When I could start fresh I jumped from MariaDB to PostgreSQL, and I mostly regret this. I have so far never used any of the PostgreSQL features, but I have been bitten by PostgreSQLs bad upgrade story, if only in my local environment. MariaDB is in my opinion better for ops. I would like to have live replication, but opening the [documentation page for PostgreSQLs replication](https://www.postgresql.org/docs/current/warm-standby.html) makes me run away screaming. 

Me being a single developer who is trying to avoid ops as much as possible this was probably the wrong tradeoff in hindsight. I think I would be happier with MariaDB. But I feel more confident that if I need some advanced feature it is there waiting for me. Three years in and it feels like PostgreSQL was a mistake, but maybe in a year more I will change my mind.


# Elm

At my previous job, Having been burned by Angular, and not being very impressed with React and ClojureScript, we chose to try [Elm](https://elm-lang.org/). This was a big success. There are some big downsides for sure, but when I started this new code base from scratch Elm was my go to, and I'm quite happy with that all things considered. I did try Vue after a week when I was being especially frustrated by Elm, but I quickly started fearing all the hidden mines in JS, and rewrote the Vue code into Elm. My situation with Elm improved when I found django-ninja and wrote Python->Elm codegen for decoders/encoders. I think Elm basically requires you to commit to some code generation to keep backend and frontend data exchange types in sync. 


# Urd

I needed some scheduling and background job processing. The standard solution is Celery, but it seemed to me like a big complex thing to use for my simple use case, and it didn't even do what I needed without adding Celery Beat on top, and still I'd have to implement locking myself on top of that. I tried django-q instead. I was very unhappy with this. It had some quite bad bugs and weird behaviors, the worst is still unfixed in the maintained fork (django-q2). I wrote my own scheduler at the end. It's extremely simple and covers my specific use case perfectly. It is released on PyPi as [Urd](https://github.com/boxed/urd). 


One of my favorite things with Urd is being able to check a “disabled” checkbox in the iommi admin GUI, press save, and that job is stopped almost immediately. This means I can quickly pull the brakes on runaway tasks.


# Dokku

I have been using [Dokku](https://dokku.com/) for hobby projects for several years, and I am very impressed with how solid and flexible it is. It's like having all the best things from Heroku, but also being able to just SSH into the VM and look around if there are problems. A simple `git push prod` to have a zero-downtime deploy is amazing. Setting up letsencrypt, databases, apps, etc. is extremely smooth. I can't recommend Dokku enough. 


# pytest

For testing I use [pytest](https://docs.pytest.org/) with [pytest-django](https://pytest-django.readthedocs.io/), [coverage.py](https://coverage.readthedocs.io/) for coverage and [time-machine](https://pypi.org/project/time-machine/) to lock the time. I have some setup to make sure tests run with [unaligned primary keys](https://kodare.net/2018/08/28/intermittent-tests-aligned-primary-keys.html), but otherwise it's all pretty standard.


# GitHub Actions

When I `git push`, GitHub Actions runs my tests and if they are successful, they `git push prod` which deploys to production with Dokku. This works amazingly well. With [Working Copy](https://workingcopy.app/) I can even make changes on the go when I only have my phone with me. This is pretty rare, but I have used it in a pinch once, and I was very glad I had it!

If I need to let users try a feature out that isn't a good fit for feature flags, I also have some code that joins all green PRs into a `test` branch that is then force pushed to GitHub and deployed to a testing server. I try to avoid having long-lived PRs that are waiting for testing, but it's useful to have this automated when I need it. This is based roughly on [the workflow I was a part of building at my previous job](https://kodare.net/2019/11/20/nice-testing-environment.html).


# Sentry + DevBar

In my opinion having [Sentry](https://sentry.io), or something similar, is absolutely vital for production at any level including hobby projects. For work I also have [DevBar](https://github.com/boxed/devbar) set up so that production crashes are shown immediately in my Mac's menu bar.

In DevBar I also show if a deploy is in progress, if the test run failed on GitHub, and some other things that I need to react to if it happens. At my previous job we had tons of things in DevBar but since I'm still only one developer I need less things.
