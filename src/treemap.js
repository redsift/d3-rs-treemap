/**
 * sift-pixel-tracker: summary view
 */
import { select } from 'd3-selection';
import { treemap, hierarchy } from 'd3-hierarchy';
import { scaleOrdinal} from 'd3-scale';
import {
  presentation10,
  display,
  fonts,
  widths,
  shadow, emboss, greyscale } from '@redsift/d3-rs-theme';
import { html as svg } from '@redsift/d3-rs-svg';
import base64 from 'base-64';

const DEFAULT_SIZE = 960;
const DEFAULT_ASPECT = 1060 / 960;
const DEFAULT_MARGIN = 26;  // white space

const filtersMap = {
  'shadow': shadow,
  'emboss': emboss,
  'greyscale': greyscale
}

let linkCache = {};

export default function chart(id) {
  let classed = 'chart-treemap',
      theme = 'light',
      background = undefined,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = undefined,
      scale = 1.0,
      fill = null,
      appendText = null,
      textValue = null,
      appendImage = null,
      imageLink = null,
      imageFallbackLink = null,
      filter = null;

   function _makeFillFn(onlyArray) {
    let colors_array = [];
    if(fill == null){
      colors_array = presentation10.lighter
    }else if (Array.isArray(fill)){
      colors_array = fill
    }else{
      colors_array.push(fill)
    }

    let t = scaleOrdinal(colors_array)
    let colors_fn = d => t(d);
    if(typeof fill === 'function'){
      colors_fn = fill;
    }
    return onlyArray ? colors_array : colors_fn
   }

  function checkImagePromise(imageSrc) {
    if(linkCache.hasOwnProperty(imageSrc)){
      return;
    }
    linkCache[imageSrc] = new Promise((ok,ko) => {
      let img = new Image();
      img.onload = ok;
      img.onerror = ko;
      img.src = imageSrc;
      return;
    })
  }

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }

    selection.each(function() {
      let node = select(this);
      let sh = height || Math.round(width * DEFAULT_ASPECT);

      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale).background(_background);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);

      let snode = node.select(root.self());
      let rootG = snode.select(root.child());

      let g = rootG.select(_impl.self());
      if (g.empty()) {
        g = rootG.append('g').attr('class', classed).attr('id', id);
      }

      let data = g.datum() || [];

      let _w = width - 2*margin
      let _h = sh - 2*margin
      let _link = () => imageLink
      if(imageLink === null){
        _link = d => d.data.u
      }

      let treeMap = treemap()
      .size([_w, _h])
      .round(true);

      let hr = hierarchy(data)
        .sum(d => d.v)
        .each(d => {
          if(d.parent && imageFallbackLink){
            checkImagePromise(_link(d));
          }
        })

      treeMap(hr);


      let colors = _makeFillFn();
      // let w = this._div.node().offsetWidth;
      // let h = select('#home').node().offsetHeight;

      let ff = d => d.children ? _background : colors(d.data.l)

      let nodes = g.selectAll('g.node').data(hr.leaves(), d => d.data.l)
      let nodesExit = nodes.exit()

      let nodesEntering = nodes.enter()
        .append('g')
          .attr('class', 'node')
          .attr('id', d => d.data.l)

      nodesEntering.append('rect')

      if(appendText){
        nodesEntering.append('text')
           .attr('class', 'node-text')
      }
      let _imageId = (d) => `image-${ base64.encode(d.data.u || d.data.l || d.data.v).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '') }`
      if(appendImage){
        nodesEntering.append('image')
          .attr('id', _imageId)
      }

      let nodesEU = nodesEntering.merge(nodes)


      if(transition){
        nodesEU = nodesEU.transition(context)
        nodesExit = nodesExit.transition(context)
      }

      nodesExit.select('rect')
        .attr('x', d => d.x1)
        .attr('y', d => d.y1)
        .attr('width', 0)
        .attr('height',0)

      nodesExit.selectAll('image').attr('xlink:href','')
      nodesExit.remove()

      nodesEU.attr('transform', d => `translate(${d.x0},${d.y0})`)

      nodesEU.select('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', ff)

      if(appendText){
        let _text = () => textValue
        if(textValue === null){
          _text = d => d.data.v
        }
        nodesEU.select('text')
            .attr('transform', d => `translate(${(d.x1-d.x0)/2 },${(d.y1-d.y0)/2})`)
            .style('font-size', d => {
              let _w = d.x1-d.x0
              return (_w < 5 ? '10' : _w < 20 ? '15' : '20' ) + 'px'
            })
            .text(_text)
      }

      if(appendImage){
        // doing some calculations to better position the image
        let _maxSize = 400;
        let w = d => d.x1 - d.x0
        let h = d => d.y1 - d.y0
        let _imgD = d => {
          let i=0
          let r = _maxSize
          const c = Math.min(w(d), h(d))
          while(r >= c){
            r = _maxSize/Math.pow(2,i)
            i++
          }
          return r;
        }

        let _filterLookupFn = ()=>{};
        if(filter && filtersMap.hasOwnProperty(filter)){
          let createFilter = (c) => {
            let fid = `filter-${filter}`;
            if (id) fid = `${fid}-${id}-${c ? c.slice(1) : ''}`;
            let e = filtersMap[filter](fid)
            if(filter !== 'shadow'){
              e.strength(1.0);
            }
            if(c){
              e.color(c);
            }
            return e;
          }
          if(filter === 'emboss'){
            // generate filters for all the colours
            let filterLookup = {}
            let filtersForColors = _makeFillFn(true).map(c => {
              let f = createFilter(c)
              filterLookup[c] = f.url();
              return f;
            })
            _filterLookupFn = d => filterLookup[colors(d.data.l)]
            filtersForColors.forEach(f => snode.call(f))
          }else{
            let f = createFilter();
            _filterLookupFn = () => f.url()
            snode.call(f)
          }
        }
        let findImageFn = function(d){
          if(!_link(d)){
            return;
          }
          if(!imageFallbackLink){
            return _link(d);
          }
          let that = this;
          linkCache[_link(d)]
            .then(()=>{ select(that).attr('xlink:href', _link(d)) })
            .catch(()=>{ select(that).attr('xlink:href', imageFallbackLink) })
        }

        nodesEU.select('image')
            .attr('x', d => Math.round(w(d)/2 - _imgD(d)/2))
            .attr('y', d => Math.round(h(d)/2 - _imgD(d)/2))
            .attr('width', _imgD)
            .attr('height', _imgD)
            .attr('filter', _filterLookupFn)
            .each(findImageFn)
      }

      let _style = style;
      if (_style == null) {
        _style = _impl.defaultStyle();
      }

      let defsEl = snode.select('defs');
      let styleEl = defsEl.selectAll('style').data(_style ? [ _style ] : []);
      styleEl.exit().remove();
      styleEl = styleEl.enter().append('style').attr('type', 'text/css').merge(styleEl);
      styleEl.text(_style);
    })//selection ends
  }

  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); };

  _impl.id = function() { return id; };

  _impl.defaultStyle = () => `
                  ${fonts.variable.cssImport}
                  ${fonts.fixed.cssImport}

                  ${_impl.self()} text {
                                        font-family: ${fonts.fixed.family};
                                        font-size: ${fonts.fixed.sizeForWidth(width)};
                                        font-weight: ${fonts.fixed.weightMonochrome};
                                        fill: ${display[theme].text};
                                      }
                  ${_impl.self()} .node-text {
                                        text-anchor: middle;
                                      }
                  ${_impl.self()} .node {
                                        stroke: ${display[theme].background};
                                        stroke-width: ${widths.grid};
                  }
                `;

  _impl.classed = function(_) {
    return arguments.length ? (classed = _, _impl) : classed;
  };

  _impl.background = function(_) {
    return arguments.length ? (background = _, _impl) : background;
  };

  _impl.width = function(_) {
    return arguments.length ? (width = _, _impl) : width;
  };

  _impl.height = function(_) {
    return arguments.length ? (height = _, _impl) : height;
  };

  _impl.scale = function(_) {
    return arguments.length ? (scale = _, _impl) : scale;
  };

  _impl.margin = function(_) {
    return arguments.length ? (margin = _, _impl) : margin;
  };

  _impl.theme = function(_) {
    return arguments.length ? (theme = _, _impl) : theme;
  };

  _impl.fill = function(_) {
    return arguments.length ? (fill = _, _impl) : fill;
  };

  _impl.appendText = function(_) {
    return arguments.length ? (appendText = _, _impl) : appendText;
  };

  _impl.textValue = function(_) {
    return arguments.length ? (textValue = _, _impl) : textValue;
  };

  _impl.appendImage = function(_) {
    return arguments.length ? (appendImage = _, _impl) : appendImage;
  };

  _impl.imageLink = function(_) {
    return arguments.length ? (imageLink = _, _impl) : imageLink;
  };

  _impl.imageFallbackLink = function(_) {
    return arguments.length ? (imageFallbackLink = _, _impl) : imageFallbackLink;
  };

  _impl.filter = function(_) {
    return arguments.length ? (filter = _, _impl) : filter;
  };

  return _impl;
}
