# StratPad

StratPad is a game-agnostic dashboard builder for tabletop games. Rather than targeting a single game system, it provides 11 fully-featured core modules that players can mix and match to build the tracking tool their specific game requires — then share it with the community.

https://github.com/user-attachments/assets/bdba29ed-ba6f-4053-af02-77d03f9aecbb

---

## Screenshots
**A Dashboard in Edit Mode**
<img width="649" height="428" alt="Screenshot 2026-04-24 163315" src="https://github.com/user-attachments/assets/efadd525-cdec-4269-ad59-6b92f70d36d9" />
**A Dashboard in Play Mode**
<img width="465" height="274" alt="Dashboard" src="https://github.com/user-attachments/assets/1b761889-d2c8-44db-87ed-81758d7c4e7a" />
**Home Page**
<img width="956" height="474" alt="Screenshot 2026-04-24 163458" src="https://github.com/user-attachments/assets/0e0400ac-ecab-423b-83fc-9423a0e69050" />
**Community Page**
<img width="563" height="387" alt="Screenshot 2026-04-24 163409" src="https://github.com/user-attachments/assets/6b1a2517-5022-4fb2-bd79-4feda0d0fa6d" />

---

## Modules

StratPad ships with 11 core modules:

| Module | Description |
|--------|-------------|
| **Stopwatch** | Usable as either a Stopwatch (count up) or Timer (count down) |
| **Score Table** | Editable table for tracking score or other metrics. Toggleable `Totals` row, and highlight the winner via `Show Highlight` and `High or Low Score` |
| **Notes** | A simple rich text editor |
| **Nested Dictionary** | A folder-like structure for rich text & images. Useful for storing rules, references, and more. Import & export via JSON |
| **List** | Text list featuring drag-to-reorder, and toggleable `QTY` and `Checkbox` columns |
| **Counter** | Simple integer counter. Configurable `Min`, `Max`, `Increment`, `Default Value`, `Prefix`, and `Suffix` for the rendered count |
| **Resource Bar** | Configurable list of sliders. Can add or remove, and change `color`, `title`, `max`, `step`, and `default value` |
| **Image** | Single image container — able to fullscreen on click |
| **Dice** | 3D rendered dice of all shapes from `d4` to `d20`. Quickly add/remove dice and add a `+/- modifier` to the total |
| **Coin Toss** | Simple animated coin toss |
| **Spin Wheel** | Animated randomizer for a collection of strings |
---

## Architecture

StratPad is a [Next.js](https://nextjs.org/) application backed by a [PostgreSQL](https://www.postgresql.org/) database, and image storage via [CloudFlare R2](https://www.cloudflare.com/en-ca/developer-platform/products/r2/).

### Early Drawings

**Cloud Architecture**
<img width="1189" height="428" alt="image" src="https://github.com/user-attachments/assets/0431a0f2-a882-47d8-99fd-31db2c768103" />

**Save & Load Dashboard Flow**
<img width="1287" height="699" alt="image" src="https://github.com/user-attachments/assets/eb2a4aa2-9805-4880-8d62-a456884e0360" />

**Thinking Through Logged-in vs. Logged-out Users**
<img width="2039" height="675" alt="image" src="https://github.com/user-attachments/assets/36e04dd5-c3ca-4d70-b613-01295ec77450" />

**Dashboard Editor Wireframe**
<img width="1226" height="748" alt="image" src="https://github.com/user-attachments/assets/538c2f21-57e7-46c0-ac86-d371f77c58f3" />



### Key design decisions:

#### Responsive Grid Layouts
**Problem:** Grids are customized and stored with modules in X and Y positions. How would the same dashboard be rendered on a laptop vs. a tablet or mobile device?

**Solution:** Use a `Pinch-Pan-Zoom` wrapper around the dashboard. Essentially, we treat the dashboard as an image, and you can zoom in, out, and pan around like you would on a large image via mobile.

This worked well for laptop & tablet, still not ideal on mobile - likely a full rework is needed in that case for the drastic reduction in screen size.

One downside is that it introduced a great deal of complexity handling events. Is someone dragging the module around? Are they interacting inside the module? Are they attempting to pan the screen? Each library has its own API for interacting with events as well, making it tricky to nail down the event routing.

**Rejected Solutions:**
- Users manually defining multiple layouts
  - This seemed like a lot of busywork for the users. Not good UX.
- Algorithmically updating multiple layouts
  - If someone moves a module on the `small` layout, what did they *intend* to do to the `large` layout?
  - React-Grid-Layout *has* a built-in version of this that we tested and found didn't *feel* good enough. Custom development of an algorithm would be a rabbit hole. 


#### Respecting Private vs. Public Images When Serving

**Problem:** Dashboards can contain many images, and the dashboard itself can be toggled back and forth between `Private` and `Public` by users.

**Solution:** Stream images directly from the main application server.

This is the least complex & quickest-to-implement solution while still prioritizing data privacy. 

However, this solution incurs additional bandwidth load on the server. Additionally, as a long term solution, this would incur additional egress costs for our image storage, and the inability to cache images via CDN.

**Rejected Solutions:**
- Generating signed URLs when serving images
    - Additional complexity with no immediate *need*
- Maintaining `Public` images via public buckets and a CDN, and either streaming/signed URLs for `Private` images.
    - Again, complexity with no immediate need given our context



#### Storing the Dashboards

**"Problem":** The primary decision point was between storing dashboards as documents in a `NoSQL` like MongoDB vs. a relational database. Modules like the `Nested Dictionary` heavily imply that `NoSQL` would be the appropriate tool. However, several of our "stretch goals" fit better with a relational DB model (like sharing & cloning individual modules between dashboards/accounts).

**Solution:** Use `PostgreSQL` for structured database & module storage, as it provides extensive `JSONB` support.

Our stretch goal of module-level granularity in sharing was never realized, so in the end a `NoSQL` solution would likely have simplified development. Or even just storing the dashboard metadata in a `JSONB` column of the dashboard table.

The `JSONB` columns were still useful for the `Nested Dictionary` modules though to vastly reduce the complexity of storing and retrieving the deeply nested tree structured content.


---

## Getting Started

### Prerequisites

- Node.js `v24`
- PostgreSQL `v14+`
- A `.env` file based on `.env.example`

### Installation

```bash
# Clone the repo
git clone https://github.com/lazzarotan/StratPad.git
cd stratpad

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values in .env

# Set up the database
npx prisma migrate deploy

# Start the development server
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## License

MIT License

Copyright (c) [2026] [lazzarotan]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.