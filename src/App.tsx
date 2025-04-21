import { For } from "solid-js";
import { createSignal } from "solid-js";
import Papa from "papaparse";

const INITIAL_TWIDTH = 11;
const INITIAL_THEIGHT = 16;

function createInitialTable() {
  return new Array(INITIAL_THEIGHT)
    .fill(null)
    .map(() => new Array(INITIAL_TWIDTH).fill(""));
}
function App() {
  const table = createSignal<string[][]>(createInitialTable());

  const selectedCell = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const fileName = createSignal<string>();

  return (
    <>
      <div id="container">
        <div id="toolbar">
          <input
            type="file"
            hidden
            accept=".csv"
            id="file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => {
                const csv = e.target!.result as string;
                const parsed = Papa.parse(csv).data as string[][];
                table[1]([...normalizeSubarrays(parsed)]);
              };
              reader.readAsText(file);
            }}
          />
          <button
            onClick={() => {
              (
                document.querySelector("#file-input") as HTMLInputElement
              ).click();
            }}
          >
            <span>
              <i class="material-symbols-outlined">upload_file</i> Open CSV
            </span>
          </button>
          <button
            onClick={() => {
              const csv = Papa.unparse(table[0]());
              downloadTextFile(
                fileName[0]() ? `${fileName[0]()}.csv` : "spreadsheet.csv",
                csv
              );
            }}
          >
            <span>
              <i class="material-symbols-outlined">download</i>
              Download CSV
            </span>{" "}
          </button>

          <button
            onClick={() => {
              table[1](createInitialTable());
            }}
          >
            <span>
              <i class="material-symbols-outlined">delete</i>
              Clear All
            </span>{" "}
          </button>
        </div>
        <input
          onChange={(e) => {
            fileName[1](e.target.value);
          }}
          type="text"
          name=""
          id=""
          placeholder="Project name here..."
          style={{
            position: "fixed",
            width: "100vw",
            top: "4rem",
          }}
        />
        <table id="table">
          <For each={table[0]()}>
            {(row, rowIndex) => {
              return (
                <>
                  <div>
                    <div>
                      <For each={row}>
                        {(cell, cellIndex) => (
                          <td
                            onFocus={() => {
                              selectedCell[1]({
                                x: cellIndex(),
                                y: rowIndex(),
                              });
                            }}
                            class={
                              selectedCell[0]()?.x === cellIndex() &&
                              selectedCell[0]()?.y === rowIndex()
                                ? "selected"
                                : ""
                            }
                            contentEditable
                            onInput={(e) => {
                              const newText = (e.target as HTMLTableCellElement)
                                .innerText;

                              table[1]((v) => {
                                v[rowIndex()][cellIndex()] = newText;

                                return [...v];
                              });
                            }}
                          >
                            {cell}
                          </td>
                        )}
                      </For>
                    </div>
                  </div>
                </>
              );
            }}
          </For>
        </table>
        <div id="bottombar">
          <button
            onClick={() => {
              table[1]((v) => {
                const rowWidth = v[0]?.length || INITIAL_TWIDTH;
                const newRow = new Array(rowWidth).fill("");
                return [...v, newRow];
              });
            }}
          >
            <span>
              <i class="material-symbols-outlined">add</i>
              Row
            </span>
          </button>
          <button
            onClick={() => {
              table[1]((v) => {
                console.log(v);
                const newTable: string[][] = [];
                v.forEach((row) => {
                  console.log(row);
                  const newRow: string[] = [];
                  row.forEach((cell) => {
                    newRow.push(cell);
                  });
                  newRow.push("");

                  newTable.push(newRow);
                });
                return newTable;
              });
            }}
          >
            <span>
              <i class="material-symbols-outlined">add</i>
              Column
            </span>
          </button>

          <div id="bottombar-rightsection">
            <button
              onClick={() => {
                const rows = getRowsTillSelectedCell();
                const sum = sumSelectedColInRows(rows);
                updateSelectedCellAndRerender(sum.toString());
              }}
            >
              <span>Sum</span>
            </button>
            <button
              onClick={() => {
                const rows = getRowsTillSelectedCell();
                const sum = sumSelectedColInRows(rows);
                const average = sum / rows.length;
                updateSelectedCellAndRerender(average.toString());
              }}
            >
              Avg
            </button>
            <div class="disp">
              Row {selectedCell[0]()?.y + 1}
              <button
                onClick={() => {
                  table[1]((v) => {
                    const n = [...v];
                    console.log(n);
                    n.splice(selectedCell[0]()?.y, 1);
                    return [...n];
                  });
                  selectedCell[1]((v) => {
                    v.y = Math.min(v.y, Math.max(table[0]().length - 1, 0));
                    return { ...v };
                  });
                }}
              >
                <span>
                  <i class="material-symbols-outlined">delete</i>
                </span>
              </button>
            </div>
            <div class="disp">
              Col {selectedCell[0]()?.x + 1}
              <button
                onClick={() => {
                  table[1]((v) => {
                    const n = [...v];
                    n.forEach((r, i) => {
                      r.splice(selectedCell[0]()?.x, 1);
                      n[i] = [...r];
                    });
                    return [...n];
                  });
                  selectedCell[1]((v) => {
                    v.x = Math.min(v.x, Math.max(table[0]()[0].length - 1, 0));
                    return { ...v };
                  });
                }}
              >
                <span>
                  <i class="material-symbols-outlined">delete</i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function updateSelectedCellAndRerender(newValue: string) {
    updateTableAndRerender(
      selectedCell[0]()!.y,
      selectedCell[0]()!.x,
      newValue
    );
  }
  function updateTableAndRerender(row: number, col: number, newValue: string) {
    const OT = [...table[0]()];
    table[1]([]);
    table[1](() => {
      OT[row][col] = newValue;
      return [...OT];
    });
  }

  function getRowsTillSelectedCell() {
    const row = selectedCell[0]()!.y;
    const rows = table[0]()!.slice(0, row);
    return rows;
  }

  function sumSelectedColInRows(rows: string[][]) {
    const col = selectedCell[0]()!.x;

    let sum = 0;

    rows.forEach((row) => {
      const cellValue = Number(row[col]);
      if (!Number.isNaN(cellValue)) {
        sum += cellValue;
      }
    });
    return sum;
  }
}

function downloadTextFile(filename: string, content: string) {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function normalizeSubarrays(arrays: string[][]) {
  // Find the maximum length among the subarrays
  const maxLength = Math.max(...arrays.map((subArray) => subArray.length));

  // Iterate over each subarray and normalize its length
  return arrays.map((subArray) => {
    while (subArray.length < maxLength) {
      subArray.push(""); // Add empty strings to match the max length
    }
    return subArray;
  });
}

export default App;
