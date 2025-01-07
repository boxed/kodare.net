---
title:	"Use the biggest hammer!"
date:	2018-02-05
tags: [programming, python, testing, pytest, flaky-tests]
author: Anders Hovmöller
---

  Our pytest database fixture used to just mean "all databases" (mysql, cassandra, vertica) but with our switch to Python3 we needed to be able to skip all tests requiring Cassandra for several months as we made changes for a new driver. We started doing this split manually but it was very error prone and slow going.

The problem was that tests could access the database because the definition for how to connect to the database was in the Django settings. The fixture just didn't have any way to *enforce* the access to the specific database. It was all or nothing. So to get around that I made sure that the settings file contained an *invalid* hostname for Cassandra. Then we introduced a new Cassandra specific fixture that fixes the hostname before the test and then breaks it after the test. The way I broke the hostname was to add the string "no-you-dont" to the end :P

With this change in, we just ran the test suite once and added the Cassandra fixture to the tests that failed. Then we could just skip all those marked tests in Python 3 until we were done with that migration.

### The take home message

I think we as programmers often try to have nice and "proper" solutions. But it's important to always consider escalating from a scalpel to the biggest hammer you have. Like fixing intermittently failing tests by breaking the hostname in your settings file :P
