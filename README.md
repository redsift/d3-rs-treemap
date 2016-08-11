# d3-rs-treemap

`d3-rs-treemap` A TreeMap visual component made with D3v4

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-treemap.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-treemap)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-treemap.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-treemap)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-treemap/master/LICENSE)


## Example

[View @redsift/d3-rs-treemap on Codepen](https://....)

## Usage

### Browser
  
  <script src="//static.redsift.io/reusable/d3-rs-treemap/latest/d3-rs-treemap.umd-es2015.min.js"></script>
  <script>
    var treemap = d3_rs_treemap.html();
  </script>

### ES6

  import { chart } from "@redsift/d3-rs-treemap";
  let eml = chart.html();
  ...
  
### Require

  var chart = require("@redsift/d3-rs-treemap");
  var eml = chart.html();
  ...

### Data layout

<!-- TODO: -->



### Parameters

|Name|Description|Transition|
|----|----------|----------|
|`classed`| SVG custom class|N|
|`width`, `height`, `size`, `scale`, `margin`| *Integer* SVG container sizes|Y
|`style`| *String* Custom CSS to inject into chart| N
|`fill`| *String, Array, Function* Colour palette for the data. Available options from [d3-rs-theme](https://github.com/Redsift/d3-rs-theme#presentation-color-palette) | Y|
|`theme`| *String* `dark` or `light`(default)| |
|`appendText`| *Boolean* Append a text element inside the rect| |
|`textValue` | *String, Function* for the value of the text element that will be displayed| |
|`appendImage`| *Boolean* Append an image element inside the rect | |
|`imageLink` | *String, Function* for the link of the image element that will be displayed| |
|`imageFallbackLink`| *String* Helper link of asset to display as a fall back solution when an image fails to load| |
|`filter`| *String* Filter to be applied on an image as described in [d3-rs-theme#filters](https://github.com/redsift/d3-rs-theme#filters) e.g. `'emboss'`, `'greyscale'`, `'shadow'`
