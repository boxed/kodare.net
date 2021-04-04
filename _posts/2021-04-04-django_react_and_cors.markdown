---
title: Django, React, and CORS
date: 2021-04-04 
---

> I started my Django app on port 8000 and my React app on port 3000. Now I have problems with CORS errors. Help!

If you've had this problem, you are not alone. The answer to your problem is easier than you might think.

The first thing to understand is that you haven't started your React app on port 3000. "But I just said I did!" you might object. Yes I know. It's confusing! What you started was the React dev server. This is a simple server that serves a basic HTML file that has links to some JavaScript files. The JavaScript files are the compiled React code. The React app is run, not on the server you started, but *in the browser*. It is best to think of your browser as if it runs on the other side of the planet. This gives you the right mindset. 

> But what about my CORS errors?

First we have to understand what the error means. CORS means Cross Origin Resource Sharing. We can ignore "Resource Sharing", but "Cross Origin" is important. You have two origins: port 8000 and port 3000. Those are just as different to the browser as YourSite and UntrustedCorp. There are strict rules what can be shared between YourSite and UntrustedSite.

The Origin is the place where you got the HTML from. If you get your HTML from the React dev server on port 3000, you'll get CORS errors accessing Django because it's a different origin.

> But how do I fix this?!

Serve the initial HTML from Django. That's it. 

You can load the compiled JavaScript React code from a different source without triggering CORS! Or you can compile your React code directly into your static files directory and serve everything via Django. I prefer this second method because that's the same in production as in development, and I like that.
