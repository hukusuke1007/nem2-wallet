(function(e){function t(t){for(var o,a,u=t[0],s=t[1],c=t[2],f=0,d=[];f<u.length;f++)a=u[f],r[a]&&d.push(r[a][0]),r[a]=0;for(o in s)Object.prototype.hasOwnProperty.call(s,o)&&(e[o]=s[o]);l&&l(t);while(d.length)d.shift()();return i.push.apply(i,c||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],o=!0,u=1;u<n.length;u++){var s=n[u];0!==r[s]&&(o=!1)}o&&(i.splice(t--,1),e=a(a.s=n[0]))}return e}var o={},r={app:0},i=[];function a(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=o,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)a.d(n,o,function(t){return e[t]}.bind(null,o));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="/nem2-wallet/";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],s=u.push.bind(u);u.push=t,u=u.slice();for(var c=0;c<u.length;c++)t(u[c]);var l=s;i.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("cd49")},1:function(e,t){},2:function(e,t){},3:function(e,t){},4:function(e,t){},5:function(e,t){},"7faf":function(e,t,n){"use strict";var o=n("8fba"),r=n.n(o);r.a},"8fba":function(e,t,n){},cd49:function(e,t,n){"use strict";n.r(t);var o=n("2b0e"),r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-app",[n("header",[n("span",[e._v(e._s(e.title)+" ")])]),n("router-view")],1)},i=[],a=n("9ab4"),u=n("60a3"),s=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.title="NEM2 wallet",t}return a["c"](t,e),t}(u["c"]),c=s,l=c,f=(n("7faf"),n("2877")),d=Object(f["a"])(l,r,i,!1,null,null,null),p=d.exports,h=n("8c4f"),v=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"home"})},y=[],b=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return a["c"](t,e),t.prototype.mounted=function(){this.loadBalance(),this.fetchLoadWalletUseCase.execute()},t.prototype.loadBalance=function(){return a["a"](this,void 0,void 0,function(){return a["d"](this,function(e){switch(e.label){case 0:return[4,this.fetchLoadBalanceUseCase.execute()];case 1:return e.sent(),[2]}})})},t.prototype.sendCoin=function(){return a["a"](this,void 0,void 0,function(){var e,t,n;return a["d"](this,function(o){switch(o.label){case 0:return e="",t=0,n="",[4,this.fetchSendCoinUseCase.execute(e,t,n)];case 1:return o.sent(),[2]}})})},a["b"]([Object(u["b"])("FetchLoadBalanceUseCase")],t.prototype,"fetchLoadBalanceUseCase",void 0),a["b"]([Object(u["b"])("FetchLoadWalletUseCase")],t.prototype,"fetchLoadWalletUseCase",void 0),a["b"]([Object(u["b"])("FetchSendCoinUseCase")],t.prototype,"fetchSendCoinUseCase",void 0),t=a["b"]([u["a"]],t),t}(u["c"]),w=b,g=w,m=Object(f["a"])(g,v,y,!1,null,null,null),C=m.exports;o["default"].use(h["a"]);var k=new h["a"]({mode:"history",base:"/nem2-wallet/",routes:[{path:"/",name:"home_page",component:C}]}),S=n("2f62");o["default"].use(S["a"]);var F=new S["a"].Store({state:{},mutations:{},actions:{}}),K=n("9483");Object(K["a"])("/nem2-wallet/service-worker.js",{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},registered:function(){console.log("Service worker has been registered.")},cached:function(){console.log("Content has been cached for offline use.")},updatefound:function(){console.log("New content is downloading.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(e){console.error("Error during service worker registration:",e)}});var O=n("ce5b"),T=n.n(O),A=n("c0a4"),j=n.n(A),x=(n("cc20"),n("7869")),_=n.n(x),P=n("6112"),U=n.n(P),B=function(){function e(e){this.repository=e}return e.prototype.execute=function(){return a["a"](this,void 0,Promise,function(){return a["d"](this,function(e){return[2,this.repository.loadBalance()]})})},e}(),N=function(){function e(e){this.repository=e}return e.prototype.execute=function(){return a["a"](this,void 0,Promise,function(){var e,t;return a["d"](this,function(n){switch(n.label){case 0:return[4,this.repository.loadWallet()];case 1:return e=n.sent(),void 0===e?[3,2]:(t=e,[3,4]);case 2:return[4,this.repository.createWallet()];case 3:t=n.sent(),n.label=4;case 4:return[2,t]}})})},e}(),W=function(){function e(e){this.repository=e}return e.prototype.execute=function(e,t,n){return a["a"](this,void 0,Promise,function(){return a["d"](this,function(o){return[2,this.repository.sendCoin(e,t,n)]})})},e}(),E=function(){function e(){this.balance=0,this.address=void 0,this.publicKey=void 0,this.privateKey=void 0,this.networkType=0}return e.prototype.toJSON=function(){return{address:this.address,publicKey:this.publicKey,privateKey:this.privateKey,networkType:this.networkType}},e}(),L=n("a002"),J=n.n(L),M=function(){function e(e){this.wrapper=e,this.localStorageKey="nem2-wallet"}return e.prototype.createWallet=function(){return a["a"](this,void 0,Promise,function(){var e;return a["d"](this,function(t){switch(t.label){case 0:return e=this.wrapper.createAccount(),[4,J.a.setItem(this.localStorageKey,e.toJSON())];case 1:return t.sent(),[2,e]}})})},e.prototype.loadWallet=function(){return a["a"](this,void 0,Promise,function(){var e,t;return a["d"](this,function(n){switch(n.label){case 0:return[4,J.a.getItem(this.localStorageKey)];case 1:return e=n.sent(),console.log("loadWallet",e),null!==e?(t=new E,t.address="address"in e?e.address:void 0,t.privateKey="privateKey"in e?e.privateKey:void 0,t.publicKey="publicKey"in e?e.publicKey:void 0,t.networkType="networkType"in e?e.networkType:void 0,[2,t]):[2,void 0]}})})},e.prototype.loadBalance=function(){return a["a"](this,void 0,Promise,function(){return a["d"](this,function(e){return console.log("loadBalance"),[2,0]})})},e}(),I=function(){function e(){}return e.prototype.sendCoin=function(e,t,n){return a["a"](this,void 0,Promise,function(){return a["d"](this,function(e){return[2,void 0]})})},e}(),$=n("db6a"),q=n("10bf"),D=n.n(q),V=function(){function e(e,t,n){this.host=e,this.port=t,this.network=n,this.endpoint="",console.log(this.host,this.port,this.network)}return e.qrJson=function(e,t,n,o,r,i){var a={type:t,data:{name:n,addr:o,amount:r*this.divisibility(),msg:i},v:e};return D.a.codeToString(D.a.convert(this.getStr2Array(JSON.stringify(a)),"UTF8"))},e.divisibility=function(){return Math.pow(10,6)},e.getStr2Array=function(e){for(var t=[],n=0;n<e.length;n++)t.push(e.charCodeAt(n));return t},e.prototype.createAccount=function(){console.log("createAccount");var e=$["Account"].generateNewAccount(this.network);console.log("account",e);var t=new E;return t.address=e.address.plain(),t.privateKey=e.privateKey,t.publicKey=e.publicKey,t.networkType=e.address.networkType.valueOf(),t},e.prototype.loadAccount=function(e){return a["a"](this,void 0,void 0,function(){return a["d"](this,function(e){return[2]})})},e.prototype.sendCoin=function(){return a["a"](this,void 0,void 0,function(){return a["d"](this,function(e){return[2]})})},e.prototype.sendAsset=function(){return a["a"](this,void 0,void 0,function(){return a["d"](this,function(e){return[2]})})},e}(),z="",G="",H=$["NetworkType"].MIJIN_TEST,Q=new V(z,G,H),R=new M(Q),X=new I,Y={FetchLoadBalanceUseCase:new B(R),FetchLoadWalletUseCase:new N(R),FetchSendCoinUseCase:new W(X)};o["default"].use(T.a,{theme:{original:j.a.purple.base,theme:"#FFDEEA",background:"#FFF6EA",view:"#ffa07a",select:"#FF7F78",button:"#5FACEF"},options:{themeVariations:["original","secondary"]}}),o["default"].use(_.a,{defaultType:"bottom",duration:3e3,wordWrap:!0,width:"280px"}),o["default"].use(U.a),o["default"].config.productionTip=!1,new o["default"]({provide:Y,router:k,store:F,render:function(e){return e(p)}}).$mount("#app")}});
//# sourceMappingURL=app.6aa53fe4.js.map