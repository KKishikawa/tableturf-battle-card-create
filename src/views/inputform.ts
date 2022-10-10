import * as convert from "@/utils/convert";
import * as dialog from "@/components/dialog";
import * as Message from "@/components/message";
import { CardGrid, fillTypes } from "@/components/cardGrid";
import { SimpleInfo } from "@/components/simpleInfo";
import { ICard, } from "@/models/card";

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
    const card_no = convert.toInt((document.getElementById("input_no") as HTMLInputElement).value);
    const sp = convert.toInt((document.getElementById("input_sp") as HTMLInputElement).value, -1);
    const rarity = convert.toInt((document.getElementById("input_rarity") as HTMLSelectElement).value, -1);
    const name = (document.getElementById("input_name") as HTMLInputElement).value;
    const gridInfo = this.gridManager.getData();
    const ret: ICard = {
      name,
      sp,
      no: card_no,
      rarity,
      spx: gridInfo.sp,
      px: gridInfo.n,
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

const inputForm = new InputForm();

document.getElementById("button_clear_cardgrid")!.onclick = function () {
  dialog.confirm({
    title: "塗りマス設定",
    message: "塗りマスの設定をクリアしますか？",
  }).then(
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
  dialog.confirm({
    title: "カードの登録",
    message: "カードを追加しますか？",
  }).then(() => {
    const validateRet = inputForm.validate();
    if (validateRet[0].length > 0) {
      dialog.alert({
        title: "追加エラー",
        message: "下記の内容を確認してください\n" + validateRet[0].join("\n"),
      });
      Message.error("登録に失敗しました。");
      return;
    }
    // todo リストへの追加処理
    console.log(validateRet[1]);
    Message.success("追加しました。");

    inputForm.clearForm();
  });
};
