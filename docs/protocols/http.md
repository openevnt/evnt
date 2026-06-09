# HTTPS

The most straightforward way to distribute Open Evnt data is to host event JSON files on a web server and serve them over HTTPS.

## Hosting

Place an event JSON file at a public URL. Any web server, static site host, or CDN works.

```
https://example.com/events/conf-2026.json
```

## eventsl.ink

[eventsl.ink](https://eventsl.ink) is a URL resolver that renders Open Evnt events from HTTPS URLs. Given an event URL, it redirects to a viewable page:

`https://eventsl.ink/e?url=https://example.com/events/conf-2026.json`

This allows you to host events on your own infrastructure and share links that work for any viewer, without needing your own rendering layer.

## Vantage

[Vantage](https://github.com/deniz-blue/vantage) can fetch and display events from HTTPS URLs. It supports cache headers (ETag, last-modified) for efficient refetching, and caches resolved events in a local SQLite database for offline access.

## Cross-origin access

Event files served over HTTPS should include appropriate CORS headers (`Access-Control-Allow-Origin: *`) if they are to be fetched from browser-based tools such as Vantage or eventsl.ink.
