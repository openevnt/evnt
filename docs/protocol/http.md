# HTTP(s) Protocol

Open Evnt is designed to be served over HTTP. You can host your event data on any static file server, a CDN, or an S3 bucket.

## File Extension & Content Type

You should use `.evnt.json` as the file extension. Tools that understand Open Evnt will recognize it while the ones that won't can fall back to treating it as a regular JSON file.

The content type of Open Evnt events should be `application/evnt+json`. This is not required, but it helps clients that want to distinguish event data from other JSON.

## Headers

You should allow CORS requests from any origin to allow clients to fetch your event data from any domain. You can do this by adding the following header to your responses:

```
Access-Control-Allow-Origin: *
```

## Discovery & Indexing

Check out [Link Discovery](link-discovery.md) to learn how to make the content you serve point to a valid Open Evnt document, so that clients can discover it from the page.

If you want to provide an index of your event data so that any client can discover all the events you serve, you can use the [Open Evnt Manifest](../spec/open-evnt-manifest.md) specification.
