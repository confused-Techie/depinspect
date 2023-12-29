const { describe, it } = require("node:test");
const assert = require("node:assert");

const Parser = require("tree-sitter");
const language = require("tree-sitter-javascript");
const SelectorTreeSitter = require("../src/selectorTreeSitter.js");

const fs = require("fs");

describe("integration tests", () => {
  it("returns the correct required module", () => {
    const code = fs.readFileSync("./test/fixtures/mini-valid-require.js", { encoding: "utf8" });

    const parser = new Parser();
    parser.setLanguage(language);

    const tree = parser.parse(code);

    const selector = ".call_expression > .identifier[text=require][childCount=0]#nextSibling#firstNamedChild::text";

    const selectorTS = new SelectorTreeSitter(tree, selector);

    const matches = selectorTS.execute();

    assert.strictEqual(matches[0], '"path"');
    assert.strictEqual(matches.length, 1);
  });

  it("returns the correct imported module", () => {
    const code = fs.readFileSync("./test/fixtures/mini-valid-import.js", { encoding: "utf8" });

    const parser = new Parser();
    parser.setLanguage(language);

    const tree = parser.parse(code);

    const selector = ".import_statement > .import[text=import]#parent:child(3)#firstNamedChild::text";

    const selectorTS = new SelectorTreeSitter(tree, selector);
    selectorTS.verbose = true;

    const matches = selectorTS.execute();

    assert.strictEqual(matches[0], 'path');
    assert.strictEqual(matches.length, 1);
  });
});
