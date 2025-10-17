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
		client: {start:"app/immutable/entry/start.DYCfX4lE.js",app:"app/immutable/entry/app.CkYLQIGP.js",imports:["app/immutable/entry/start.DYCfX4lE.js","app/immutable/chunks/jZ1gG0LB.js","app/immutable/chunks/FhcG3dpi.js","app/immutable/chunks/BGMrN2PN.js","app/immutable/chunks/CQHu2C7m.js","app/immutable/entry/app.CkYLQIGP.js","app/immutable/chunks/BGMrN2PN.js","app/immutable/chunks/FhcG3dpi.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/CMUbuGCI.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
