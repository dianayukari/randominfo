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
		client: {start:"app/immutable/entry/start.B8g7gpaR.js",app:"app/immutable/entry/app.CSAombmQ.js",imports:["app/immutable/entry/start.B8g7gpaR.js","app/immutable/chunks/C9ejeQgd.js","app/immutable/chunks/BuNEtrVY.js","app/immutable/chunks/BkHzRi2O.js","app/immutable/entry/app.CSAombmQ.js","app/immutable/chunks/BkHzRi2O.js","app/immutable/chunks/BuNEtrVY.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/CbxNRxmd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
