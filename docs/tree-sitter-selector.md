# Tree-Sitter CSS Selectors

This module `depinspect` uses a simple system to select nodes from a Tree-Sitter parsed grammar.

By utilizing CSS selectors, the `detectors` of `depinspect` have a simple way to interact with the syntax tree to find the little information they need, while ensuring things are as accurate as possible.

While the selector syntax itself should be able to fully parse any and all valid CSS syntax selectors, the full spec couldn't be supported exactly for this context, especially considering things like `element`s or `class`s don't have a like-for-like translation. So below will define what CSS selectors mean in terms of selector elements from a Tree-Sitter Parsed Grammar Syntax Tree.

## Translation from Tree-Sitter to CSS Selectors

### Basic Selectors

#### Class Selector

> `.value`

This selector will match with the `node.type` of a Tree-Sitter node.

#### Type Selector

> `value`

Unsupported.

#### ID Selector

> `#value`

Unsupported.

### Combinators

#### Descendant Combinator

> ` `

#### Child Combinator

> `>`

#### Subsequent-Sibling Combinator

> `~`

#### Next-Sibling Combinator

> `+`

#### Column Combinator

> `||`

Unsupported.


---

QUICK NOTES SO I DON'TO FORGET

* Class = node.type
* attribute = checking a property of the node
* pseudo-class = execute a function to then use that node ex. `:child(2)` = `node.child(2)`
* pseudo-element = return that property instead of the node ex `::text` = `return node.text;`
* id = switch to that node ex. `#parent` = `return node.parent;`
* type = we don't use those here apparently
