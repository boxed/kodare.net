Looking for a new language

Python is my first choice language and has been for a decade or so. But there are obviously issues. Not being able to run Python in the browser is really bad. The GUI story for desktop, iOS and Android isn’t very compelling either. So I’m looking for a new language to learn. 

Requirements

Must haves

    compile to JavaScript (or webassembly, I’m willing to wait)
    fairly efficient by default
    high productivity
    strong community
    create iOS, Android, Mac apps

In between

These are not “must haves” but I really want them.

    keyword/labeled arguments
    extend types (like Objective-C categories)
    sane threading model: no shared memory that if you forget to synchronize you get races

Nice to haves

    functional style features (but not dogmatic about it!)
    create Windows apps
    static typing in some form, preferably not too onerous for prototyping
    generate stand alone executables
    be able to create embeddable parts to use in e.g. Python for performance critical parts
    An iPhone app to code on the go
    Unikernel support

Languages I reviewed
Python

No web: tried to use Transcrypt and they’ve fixed loads of stuff I reported and it’s moving fast but it’s a lot of work porting Python code to it. The native GUI story is also weak. Performance is weak by default but can be handled with Cython, numba and other tools.
Elm

No native, no server side. Simplistic type system that can lead to DRY violations, stringly typed code or code generation. The Elm Architecture seems to me to the be way to go for web development though, so happy I spent some time with it.
OCaml

Very early for web stuff but seems promising due to full featured language. Many other minor issues, but looks promising. The shorthand syntax for labeled arguments seems pretty amazing.
Swift

No web, doesn’t appear to have started on it either. Pity, because I like Swift quite a bit from what I’ve seen and used. Only language I’ve considered that isn’t garbage collected, but from a usability point of view it’s pretty close.
Clojure

Web story is ok but compilation times are annoyingly long. I don’t like Clojure for various reasons. Keyword arguments sort of exists but are terrible. Native app development on iOS seem to require you to go via JavaScript :(
F#

Web development with fable looks pretty nice. Standalone executables seems possible with .NET Native in some cases, but you can’t compile F# to .NET Native yet sadly.
So where do I stand?

I’m being harsh here. Some things are sliding scales and some things work technically but suck. If it’s on the bad side or it sucks in practice I’m calling it as not qualifying.

Must haves

    compile to js/wa: Elm, OCaml, Clojure, F#
    fast: OCaml, Swift, Clojure, F#
    productive: All of them I hope :P
    community: OCaml looks the worst here because it’s smallest.
    native apps: Swift?, F#

Languages that pass: F#

In between

    keyword arguments: Python, OCaml, Swift, F#
    extend types: Swift
    sane threading: Clojure

Nice to haves

    FP: OCaml, Clojure, F# (Elm is disqualified because it’s dogmatic)
    windows: F#
    static typing: Elm, OCaml, Swift, F#
    stand alone executables: OCaml, Swift, F#? 
    embedding: OCaml, Swift
    iPhone app: Python (great), Clojure (terrible), F# (meh)
    Unikernel: OCaml

Languages that pass my nice to haves: None. OCaml comes the closest.

Conclusion

I’m starting to look into F#. A nice thing about that is that it’s strongly inspired by OCaml, so learning and writing F# probably means you learn parts of OCaml incidentally. Maybe you can write F# and if you need to embed (or do other things where OCaml is stronger), you can port the code to OCaml?

I must admit I feel a bit apprehensive looking at Microsoft stuff. I was stuck in the MS swamp back before .NET and before they became more open and that was pretty bad. It looks like they’ve changed, but I keep hearing the story of the scorpion in the back of my mind. Ultimately the tech should speak for itself and MS is big and can put a lot of engineering effort behind their platform.
