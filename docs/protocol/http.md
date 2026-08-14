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

Check out the [Link Discovery](link-discovery.md) and [Index Discovery](index-discovery.md) protocols for more information on how to make your event data discoverable and indexable by other tools and applications.
