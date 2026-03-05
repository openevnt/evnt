import { Context } from "hono";
import { Script } from "vite-ssr-components/hono";

export const renderSsrPage = (c: Context, props: any) => {
	return c.html(
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<Script src="/src/client.tsx" type="module" />
			</head>
			<body>
				<div id="root" data-props={JSON.stringify(props)}></div>
			</body>
		</html>
	);
};
