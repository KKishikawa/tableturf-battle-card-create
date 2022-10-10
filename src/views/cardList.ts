import { htmlToElement } from "@/utils/index";
import { toInt } from "@/utils/convert";
import * as RecordUtil from "@/utils/variableRecord";
import { ICard, RARITY } from "@/models/card";
import * as dialog from "@/components/dialog";
import * as Message from "@/components/message";
import { inputForm } from "@/views/inputform";

const cardListTable = document.getElementById(
  "cardlist_table"
) as HTMLTableElement;
const tableBody = cardListTable.getElementsByTagName("tbody")[0];

function deleteRow(tr: HTMLTableRowElement) {
  const card_no = toInt(tr.dataset["card_no"]);
  const card_name = tr.querySelector(".card_name")!.textContent!;
  dialog
    .confirm({
      title: "カードリストの削除",
      message: `No.${card_no} ${card_name} をリストから削除しますか？`,
    })
    .then(
      () => {
        tr.remove();
        Message.success(`No.${card_no} ${card_name} を削除しました。`);
      },
      () => {
        Message.info("削除をキャンセルしました。");
      }
    );
}
function editRow(tr: HTMLTableRowElement) {
  const card_no = toInt(tr.dataset["card_no"]);
  const card_sp = toInt(tr.querySelector(".card_sp")!.textContent?.trim());
  const card_name = tr.querySelector(".card_name")!.textContent!.trim();
  const rarity = toInt(tr.dataset["card_rarity"]);
  const spx = RecordUtil.readVariableRecord(tr.dataset["card_spx"]);
  const px = RecordUtil.readVariableRecord(tr.dataset["card_px"]);
  const info: ICard = {
    px,
    spx,
    no: card_no,
    name: card_name,
    sp: card_sp,
    rarity,
  };
  inputForm.loadCard(info);
}

// tableBody内のbuttonクリックイベント
tableBody.addEventListener("click", function (e) {
  if (!e.target || !(e.target instanceof HTMLElement)) return;
  const button = e.target.closest("button");
  if (!button) return;
  const tr = button.closest("tr");
  if (!tr) return;
  if (button.classList.contains("button-delete")) {
    deleteRow(tr);
  } else if (button.classList.contains("button-edit")) {
    editRow(tr);
  }
});

export function findCardByNo(card_no: number) {
  const tr = tableBody.querySelector<HTMLTableRowElement>(
    `tr[data-card_no="${card_no}"]`
  );
  return tr;
}
export function tryAddCard(cardInfo: ICard) {
  const newTr = createCardRow(cardInfo);
  const trs = Array.from(tableBody.children).reverse() as HTMLTableRowElement[];
  let targetEl: HTMLTableRowElement | undefined;
  for (const cur_tr of trs) {
    const curCardNo = toInt(cur_tr.dataset["card_no"]);
    if (curCardNo === cardInfo.no) {
      // if same, replace it
      cur_tr.replaceWith(newTr);
      return;
    }
    if (curCardNo < cardInfo.no) {
      targetEl = cur_tr;
      break;
    }
  }
  if (!targetEl) {
    // if new is smaller than any element
    tableBody.prepend(newTr);
    return;
  }
  // find some smaller
  tableBody.insertBefore(newTr, targetEl.nextSibling);
}

function createCardRow(cardInfo: ICard) {
  const gridCount = cardInfo.spx.length + cardInfo.px.length;
  const row = htmlToElement(
    `<tr><td class="card_no">${
      cardInfo.no
    }</td><td class="card_gridcount">${gridCount}</td><td class="card_sp">${
      cardInfo.sp
    }</td><td class="card_rarity">${
      RARITY[cardInfo.rarity]
    }</td><td class="card_name">${
      cardInfo.name
    }</td><td class="card_action"><button class="action button-edit">編集</button><button class="action action--danger button-delete">削除</button></td></tr>`
  );
  row.dataset["card_no"] = cardInfo.no.toString();
  row.dataset["card_rarity"] = cardInfo.rarity.toString();
  row.dataset["card_spx"] = RecordUtil.writeVariableRecord(cardInfo.spx);
  row.dataset["card_px"] = RecordUtil.writeVariableRecord(cardInfo.px);
  return row;
}
