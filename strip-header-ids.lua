-- Lua filter to remove header identifiers so Pandoc won't create bookmarks
function Header(el)
  el.identifier = ""
  return el
end
