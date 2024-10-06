---
title:	"Vastly faster Python integration tests"
date:	2017-10-24
tags: [programming, python, testing, pytest]
---

  I work at an old code base at TriOptima. It's ~15 years old and over 200 thousand lines of Python code. For various reasons most tests have to be integration tests. We've made many optimizations like:

* memory disks for the database
* rollback tests if possible
* looking at the worst offending tests to optimize these
* building in parallel

All this work has gone on at the same time as we get more tests and more features in the product. Overall the time for the test suite has gone down, but because we do continuous deployment and we have a big team the CI environment is under constant load. The end result is that we had to wait for at least 17 minutes to get the ok from the CI tests (unless a fast test failed of course) and if there are queues the total time can go up to 40 minutes.

### Enter pytest-testmon

[pytest-testmon](https://github.com/tarpas/pytest-testmon/) is a plugin to pytest that keeps track of which code is used by which tests. It uses this information to only run the tests that are relevant for the changes you have on disk. The use case the original authors thought of is to have a file watcher running at all times and as you make changes it will run only relevant tests as you save your files for a great interactive testing experience. But we had other plans!

#### The initial failed experiments

I experimented with pytest-testmon on my local machine but it never worked out well because the initial run of the full test suite took so long it wasn't much of an improvement. Since we have a big team the code base moves all the time so I had to start from scratch quite often, making it not much faster than running the full suite locally. This was just too slow so I never bothered. I continued doing what we normally did: pushed the code and waited for the CI environment because that was faster.

#### A new hope

At some point I had an epiphany: testmon was slow and impractical because this initial run had to run all tests, and if everyone on the team did this they'd be basically running the same initial run too. But we could share that work I thought! Running the full suite with pytest-testmon and storing the result centrally could mean we could reuse this data on each developer machine and down the line by the CI itself, making the tests on each PR much faster.

Initial experiments with this was unsuccessful because of how testmon was implemented. I brought this up with the developers and they rewrote a lot of how testmon worked to better cover this case. Testmon used to look at the timestamps of the files and then at blocks of code to figure out changes if the time stamps were different. Git doesn't track timestamps so they reflected clone/checkout time and not modification time. This meant it was very slow to detect that nothing had changed. This was changed by the testmon team to also look at the hash of the source. This meant that even if the timestamp didn't match up, testmon could still quickly discover that a file was unmodified. This meant that it became feasible to share work.

### Up to 3 times faster test builds!

We now test PRs with testmon on by default. We have test times as low as 6 minutes instead of 17. Some of that time is unrelated to the integration tests and are temporary so we can very likely cut at least one minute from that. Some changes will of course trigger more tests, but we're almost never up to the times we had before for all PRs.

The system has two parts:

#### 1. Generate testmon database files

We run the unit and integration parts of the test suite with no parallelization and store the resulting testmon database file in our artifact repository. The name of the file is the git hash for the commit we ran the tests on.

#### 2. Run only relevant tests using testmon

We've built this step into a simple script called test_changes that boils down to:

1. Get the list of all available testmon files from the artifact repository
2. Get 30 parents of the git commit we have checked out
3. Use these two lists to find the closest git commit that exists in both our local checkout and has a testmon file in the artifact repository
4. Download this to a cache directory if it's not already there
5. Copy the testmon file from our cache directory to .testmondata
6. Run pytest with the --testmon flag

The point of the cache is to enable us to switch branches much faster, since these downloads can be a bit on the big side. In our case it's over 30 megs.

This test_changes script is the same for the CI environment as locally which makes running tests really great. So instead of having to run all tests locally we just run the script and if you don't have local changes testmon checksums your source files and then it'll say it skipped all tests. Making a change to some code will now retrigger just relevant tests. This is the dream of testmon, but now it's also possible for huge code bases!
