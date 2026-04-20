**Protocols**

Open Evnt is designed to be protocol-agnostic, meaning that it can be used with any protocol or transport mechanism.

This section describes some protocols that can be used with Open Evnt, but you are not limited to these. You can use any protocol that can transmit JSON data.

## HTTPS

The most straightforward way to use Open Evnt is to host your event data on a web server and serve it over HTTPS. This allows anyone to access your event data using a simple URL.

The [eventsl.ink](https://eventsl.ink) project supports this method, allowing you to host your events on your own server and then create a link that can redirect users to applications that can display the event data.

Here's an example link: https://eventsl.ink/e?url=https%3A%2F%2Fdeniz.blue%2Fevents-data%2Fevents%2F2026%2Ffoss%2Ffosdem26.json

## AT Protocol

The [AT Protocol](https://atproto.com/) is a decentralized protocol for building social applications.

We define the `directory.evnt.event` AT Protocol lexicon for Open Evnt events. It has the same structure as the Open Evnt event.

The `components` system integrates with the AT Protocol's lexicon system, allowing you to define reusable components that can be used across multiple events.

The [eventsl.ink](https://eventsl.ink) project also supports the AT Protocol, allowing users and applications to access event data using the AT Protocol. This means that you can host your events on your own server and then create a link that can redirect users to applications that can display the event data using the AT Protocol.

Here's an example link: https://eventsl.ink/a?at=at://did:plc:ir2qabq56znbbinhktehjmc6/directory.evnt.event/3mgnekiomev2y

## Other Protocols

ActivityPub, Matrix, XMPP, and other protocols can also be theoretically be used to transmit Open Evnt data, but there have not been any attempts to do so yet. If you are interested in doing so, do reach out to us on our Discord or Matrix channels.
