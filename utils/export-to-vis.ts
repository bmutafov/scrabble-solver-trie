import * as fs from "fs";
import { join } from "path";

export function exportToVis(board: string[][]) {
  const filePath = join(__dirname, "..", "vis", "board-to-vis.js");
  fs.writeFileSync(filePath, `const board = ${JSON.stringify(board)}`, {
    flag: "w+",
  });
}
