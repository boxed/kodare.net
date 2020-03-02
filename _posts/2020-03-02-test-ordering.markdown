---

title:	"Test ordering"
date:	2020-03-02
---

I've been working for a few weeks on iommi, a union and expansion of the libraries tri.form, tri.table and tri.query. The test suite is quite comprehensive as it is the tests from all those libraries, plus more for new functionality and we've spent time improving the test suite too. 

Since this is an opportunity for us to break backwards compatibility we have reevaluated all old decisions, solutions, algorithm and names. This means we've very often gone from all tests passing to having more than 90% of tests fail. Getting back to a green state when you are out in the woods like that (many times!) have made me realize that we, as an industry, don't generally structure our tests in a way that makes this easy. 

Our solution was to have a naming scheme where test files are named test_&lt;number&gt;_&lt;name&gt;.py so that we can put the lower level tests first and then the higher levels of abstraction later. This means we are more likely to hit a test that shows the problem early instead of that test being buried as failing test 151 out of 214 failing tests. Earlier tests are often much clearer.  

It's also a good idea to move more basic tests up in each file so they are above the tests that are likely to fail as a side effect of something more basic breaking. We think this sorted test suite makes more sense and makes it more understandable and not just a disorder pile of disjointed tests. 

The numbering convention we use is two numbers, where the first digit is major layer of the architecture. So for us 05 means 0 for the most basic stuff and 5 for the 6th item in that list (zero indexed of course). It's not necessary to be very strict here, the rough ordering gives most of the gain.  If you undertake a big refactoring where you intend to break backwards compatibility we highly recommend doing this type of rename first. It would have saved us a lot of time if we had done this at the start of the project. 

(To see how to make pytest respect this ordering, see https://github.com/TriOptima/iommi/blob/master/conftest.py#L22)
