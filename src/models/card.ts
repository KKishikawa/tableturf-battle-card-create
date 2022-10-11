import { getFromStorage, setToStrage, saveJson } from "@/utils";
import * as RecordUtil from "@/utils/variableRecord";
export interface ICardData {
  /** バージョン */
  v: 0;
  c: ICardRaw[];
}
export interface ICardRaw {
  /** カードno */
  n: number;
  /** sp必要数 */
  sp: number;
  /** 日本語名 */
  ja: string;
  /** spマス */
  sg: string;
  /** sp以外マス */
  g: string;
  /** レア度 */
  r: number;
}
export interface ICard {
  /** カードno */
  no: number;
  /** sp必要数 */
  sp: number;
  /** カード名 */
  name: string;
  /** spマス */
  spx: number[];
  /** sp以外マス */
  px: number[];
  /** レア度 */
  rarity: number;
}

export const RARITY = ["コモン", "レア", "フレッシュ"];
/** 塗り情報文字列を座標配列に復元します */
export function encodeInkInfo(val: number[] | null | undefined) {
  return RecordUtil.writeFixRecord(val);
}
/** 塗り座標数列を情報文字列に変換します */
export function decodeInkInfo(val: string | null | undefined) {
  return RecordUtil.readeFixRecord(val);
}
export function encodeCard(card: ICard): ICardRaw {
  return {
    n: card.no,
    sp: card.sp,
    ja: card.name,
    r: card.rarity,
    sg: encodeInkInfo(card.spx),
    g: encodeInkInfo(card.px),
  };
}
export function decodeCard(card: ICardRaw): ICard {
  return {
    no: card.n,
    sp: card.sp,
    name: card.ja,
    rarity: card.r,
    spx: decodeInkInfo(card.sg),
    px: decodeInkInfo(card.g),
  };
}

function encodeCardData(cards: ICard[]): ICardData {
  return {
    v: 0,
    c: cards.map(encodeCard),
  };
}
function decodeCardData(data: ICardData): ICard[] {
  if (data.v === 0) return data.c.map(decodeCard);
  return [];
}

const stragekey = "tableturf_cardinfoV0";
/** ローカルストレージにデータを保存します */
export function loadFromLocalStorage(): ICard[] {
  const d = getFromStorage<ICardData>(stragekey);
  if (!d) return [];
  return decodeCardData(d);
}
/** ローカルストレージからデータを取得します */
export function saveToLocalStorage(data: ICard[]) {
  const d = encodeCardData(data);
  setToStrage(stragekey, d);
}
/** カードリスト情報をファイルに保存します */
export function saveToFile(data: ICard[]) {
  const d = encodeCardData(data);
  saveJson(JSON.stringify(d), "tableturf-buttle-cardlist.json")
}
/** ファイルからカードリスト情報を読み込みます */
export async function loadFromFile(file: File | Blob | null): Promise<ICard[] | null> {
  if (!file) return null;
  try {
    const json = await file.text();
    const d = JSON.parse(json);
    return decodeCardData(d);
  } catch (error) {
    console.log(error);
    return null;
  }
}
