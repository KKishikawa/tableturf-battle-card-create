import { htmlToElement } from "@/utils/index";
import { toInt } from "@/utils/convert";
import {
  ICard,
  RARITY,
  encodeInkInfo,
  decodeInkInfo,
  loadFromLocalStorage,
  saveToLocalStorage,
  saveToFile,
  loadFromFile,
} from "@/models/card";
import * as dialog from "@/components/dialog";
import * as Message from "@/components/message";
import { inputForm } from "@/views/inputform";

const cardListTable = document.getElementById(
  "cardlist_table"
) as HTMLTableElement;
const tableBody = cardListTable.getElementsByTagName("tbody")[0];

function loadCardFromRow(tr: HTMLTableRowElement): ICard {
  const card_no = toInt(tr.dataset["card_no"]);
  const card_sp = toInt(tr.querySelector(".card_sp")!.textContent?.trim());
  const card_name = tr.querySelector(".card_name")!.textContent!.trim();
  const rarity = toInt(tr.dataset["card_rarity"]);
  const spx = decodeInkInfo(tr.dataset["card_spx"]);
  const px = decodeInkInfo(tr.dataset["card_px"]);
  return {
    px,
    spx,
    no: card_no,
    name: card_name,
    sp: card_sp,
    rarity,
  };
}
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
  const info = loadCardFromRow(tr);
  inputForm.loadCard(info);
}

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
  row.dataset["card_spx"] = encodeInkInfo(cardInfo.spx);
  row.dataset["card_px"] = encodeInkInfo(cardInfo.px);
  return row;
}

// component process
{
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
  document
    .getElementById("save_cardlist_browser")!
    .addEventListener("click", function () {
      try {
        const cards = (
          Array.from(tableBody.children) as HTMLTableRowElement[]
        ).map(loadCardFromRow);
        saveToLocalStorage(cards);
        Message.success("ブラウザにデータを保存しました。");
      } catch (error) {
        console.log(error);
        Message.error("ブラウザへの保存に失敗しました。");
      }
    });
  document
    .getElementById("save_cardlist_file")!
    .addEventListener("click", function () {
      try {
        const cards = (
          Array.from(tableBody.children) as HTMLTableRowElement[]
        ).map(loadCardFromRow);
        saveToFile(cards);
        Message.success("保存データを作成しました。");
      } catch (error) {
        Message.error("ダウンロードデータの作成中にエラーが発生しました。");
      }
    });
  const loadFileButton = document.getElementById("load_cardlist_file")!;
  loadFileButton
    .getElementsByTagName("input")[0]
    .addEventListener("change", function () {
      if (!this.files) return;
      const file = this.files[0];
      // 同じファイルを再度選択してもイベントが発火するように値をクリアする
      this.value = "";
      loadFromFile(file)
        .then((cards) => {
          if (!cards) return Promise.reject();
          tableBody.innerHTML = "";
          cards
            .sort((a, b) => a.no - b.no)
            .forEach((c) => {
              const tr = createCardRow(c);
              tableBody.append(tr);
            });
          Message.success("カード情報を読み込みました。");
        })
        .catch(() => {
          Message.error("カードの読み込みに失敗しました。");
        });
    });
  loadFileButton.addEventListener("click", function () {
    this.getElementsByTagName("input")[0].click();
  });
}
// initialize
{
  const cardData = loadFromLocalStorage();
  cardData
    .sort((a, b) => a.no - b.no)
    .forEach((c) => {
      const tr = createCardRow(c);
      tableBody.append(tr);
    });
}
