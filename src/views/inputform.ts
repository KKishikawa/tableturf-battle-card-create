import Mustache from "mustache";
import * as convert from "@/utils/convert";
import * as dialog from "@/components/dialog";
import * as Message from "@/components/message";
import { CardGrid, fillTypes } from "@/components/cardGrid";
import { SimpleInfo } from "@/components/simpleInfo";
import { ICard } from "@/models/card";
import * as cardList from "@/views/cardList";

import errMsgHTML from "@/template/inputForm/errorMsg.html";
import overwriteHTML from "@/template/inputForm/overwriteMsg.html";

class InputForm {
  private readonly infoElManager: SimpleInfo;
  private readonly gridManager: CardGrid;
  constructor() {
    this.infoElManager = new SimpleInfo();
    this.infoElManager.element.classList.add("mt-2");
    this.gridManager = new CardGrid({
      size: "lg",
      clickHandler: (el) => {
        const form = document.getElementById(
          "card-input-form"
        ) as HTMLFormElement;
        const colorSettingRadio = form.elements.namedItem(
          "cell_color"
        ) as RadioNodeList;
        const curVal = colorSettingRadio.value;
        if (!curVal) return;
        const curClass = `${curVal}-fill`;
        const hasClass = el.classList.contains(curClass);
        el.classList.remove(...fillTypes);
        if (!hasClass) el.classList.add(curClass);
        this.showGridInfo();
      },
    });
    this.showGridInfo();
    const cardgridWrapper = document.getElementById("input_cardgrid")!;
    cardgridWrapper.append(this.gridManager.element);
    cardgridWrapper.append(this.infoElManager.element);
  }
  /** formにデータを読み込む */
  loadCard(info: ICard) {
    (document.getElementById("input_no") as HTMLInputElement).value =
      info.n.toString();
    (document.getElementById("input_sp") as HTMLInputElement).value =
      info.sp.toString();
    (document.getElementById("input_rarity") as HTMLSelectElement).value =
      info.r.toString();
    (document.getElementById("input_name") as HTMLInputElement).value =
      info.ja;
    this.gridManager.clear();
    this.gridManager.fill(info.g, info.sg);
    this.showGridInfo();
  }
  /** グリッドの情報の表示を更新する */
  showGridInfo() {
    const countInfo = this.gridManager.getCount();
    this.infoElManager.setInfo(
      `マス数: ${countInfo.fill}  sp: ${countInfo.sp}`
    );
  }
  clearGrid() {
    this.gridManager.clear();
    this.showGridInfo();
  }
  /** formの内容を全て消去する */
  clearForm() {
    this.clearGrid();
    (document.getElementById("input_no") as HTMLInputElement).value = "";
    (document.getElementById("input_sp") as HTMLInputElement).value = "";
    (document.getElementById("input_rarity") as HTMLSelectElement).value = "";
    (document.getElementById("input_name") as HTMLInputElement).value = "";
  }
  validate() {
    const errorMsg = [];
    const card_no = convert.toInt(
      (document.getElementById("input_no") as HTMLInputElement).value
    );
    const sp = convert.toInt(
      (document.getElementById("input_sp") as HTMLInputElement).value,
      -1
    );
    const rarity = convert.toInt(
      (document.getElementById("input_rarity") as HTMLSelectElement).value,
      -1
    );
    const name = (document.getElementById("input_name") as HTMLInputElement)
      .value;
    const gridInfo = this.gridManager.getData();
    const ret: ICard = {
      ...gridInfo,
      ja: name,
      sp,
      n: card_no,
      r: rarity,
    };
    // validation
    if (card_no < 1) {
      errorMsg.push("・カードNoが正しく設定されていません");
    }
    if (sp < 0) {
      errorMsg.push("・スペシャル必要数が正しく設定されていません");
    }
    if (rarity < 0) {
      errorMsg.push("・レア度が正しく設定されていません");
    }
    if (name == null || name == "") {
      errorMsg.push("・カード名が指定されていません");
    }

    return [errorMsg, ret] as const;
  }
}

export const inputForm = new InputForm();
{
  document.getElementById("button_clear_cardgrid")!.onclick = function () {
    dialog
      .confirm({
        title: "塗りマス設定",
        message: "塗りマスの設定をクリアしますか？",
      })
      .then(
        () => {
          inputForm.clearGrid();
          Message.success("クリアしました。");
        },
        () => {
          Message.info("操作をキャンセルしました。");
        }
      );
  };

  document.getElementById("addcard")!.onclick = function () {
    const validateRet = inputForm.validate();
    if (validateRet[0].length > 0) {
      dialog.alert({
        title: "入力エラー",
        html: Mustache.render(errMsgHTML, validateRet[0]),
      });
      return;
    }
    const existsInfo = cardList.findCardByNo(validateRet[1].n);

    let dialogConfig: dialog.IComfirmOption;
    if (existsInfo) {
      dialogConfig = { title: "カードの編集", html: Mustache.render(overwriteHTML, { old: existsInfo, new: validateRet[1] }) };
    } else {
      dialogConfig = { title: "カードの登録", message: "カードを追加しますか？" };
    }
    dialog.confirm(dialogConfig).then(
      () => {
        cardList.tryAddCard(validateRet[1]);
        // バックグラウンドで自動保存を実行する
        window.setTimeout(cardList.saveCardList.bind(null, true));
        Message.success(existsInfo ? "更新しました" : "追加しました。");
        inputForm.clearForm();
      },
      () => {
        Message.info("キャンセルしました");
      }
    );
  };
  document.getElementById("clearInputForm")!.onclick = function () {
    dialog
      .confirm({
        title: "入力フォームのクリア",
        message: "入力フォームをクリアしますか？",
      })
      .then(
        () => {
          inputForm.clearForm();
          Message.success("クリアしました。");
        },
        () => Message.info("キャンセルしました。")
      ).catch(()=> Message.error("クリアに失敗しました。"));
  };
}
