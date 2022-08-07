---
title: "Obsidian + Hugo"
date: 2022-04-02T04:28:00Z
# weight: 1
# aliases: ["default"]
tags: [
	"obsidian",
	"workflow",
	"hugo",
]
author: "gabrioliv"
draft: true
description: "Configuration of a Workspace with Obsidian and Hugo"

# cover:
#   image: "images/cover_01.jpg" # image path/url
#   alt: "Cover Image" # alt text
#   caption: "" # display caption under cover
#   relative: false # when using page bundles set this to true
#   hidden: true # only hide on current single page

---

# Workflow Obsidian + Hugo

- #### Start Project
	- Choose a Framework
		- HUGO GO Framework
	- Choose the Publishing Format
		- Digital Gardening
	- Test framework
		- Used Debian version, by apt
		- Inside Docker
	- Format Website
		- Minimalist Blog/Listing Style
		- Chosen Theme PaperMod
	- Push on git
		- GabriOliv / Garden
	- Choose a Deploy Service
		- Netlify

---

- #### Workspace
	- Choose a Editor
		- Set Obsdian 
	- Git automation
		- Obsidian Git Plugin
		- Side branch for "Work In Progress" posts

- #### Ongoing 

---

### Workflow
```mermaid
graph LR
	A["Obsidian"]
	B["Git (Side Branch)"]
	C["Git (Master)"]
	D["Netlify"]

	A -->|Push| B
	B -->|Merge| C
	C -->|Deploy| D
```

---