var React = require('react');
var RoutePattern = require('route-pattern');
var nativePath = require('path');
var jsXpress = function(element, options){
  options = options || {};
  var childrenSets = [];
  var children = element;
  if(!Array.isArray(children)) children = [children];
  var paths = [];
  return function subroute(request, response, parentNext){
    var render = options.dynamic ?
      React.renderToString :
      React.renderToStaticMarkup;
    var i = 0;
    var currentItem;
    var next = function(error){
      if(error) return parentNext(error);
      currentItem = children ? children[i++] : undefined;
      if(!currentItem){
        children = childrenSets.pop();
        paths.pop();
        if(!parentNext.jsxpress){paths = []};
        return parentNext();
      }
      currentItem.props.request = request;
      currentItem.props.response = response;
      currentItem.props.next = next;
      var pathMatch = function(path, request){
        var throughPath = paths.filter(function(item){
          return item !== undefined;
        });
        var requestPath = request.path;
        throughPath.push(path);
        throughPath = throughPath.join('/');
        var match = RoutePattern
          .fromString(throughPath)
          .match(requestPath);
        return match;
      }
      if(currentItem.props.renderat !== undefined &&
        pathMatch(currentItem.props.renderat, request)){
        var preRenderer = currentItem.props.prerender;
        if(typeof preRenderer !== "function")
          preRenderer = function(element){return element};

        if(options.routeParams){
          var params
          = pathMatch(currentItem.props.renderat, request).namedParams;
          if(options.routeParams === 'overwrite'){
            request.params = params;
          }else{
            request.params = request.params || {};
            for(var k in params){
              request.params[k] = params[k]
            }
          }
        }
        var preRender = preRenderer(currentItem, request, response);
        if(preRender.then && options.renderThenable){
          preRender.then(function(result){
            response.end(render(result));
            paths = [];
          })
        }else{
          response.end(render(preRender));
          paths = [];
        }
      }else if(currentItem.props.renderat !== undefined &&
        !pathMatch(currentItem.props.renderat, request)){
          next();
      }else if(
        currentItem.props.renderthrough === undefined ||
        pathMatch(currentItem.props.renderthrough, request)){
          childrenSets.push(children);
          children = currentItem.props.children;
          if(!Array.isArray(children)) children = [children];
          paths.push(currentItem.props.renderthrough);
          next.jsxpress = true;
          subroute(request, response, next);
      }else{
        next();
      }
    }
    return next();
  }
}
class NoRender extends React.Component{
  constructor(){}
  render(){
    return <a/>
  }
}
jsXpress.middlewareComponent = function(middleware){
  return class M extends React.Component{
    constructor(props){
      middleware(props.request, props.response, props.next);
    }
    render(){
      return <NoRender/>
    }
  }
}
jsXpress.NoRender = NoRender;
module.exports = jsXpress;
