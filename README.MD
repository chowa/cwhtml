# cwhtml

Front-end modular development scaffolding

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

cwhtml-project
|
|-- dist
|
|-- src
|   |-- component
|   |   |-- header /* include component will auto import style and js */
|   |   |   |-- index.tpl
|   |   |   |-- index.scss
|   |   |   |-- index.js
|   |
|   |-- data /* page render data */
|   |   |-- index.json
|   |
|   |-- image
|   |   |-- banner.png
|   |
|   |-- page /* entry */
|   |   |-- index.tpl
|   |   
|   |-- js
|   |   |-- index.js
|   |
|   |-- style
|   |   |-- index.less
|   |
|   |-- favicon.ico


## Synatx

### Template inheritance

```
##extends './layout.tpl'##
```

### Sub template

```
##include '../component/header'##
```

### Block inheritance

```
##block 'content'##
    <h1>sub conetnt</h1>
##/block##
```

### Loop

Key and item are keywords

```
##each from=data##
    <li data-key="##key##"> ##item.name##</li>
##/each##
```

### Condition

```
##if a==1##
    <h1>true</h1>
##else##
    <h2>false</h2>
##/if##
```

### Variable

```
##set a=1##

##a##
```

### Import style

```
##style '../style/index.less'##
````

***inline source***
```
##style '../style/index.less?inline'##
````

### Import javascript

```
##script '../js/index.js'##
````

***inline source***
```
##script '../js/index.js?inline'##
````
