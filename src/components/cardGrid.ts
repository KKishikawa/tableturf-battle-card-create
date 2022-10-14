import { htmlToElement } from "@/utils";
import { toInt } from "@/utils/convert";

function createCell(idx: number) {
  const cell = document.createElement("div");
  cell.className = "cardgrid-cell";
  cell.dataset["idx"] = idx.toString();
  return cell;
}
export const fillTypes = ["n-fill", "sp-fill"] as const;
/** filltypeを双方選択するCSSセレクタ */
const fillTypeSelector = fillTypes.map((s) => `.${s}`).join(",");
export type CardGridCellSize = "sm" | "md" | "lg";
export interface ICardGridOptions {
  size?: CardGridCellSize;
  clickHandler?: (cell: HTMLElement) => void;
}
/** カードの塗り範囲をグリッド表現 */
export class CardGrid {
  readonly element: HTMLElement;
  constructor(options: ICardGridOptions = {}) {
    this.element = htmlToElement(
      `<div class="cardgrid"><div class="cardgrid-border"></div></div>`
    );
    this.changeSize(options.size ?? "sm");
    if (options.clickHandler) {
      const cHandler = options.clickHandler;
      this.element.classList.add("cardgrid__clickable");
      this.element.addEventListener("click", (e) => {
        if (!e.target || !(e.target instanceof HTMLElement)) return;
        let el: HTMLElement | null;
        if (!(el = e.target.closest("[data-idx]"))) return;
        cHandler(el);
      });
    }
    for (let i = 0; i < 64; i++) {
      this.element.append(createCell(i));
    }
  }
  changeSize(size: CardGridCellSize) {
    this.element.dataset["grid_size"] = size;
  }
  /** 設定値をもとにグリッドを塗ります(追加) */
  fill(spx: number[], px: number[]) {
    const cells = this.element.querySelectorAll<HTMLElement>("[data-idx]");
    spx.forEach((x) => {
      cells[x].classList.add(fillTypes[1]);
    });
    px.forEach((x) => {
      cells[x].classList.add(fillTypes[0]);
    });
  }
  /** 対象のグリッドを塗ります */
  fillCell(className: string, idx: number) {
    const target = this.element.querySelector(`[data-idx="${idx}"]`);
    if (!target) return;
    target.classList.add(className);
  }
  /** 全ての塗りを消します */
  clear() {
    for (const className of fillTypes) {
      const targetEls = Array.from(
        this.element.getElementsByClassName(className)
      );
      for (const el of targetEls) {
        el.classList.remove(className);
      }
    }
  }
  /** 塗れる数をカウントします */
  getCount() {
    const filledCells = this.element.querySelectorAll(fillTypeSelector);
    const spCells = this.element.getElementsByClassName(fillTypes[1]);
    return {
      fill: filledCells.length,
      sp: spCells.length,
    };
  }
  /** 塗れる範囲を2つの1次元配列で表現します */
  getData() {
    const nCells = Array.from(
      this.element.getElementsByClassName(fillTypes[0])
    ) as HTMLElement[];
    const spCells = Array.from(
      this.element.getElementsByClassName(fillTypes[1])
    ) as HTMLElement[];
    function collectIdxVal(cells: HTMLElement[]) {
      return cells.map((e) => toInt(e.dataset["idx"])).filter(isFinite);
    }
    return {
      n: collectIdxVal(nCells),
      sp: collectIdxVal(spCells),
    };
  }
}
