# HTTP

Open Evnt is designed to be served over HTTP. You can host your event data on any static file server, a CDN, or an S3 bucket.

## File extension (optional)

Use `.evnt.json` as the file extension. Tools use the `.evnt` segment to recognise the file as Open Evnt data, while the `.json` tail means systems that don't know about Open Evnt still handle it as regular JSON.

## Content type (optional)

Serve with:

```
Content-Type: application/evnt+json
```

The `+json` suffix means any parser that handles `application/*+json` can decode it. Clients that know Open Evnt can match on `application/evnt+json` specifically. Not required - `application/json` works too. But `application/evnt+json` helps clients that want to distinguish event data from other JSON.

## CORS

If you want other websites to be able to fetch your events, add this header to your HTTP response:

```
Access-Control-Allow-Origin: *
```

## Discovery

When returning HTML web pages, you can add a `<link>` tag to the `<head>` of your page to point to your Open Evnt data:

```html
<link rel="alternate" type="application/evnt+json" href="https://example.com/my-event.evnt.json">
```

## Lists

You can use [JSON Feed](https://jsonfeed.org/) to publish a list of events. JSON Feed is a simple format for syndicating content, and it can be used to list multiple Open Evnt files.
