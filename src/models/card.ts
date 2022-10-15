import { getFromStorage, setToStrage, saveJson } from "@/utils";
import * as RecordUtil from "@/utils/variableRecord";
export interface ICardData {
  /** バージョン */
  v: 0;
  c: ICard[];
}
export interface ICard {
  /** カードno */
  n: number;
  /** sp必要数 */
  sp: number;
  /** 日本語名 */
  ja: string;
  /** spマス */
  sg?: string;
  /** sp以外マス */
  g?: string;
  /** レア度 */
  r: number;
}

export const RARITY = ["コモン", "レア", "フレッシュ"];
function createJsonData(c: ICard[]): ICardData {
  return {
    v: 0,
    c,
  };
}
/** 塗り座標数列を情報文字列に変換します */
export function encodeInkInfo(val: number[] | null | undefined) {
  const d = RecordUtil.writeFixRecord(val);
  return d != "" ? d : undefined;
}
/** 塗り情報文字列を座標配列に復元します */
export function decodeInkInfo(val: string | null | undefined) {
  return RecordUtil.readeFixRecord(val);
}
/** 塗れる数をカウントします */
export function inkCount(...g: (string | null | undefined)[]) {
  return g.reduce((init, g) => init + RecordUtil.calcFixRecordLen(g), 0);
}

const stragekey = "tableturf_cardinfoV0";
/** ローカルストレージからデータを取得します */
export function loadFromLocalStorage(): ICard[] {
  const d = getFromStorage<ICardData>(stragekey);
  if (!d) return [];
  return d.c;
}
/** ローカルストレージにデータを保存します */
export function saveToLocalStorage(data: ICard[]) {
  setToStrage(stragekey, data);
}
/** カードリスト情報をファイルに保存します */
export function saveToFile(data: ICard[]) {
  const d = createJsonData(data);
  saveJson(JSON.stringify(d), "tableturf-buttle-cardlist.json");
}
/** ファイルからカードリスト情報を読み込みます */
export async function loadFromFile(
  file: File | Blob | null
): Promise<ICard[] | null> {
  if (!file) return null;
  try {
    const json = await file.text();
    const d = JSON.parse(json);
    return d.c;
  } catch (error) {
    console.log(error);
    return null;
  }
}
