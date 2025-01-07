---
title:	"Flaky tests part 3: freeze the world"
date:	2018-09-12
tags: [programming, python, testing, pytest, flaky-tests]
author: Anders Hovmöller
---

 I didn't set out to write a blog series on flaky tests, but [here](/2018/02/05/use-the-biggest-hammer.html) we [are](/2018/08/28/intermittent-tests-aligned-primary-keys.html). Sometimes the topic chooses you.

Dealing with time in tests is a pain. Time is essentially a global variable that keeps changing constantly. I was recently reminded of this when I wrote a test that only passed after 02:00 and before 07:00. There were two problems with the test:

1. Time was moving.
2. Some other thing I still don't know what it was.
Point 1 was the bigger problem and after having spent a few hours trying to figure out what point 2 was I decided to ignore it for now and fix 1. Of course, when I did the problem went away. So here's the first lesson: solve the obvious and big problem first. This is a lesson I knew but didn't apply to this situation so it bears repeating :P

To stop time we use a fantastic library called [freezegun](https://github.com/spulec/freezegun). It allows you to lock the time, move the clock "manually", etc. We've used it for a few years, but the problem was that it was *off* by default. Or in other words our tests were *broken by default.* I realized that tests that actually do want and need access to a real, moving time are the exception, not the rule.

Locking the time for all tests in pytest is easy:

```python
@pytest.fixture(autouse=True)  
def frozen_time():  
    with freezegun.freeze_time(fake_now) as f:  
        yield f
```

There were some tests that had `sleep()` calls in them because they were testing some feature that measured time. With frozen time we can call `frozen_time.tick()` to move time forward exactly one second. So now the tests are faster and instead of an assert like `elapsed > 1` we can now write the exact `elapsed == 1` which is also better since it can find an introduced bug where the measured time is too big.

Some tests do actually need to look at the current time, or at least have the time moving and can't be easily changed to call tick() at the correct time. For these I added this fixture:

```python
@pytest.fixture  
def actual_time():  
    with freezegun.freeze_time(freezegun.api.real_datetime.now(), tick=True) as f:  
        yield f
```
To make all this work properly there is another change that we had to make: we use FactoryBoy for our factories and we had factories that looked something like this:

```python
class UserFactory(factory.Factory):  
    class Meta:  
        model = models.User 
        first_name = 'John'  
        last_name = 'Doe'  
        created_at = datetime.now()
```
This was broken because the `created_at` timestamp was locked to the import time, not the time a `User` was created. This worked by mistake mostly, but I did find tests that would have failed if the test suite started before 00:00 and the test itself ran on the next day. We just had never been that unlucky, mostly due to people not working in the middle of the night.

I solved this by having a constant `fake_now` that we use to set times in our factories and that is also the time used when freezing the time, so they match up.

This change simplifies lots of tests and will make it easier to write future tests. Asserting log entries is a breeze when you know the time they write for example.
