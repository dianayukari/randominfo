export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "app",
	appPath: "randominfo/app",
	assets: new Set(["rabbit1.png","rabbit2.png","robots.txt"]),
	mimeTypes: {".png":"image/png",".txt":"text/plain"},
	_: {
		client: {start:"app/immutable/entry/start.BnnK5KWF.js",app:"app/immutable/entry/app.BHCjjWL-.js",imports:["app/immutable/entry/start.BnnK5KWF.js","app/immutable/chunks/jKQ_GxeY.js","app/immutable/chunks/Doo6WzFp.js","app/immutable/chunks/BSKxhTlf.js","app/immutable/chunks/BqKCSvDI.js","app/immutable/entry/app.BHCjjWL-.js","app/immutable/chunks/BSKxhTlf.js","app/immutable/chunks/Doo6WzFp.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/BMsKAc2y.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/randominfo/","/randominfo/__data.json"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
