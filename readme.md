#jsXpress

Router for Server Side Rendering of JSX (React)

##About

jsXpress is middleware for express/connect that allows for server-side rendering of elements written in react.

##JSX Syntax
The examples below are written using JSX syntax, but OTHER SYNTAX should work perfectly fine.
If you would like to work with JSX syntax, there are many WAYS TO DO IT

##Installation

To install jsxpress in your local project, simply type

```sh
npm install --save jsxpress

```

To reference jsxpress in your project

```js
var jsXpress = require('jsxpress');
```

##Getting Started

Using jsXpress with an express or connect application is easy. Simply place it on a route where you would normally place and pass it a react element.

```js
var React = require('React');
var app = require('express')();
...
app.get('*', jsXpress(
    <html renderat='/'>
      <body>
        Hello World
      </body>
    </html>
)
```

Notice the __renderat__ attribute. It's set to '/', which means that the given component will render at the root of your application. If you were to leave this out, you application would not render.

If you wanted to have a choice between pages, you could put two element with the __renderat__ attribute set side by side. Since you react requires adjacent components to be nested, you'll have to wrap them in another element, but as long as it doesn't have a __renderat__ attribute, it won't render.

```js
app.get('*', jsXpress(
    <html>
      <html renderat='/'>
        <body>
          Hello World
        </body>
      </html>
      <html renderat='/signin'>
        <body>
          Sign In
        </body>
      </html>
    </html>
);
```

It won't really affect how your code works, but if you're uncomfortable using react components in such a way, you can use the jsXpress.NoRender component instead.

```js
app.get('*', jsXpress(
    <jsXpress.NoRender>
      <html renderat='/'>
        <body>
          Hello World
        </body>
      </html>
      <html renderat='/signin'>
        <body>
          Sign In
        </body>
      </html>
    </jsXpress.NoRender>
    )
);
```
##Using Custom Components

You can easily use mix and match components, even custom ones.

```js
class SignInPage extends React.Component{
  constructor(){
  }
  render(){
    return <html renderat='/signin'>
      <body>
        Sign In
      </body>
    </html>
  }
}

app.get('*', jsXpress(
    <jsXpress.NoRender>
      <html renderat='/'>
        <body>
          Hello World
        </body>
      </html>
      <SignInPage renderat='signin' />
    </jsXpress.NoRender>
    )
);
```

##Prerendering elements

The rendering of elements can be pre-empted by assiging a function with a __prerender__ attribute. The function has access to the element, the httprequest, and the http response. It should return a modified copy of the element to be rendered.

```js
var preRenderer = function(element, request, response){
  return React.cloneElement(element, {message:"Hello Universe!"});
}

class WelcomePage extends React.Component{
  constructor(props){
    this.state = {
      messate : props.message || "Hello World"
    }
  }
  render(){
    return <html renderat='/signin'>
      <body>
        {this.state.message}
      </body>
    </html>
  }
}

...

app.get('*', jsXpress(
    <jsXpress.NoRender>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
    </jsXpress.NoRender>
    )
);

```
##Accessing Parametes
Non-rendred pages can heiarchically define routes with the __renderthrough__ attribute.

```js
class AboutPage extends React.Component{
  constructor(props){
    this.state = {
      text : props.text || "Lear About Us"
    }
  }
  render(){
    return <html renderat='/signin'>
      <body>
        {this.state.message}
      </body>
    </html>
  }
}

app.get('*', jsXpress(
    <jsXpress.NoRender>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='team' text='Who we are... '></AboutPage>
        <AboutPage renderat='whatwedo' text='What we do...'></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>
    )
);

```
Here, a page showing 'What we do' can be found by visiting /about/whatwedo


##Route Parames

Route params are available as well. You can make them accessible in the request object during the prerender stage, by passing in the routeParams option.

```js
var nameRenderer = function(element, request){
  return React.cloneElement(
    element,
    {text : "Your name is " + request.routeParams.name}} + ".");
}

app.get('*', jsXpress(
    <jsXpress.NoRender>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='team' text='Who we are... '></AboutPage>
        <AboutPage renderat='whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {routeParams:true}
    )
);
```
Learn a bit about yourself by visiting /about/<your name>...

##Middleware

You can use other just like you would in any other connect or express application. Because the request, response, and next objects from the express/connect router are attached to each components props object when rendering, JSX component can act like middleware by manipulating these in
their constructors.

