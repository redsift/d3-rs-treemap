/**
 * sift-pixel-tracker: summary view
 */
import { select } from 'd3-selection';
import { treemap, hierarchy } from 'd3-hierarchy';
import { scaleOrdinal} from 'd3-scale';
import { presentation10, display, emboss, greyscale } from '@redsift/d3-rs-theme';
import { html as svg } from '@redsift/d3-rs-svg';

const DEFAULT_SIZE = 960;
const DEFAULT_ASPECT = 1060 / 960;
const DEFAULT_MARGIN = 26;  // white space

export default function chart(id) {
  let classed = 'chart-treemap',
      theme = 'light',
      background = undefined,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = undefined,
      scale = 1.0,
      inset = null,
      fill = null,
      appendText = null,
      textValue = null,
      appendImage = null,
      imageLink = null,
      imageFallbackLink = null,
      imCache = {},
      rqs = [];

  // function checkImage(imageSrc) {
  //   var p = new Promise((ok,ko) => {
  //     var img = new Image();
  //     img.onload = () => {
  //       console.log(this.src)
  //       imCache[this.src] = true;
  //       ok();
  //     }
  //     img.onerror = () => {
  //       imCache[this.src] = false;
  //       ko();
  //     }
  //     img.src = imageSrc;
  //   })
  //   rqs.push(p);
  // }
  function _makeFillFn() {
    let colors = () => fill;
    if (fill == null) {
      let c = presentation10.lighter;
      // colors = (d, i) => (c[i % c.length]);
      var t = scaleOrdinal(c)
      colors = (d, i) => t(d);
    } else if (typeof fill === 'function') {
      colors = fill;
    } else if (Array.isArray(fill)) {
      colors = (d, i) => scaleOrdinal(fill)(d);
    }
    return colors;
  }

  function checkImage(imageSrc, good, bad) {
    var img = new Image();
    img.onload = good;
    img.onerror = bad;
    img.src = imageSrc;
  }

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    let _background = background;
    if (_background === undefined) {
      _background = display[theme].background;
    }
      
    selection.each(function(data) {
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

      // for the filters
      // let fid = 'filter-fill';
      // if (id) pid = pid + '-' + id;
      // let pattern = highlights(pid);
      // snode.call(pattern);

    // let fUrls = {}
    // let filters = colors.map(c => {
    //   let e = emboss()
    //   .color(c)
    //   .strength(1.0)
    //   fUrls[c] = e.url();
    //   return e;
    // })
    // filters.forEach(f => g.call(f))


    let _w = width - 2*margin
    let _h = sh - 2*margin
    let treeMap = treemap()
    .size([_w, _h])
    .round(true);

    var hr = hierarchy(data)
      .sum(d => {
        return d.v
      })

    treeMap(hr);


    let colors = _makeFillFn();
    // let w = this._div.node().offsetWidth;
    // let h = select('#home').node().offsetHeight;

    let ff = d => { 
      return d.data.l === 'no-trackers-found' || d.children ? 'white' : colors(d.data.v)
    }
    let nodes = g.selectAll('g.node').data(hr.leaves(), d => d.data.l)
    nodes.exit().remove();
    nodes = nodes.enter()
      .append('g')
        .attr('class', 'node')
        .attr('id', d => d.data.l)
        .attr('transform', d => `translate(${d.x0 },${d.y0 })`)
    
    nodes.append('rect')
        .attr('class', 'node-rect')
        .attr('width', d => d.x1 - d.x0 )
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', ff)

    if(appendText){
      let _text = () => textValue
      if(textValue === null){
        _text = d => d.data.v
      } 
      nodes.append('text')
        .attr('x', d => 15)
        .attr('y', d => 25)
        .style('font-size', d => {
          let _w = d.x1-d.x0
          return (_w < 5 ? '10' : _w < 20 ? '15' : '20' ) + 'px'
        })
        .text(_text)
    }

    if(appendImage){
      let _link = () => imageLink
      if(imageLink === null){
        _link = d => d.data.u
      }
      let _imgMargin = 25;
      let w = d => d.x1 - d.x0
      let h = d => d.y1 - d.y0
      let _imgD = d => {
        let f = d => d - 2*_imgMargin;
        if(f(w(d)) > 400 && f(h(d)) > 400){
          return 400;
        }else {
          return Math.min(w(d), h(d))/400 * Math.min(w(d), h(d))
        }
      }
      nodes
        .append('image')
          .attr('class', 'node-image')
          .attr('id', (d,i) => `image-${i}`)
          .attr('transform', d=> `translate(${w(d)/2 - _imgD(d)/2},${ h(d)/2 - _imgD(d)/2})`)
          // .attr('x', d => w(d)/2 - _imgD(d)/2)
          // .attr('y', d => h(d)/2 - _imgD(d)/2)
          .attr('width', _imgD)
          .attr('height', _imgD)
          // .attr('filter', d => fUrls[ff(d)])
          .attr('xlink:href', (d,i) => {
            if(imageFallbackLink){
              checkImage(_link(d), ()=>{}, ()=>{nodes.select(`#image-${i}`).attr('xlink:href', imageFallbackLink)})
            }
            return _link(d);
          })
    }
    
    nodes = nodes.merge(nodes)

    if(transition){
      nodes = nodes.transition(context)
    }
    nodes.selectAll('.node').attr('transform', d => `translate(${d.x0},${d.y0})`)
    nodes.selectAll('.node-rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', ff)


    })
  }

  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); };

  _impl.id = function() { return id; };

  // _impl.defaultStyle = () => `
  //                 ${fonts.variable.cssImport}
  //                 ${fonts.fixed.cssImport}  

  //                 ${_impl.self()} text { 
  //                                       font-family: ${fonts.fixed.family};
  //                                       font-size: ${fonts.fixed.sizeForWidth(width)};
  //                                       font-weight: ${fonts.fixed.weightMonochrome}; 
  //                                       fill: ${display[theme].text}; 
  //                                     }
  //                 ${_impl.self()} text.xlabels {
  //                                       text-anchor: ${xLabelAnchor};
  //                                       alignment-baseline: ${xLabelBaseline};
  //                                     }
  //                 ${_impl.self()} text.ylabels {
  //                                       text-anchor: end;
  //                                       alignment-baseline: middle;
  //                                     }
  //                 ${_impl.self()} .square {
  //                                       stroke: ${display[theme].background};
  //                                       stroke-width: ${widths.grid};
  //                 }
  //               `;

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
  //TODO:
  //1) add default css with stroke and stroke-width
  //2) add options for appending text and images
  //3) make type of filter an option.
  //4) height and sh variable
  return _impl;
}
