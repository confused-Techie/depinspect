// This module is used to inspect the tree via a CSS like selector

module.exports =
function inspectTreeMain(tree, selector) {
  // Selector Definition: ./docs/treeSelectors.md

  let matches = [];

  for (let i = 0; i < selector.depth; i++) {
    let partialMatches = [];

    if (matches.length == 0) {
      partialMatches = descendNode(tree.rootNode, (node) => {
        // Now we handle this specific selector
        return matchNode(node, selector.selectorForDepth(i));
      });
    } else {
      // We already have matches, so we will use those as our rootNode
      for (let y = 0; y < matches.length; y++) {
        partialMatches = partialMatches.concat(doesChildMatchNode(matches[y], (node) => {
          // Now we handle this specific selector
          return matchNode(node, selector.selectorForDepth(i));
        }));
      }
    }

    matches = partialMatches;
  }

  return matches;
}

function descendNode(node, matchSelector) {
  let otherNodes = [];
  // First we check if we can descend on this node
  if (node.childCount > 0) {
    for (let i = 0; i < node.childCount; i++) {
      otherNodes = otherNodes.concat(descendNode(node.child(i), matchSelector));
    }
  }
  if (matchSelector(node)) {
    otherNodes = otherNodes.concat(node);
  }

  return otherNodes;
}

function doesChildMatchNode(node, matchCondition) {
  let otherNodes = [];
  if (node.childCount > 0) {
    for (let i = 0; i < node.childCount; i++) {
      if (matchCondition(node.child(i))) {
        otherNodes.push(node.child(i));
      }
    }
  }

  return otherNodes;
}

function matchNode(node, selNode) {
  if (node.type !== selNode.node) {
    return false;
  }
  if (selNode.attrs.length > 0) {
    for (let i = 0; i < selNode.attrs.length; i++) {
      // If we added other checks here than `=` it would be added here
      if (
        selNode.attrs[i].match === "equals" &&
        node[selNode.attrs[i].attr] != selNode.attrs[i].value
         ) {
        // WARNING Coercion allowed on this check to match `0 == '0'`
        return false;
      }
    }
  }

  // We return true by default, only failing on a bad match
  return true;
}
