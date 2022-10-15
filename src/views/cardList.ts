import Mustache from "mustache";
import { htmlToElement, mesureWidth } from "@/utils";
import { toInt } from "@/utils/convert";
import {
  ICard,
  ICardRaw,
  RARITY,
  decodeInkInfo,
  encodeCard,
  loadFromLocalStorage,
  saveToLocalStorage,
  saveToFile,
  loadFromFile,
} from "@/models/card";
import * as dialog from "@/components/dialog";
import * as Message from "@/components/message";
import { CardGrid } from "@/components/cardGrid";
import { inputForm } from "@/views/inputform";
import tableRowHTML from "@/template/cardList/row.html";

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
        // バックグラウンドで自動保存を実行する
        window.setTimeout(saveCardList.bind(null, true));
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
    Mustache.render(tableRowHTML, {
      ...encodeCard(cardInfo),
      gridCount,
      rarity_label(this: ICardRaw) {
        return RARITY[this.r];
      },
    })
  );
  const clientNameWidth = mesureWidth(cardInfo.name, "text-sm font-bold");
  console.log([cardInfo.name, clientNameWidth]);
  if (clientNameWidth > 152) {
    const scale = 152 / clientNameWidth;
    (
      row.querySelector(".card_name *") as HTMLElement
    ).style.cssText = `--tw-scale-x:${scale};--tw-scale-y:${scale};`;
  }
  const cardGrid = new CardGrid();
  cardGrid.fill(cardInfo.spx, cardInfo.px);
  row.prepend(cardGrid.element);
  return row;
}
/** ブラウザにカードリストの情報を保存します */
export function saveCardList(isAutoSaveAction?: boolean) {
  if (isAutoSaveAction) {
    // 自動保存アクションの場合は、自動保存が有効か確認する
    if (
      !(document.getElementById("autosave_cardlist") as HTMLInputElement)
        .checked
    )
      return;
  }
  try {
    const cards = (Array.from(tableBody.children) as HTMLTableRowElement[]).map(
      loadCardFromRow
    );
    saveToLocalStorage(cards);
    if (isAutoSaveAction) {
      Message.info("ブラウザに保存しているカードリストを更新しました。");
    } else {
      Message.success("ブラウザにカードリストを保存しました。");
    }
  } catch (error) {
    console.log(error);
    if (isAutoSaveAction) {
      Message.warn("ブラウザに保存しているカードリストの更新に失敗しました。");
    } else {
      Message.error("ブラウザへのカードリストの保存に失敗しました。");
    }
  }
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
      // 削除ボタンクリック
      deleteRow(tr);
    } else if (button.classList.contains("button-edit")) {
      // 編集ボタンクリック
      editRow(tr);
    }
  });
  document
    .getElementById("save_cardlist_browser")!
    .addEventListener("click", saveCardList.bind(null, false));
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

  // レイアウト変更
  const layoutButtons =
    document.querySelectorAll<HTMLElement>("[data-button_type]");
  layoutButtons.forEach((el) => {
    el.addEventListener("click", function () {
      layoutButtons.forEach((el) => el.classList.remove("button-active"));
      this.classList.add("button-active");
      const layoutName = this.dataset["button_type"]!;
      cardListTable.dataset["layout"] = layoutName;
    });
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
