
module.exports =
class Selector {
  constructor(selectorString) {
    if (typeof selectorString !== "string") {
      throw new Error("ParseSelector Class must be instianted with a string!");
    }
    this.string = selectorString;

    this.depth = 0; // The depth of the selectors in sequence
    this.selectorObj = {};

    // Regex
    this.attributeSelectorReg = new RegExp(/\[(?<attr>.+?)\]+/, 'g');

    this.parse();
  }

  parse() {
    this.selectorObj.text = this.string;

    let nodes = this.string.split(".");

    for (let i = 0; i < nodes.length; i++) {
      let selNode = {
        text: nodes[i],
        node: nodes[i], // We declare the node text here, even though it'll be
        // redefined later, but we want the redefinitions to be cumulative,
        // so all other steps should build off this string
        attrs: []
      };

      // CSS Attribute Selector Syntax Support
      let attrSelMatch = selNode.node.match(this.attributeSelectorReg);
      if (attrSelMatch && Array.isArray(attrSelMatch) && attrSelMatch.length > 0) {
        for (let y = 0; y < attrSelMatch.length; y++) {
          selNode.node = selNode.node.replace(attrSelMatch[y], "");

          let keyPair = attrSelMatch[y].split("=");
          // TODO if we wanted to support more than just `=` that would be added
          // here
          selNode.attrs.push({
            attr: keyPair[0].replace("[", ""),
            value: keyPair[1].replace("]", ""),
            match: "equals"
          });
        }
      }
      // If we choose to add other support, that can probably be added here

      // Now add the node to our obj, based on our current depth, then increase depth
      this.selectorObj[this.depth] = selNode;
      this.depth = this.depth + 1;
    }
  }

  selectorForDepth(depth) {
    return this.selectorObj[`${depth}`];
  }

}
