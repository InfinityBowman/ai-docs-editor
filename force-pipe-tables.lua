-- force-pipe-tables.lua
-- Forces pandoc to output pipe tables instead of simple tables

function Table(tbl)
  -- Force pipe table style by setting colspecs widths to 0
  for i, colspec in ipairs(tbl.colspecs) do
    tbl.colspecs[i] = {colspec[1], 0}
  end
  return tbl
end
