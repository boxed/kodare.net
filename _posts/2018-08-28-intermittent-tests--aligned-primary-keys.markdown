---
title:	"Intermittent tests: aligned primary keys"
date:	2018-08-28
tags: [programming, python, testing, pytest, flaky-tests]
author: Anders Hovmöller
---

  We've had a problem for years with tests that work locally but that breaks in CI and in some cases even breaks intermittently in CI. [I've written about how we solved some of these](https://medium.com/@boxed/use-the-biggest-hammer-8425e4c71882), but this time I want to talk about aligned primary keys.

We use normal auto increment primary keys in MySQL and we have some quite complex data models. Some of those come in pairs or even triplets, so if you create a row of Foo we create a corresponding Bar. For example we use these primary keys in audit logs that tests must assert.

The problem comes when we confuse the primary key of Foo and Bar. If you run the test locally the tables are truncated so both the Foo and Bar rows will get primary key 1 and broken tests pass. They can even pass for a very long time in CI, but Django rollback tests causes auto incremented values to stick. This can result in the primary keys getting out of sync which cause failing tests, but only if you're unlucky (lucky?) and have a test that runs before your broken test that touches the Foo and Bar tables in such a way as to make the primary keys misalign. This can be quite maddening to debug because it works locally 100% of the time when just running a single test. To reproduce it you have to figure out which other test (out of hundreds or thousands) that combines with your test to cause the problem.

The solution turns out to be quite simple: make sure all tables get their own primary key range. MySQL has a command to set the next index for auto increment columns, so we just run that on all tables before every test that touches the database:

```python
cursor.execute('SHOW TABLES')  
for i, row in enumerate(cursor.fetchall()):  
    cursor.execute(f'ALTER TABLE `{row[0]}` AUTO_INCREMENT = {(i + 1) * 1000}')
```

For PostgreSQL:

```python
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
for i, (table,) in enumerate(cursor.fetchall()):
    cursor.execute(f'ALTER SEQUENCE IF EXISTS {table}_id_seq RESTART WITH {(i + 1) * 1000}')
```

A full implementation for pytest:

```python
@pytest.fixture(autouse=True)
def reset_sequences(request, django_db_blocker):
    if request.node.get_closest_marker('django_db'):
        with django_db_blocker.unblock():
            cursor = connection.cursor()

            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            for i, (table,) in enumerate(cursor.fetchall()):
                cursor.execute(f'ALTER SEQUENCE IF EXISTS {table}_id_seq RESTART WITH {(i + 1) * 1000}')
```

No more intermittent tests 🎉
