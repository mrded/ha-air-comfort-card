function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=window,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t;var l;const d=window,c=d.trustedTypes,h=c?c.emptyScript:"",u=d.reactiveElementPolyfillSupport,p={toAttribute(t,e){switch(e){case Boolean:t=t?h:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>e!==t&&(e==e||t==t),f={attribute:!0,type:String,converter:p,reflect:!1,hasChanged:v},m="finalized";let g=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))}),t}static createProperty(t,e=f){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const o=this[t];this[e]=s,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||f}static finalize(){if(this.hasOwnProperty(m))return!1;this[m]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach(t=>t(this))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{i?t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):s.forEach(i=>{const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)})})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=f){var s;const o=this.constructor._$Ep(t,i);if(void 0!==o&&!0===i.reflect){const r=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:p).toAttribute(e,i.type);this._$El=t,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,o=s._$Ev.get(t);if(void 0!==o&&this._$El!==o){const t=s.getPropertyOptions(o),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:p;this._$El=o,this[o]=r.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||v)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((t,e)=>this[e]=t),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach(t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)}),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach(t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach((t,e)=>this._$EO(e,this[e],t)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};var $;g[m]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:g}),(null!==(l=d.reactiveElementVersions)&&void 0!==l?l:d.reactiveElementVersions=[]).push("1.6.3");const _=window,y=_.trustedTypes,b=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",x=`lit$${(Math.random()+"").slice(9)}$`,w="?"+x,E=`<${w}>`,C=document,S=()=>C.createComment(""),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,M=Array.isArray,P="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,R=/>/g,O=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,T=/"/g,N=/^(?:script|style|textarea|title)$/i,z=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),j=new WeakMap,B=C.createTreeWalker(C,129,null,!1);function W(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==b?b.createHTML(e):e}const V=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":"",n=U;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===U?"!--"===l[1]?n=H:void 0!==l[1]?n=R:void 0!==l[2]?(N.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=O):void 0!==l[3]&&(n=O):n===O?">"===l[0]?(n=null!=o?o:U,d=-1):void 0===l[1]?d=-2:(d=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?O:'"'===l[3]?T:D):n===T||n===D?n=O:n===H||n===R?n=U:(n=O,o=void 0);const h=n===O&&t[e+1].startsWith("/>")?" ":"";r+=n===U?i+E:d>=0?(s.push(a),i.slice(0,d)+A+i.slice(d)+x+h):i+x+(-2===d?(s.push(void 0),e):h)}return[W(t,r+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,d]=V(t,e);if(this.el=Y.createElement(l,i),B.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=B.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(A)||e.startsWith(x)){const i=d[r++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+A).split(x),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:o,name:e[2],strings:t,ctor:"."===e[1]?J:"?"===e[1]?G:"@"===e[1]?Q:K})}else a.push({type:6,index:o})}for(const e of t)s.removeAttribute(e)}if(N.test(s.tagName)){const t=s.textContent.split(x),e=t.length-1;if(e>0){s.textContent=y?y.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],S()),B.nextNode(),a.push({type:2,index:++o});s.append(t[e],S())}}}else if(8===s.nodeType)if(s.data===w)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(x,t+1));)a.push({type:7,index:o}),t+=x.length-1}o++}}static createElement(t,e){const i=C.createElement("template");return i.innerHTML=t,i}}function q(t,e,i=t,s){var o,r,n,a;if(e===L)return e;let l=void 0!==s?null===(o=i._$Co)||void 0===o?void 0:o[s]:i._$Cl;const d=k(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==d&&(null===(r=null==l?void 0:l._$AO)||void 0===r||r.call(l,!1),void 0===d?l=void 0:(l=new d(t),l._$AT(t,i,s)),void 0!==s?(null!==(n=(a=i)._$Co)&&void 0!==n?n:a._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(e=q(t,l._$AS(t,e.values),l,s)),e}class F{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,o=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:C).importNode(i,!0);B.currentNode=o;let r=B.nextNode(),n=0,a=0,l=s[0];for(;void 0!==l;){if(n===l.index){let e;2===l.type?e=new Z(r,r.nextSibling,this,t):1===l.type?e=new l.ctor(r,l.name,l.strings,this,t):6===l.type&&(e=new tt(r,this,t)),this._$AV.push(e),l=s[++a]}n!==(null==l?void 0:l.index)&&(r=B.nextNode(),n++)}return B.currentNode=C,o}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Z{constructor(t,e,i,s){var o;this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(o=null==s?void 0:s.isConnected)||void 0===o||o}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=q(this,t,e),k(t)?t===I||null==t||""===t?(this._$AH!==I&&this._$AR(),this._$AH=I):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>M(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==I&&k(this._$AH)?this._$AA.nextSibling.data=t:this.$(C.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,o="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Y.createElement(W(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===o)this._$AH.v(i);else{const t=new F(o,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=j.get(t.strings);return void 0===e&&j.set(t.strings,e=new Y(t)),e}T(t){M(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Z(this.k(S()),this.k(S()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class K{constructor(t,e,i,s,o){this.type=1,this._$AH=I,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=q(this,t,e,0),r=!k(t)||t!==this._$AH&&t!==L,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=q(this,s[i+n],e,n),a===L&&(a=this._$AH[n]),r||(r=!k(a)||a!==this._$AH[n]),a===I?t=I:t!==I&&(t+=(null!=a?a:"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class J extends K{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===I?void 0:t}}const X=y?y.emptyScript:"";class G extends K{constructor(){super(...arguments),this.type=4}j(t){t&&t!==I?this.element.setAttribute(this.name,X):this.element.removeAttribute(this.name)}}class Q extends K{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=q(this,t,e,0))&&void 0!==i?i:I)===L)return;const s=this._$AH,o=t===I&&s!==I||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==I&&(s===I||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class tt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){q(this,t)}}const et=_.litHtmlPolyfillSupport;null==et||et(Y,Z),(null!==($=_.litHtmlVersions)&&void 0!==$?$:_.litHtmlVersions=[]).push("2.8.0");var it,st;class ot extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,o;const r=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=r._$litPart$;if(void 0===n){const t=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:null;r._$litPart$=n=new Z(e.insertBefore(S(),t),t,void 0,null!=i?i:{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return L}}ot.finalized=!0,ot._$litElement$=!0,null===(it=globalThis.litElementHydrateSupport)||void 0===it||it.call(globalThis,{LitElement:ot});const rt=globalThis.litElementPolyfillSupport;null==rt||rt({LitElement:ot}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.3");const nt=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e),at=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function lt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):at(t,e)}function dt(t){return lt({...t,state:!0})}var ct;null===(ct=window.HTMLSlotElement)||void 0===ct||ct.prototype.assignedElements;let ht=class extends ot{setConfig(t){this.config=t}_getEntities(){return this.hass?Object.keys(this.hass.states).sort():[]}static get styles(){return n`
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

      input {
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

      ha-entity-picker {
        margin-top: 8px;
      }
    `}render(){if(!this.config)return z``;const t=this.config;return z`
      <div class="card-config">
        <div class="option">
          <label for="name">Card Title</label>
          <input
            id="name"
            type="text"
            .value=${t.name||""}
            placeholder="Air Comfort"
            @input=${this._valueChanged}
          />
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${t.temperature_entity}
          .label=${"Temperature Entity"}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${["temperature"]}
          .required=${!0}
          @value-changed=${this._entityChanged("temperature_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${t.humidity_entity}
          .label=${"Humidity Entity"}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${["humidity"]}
          .required=${!0}
          @value-changed=${this._entityChanged("humidity_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-option">
          <input
            id="show_temperature"
            type="checkbox"
            .checked=${!1!==t.show_temperature}
            @change=${this._valueChanged}
          />
          <label for="show_temperature">Show Temperature</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_humidity"
            type="checkbox"
            .checked=${!1!==t.show_humidity}
            @change=${this._valueChanged}
          />
          <label for="show_humidity">Show Humidity</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_comfort_level"
            type="checkbox"
            .checked=${!1!==t.show_comfort_level}
            @change=${this._valueChanged}
          />
          <label for="show_comfort_level">Show Comfort Level</label>
        </div>
      </div>
    `}_entityChanged(t){return e=>{if(!this.config)return;const i=e.detail.value;this.config={...this.config,[t]:i||void 0};const s=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(s)}}_valueChanged(t){if(!this.config)return;const e=t.target,i=e.id,s=new Set(["temperature_entity","humidity_entity"]);let o;"checkbox"===e.type?o=e.checked:(HTMLSelectElement,o=e.value,""===o&&s.has(i)&&(o=void 0)),this.config={...this.config,[i]:o};const r=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(r)}};t([lt({attribute:!1})],ht.prototype,"hass",void 0),t([dt()],ht.prototype,"config",void 0),ht=t([nt("air-comfort-card-editor")],ht);let ut=class extends ot{static getStubConfig(){return{type:"custom:air-comfort-card",temperature_entity:"sensor.temperature",humidity_entity:"sensor.humidity",show_temperature:!0,show_humidity:!0,show_comfort_level:!0}}static getConfigElement(){return document.createElement("air-comfort-card-editor")}setConfig(t){if(!t.temperature_entity)throw new Error("You need to define a temperature_entity");if(!t.humidity_entity)throw new Error("You need to define a humidity_entity");this.config={show_temperature:!0,show_humidity:!0,show_comfort_level:!0,...t}}getCardSize(){return 4}static get styles(){return n`
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

      .dial-outer-ring {
        position: absolute;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .dial-comfort-zone {
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(100, 200, 100, 0.15);
        border: 2px solid rgba(100, 200, 100, 0.4);
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
    `}render(){if(!this.config||!this.hass)return z``;const t=this.hass.states[this.config.temperature_entity],e=this.hass.states[this.config.humidity_entity];if(!t||!e)return z`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Entity not found</div>
        </div>
      `;const i=parseFloat(t.state),s=parseFloat(e.state),o=t.attributes.unit_of_measurement||"°C",r=e.attributes.unit_of_measurement||"%";if(isNaN(i)||isNaN(s))return z`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Invalid sensor values</div>
        </div>
      `;const{angle:n,radialDistance:a,isInComfortZone:l,statusText:d}=function(t,e){const i=20,s=40;let o=0;t<i?o=i-t:t>24&&(o=t-24);let r=0;e<s?r=s-e:e>60&&(r=e-60);const n=0===o&&0===r;let a=0;if(n){const i=t-22,s=e-50;a=Math.atan2(s,i)*(180/Math.PI),a=(a+90+360)%360}else{let o=0,r=0;t<i?o=-(i-t):t>24&&(o=t-24),e<s?r=-(s-e):e>60&&(r=e-60),a=Math.atan2(r,o)*(180/Math.PI),a=(a+90+360)%360}const l=o/10,d=r/40,c=Math.sqrt(l*l+d*d);let h="PLEASANT";if(!n){const n=Math.abs(o),a=Math.abs(r);h=n>.5*a?t<i?a>5?e<s?"COLD & DRY":"COLD & HUMID":"COLD":a>5?e<s?"WARM & DRY":"WARM & HUMID":"WARM":e<s?n>1?t<i?"COLD & DRY":"WARM & DRY":"DRY":n>1?t<i?"COLD & HUMID":"WARM & HUMID":"HUMID"}return{angle:a,radialDistance:c,isInComfortZone:n,statusText:h,tempDeviation:o,humidityDeviation:r}}(i,s);let c;l?c=60*a*.3:(c=60+60*a/1.5,c=Math.min(c,120));const h=(n-90)*(Math.PI/180),u=c*Math.cos(h),p=c*Math.sin(h),v=!l;return z`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name||"Air Comfort"}</div>
          <div class="status-badge">${d}</div>
        </div>
        
        <div class="comfort-dial-container">
          <div class="comfort-dial">
            <div class="dial-outer-ring"></div>
            <div class="dial-comfort-zone"></div>
            <div 
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${u}px, ${p}px);"
            ></div>
            
            <div class="dial-label label-top">WARM</div>
            <div class="dial-label label-right">HUMID</div>
            <div class="dial-label label-bottom">COLD</div>
            <div class="dial-label label-left">DRY</div>
          </div>
        </div>

        <div class="readings">
          <div class="reading">
            <div class="reading-label">Temperature</div>
            <div class="reading-value">
              ${v?z`<span class="warning-icon">⚠</span>`:""}
              ${i.toFixed(1)}<span class="reading-unit">${o}</span>
            </div>
          </div>
          
          <div class="reading">
            <div class="reading-label">Humidity</div>
            <div class="reading-value">
              ${s.toFixed(0)}<span class="reading-unit">${r}</span>
            </div>
          </div>
        </div>
      </div>
    `}};t([lt({attribute:!1})],ut.prototype,"hass",void 0),t([dt()],ut.prototype,"config",void 0),ut=t([nt("air-comfort-card")],ut),window.customCards=window.customCards||[],window.customCards.push({type:"custom:air-comfort-card",name:"Air Comfort Card",description:"A card that visualizes indoor air comfort using temperature and humidity",preview:!1,documentationURL:"https://github.com/mrded/ha-air-comfort-card"});export{ut as AirComfortCard,ht as AirComfortCardEditor};
//# sourceMappingURL=air-comfort-card.js.map
