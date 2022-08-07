---
title: "Markdown Showcase"
date: 2022-04-02T04:28:00Z
# weight: 1
# aliases: ["default"]
tags: [
	"markdown",
]
author: "gabrioliv"
draft: true
description: "Markdown, tests and showcase with Hugo"

# cover:
#   image: "images/cover_01.jpg" # image path/url
#   alt: "Cover Image" # alt text
#   caption: "" # display caption under cover
#   relative: false # when using page bundles set this to true
#   hidden: true # only hide on current single page

---

# Markdown Showcase
Source - [The Markdown Guide](https://www.markdownguide.org)

---

## Basic Syntax

These are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.

---

Change
The [[Markdown Showcase | WOW]] link
To

---

{{< highlight gherkin>}}
Feature: A bunch of code here 
{{< /highlight >}}


### Heading

# H1
## H2
### H3
#### H4
##### H5

### Bold

**bold text**

### Italic

*italicized text*

### Blockquote

> blockquote

### Ordered List

1. First item
2. Second item
3. Third item

### Unordered List

- First item
- Second item
- Third item

### Code

`code`

### Horizontal Rule

---

### Link

[Markdown Guide](https://www.markdownguide.org)

### Image

![alt text](https://www.markdownguide.org/assets/images/tux.png)

## Extended Syntax

These elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.

### Table

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

### Fenced Code Block

```
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

```
Feature: Guess the word

  # The first example has two steps
  Scenario: Maker starts a game
    When the Maker starts a game
    Then the Maker waits for a Breaker to join

  # The second example has three steps
  Scenario: Breaker joins a game
    Given the Maker has started a game with the word "silky"
    When the Breaker joins the Maker's game
    Then the Breaker must guess a word with 5 characters
```

### Footnote

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

### Heading ID

### My Great Heading {#custom-id}

### Definition List

term
: definition

### Strikethrough

~~The world is flat.~~

### Task List

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### Emoji

That is so funny! :joy:

(See also [Copying and Pasting Emoji](https://www.markdownguide.org/extended-syntax/#copying-and-pasting-emoji))

### Highlight

I need to highlight these ==very important words==.

### Subscript

H~2~O

### Superscript

X^2^

---