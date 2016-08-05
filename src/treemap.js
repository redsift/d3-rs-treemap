/**
 * sift-pixel-tracker: summary view
 */
import { select } from 'd3-selection';
import { treemap, hierarchy } from 'd3-hierarchy';
import { scaleOrdinal} from 'd3-scale';
import { presentation10, emboss, greyscale } from '@redsift/d3-rs-theme';
import { html as svg } from '@redsift/d3-rs-svg';

const DEFAULT_SIZE = 960;
const DEFAULT_ASPECT = 1060 / 960;
const DEFAULT_MARGIN = 26;  // white space
const DEFAULT_INSET = 24;   // scale space

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

  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);

    // let _background = background;
    // if (_background === undefined) {
    //   _background = display[theme].background;
    // }
      
    selection.each(function(data) {
      let node = select(this);
      let sh = height || Math.round(width * DEFAULT_ASPECT);
      
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale)
      // .background(_background);
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


    let treeMap = treemap()
    .size([100, 100])
    .round(true);

    var hr = hierarchy(data)
      .sum(d => {
        // checkImage(d.u) // piggyback sum's iteration
        return d.v
      })

    treeMap(hr);


    let colors = _makeFillFn();
    // let w = this._div.node().offsetWidth;
    // let h = select('#home').node().offsetHeight;

    let ff = d => { 
      return d.data.l === 'no-trackers-found' || d.children ? 'white' : colors(d.data.v)
    }
    let nodes = g
      .selectAll('.node')
      .data(hr.leaves(), d => d.data.l)
      .enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x0 / 100 * width},${d.y0 / 100 * sh})`)

    nodes
      .append('rect')
        .attr('class', 'node-rect')
        .attr('width', d => (d.x1 - d.x0) / 100 * width )
        .attr('height', d => (d.y1 - d.y0) / 100 * sh )
        .attr('fill', ff)


      nodes.append('text')
        .attr('x', d => 15)
        .attr('y', d => 25)
        .style('font-size', d => (d.x1 < 10 ? '10' : d.x1 < 20 ? '15' : '20' ) + 'px')
        .text(d => d.data.v)
      // let theEye = "assets/fa-eye@3x.png"
      // nodes
      //   .append('image')
      //     .attr('class', 'node-image')
      //     .attr('id', (d,i) => `image-${i}`)
      //     .attr('x', 25)
      //     .attr('y', 25)
      //     .attr('width', 50)
      //     .attr('height', 50)
      //     // .attr('filter', d => fUrls[ff(d)])
      //     .attr('xlink:href', d => imCache[d.data.u] ? d.data.u : '')

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

  _impl.width = function(value) {
    return arguments.length ? (width = value, _impl) : width;
  };

  _impl.height = function(value) {
    return arguments.length ? (height = value, _impl) : height;
  }; 

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.margin = function(value) {
    return arguments.length ? (margin = value, _impl) : margin;
  };

  _impl.theme = function(_) {
    return arguments.length ? (theme = _, _impl) : theme;
  };

  _impl.fill = function(value) {
    return arguments.length ? (fill = value, _impl) : fill;
  };
  //TODO:
  //1) add default css with stroke and stroke-width
  //2) add options for appending text and images
  //3) make type of filter an option.
  return _impl;
}
