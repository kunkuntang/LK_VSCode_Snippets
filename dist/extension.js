module.exports=function(e){var t={};function s(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,s),n.l=!0,n.exports}return s.m=e,s.c=t,s.d=function(e,t,r){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(s.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(r,n,function(t){return e[t]}.bind(null,n));return r},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=1)}([function(e,t){e.exports=require("vscode")},function(e,t,s){"use strict";var r=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))((function(n,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function i(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(a,i)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.activate=void 0;const n=s(0),o=s(2),a=s(3);t.activate=function(e){let t=n.commands.registerCommand("extension.createModel",(function(){return r(this,void 0,void 0,(function*(){let e=n.window.activeTextEditor,t={};if(e){let s=e.selection;const r=e.document.getText(s);let i=yield a.showInputBox(r||"");const u=yield n.env.clipboard.readText();try{console.log("clipboardText",u),t=JSON.parse(u);const n=new o.ModelCreator(i||"",t).generateModel();e.edit(e=>{r?e.replace(s,n):e.insert(s.active,n)})}catch(s){if(console.log("error",s),n.window.showErrorMessage("非法的JSON字符串，请重新复制接口响应数据"),"是"===(yield n.window.showQuickPick(["是","否"],{placeHolder:"是否继续生成model？"}))){const s=new o.ModelCreator(i||"",t).generateModel();if(e){let t=e.selection;e.edit(e=>{r?e.replace(t,s):e.insert(t.active,s)})}}}}}))}));e.subscriptions.push(t)}},function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ModelCreator=void 0;const r=s(0);function n(e){return e.substring(0,1).toUpperCase()+e.substring(1)}const o={number:void 0,undefined:void 0,string:"",boolean:!1,bigint:void 0,symbol:void 0,object:{},function:void 0};t.ModelCreator=class{constructor(e,t){var s,o;this.data={},this.className="Test",this.enterSign="\n",this.modelStr=[],(null===(s=r.window.activeTextEditor)||void 0===s?void 0:s.document.eol)&&(this.enterSign=(null===(o=r.window.activeTextEditor)||void 0===o?void 0:o.document.eol)===r.EndOfLine.LF?"\n":"\r\n"),this.className=e?n(e):this.className,this.data=t||{}}generateModel(){return null!==this.data?(this.modelStr.push(this.generateConstructor(this.data)),this.modelStr.push(this.generateInterface(this.data)),this.modelStr.push(this.generateClass(this.className,this.data.data||{})),this.modelStr.reverse().join(this.enterSign)):(r.window.showErrorMessage("data 值为null，请重新复制接口响应数据"),"")}generateInterface(e){let t=[];return t.push(`interface I${this.className}ContainerModel<T> {`),Object.keys(e).forEach(s=>{"data"!==s&&("object"!=typeof e[s]?t.push(`  ${s}: ${typeof e[s]};`):null===e[s]&&t.push(`  ${s}: null;`))}),t.push("  data: T;"),t.push("}"+this.enterSign),t.join(this.enterSign)}generateConstructor(e){let t=[];const s=["msg","message","ok","success","status","code","data"];return Array.isArray(e.data)?t.push(`export class ${this.className}CM extends ContainerModel<${this.className}M[]>{`):t.push(`export class ${this.className}CM extends ContainerModel<${this.className}M>{`),t.push("    // 额外的响应结构"),Object.keys(e).filter(e=>-1===s.indexOf(e)).forEach(s=>{"object"!=typeof e[s]?t.push(`    ${s}:${typeof e[s]} = ${o[typeof e[s]]};`):null===e[s]?t.push(`    ${s} = null;`):Array.isArray(e[s])?t.push(`    ${s} = [];`):t.push(`    ${s} = {};`)}),t.push(""),Array.isArray(e.data)?t.push(`    constructor(props: I${this.className}ContainerModel<${this.className}M[]>){`):t.push(`    constructor(props: I${this.className}ContainerModel<${this.className}M>){`),t.push("        super(props);"),t.push(""),t.push("        // 基本响应结构"),Object.keys(e).forEach(r=>{"msg"!==r&&"message"!==r||t.push(`        this.message = props.${r} || '查询成功';`),"ok"!==r&&"success"!==r||t.push(`        this.success = props.${r} || true;`),"status"!==r&&"code"!==r||(t.push(`        this.code = props.${r} || '';`),t.push("")),-1===s.indexOf(r)&&("object"!=typeof e[r]?t.push(`        this.${r} = props.${r} || ${o[typeof e[r]]};`):null===e[r]?t.push(`        this.${r} = props.${r} || null;`):Array.isArray(e[r])?t.push(`        this.${r} = props.${r} || [];`):t.push(`        this.${r} = props.${r} || {};`))}),t.push(""),t.push("        if (props && props.data) {"),Array.isArray(e.data)?t.push(`            this.data = super.transformArray(props.data, ${this.className}M);`):t.push(`            this.data = super.transformObject(props.data, ${this.className}M);`),t.push("        } else {"),Array.isArray(e.data)?t.push("            this.data = []"):t.push(`            this.data = new ${this.className}M()`),t.push("        }"),t.push("   }"),t.push("}"),t.push(""),t.join(this.enterSign)}generateClass(e,t){let s=e=>{console.log("genclass",e),Object.keys(e).forEach(t=>{"number"==typeof e[t]&&(r.push(`    @DataMapper('${t}')`),r.push(`    ${t}!:number`),r.push("")),"string"==typeof e[t]&&(r.push(`    @DataMapper('${t}')`),r.push(`    ${t} = '';`),r.push("")),"boolean"==typeof e[t]&&(r.push(`    @DataMapper('${t}')`),r.push(`    ${t} = false;`),r.push("")),void 0===e[t]&&(r.push(`    @DataMapper('${t}')`),r.push(`    ${t} = void 0;`),r.push("")),"object"==typeof e[t]&&(null===e[t]?(r.push(`    @DataMapper('${t}')`),r.push(`    ${t} = null;`),r.push("")):Array.isArray(e[t])?(r.push(`    @DataMapper('${t}')`),void 0!==e[t][0]?(r.push(`    ${t}:${n(t)}M[] = [];`),r.push(""),r.unshift(this.generateClass(n(t),e[t][0]))):(r.push(`    ${t} = [];`),r.push(""))):(r.push(`    @DataMapper({ clazz: ${n(t)}M, name: '${t}' })`),r.push(`    ${t} = new ${n(t)}M;`),r.push(""),r.unshift(this.generateClass(n(t),e[t]))))})},r=[];return r.push(`export class ${e}M {`),Array.isArray(t)?s(t[0]):s(t),r.push("}"),r.push(""),r.join(this.enterSign)}}},function(e,t,s){"use strict";var r=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))((function(n,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function i(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(a,i)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.showInputBox=void 0;const n=s(0);t.showInputBox=function(e){return r(this,void 0,void 0,(function*(){return yield n.window.showInputBox({value:e||"",placeHolder:"输入mode名称，不包含Entity、EntityContainer的字符"})}))}}]);
//# sourceMappingURL=extension.js.map