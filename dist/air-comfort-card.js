function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t;var l;const d=window,c=d.trustedTypes,h=c?c.emptyScript:"",u=d.reactiveElementPolyfillSupport,p={toAttribute(t,e){switch(e){case Boolean:t=t?h:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},f=(t,e)=>e!==t&&(e==e||t==t),v={attribute:!0,type:String,converter:p,reflect:!1,hasChanged:f},m="finalized";let g=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))}),t}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const r=this[t];this[e]=s,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||v}static finalize(){if(this.hasOwnProperty(m))return!1;this[m]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach(t=>t(this))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{i?t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):s.forEach(i=>{const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)})})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=v){var s;const r=this.constructor._$Ep(t,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:p).toAttribute(e,i.type);this._$El=t,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,r=s._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=s.getPropertyOptions(r),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:p;this._$El=r,this[r]=o.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||f)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((t,e)=>this[e]=t),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)}),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach(t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach((t,e)=>this._$EO(e,this[e],t)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};var _;g[m]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:g}),(null!==(l=d.reactiveElementVersions)&&void 0!==l?l:d.reactiveElementVersions=[]).push("1.6.3");const y=window,$=y.trustedTypes,b=$?$.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",E=`lit$${(Math.random()+"").slice(9)}$`,x="?"+E,w=`<${x}>`,S=document,C=()=>S.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,T="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,O=/>/g,M=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,R=/"/g,z=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),D=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),I=new WeakMap,B=S.createTreeWalker(S,129,null,!1);function W(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==b?b.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":"",n=P;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===P?"!--"===l[1]?n=U:void 0!==l[1]?n=O:void 0!==l[2]?(z.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=M):void 0!==l[3]&&(n=M):n===M?">"===l[0]?(n=null!=r?r:P,d=-1):void 0===l[1]?d=-2:(d=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?M:'"'===l[3]?R:N):n===R||n===N?n=M:n===U||n===O?n=P:(n=M,r=void 0);const h=n===M&&t[e+1].startsWith("/>")?" ":"";o+=n===P?i+w:d>=0?(s.push(a),i.slice(0,d)+A+i.slice(d)+E+h):i+E+(-2===d?(s.push(void 0),e):h)}return[W(t,o+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class F{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[l,d]=V(t,e);if(this.el=F.createElement(l,i),B.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=B.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(A)||e.startsWith(E)){const i=d[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+A).split(E),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:r,name:e[2],strings:t,ctor:"."===e[1]?X:"?"===e[1]?G:"@"===e[1]?Q:J})}else a.push({type:6,index:r})}for(const e of t)s.removeAttribute(e)}if(z.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=$?$.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],C()),B.nextNode(),a.push({type:2,index:++r});s.append(t[e],C())}}}else if(8===s.nodeType)if(s.data===x)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=S.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,s){var r,o,n,a;if(e===D)return e;let l=void 0!==s?null===(r=i._$Co)||void 0===r?void 0:r[s]:i._$Cl;const d=k(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==d&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===d?l=void 0:(l=new d(t),l._$AT(t,i,s)),void 0!==s?(null!==(n=(a=i)._$Co)&&void 0!==n?n:a._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(e=Y(t,l._$AS(t,e.values),l,s)),e}class q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,r=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:S).importNode(i,!0);B.currentNode=r;let o=B.nextNode(),n=0,a=0,l=s[0];for(;void 0!==l;){if(n===l.index){let e;2===l.type?e=new K(o,o.nextSibling,this,t):1===l.type?e=new l.ctor(o,l.name,l.strings,this,t):6===l.type&&(e=new tt(o,this,t)),this._$AV.push(e),l=s[++a]}n!==(null==l?void 0:l.index)&&(o=B.nextNode(),n++)}return B.currentNode=S,r}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class K{constructor(t,e,i,s){var r;this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(r=null==s?void 0:s.isConnected)||void 0===r||r}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),k(t)?t===j||null==t||""===t?(this._$AH!==j&&this._$AR(),this._$AH=j):t!==this._$AH&&t!==D&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>H(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==j&&k(this._$AH)?this._$AA.nextSibling.data=t:this.$(S.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,r="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=F.createElement(W(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===r)this._$AH.v(i);else{const t=new q(r,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new F(t)),e}T(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new K(this.k(C()),this.k(C()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class J{constructor(t,e,i,s,r){this.type=1,this._$AH=j,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=j}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=Y(this,t,e,0),o=!k(t)||t!==this._$AH&&t!==D,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=Y(this,s[i+n],e,n),a===D&&(a=this._$AH[n]),o||(o=!k(a)||a!==this._$AH[n]),a===j?t=j:t!==j&&(t+=(null!=a?a:"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class X extends J{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===j?void 0:t}}const Z=$?$.emptyScript:"";class G extends J{constructor(){super(...arguments),this.type=4}j(t){t&&t!==j?this.element.setAttribute(this.name,Z):this.element.removeAttribute(this.name)}}class Q extends J{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=Y(this,t,e,0))&&void 0!==i?i:j)===D)return;const s=this._$AH,r=t===j&&s!==j||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==j&&(s===j||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class tt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const et=y.litHtmlPolyfillSupport;null==et||et(F,K),(null!==(_=y.litHtmlVersions)&&void 0!==_?_:y.litHtmlVersions=[]).push("2.8.0");var it,st;class rt extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,r;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=o._$litPart$;if(void 0===n){const t=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;o._$litPart$=n=new K(e.insertBefore(C(),t),t,void 0,null!=i?i:{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return D}}rt.finalized=!0,rt._$litElement$=!0,null===(it=globalThis.litElementHydrateSupport)||void 0===it||it.call(globalThis,{LitElement:rt});const ot=globalThis.litElementPolyfillSupport;null==ot||ot({LitElement:rt}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.3");const nt=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e),at=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function lt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):at(t,e)}function dt(t){return lt({...t,state:!0})}var ct;null===(ct=window.HTMLSlotElement)||void 0===ct||ct.prototype.assignedElements;let ht=class extends rt{setConfig(t){this.config=t}_getEntities(){return this.hass?Object.keys(this.hass.states).sort():[]}_getSensorEntities(){return this._getEntities().filter(t=>t.startsWith("sensor."))}_getTemperatureEntities(){return this.hass?this._getSensorEntities().filter(t=>{const e=this.hass.states[t];if(!e)return!1;const i=e.attributes,s=i.device_class,r=i.unit_of_measurement;if("temperature"===s)return!0;if(r&&("°C"===r||"°F"===r||"K"===r))return!0;const o=t.toLowerCase();return!(!o.includes("temperature")&&!o.includes("temp"))}):[]}_getHumidityEntities(){return this.hass?this._getSensorEntities().filter(t=>{const e=this.hass.states[t];if(!e)return!1;const i=e.attributes,s=i.device_class,r=i.unit_of_measurement;if("humidity"===s)return!0;if("%"===r){const e=t.toLowerCase();if(e.includes("humidity")||e.includes("humid"))return!0}const o=t.toLowerCase();return!(!o.includes("humidity")&&!o.includes("humid"))}):[]}_getEntityName(t){if(!this.hass||!this.hass.states[t])return t;return this.hass.states[t].attributes.friendly_name||t}static get styles(){return n`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      label {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      input,
      select {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      input[type="checkbox"] {
        width: auto;
        margin-left: 0;
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `}render(){if(!this.config)return L``;const t=this._getTemperatureEntities(),e=this._getHumidityEntities(),i=this.config;return L`
      <div class="card-config">
        <div class="option">
          <label for="name">Card Title</label>
          <input
            id="name"
            type="text"
            .value=${i.name||""}
            placeholder="Air Comfort"
            @input=${this._valueChanged}
          />
        </div>

        <div class="option">
          <label for="temperature_entity">Temperature Entity</label>
          <select
            id="temperature_entity"
            .value=${i.temperature_entity||""}
            @change=${this._valueChanged}
          >
            <option value="">Select an entity...</option>
            ${t.map(t=>L`
              <option value=${t}>
                ${this._getEntityName(t)}
              </option>
            `)}
          </select>
        </div>

        <div class="option">
          <label for="humidity_entity">Humidity Entity</label>
          <select
            id="humidity_entity"
            .value=${i.humidity_entity||""}
            @change=${this._valueChanged}
          >
            <option value="">Select an entity...</option>
            ${e.map(t=>L`
              <option value=${t}>
                ${this._getEntityName(t)}
              </option>
            `)}
          </select>
        </div>

        <div class="checkbox-option">
          <input
            id="show_temperature"
            type="checkbox"
            .checked=${!1!==i.show_temperature}
            @change=${this._valueChanged}
          />
          <label for="show_temperature">Show Temperature</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_humidity"
            type="checkbox"
            .checked=${!1!==i.show_humidity}
            @change=${this._valueChanged}
          />
          <label for="show_humidity">Show Humidity</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_comfort_level"
            type="checkbox"
            .checked=${!1!==i.show_comfort_level}
            @change=${this._valueChanged}
          />
          <label for="show_comfort_level">Show Comfort Level</label>
        </div>
      </div>
    `}_valueChanged(t){if(!this.config)return;const e=t.target,i=e.id,s=new Set(["temperature_entity","humidity_entity"]);let r;"checkbox"===e.type?r=e.checked:(HTMLSelectElement,r=e.value,""===r&&s.has(i)&&(r=void 0)),this.config={...this.config,[i]:r};const o=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(o)}};t([lt({attribute:!1})],ht.prototype,"hass",void 0),t([dt()],ht.prototype,"config",void 0),ht=t([nt("air-comfort-card-editor")],ht);let ut=class extends rt{static getStubConfig(){return{type:"custom:air-comfort-card",temperature_entity:"sensor.temperature",humidity_entity:"sensor.humidity",show_temperature:!0,show_humidity:!0,show_comfort_level:!0}}static getConfigElement(){return document.createElement("air-comfort-card-editor")}setConfig(t){if(!t.temperature_entity)throw new Error("You need to define a temperature_entity");if(!t.humidity_entity)throw new Error("You need to define a humidity_entity");this.config={show_temperature:!0,show_humidity:!0,show_comfort_level:!0,...t}}getCardSize(){return 4}static get styles(){return n`
      :host {
        display: block;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        padding: 24px;
        background: var(--ha-card-background, var(--card-background-color, #1a1a1a));
        border-radius: 12px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      .card-title {
        font-size: 1.5em;
        font-weight: 400;
        color: var(--primary-text-color, #ffffff);
      }

      .status-badge {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--primary-text-color, #ffffff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .comfort-dial-container {
        position: relative;
        width: 300px;
        height: 300px;
        margin: 0 auto 32px;
      }

      .comfort-dial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dial-ring {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.3);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .dial-center {
        position: absolute;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }

      .comfort-indicator {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        top: 50%;
        left: 50%;
        z-index: 3;
        transition: transform 0.5s ease;
      }

      .dial-label {
        position: absolute;
        font-size: 0.9em;
        font-weight: 500;
        color: var(--primary-text-color, #ffffff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .label-top {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .label-right {
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
      }

      .label-bottom {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .label-left {
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      }

      .readings {
        display: flex;
        justify-content: space-around;
        gap: 48px;
      }

      .reading {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .reading-label {
        font-size: 0.75em;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .reading-value {
        font-size: 2.5em;
        font-weight: 300;
        color: var(--primary-text-color, #ffffff);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reading-unit {
        font-size: 0.6em;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      }

      .warning-icon {
        font-size: 0.5em;
        color: var(--warning-color, #ff9800);
      }
    `}render(){if(!this.config||!this.hass)return L``;const t=this.hass.states[this.config.temperature_entity],e=this.hass.states[this.config.humidity_entity];if(!t||!e)return L`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Entity not found</div>
        </div>
      `;const i=parseFloat(t.state),s=parseFloat(e.state),r=t.attributes.unit_of_measurement||"°C",o=e.attributes.unit_of_measurement||"%";if(isNaN(i)||isNaN(s))return L`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Invalid sensor values</div>
        </div>
      `;const{angle:n,comfort:a,description:l}=function(t,e){const i=(t-22)/10,s=(e-50)/50;let r=Math.atan2(s,i)*(180/Math.PI);r=(r+90+360)%360;let o="comfortable",n="Perfect";const a=Math.sqrt(i*i+s*s);return a>.8?(o="very-uncomfortable",n=t<18?e<40?"Too Cold & Dry":e>60?"Too Cold & Humid":"Too Cold":t>26?e<40?"Too Warm & Dry":e>60?"Too Warm & Humid":"Too Warm":e<40?"Too Dry":"Too Humid"):a>.5?(o="uncomfortable",n=t<20?e<45?"Slightly Cold & Dry":e>55?"Slightly Cold & Humid":"Slightly Cold":t>24?e<45?"Slightly Warm & Dry":e>55?"Slightly Warm & Humid":"Slightly Warm":e<45?"Slightly Dry":"Slightly Humid"):a>.3&&(o="acceptable",n="Good"),{angle:r,comfort:o,description:n}}(i,s),d=(n-90)*(Math.PI/180),c=80*Math.cos(d),h=80*Math.sin(d);let u="COMFORTABLE";i<20?u="COLD":i>24?u="WARM":s<40?u="DRY":s>60&&(u="HUMID");const p="COMFORTABLE"!==u;return L`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name||"Air Comfort"}</div>
          <div class="status-badge">${u}</div>
        </div>
        
        <div class="comfort-dial-container">
          <div class="comfort-dial">
            <div class="dial-ring"></div>
            <div class="dial-center"></div>
            <div 
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${c}px, ${h}px);"
            ></div>
            
            <div class="dial-label label-top">TOO WARM</div>
            <div class="dial-label label-right">HUMID</div>
            <div class="dial-label label-bottom">COLD</div>
            <div class="dial-label label-left">DRY</div>
          </div>
        </div>

        <div class="readings">
          <div class="reading">
            <div class="reading-label">Temperature</div>
            <div class="reading-value">
              ${p?L`<span class="warning-icon">⚠</span>`:""}
              ${i.toFixed(1)}<span class="reading-unit">${r}</span>
            </div>
          </div>
          
          <div class="reading">
            <div class="reading-label">Humidity</div>
            <div class="reading-value">
              ${s.toFixed(0)}<span class="reading-unit">${o}</span>
            </div>
          </div>
        </div>
      </div>
    `}};t([lt({attribute:!1})],ut.prototype,"hass",void 0),t([dt()],ut.prototype,"config",void 0),ut=t([nt("air-comfort-card")],ut),window.customCards=window.customCards||[],window.customCards.push({type:"custom:air-comfort-card",name:"Air Comfort Card",description:"A card that visualizes indoor air comfort using temperature and humidity",preview:!1,documentationURL:"https://github.com/mrded/ha-air-comfort-card"});export{ut as AirComfortCard,ht as AirComfortCardEditor};
//# sourceMappingURL=air-comfort-card.js.map
