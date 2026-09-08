# ON A HIGH LEVEL, WHAT ARE MY REQUIREMENTS?

1. I can access stratlab as one of two types of user:
  - Logged out
  - Logged in

## Logged-in User.
1. I can access stratlab from one of like.. 3? places.
  - StratLab link (navbar)
    - Wait, does this always boot up a new one? Or does it prompt you to OPEN one?
  - User home (Select Dashboard X)
  - User home (New)
  - User home (clone from URL/ID, whatever..)
  - StratLibrary (Clone Dashboard X)

2. I can interact with a dashboard in the following ways:
  - Messing around with a new one, nothing is saved yet.
  - Messing around with new one, and I DO save to backend
  
  - Load in a cloned dashboard, I can save changes
  - Load in my own dashboard, I can save changes

> Do we want to be able to "Just view" people's on the StratLibrary?

## Logged-out User.

1. I can access stratlab from one of two places:
  - Navigation link
    - New
    - Stored in session already

2. I can interact with a dashboard in the following ways:
  - Edit it
  - Leave the page, return, reload it from session

> Do we want to be able to "just view" people's on the StratLibrary?
    > I guess we COULD just clone it into the session? But that would overwrite their existing one..
    > Honestly, we could just say "Fuck logged-out users"?

# Options for routing/passing in the page arg:

1. Session storage
    - This is weird.
    - Link not shareable
    - Have to track session instead of just passing a "prop" like query string or dynamic route


2. Query string
    - Single "/stratlab" route

> Note: I don't *think* this saves effort? (SEE BELOW)
>   - Is it new?
>   - Am I logged in?
>   - Do I prompt to exit?

3. Single route + dynamic
  - Multiple routes, means multiple pages to juggle
        - *However*, this means that logic may be split up ahead of time
        - If it's `/stratlab/id` -> We're loading from backend
        - If it's `/stratlab` -> We're loading from Session for logged out, or it's new.


Either way, I think we could benefit from one more level of abstraction?
I.e. Move all of the logic from `/stratlab/page.js` into a single `DashboardEditor` component.

Cuz we either need to:
- Have it in multiple places
OR
- Add a whack load of logic to manage page load/exit.



# What API Endpoints Do I Have/Need.
HAVE:
    - Save entire dashboard
    - Load entire dashboard
    - List dashboards for a given user (Populate homepage)
        - List dashboards by filter  <<< MAKE THESE FILTERS ON A SINGLE "GET" ENDPOINT

NEED:
    - Update dashboard metadata (Share, title, etc.)
    - Clone to my acct