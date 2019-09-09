---

title:	"Salvaging abandoned projects"
date:	2018-06-25
---

  I think we've all seen abandoned projects that have multiple good pull requests. Sometimes there is an active fork but it can be extremely hard to find, even if you spend the time to go looking. I believe this is a problem that can be fixed, or at least improved upon significantly.

#### A case study: GitX

GitX is a nice git desktop client for macOS, but the original repository is abandoned. As of now if you google "gitx" the top hits are:

1. The original homepage to the now abandoned project (updated 2009)
2. Project page for an abandoned fork (updated 2014)
3. GitHub page of the original project
4. GitHub page of fork from point 2 above
5. …followed by a lot of junk hits pretty much
If you click on the number of forks in the top right corner on GitHub and then click the "network" tab you can, with a little digging, find that there *is* an active fork at <https://github.com/gitx/gitx> but that doesn't seem to show up on google or any of the pages you're likely to find there. If you google for "gitx active fork" the top hit is a stackoverflow page that gives you wrong information and that is closed because of some silly rule.

#### What GitHub could do

GitHub could have a way for active forks to be linked in a banner at the top of abandoned projects. The banner could look something like this:

![](/img/1*08wskmnFKchqdhRmAcJUPw.png)This should of course be subject to some basic rules. I think a good starting point might be:

* the original project owner should contacted and only if that person does not respond after some time can the banner go up
* if the original project owner wakes up he/she should be able to remove the banner at will
We need to find some good definition of "abandoned", but I think we can start very conservatively and then include more projects slowly.

There is a lot of opportunity for strengthening open source if abandoned projects can be salvaged. I think this is feasible and very worthwhile.

