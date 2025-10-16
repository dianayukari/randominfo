export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "app",
	appPath: "randominfo/app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"app/immutable/entry/start.GzNmsooi.js",app:"app/immutable/entry/app.CTMWo26F.js",imports:["app/immutable/entry/start.GzNmsooi.js","app/immutable/chunks/D0IoRmqh.js","app/immutable/chunks/CZWMsW5p.js","app/immutable/chunks/B089eHam.js","app/immutable/entry/app.CTMWo26F.js","app/immutable/chunks/B089eHam.js","app/immutable/chunks/CZWMsW5p.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/RsWywM0O.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
