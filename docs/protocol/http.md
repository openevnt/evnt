# HTTP

Open Evnt is JSON. Serving it over HTTP is just serving JSON with two details.

## File extension (optional)

Use `.evnt.json` as the file extension. Tools use the `.evnt` segment to recognise the file as Open Evnt data, while the `.json` tail means systems that don't know about Open Evnt still handle it as regular JSON.

## Content type (optional)

Serve with:

```
Content-Type: application/evnt+json
```

The `+json` suffix means any parser that handles `application/*+json` can decode it. Clients that know Open Evnt can match on `application/evnt+json` specifically. Not required - `application/json` works too. But `application/evnt+json` helps clients that want to distinguish event data from other JSON.

## CORS

If you want other websites to fetch your events, add:

```
Access-Control-Allow-Origin: *
```

This is the only CORS header you need for public event data. Without it, browser-side JavaScript can't read your events.

## That's it

Put the file on any static file server, a CDN, or an S3 bucket. There's no special routing, no well-known endpoint, no directory index convention. Open Evnt isn't a protocol - it's a format that happens to work well over HTTP.
