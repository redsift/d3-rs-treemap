# d3-rs-treemap

`d3-rs-treemap` A TreeMap visual component made with D3v4

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-treemap.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-treemap)

## Example

[View @redsift/d3-rs-treemap on Codepen](https://....)

## Usage

### Browser
  
  <script src="//static.redsift.io/reusable/d3-rs-treemap/latest/d3-rs-treemap.umd-es2015.min.js"></script>
  <script>
    // for cooccurence view
    var treemap = d3_rs_treemap.html();
    ...
    //or for calendar view
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
|`width`, `height`, `size`, `scale`| *Integer* SVG container sizes|Y
|`style`| *String* Custom CSS to inject into chart| N
|`fill`| Colour palette for the data. Available options from [d3-rs-theme](https://github.com/Redsift/d3-rs-theme#presentation-color-palette) | Y|
|`theme`| `dark` or `light`
