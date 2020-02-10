# cwhtml

Small front-end engineering modular development scaffolding

## Install

```
npm i cwhtml -g
```
## Usage

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
{{block 'content'}}
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
