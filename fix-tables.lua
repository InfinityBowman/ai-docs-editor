-- fix-tables.lua
-- Ensures tables have proper column widths for Google Docs compatibility

function Table(tbl)
  -- Remove all column width specifications so Word/Google Docs auto-sizes
  local new_colspecs = {}
  for i, colspec in ipairs(tbl.colspecs) do
    -- Keep alignment but set width to 0 (auto)
    new_colspecs[i] = {colspec[1], 0}
  end
  tbl.colspecs = new_colspecs
  return tbl
end
