exports.extractRegexp = (str, regexp) => {
  if (!str) {
    return
  }
  const match = str.match(regexp)
  if (match) {
    return match[1]
  }
}
