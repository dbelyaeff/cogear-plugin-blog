# **Blog** plugin for Cogear.JS

[Features](#features) | [Installation](#installation) | [Usage](#usage) | [Post](#post) | [Layouts](#layouts) | [Pagination](#pagination)

Example: [https://cogearjs.org/blog](https://cogearjs.org/blog)

![Cogear.JS blog plugin in action](https://i.imgur.com/zhLts4el.jpg)

# Features
* Data stored in flat files (as pages)
* Pagination
* Tags

# Installation

Go to the site folder and install plugin with command:
```bash
yarn add cogear-plugin-blog
# or 
npm install cogear-plugin-blog
```

Plugin will loads up automatically.

# Usage

By default it creates virtual `blog` page (uri `/blog`) and passed all the posts in `./src/pages/blog` (can be customized) folder while rendering layout of `blog` page (also named the same).

Layout `blog` must be created in `./src/layouts` or using theme layouts. 

Variables passed to this layout:
* `posts` – list of posts<br>Typical **Cogear.JS** [pages objects](https://cogearjs.org/docs/pages)) with one exception – they have `teaser` field.
* `paginator` - pagination data ([Read More](#pagination))
* `tags` - all posts tags (for creating navs)

# Post
Let's take a look of typical post page.

Pay attention to `tags` which are passed to `blog` instance and to splitter `<!--more-->`, which brings `teaser` (before it) and full views (without it).

## Listing `./src/pages/blog/2018/08/welcome.md`
```Markdown
---
title: Welcome to Cogear.JS blog!
tags: 
 - news
---

We are happy to introduce **Cogear.JS** – modern static websites generator. 
It's written in [Node.JS](https://nodejs.org) and powered by the latest [Webpack](https://wepback.js.org).

Read [the docs](/docs) to understand how the system works.

[Cogear.JS](https://cogearjs.org/images/cogearjs.jpg)]

As you can see it's even suitable for blogging! Every blog post can have comments via modern services like [Disqus](https://disqus.com). Posts can also be tagged.

All blog pages are built automatically and rebuilt when proper content pages are changed, added or deleted.

<!--more-->

> Posts can even have teaser which is splitted from main content by `<!--more-->` symbol (new line only).

To create a blog on your site, please install [`cogear-plugin-blog`](https://github.com/codemotion/cogear-plugin-blog) npm package and follow the instructions in `README.md` file.

We really appreciate your attention, so it will be great if you write a comment.
```
# Layouts

All the layouts can be found at `./layouts` folder of this repository.

Copy them to `./src/layouts` or to a theme `layouts` folder, style it and use.

# Generated pages

Plugin generates the following pages:
* `blog` – index blog page
* `blog/[page-num]` – pagination for index page
* `blog/tag/[tag]` – tag index page
* `blog/tag/[tag]/[page-num]` – pagination for tag index page

# Pagination

Pagination object passed to layout has the following properties:
* `count` - total blog posts count
* `total` - total pages number
* `current` - current page
* `next` - next page link
* `prev` - prev page link

# Behavior

When post is changed, add or deleted all connected blog pages will be regenereated automatically and browser window will be refreshed.

# Config

If you wanna configure plugin, add `blog` section to `./config.yaml`:

```yaml
blog:
 regex:
  posts: ^blog\/(?!tag).+ # Pages are feeded to blog page, tags pages and paginator
```

You may change `blog.regex.posts` expression to serve `posts` from another folder.

### How to make post author name and avatar?
With ease. Use `pages` config param to pass all posts sitting on `blog` uri needed params:
```yaml
pages:
  ^blog:
    layout: blog
    js:
      - js/blog.js
    author: 
      name: Dmitry Beliaev
      github: https://github.com/codemotion
```

As you see custom webpack [entry point](https://cogearjs.org/docs/pages) `js/blog.js` was also added to customize scripts and styles.

# TODO
It's a bit nightmare to test async operations manually, because of error handling.
But I've do my best 🔥

* Automated testing…

# Docs
How to create your own plugin?

Read the docs: [https://cogearjs.org/docs/plugins](https://cogearjs.org/docs/plugins).
