# Fauna Streams with Fresh

This is small demo repository to demonstrate using Fauna Streaming in Fresh.

Fauna provides two distinct stream types: Document and Set. While a document stream can see create, update, and delete events on the document, a Set stream can only see add or remove events on the set. 

Since the stream ultimately runs on the client, it needs to import faunadb from a non-Deno target.

This repo isn't actually connected to a database.