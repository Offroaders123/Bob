# Bob

Binary JSON objects!

Been thinking about how one could store JSON data vert small, by using a very compressed binary format, possibly with compression, but moreso with writing data to the file like you do for NBT, but specific to what JSON's spec supports.

## Intrigue

I am following the issue on WHATWG about [adding support for custom objects in the `structuredClone()` algorithm](https://github.com/whatwg/html/issues/7428), and it relates to the concepts I have here with making Bob, and to an extent NBTify as well (since these two are related).

[StructuredClone Commentary](https://github.com/whatwg/html/issues/7428#issuecomment-2610601789)

[buffered-clone](https://github.com/WebReflection/buffered-clone)
