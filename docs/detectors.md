# Detectors

The Detectors (`./src/detectors.js`) really make this whole project go-round.

This single file is what exposes the objects needed in order for languages to be supported.

Each detector enables DepInspect support for the extension it reports.

## Specification

### `name`

Quite simply, this is the name of the type of code being supported. Recommended to be `<LANGUAGE>Dependency`.

### `language`

This function should return a require statement to the correct tree-sitter grammar needed for this languages support.

### `selectors`

An array of selector objects:

* `name`: A human readable name for the type of selector this object is
* `selector`: A CSS-Like Selector, which will target a specific node or value from a parsed Tree-Sitter grammar. (More in ./tree-sitter-selector.md)
* `getModule`: An **optional** function, that can take the node returned by the above `selector` and return the text of the dependency in it. Not always needed.

### `validateModule`

A method that will be given the `rawModule` as collected by a selector, along with:

* `filepath`: The path of the file we are operating on
* `rootFilePath`: The root directory of the project.

Here the function needs to be able to return a relativized filepath to the dependency, if there is one, otherwise returning the name of the dependency.