```js
class LoggerMiddleware Extends React.Component{
  constructor(props){
    var request = props.request;
    var response = props.response;
    var next = props.next();
    console.log('Someone requested %.', request);
    next();
  }
  render(){
    return <a/>
  }
}
//Note that even though the middleware element isn't rendered, React
//still requires components to have render methods that return components

app.get('*', jsXpress(
    <jsXpress.NoRender>
      <LoggerMiddleWare />
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='/team' text='Who we are... '></AboutPage>
        <AboutPage renderat='/whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {routeParams:true}
    )
);
```

jsXpress features a convenience method for turning existing middleware into
React Components

```js
var morgan = require('morgan');
var MorganLogger = jsXpress.middlewareComponent(morgan);

app.post('*', jsXpress(
    <jsXpress.NoRender>
      <MorganLogger/>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='/team' text='Who we are... '></AboutPage>
        <AboutPage renderat='/whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {
      routeParams : true,
      renderThenable : true
    }
    )
);
```
##Asynchronicity
If you do not wish to respond immediately, the prerender function can return a theanable to be fulfilled with a renderable component later. Set the renderThennable option to true to enable this.

```js
var nameRenderer = function(element, request){
  return new Promise(){
    setTimeout(function(){
      fulfill(React.cloneElement(
        element,
        {text : "Your name is " + request.routeParams.name}} + ".");)
    },
    1000)
  };
}

app.post('*', jsXpress(
    <jsXpress.NoRender>
      <MorganLogger/>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='/team' text='Who we are... '></AboutPage>
        <AboutPage renderat='/whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {
      routeParams : true,
      renderThenable : true
    }
    )
);
```
##Dynamic vs Static
If you're rendering html for dymanic sites that will use react on the front end, you can render them with react-binding for better startup time. You do this by setting the dynamic option to true.

```js
app.post('*', jsXpress(
    <jsXpress.NoRender>
      <MorganLogger/>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='/team' text='Who we are... '></AboutPage>
        <AboutPage renderat='/whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {
      routeParams : true,
      renderThenable : true,
      dynamic:true
    }
    )
);
```
##Todo
Decouple JSX from React
Clarify differences between components and elements

##Known Issues

I think there is a bug with using the renderthrough

Right now, there seem to be some issues with using other middleware after jsXprss

#Appendix

##Full Application

```js
var React = require('React');
var app = require('express')();
var jsXpress = require('jsxpress');
var morgan = require('morgan');
var MorganLogger = jsXpress.middlewareComponent(morgan);

var nameRenderer = function(element, request){
  return new Promise(){
    setTimeout(function(){
      fulfill(React.cloneElement(
        element,
        {text : "Your name is " + request.routeParams.name}} + ".");)
    },
    1000)
  };
}

var preRenderer = function(element, request, response){
  return React.cloneElement(element, {message:"Hello Universe!"});
}
class WelcomePage extends React.Component{
  constructor(props){
    this.state = {
      messate : props.message || "Hello World"
    }
  }
  render(){
    return <html renderat='/signin'>
      <body>
        {this.state.message}
      </body>
    </html>
  }
}
class SignInPage extends React.Component{
  constructor(){
  }
  render(){
    return <html renderat='/signin'>
      <body>
        Sign In
      </body>
    </html>
  }
}
class AboutPage extends React.Component{
  constructor(props){
    this.state = {
      text : props.text || "Lear About Us"
    }
  }
  render(){
    return <html renderat='/signin'>
      <body>
        {this.state.message}
      </body>
    </html>
  }
}

app.post('*', jsXpress(
    <jsXpress.NoRender>
      <MorganLogger/>
      <WelcomePage renderat= '/' prerender={preRenderer}/>
      <SignInPage renderat='signin' />
      <jsXpress.NoRender renderthrough="about">
        <AboutPage renderat='/' ></AboutPage>
        <AboutPage renderat='/team' text='Who we are... '></AboutPage>
        <AboutPage renderat='/whatwedo' text='What we do...'></AboutPage>
        <AboutPage renderat=':name' prerender={nameRenderer}></AboutPage>
      </jsXpress.NoRender>
    </jsXpress.NoRender>,
    {
      routeParams : true,
      renderThenable : true,
      dynamic:true
    }
    )
);
app.listen(8080);
```
