---
title:	"Flaky tests, part 4"
date:	2019-04-23
tags: [programming, python, testing, pytest, flaky-tests]
author: Anders Hovmöller
---

  We've had a flaky test for several weeks that always runs fine locally, but it sometimes failed in CI. Today I found the bug. The test should have been

```python
fake_request = WSGIRequest()  
fake_request.user = Struct([..snip..], is_staff=True)  
[...snip...]
```

But there was a mistake. It actually looked like this:

```python
fake_request = WSGIRequest  
fake_request.user = Struct([..snip..], is_staff=True)  
[...snip...]
```

Did you notice the error? There are no parenthesis after `WSGIRequest`! This means that after this test has run the `WSGIRequest` class is now accidentally monkey patched to have a new attribute user which mostly worked. The problem was that another test accessed `request.user.is_authenticated` and there is no `is_authenticated` flag on the Struct above, so that's a crash.

The reason the test was flaky was because the ordering of tests isn't strict because we use [pytest-testmon](https://testmon.org) on most builds to [skip irrelevant tests](https://medium.com/@boxed/vastly-faster-python-integration-tests-9d8106b3693c), and on the main build we use a chunking system to split tests across multiple build machines, plus [xdist](https://github.com/pytest-dev/pytest-xdist) to run them in parallel on each of those machines. this lowers the odds considerably that we run the test that monkey patches WSGIRequest and the test that cares that it is monkey patched. We also never run them locally together because one is a unit test and the other is an integration test.

Ideally this should be caught by some form of static analysis, but unfortunately it isn't found by either flake8 or PyCharm.
