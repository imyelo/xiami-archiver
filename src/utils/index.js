exports.match = (str, regexp) => {
  if (!str) {
    return
  }
  const matched = str.match(regexp)
  if (matched) {
    return matched[1]
  }
}
