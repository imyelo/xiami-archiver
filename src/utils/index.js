exports.match = (str, regexp) => {
  if (!str) {
    return
  }
  const matched = str.match(regexp)
  if (matched) {
    return matched[1]
  }
}

exports.nodeText = ($node, currentNodeOnly = true) => {
  if (!$node) {
    return
  }
  if (!currentNodeOnly) {
    return $node.text()
  }
  return $node.clone().children().remove().end().text()
}

exports.findNodeWithText = ($, $node, text) => {
  return $($node.get().find((element) => $(element).text().includes(text)))
}

exports.trim = (str) => {
  if (!str) {
    return
  }
  return str.trim()
}
