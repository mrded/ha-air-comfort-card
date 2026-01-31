function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t;var a;const d=window,c=d.trustedTypes,h=c?c.emptyScript:"",u=d.reactiveElementPolyfillSupport,p={toAttribute(t,e){switch(e){case Boolean:t=t?h:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>e!==t&&(e==e||t==t),f={attribute:!0,type:String,converter:p,reflect:!1,hasChanged:v},m="finalized";let $=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))}),t}static createProperty(t,e=f){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const o=this[t];this[e]=s,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||f}static finalize(){if(this.hasOwnProperty(m))return!1;this[m]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach(t=>t(this))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{i?t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):s.forEach(i=>{const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)})})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=f){var s;const o=this.constructor._$Ep(t,i);if(void 0!==o&&!0===i.reflect){const r=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:p).toAttribute(e,i.type);this._$El=t,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,o=s._$Ev.get(t);if(void 0!==o&&this._$El!==o){const t=s.getPropertyOptions(o),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:p;this._$El=o,this[o]=r.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||v)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((t,e)=>this[e]=t),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)}),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach(t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach((t,e)=>this._$EO(e,this[e],t)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};var _;$[m]=!0,$.elementProperties=new Map,$.elementStyles=[],$.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:$}),(null!==(a=d.reactiveElementVersions)&&void 0!==a?a:d.reactiveElementVersions=[]).push("1.6.3");const g=window,y=g.trustedTypes,A=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,b="$lit$",E=`lit$${(Math.random()+"").slice(9)}$`,w="?"+E,S=`<${w}>`,x=document,C=()=>x.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,U="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,k=/-->/g,N=/>/g,O=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),M=/'/g,R=/"/g,z=/^(?:script|style|textarea|title)$/i,D=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),j=Symbol.for("lit-noChange"),L=Symbol.for("lit-nothing"),I=new WeakMap,B=x.createTreeWalker(x,129,null,!1);function W(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":"",n=T;for(let e=0;e<i;e++){const i=t[e];let l,a,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,a=n.exec(i),null!==a);)c=n.lastIndex,n===T?"!--"===a[1]?n=k:void 0!==a[1]?n=N:void 0!==a[2]?(z.test(a[2])&&(o=RegExp("</"+a[2],"g")),n=O):void 0!==a[3]&&(n=O):n===O?">"===a[0]?(n=null!=o?o:T,d=-1):void 0===a[1]?d=-2:(d=n.lastIndex-a[2].length,l=a[1],n=void 0===a[3]?O:'"'===a[3]?R:M):n===R||n===M?n=O:n===k||n===N?n=T:(n=O,o=void 0);const h=n===O&&t[e+1].startsWith("/>")?" ":"";r+=n===T?i+S:d>=0?(s.push(l),i.slice(0,d)+b+i.slice(d)+E+h):i+E+(-2===d?(s.push(void 0),e):h)}return[W(t,r+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,l=this.parts,[a,d]=V(t,e);if(this.el=q.createElement(a,i),B.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=B.nextNode())&&l.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(b)||e.startsWith(E)){const i=d[r++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+b).split(E),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:o,name:e[2],strings:t,ctor:"."===e[1]?Z:"?"===e[1]?Q:"@"===e[1]?X:Y})}else l.push({type:6,index:o})}for(const e of t)s.removeAttribute(e)}if(z.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=y?y.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],C()),B.nextNode(),l.push({type:2,index:++o});s.append(t[e],C())}}}else if(8===s.nodeType)if(s.data===w)l.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)l.push({type:7,index:o}),t+=E.length-1}o++}}static createElement(t,e){const i=x.createElement("template");return i.innerHTML=t,i}}function F(t,e,i=t,s){var o,r,n,l;if(e===j)return e;let a=void 0!==s?null===(o=i._$Co)||void 0===o?void 0:o[s]:i._$Cl;const d=P(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==d&&(null===(r=null==a?void 0:a._$AO)||void 0===r||r.call(a,!1),void 0===d?a=void 0:(a=new d(t),a._$AT(t,i,s)),void 0!==s?(null!==(n=(l=i)._$Co)&&void 0!==n?n:l._$Co=[])[s]=a:i._$Cl=a),void 0!==a&&(e=F(t,a._$AS(t,e.values),a,s)),e}class K{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,o=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:x).importNode(i,!0);B.currentNode=o;let r=B.nextNode(),n=0,l=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new J(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new tt(r,this,t)),this._$AV.push(e),a=s[++l]}n!==(null==a?void 0:a.index)&&(r=B.nextNode(),n++)}return B.currentNode=x,o}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class J{constructor(t,e,i,s){var o;this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(o=null==s?void 0:s.isConnected)||void 0===o||o}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=F(this,t,e),P(t)?t===L||null==t||""===t?(this._$AH!==L&&this._$AR(),this._$AH=L):t!==this._$AH&&t!==j&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>H(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==L&&P(this._$AH)?this._$AA.nextSibling.data=t:this.$(x.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,o="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=q.createElement(W(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===o)this._$AH.v(i);else{const t=new K(o,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new q(t)),e}T(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new J(this.k(C()),this.k(C()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class Y{constructor(t,e,i,s,o){this.type=1,this._$AH=L,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=L}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=F(this,t,e,0),r=!P(t)||t!==this._$AH&&t!==j,r&&(this._$AH=t);else{const s=t;let n,l;for(t=o[0],n=0;n<o.length-1;n++)l=F(this,s[i+n],e,n),l===j&&(l=this._$AH[n]),r||(r=!P(l)||l!==this._$AH[n]),l===L?t=L:t!==L&&(t+=(null!=l?l:"")+o[n+1]),this._$AH[n]=l}r&&!s&&this.j(t)}j(t){t===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Z extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===L?void 0:t}}const G=y?y.emptyScript:"";class Q extends Y{constructor(){super(...arguments),this.type=4}j(t){t&&t!==L?this.element.setAttribute(this.name,G):this.element.removeAttribute(this.name)}}class X extends Y{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=F(this,t,e,0))&&void 0!==i?i:L)===j)return;const s=this._$AH,o=t===L&&s!==L||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==L&&(s===L||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class tt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){F(this,t)}}const et=g.litHtmlPolyfillSupport;null==et||et(q,J),(null!==(_=g.litHtmlVersions)&&void 0!==_?_:g.litHtmlVersions=[]).push("2.8.0");var it,st;class ot extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,o;const r=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=r._$litPart$;if(void 0===n){const t=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:null;r._$litPart$=n=new J(e.insertBefore(C(),t),t,void 0,null!=i?i:{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return j}}ot.finalized=!0,ot._$litElement$=!0,null===(it=globalThis.litElementHydrateSupport)||void 0===it||it.call(globalThis,{LitElement:ot});const rt=globalThis.litElementPolyfillSupport;null==rt||rt({LitElement:ot}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.3");const nt=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function lt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):nt(t,e)}var at;null===(at=window.HTMLSlotElement)||void 0===at||at.prototype.assignedElements;let dt=class extends ot{static getStubConfig(){return{type:"custom:air-comfort-card",temperature_entity:"sensor.temperature",humidity_entity:"sensor.humidity",show_temperature:!0,show_humidity:!0,show_comfort_level:!0}}setConfig(t){if(!t.temperature_entity)throw new Error("You need to define a temperature_entity");if(!t.humidity_entity)throw new Error("You need to define a humidity_entity");this.config={show_temperature:!0,show_humidity:!0,show_comfort_level:!0,...t}}getCardSize(){return 4}static get styles(){return n`
      :host {
        display: block;
        padding: 16px;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .card-title {
        font-size: 1.5em;
        font-weight: 500;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      .comfort-dial-container {
        position: relative;
        width: 240px;
        height: 240px;
        margin: 20px 0;
      }

      .comfort-dial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        background: conic-gradient(
          from 0deg,
          var(--success-color, #4caf50) 0deg,
          var(--success-color, #4caf50) 72deg,
          var(--warning-color, #ff9800) 72deg,
          var(--warning-color, #ff9800) 144deg,
          var(--error-color, #f44336) 144deg,
          var(--error-color, #f44336) 216deg,
          var(--info-color, #2196f3) 216deg,
          var(--info-color, #2196f3) 288deg,
          var(--success-color, #4caf50) 288deg,
          var(--success-color, #4caf50) 360deg
        );
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .comfort-dial::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dial-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 2;
      }

      .comfort-indicator {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        border: 3px solid var(--card-background-color, #fff);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        top: 50%;
        left: 50%;
        z-index: 3;
        transition: transform 0.5s ease;
      }

      .comfort-level {
        font-size: 1.2em;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .comfort-description {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }

      .readings {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 16px;
      }

      .reading {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .reading-label {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }

      .reading-value {
        font-size: 1.5em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .reading-unit {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-left: 2px;
      }

      .comfortable {
        color: var(--success-color, #4caf50);
      }

      .acceptable {
        color: var(--info-color, #2196f3);
      }

      .uncomfortable {
        color: var(--warning-color, #ff9800);
      }

      .very-uncomfortable {
        color: var(--error-color, #f44336);
      }
    `}render(){if(!this.config||!this.hass)return D``;const t=this.hass.states[this.config.temperature_entity],e=this.hass.states[this.config.humidity_entity];if(!t||!e)return D`
        <ha-card>
          <div class="card-content">
            <div class="card-title">Air Comfort</div>
            <div>Entity not found</div>
          </div>
        </ha-card>
      `;const i=parseFloat(t.state),s=parseFloat(e.state),o=t.attributes.unit_of_measurement||"°C",r=e.attributes.unit_of_measurement||"%";if(isNaN(i)||isNaN(s))return D`
        <ha-card>
          <div class="card-content">
            <div class="card-title">Air Comfort</div>
            <div>Invalid sensor values</div>
          </div>
        </ha-card>
      `;const{angle:n,comfort:l,description:a}=function(t,e){const i=(t-22)/10,s=(e-50)/50;let o=Math.atan2(s,i)*(180/Math.PI);o=(o+90+360)%360;let r="comfortable",n="Perfect";const l=Math.sqrt(i*i+s*s);return l>.8?(r="very-uncomfortable",n=t<18?e<40?"Too Cold & Dry":e>60?"Too Cold & Humid":"Too Cold":t>26?e<40?"Too Warm & Dry":e>60?"Too Warm & Humid":"Too Warm":e<40?"Too Dry":"Too Humid"):l>.5?(r="uncomfortable",n=t<20?e<45?"Slightly Cold & Dry":e>55?"Slightly Cold & Humid":"Slightly Cold":t>24?e<45?"Slightly Warm & Dry":e>55?"Slightly Warm & Humid":"Slightly Warm":e<45?"Slightly Dry":"Slightly Humid"):l>.3&&(r="acceptable",n="Good"),{angle:o,comfort:r,description:n}}(i,s),d=(n-90)*(Math.PI/180),c=96*Math.cos(d),h=96*Math.sin(d);return D`
      <ha-card>
        <div class="card-content">
          ${this.config.name?D`<div class="card-title">${this.config.name}</div>`:""}
          
          <div class="comfort-dial-container">
            <div class="comfort-dial"></div>
            <div class="dial-center">
              ${!1!==this.config.show_comfort_level?D`
                <div class="comfort-level ${l}">${a}</div>
              `:""}
            </div>
            <div 
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${c}px, ${h}px);"
            ></div>
          </div>

          <div class="readings">
            ${!1!==this.config.show_temperature?D`
              <div class="reading">
                <div class="reading-label">Temperature</div>
                <div class="reading-value">
                  ${i.toFixed(1)}<span class="reading-unit">${o}</span>
                </div>
              </div>
            `:""}
            
            ${!1!==this.config.show_humidity?D`
              <div class="reading">
                <div class="reading-label">Humidity</div>
                <div class="reading-value">
                  ${s.toFixed(0)}<span class="reading-unit">${r}</span>
                </div>
              </div>
            `:""}
          </div>
        </div>
      </ha-card>
    `}};t([lt({attribute:!1})],dt.prototype,"hass",void 0),t([function(t){return lt({...t,state:!0})}()],dt.prototype,"config",void 0),dt=t([(t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e))("air-comfort-card")],dt),window.customCards=window.customCards||[],window.customCards.push({type:"air-comfort-card",name:"Air Comfort Card",description:"A card that visualises indoor air comfort using temperature and humidity",preview:!1,documentationURL:"https://github.com/mrded/ha-air-comfort-card"});export{dt as AirComfortCard};
//# sourceMappingURL=air-comfort-card.js.map
