<p align="center">
    <img src="http://upload.ouliu.net/i/20200210221643sqi62.png" width="240">
</p>

# cwhtml

Small front-end engineering modular development scaffolding

[![Build Status](https://travis-ci.org/chowa/cwhtml.svg?branch=master)](https://travis-ci.org/chowa/cwhtml)
[![npm](https://img.shields.io/npm/v/cwhtml.svg)](https://www.npmjs.com/package/cwhtml)
[![npm](https://img.shields.io/npm/dm/cwhtml.svg)](https://www.npmjs.com/package/cwhtml)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

## Install

```
npm i cwhtml -g
```

## Usage

### create project

```
cwhtml create <dir>
```

### build

```
cwhtml build
```

### development

```
cwhtml dev
```

## Congifure

### File

`.cwhtmlrc`

### Options


## Directory rules

```
cwhtml-project
|
|-- dist
|
|-- src
|   |-- component
|   |   |-- header /* auto import style and js */
|   |   |   |-- index.tpl
|   |   |   |-- index.scss
|   |   |   |-- index.js
|   |
|   |-- data /* page render data */
|   |   |-- index.js
|   |
|   |-- image
|   |   |-- banner.png
|   |
|   |-- sprite
|   |   |-- index
|   |   |   |-- icon.png
|   |
|   |-- layout
|   |   |-- common.tpl
|   |
|   |-- page /* entry */
|   |   |-- index.tpl
|   |   
|   |-- script
|   |   |-- index.js
|   |
|   |-- style
|   |   |-- index.scss /* free choice css sass */
|   |
|   |-- favicon.ico
```

## Synatx

### Template inheritance

```
{{extend './layout.tpl'}}
```

### Sub template

***auto include `src/component/header/*`***

```
{{include header}}
```

### Block inheritance

```
{{block content}}
    <h1>sub conetnt</h1>
{{/block}}
```

### Loop

Key and item are keywords

```
{{each from=data}}
    <li data-key="{{key}}"> {{item.name}}</li>
{{/each}}
```

### Condition

> does not support boolean

```
{{if a=1}}
    <h1>true</h1>
#{{else}}
    <h2>false</h2>
{{/if}}

{{if c=case}}
    <h1>case</h1>
{{elseif c=which}}
    <h2>which</h2>
{{/if}}
```

### Variable

```
{{set a=1}}

{{a}}
```

### Import style

> support css and sass

```
{{style '../style/index.scss'}}
````

### Import javascript

```
{{script '../js/index.js'}}
````

## Options

```js
    root: './src',
    output: './dist'
    extname: '.tpl'
```
