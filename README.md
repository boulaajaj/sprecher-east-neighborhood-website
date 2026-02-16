# Sprecher East Neighborhood Website Backup

Offline backup of **https://www.sprechereast.com/** — the Sprecher East Neighborhood Association (SENA) website.

**Backup date:** February 15, 2026  
**Original platform:** Squarespace

## About the Site

Sprecher East is a neighborhood on the far east side of Madison, Wisconsin. It encompasses the **Meadowlands**, **Door Creek**, and **Reston Heights** subdivisions. Boundaries: Interstate 94 (north), Door Creek Park (east), Sprecher Road (west), Cottage Grove Road (south).

The Sprecher East Neighborhood Association (SENA) was established in 2006 to represent the neighborhood's interests and provide a social outlet for neighbors. Membership is open to any resident and is always optional.

## How to View Offline

Simply open **index.html** in any web browser. All pages, styles, images, fonts, and scripts are saved locally.

## Pages Backed Up (6 total)

| File | Original URL | Description |
|------|-------------|-------------|
| `index.html` | `/` | Homepage — intro to neighborhood & association |
| `neighborhood.html` | `/neighborhood` | Boundaries, map, parks, schools, HOAs, East Area coalition |
| `events.html` | `/events` | Community events listing (past & future) |
| `events-corridorstudyhearing1.html` | `/events/corridorstudyhearing1` | I-39/90/94 Virtual Public Hearing (Jul 29, 2024) |
| `events-corridorstudyhearing2.html` | `/events/corridorstudyhearing2` | I-39/90/94 In-Person Public Hearing (Jul 30, 2024) |
| `contact-us.html` | `/contact-us` | Contact form (name, email, subject, message) |

## Assets Backed Up

| Category | Count | Location |
|----------|-------|----------|
| Images | 10 | `assets/images/` |
| CSS Stylesheets | 6 | `assets/css/` |
| JavaScript | 17 | `assets/js/` |
| Fonts (Poppins + Squarespace UI) | 20 | `assets/fonts/` |
| Favicon | 1 | `assets/favicon.ico` |

**Total: 60 files, ~6.7 MB**

## Directory Structure

```
sprecher-east-neighborhood-website/
├── index.html
├── neighborhood.html
├── events.html
├── events-corridorstudyhearing1.html
├── events-corridorstudyhearing2.html
├── contact-us.html
├── README.md
└── assets/
    ├── favicon.ico
    ├── css/
    │   ├── site.css
    │   ├── static.css
    │   ├── website.components.button.styles.css
    │   ├── website.components.form.styles.css
    │   └── website.components.imageFluid.styles.css
    ├── fonts/
    │   ├── poppins.css
    │   ├── pxiBp8kv8JHgFVr*.woff2 (15 Poppins variants)
    │   ├── squarespace-ui-font.eot
    │   ├── squarespace-ui-font.ttf
    │   ├── squarespace-ui-font.woff
    │   └── squarespace-ui-font.svg
    ├── images/
    │   ├── image-asset.jpeg (neighborhood hero)
    │   ├── photo.jpeg
    │   ├── image.jpeg
    │   ├── image_(8).jpeg
    │   ├── East_Madison_NAs.png (coalition map)
    │   ├── I39_Corridor_Study_Logo.png
    │   ├── Screenshot_2024-07-28_214758.png
    │   ├── 441519955_*.jpg (event photo)
    │   ├── 451962546_*.jpg (event photo)
    │   └── 452236518_*.jpg (event photo)
    └── js/
        ├── site-bundle.*.js
        └── (16 component scripts)
```

## Notes

- All internal navigation links have been rewritten to work between the local HTML files.
- All CSS, JS, image, and font URLs have been rewritten from Squarespace CDN to local `assets/` paths.
- The Google Fonts (Poppins) CSS and all 15 woff2 font files are saved locally.
- The contact form will not function offline (it required Squarespace backend).
- The Google Maps embed on the neighborhood page requires internet connectivity to load map tiles.
- Some Squarespace JavaScript functionality may be limited offline, but all content and styling is preserved.

## Key Links (from the original site)

- [Sprecher East Forum](https://www.sprechereast.org/)
- [Nextdoor](https://nextdoor.com/neighborhood/sprechereast--madison--wi/)
- [Facebook](http://www.facebook.com/SprecherEast)
- [City of Madison Neighborhood Profile](https://www.cityofmadison.com/neighborhoods/profile/146.html)
